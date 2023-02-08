import { getCookies, getCookie, setCookie, deleteCookie } from "cookies-next";
import {
  CLPublicKey,
  decodeBase16,
  verifyMessageSignature,
} from "casper-js-sdk";
import * as storage from "../src/storage.js";
import * as discord from "../src/discord.js";

export const verifyWallet = (publicKey, signature) => {
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
      console.log("Im here", clientState, discordState);
      return {
        props: {
          data,
        },
      };
    }

    const tokens = await discord.getOAuthTokens(code);

    console.log("Cookie Code", clientState, code, tokens);

    // 2. Uses the Discord Access Token to fetch the user profile
    const meData = await discord.getUserData(tokens);
    const userId = meData.user.id;
    await storage.storeDiscordTokens(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
    });

    // 3. Update the users metadata, assuming future updates will be posted to the `/update-metadata` endpoint
    const updatedMetadata = await updateMetadata(userId, { publicKey });
    console.log("UserID", userId, meData.user, updatedMetadata.jsonData);

    return {
      props: {
        data: {
          user: meData.user,
        },
      },
    };
  } catch (error) {
    console.error("Im here", error);
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
async function updateMetadata(userId, { publicKey }) {
  // Fetch the Discord tokens from storage
  const tokens = await storage.getDiscordTokens(userId);

  let metadata = {};
  try {
    // Fetch the new metadata you want to use from an external source.
    // This data could be POST-ed to this endpoint, but every service
    // is going to be different.  To keep the example simple, we'll
    // just generate some random data.
    metadata = {
      casperwallet: 0,
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

function DiscordResult({ data }) {
  const { error, user } = data;
  return (
    <div>
      {error ? (
        <span>{error}</span>
      ) : (
        <div>Linked {user.username} with Casper Wallet</div>
      )}
    </div>
  );
}

export default DiscordResult;
