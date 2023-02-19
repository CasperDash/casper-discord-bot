import {
  CapserDashConnector,
  CasperSignerConnector,
  useAccount,
  useConnect,
} from "@casperdash/usewallet";
import { setCookie } from "cookies-next";
import * as discord from "../src/discord.js";
import DiscordForm from "../components/discordForm";

const CasperDashButton = () => {
  const { connect } = useConnect({
    connector: new CapserDashConnector(),
  });

  return (
    <div>
      <button onClick={() => connect()}>Connect with CasperDash</button>
    </div>
  );
};

const CasperSignerButton = () => {
  const { connect } = useConnect({
    connector: new CasperSignerConnector({}),
  });

  return (
    <div>
      <button onClick={() => connect()}>Connect with CasperSigner</button>
    </div>
  );
};

function WalletConnector({ data }) {
  const { publicKey } = useAccount();
  return (
    <div>
      <h3>Welcome to Casper Discord Bot</h3>
      {publicKey ? (
        <div>
          <p>
            Your Casper Wallet has been verified, but you must link it with
            Discord to finish
          </p>
          <div>
            <DiscordForm url={`${data.url}&pk=${publicKey}`} pk={publicKey} />
          </div>
        </div>
      ) : (
        <div>
          <CasperSignerButton />
          <br />
          <CasperDashButton />
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const { url, state } = discord.getOAuthUrl();

  // Store the signed state param in the user's cookies so we can verify
  // the value later. See:
  // https://discord.com/developers/docs/topics/oauth2#state-and-security
  setCookie("clientState", state, {
    req,
    res,
    maxAge: 1000 * 60 * 5,
    signed: true,
  });

  return {
    props: {
      data: {
        url,
        state,
      },
    },
  };
}

export default WalletConnector;
