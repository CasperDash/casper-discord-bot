import { getCookie } from "cookies-next";
import * as storage from "../src/storage.js";
import * as discord from "../src/discord.js";
import { connectToDb } from "../src/db";
import Entry from "../src/db/models/Entry";

export const verifyWallet = (publicKey, signature) => {
  const {
    CLPublicKey,
    decodeBase16,
    verifyMessageSignature,
  } = require("casper-js-sdk");
  if (!signature) {
    return false;
  }

  return verifyMessageSignature(
    CLPublicKey.fromHex(publicKey),
    `link-discord-${publicKey}`,
    decodeBase16(signature)
  );
};

export async function getServerSideProps({ req, res, query }) {
  try {
    // 1. Uses the code and state to acquire Discord OAuth2 tokens
    const { code, state: discordState } = query;
    // make sure the state parameter exists
    const clientState = getCookie("clientState", { req, res });
    const signature = getCookie("signature", { req, res });
    const publicKey = getCookie("address", { req, res });
    if (!verifyWallet(publicKey, signature)) {
      const data = {
        error: "Unauthorized wallet.",
      };
      return {
        props: {
          data,
        },
      };
    }

    if (clientState !== discordState) {
      const data = {
        error: "State verification failed.",
      };
      return {
        props: {
          data,
        },
      };
    }

    const tokens = await discord.getOAuthTokens(code);

    // 2. Uses the Discord Access Token to fetch the user profile
    const meData = await discord.getUserData(tokens);
    const userId = meData.user.id;
    await storage.storeDiscordTokens(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
    });

    const canMintRes = await fetch(
      `https://api.eggforce.io/user/${publicKey}/canMintNFT`
    );

    const canMintData = await canMintRes.json();

    // 3. Update the users metadata, assuming future updates will be posted to the `/update-metadata` endpoint
    await updateMetadata(userId, {
      casperwallet: 1,
      ishammerhodler: canMintData.canMint ? 1 : 0,
    });

    await persistWalletInfo(userId, {
      publicKey,
      isHammerHodler: canMintData.canMint,
    });

    return {
      props: {
        data: {
          user: meData.user,
        },
      },
    };
  } catch (error) {
    console.error("Error happened", error);
    return {
      props: {
        data: {
          error: error.message,
        },
      },
    };
  }
}

/**
 * Given a Discord UserId, push static make-believe data to the Discord
 * metadata endpoint.
 */
async function updateMetadata(userId, { casperwallet, ishammerhodler }) {
  // Fetch the Discord tokens from storage
  const tokens = await storage.getDiscordTokens(userId);

  let metadata = {};
  try {
    // Fetch the new metadata you want to use from an external source.
    // This data could be POST-ed to this endpoint, but every service
    // is going to be different.  To keep the example simple, we'll
    // just generate some random data.
    metadata = {
      casperwallet,
      ishammerhodler,
    };
  } catch (e) {
    e.message = `Error fetching external data: ${e.message}`;
    console.error(e);
    // If fetching the profile data for the external service fails for any reason,
    // ensure metadata on the Discord side is nulled out. This prevents cases
    // where the user revokes an external app permissions, and is left with
    // stale verified role data.
  }

  // Push the data to Discord.
  return await discord.pushMetadata(userId, tokens, metadata);
}

async function persistWalletInfo(userId, { publicKey, isHammerHodler }) {
  await connectToDb();
  const entry = new Entry({
    userId,
    publicKey,
    isHammerHodler,
  });

  return await entry.save();
}

function DiscordResult({ data }) {
  const { error, user } = data;
  return (
    <div>
      {error ? (
        <span className="error">{error}. Please try again.</span>
      ) : (
        <div>
          <h3>
            Linked {user.username} with Casper Wallet. Please go back your
            Discord.
          </h3>
        </div>
      )}
    </div>
  );
}

export default DiscordResult;
