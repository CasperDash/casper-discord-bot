import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
  verifyKey,
} from "discord-interactions";
import loadConfig from "../../src/config.js";

export default async function handler(req, res, buf) {
  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];
  const config = loadConfig();

  console.log(
    "DEBUG",
    signature,
    timestamp,
    req.headers,
    config.DISCORD_PUBLIC_KEY
  );
  const isValidRequest = verifyKey(
    buf,
    signature,
    timestamp,
    config.DISCORD_PUBLIC_KEY
  );
  if (!isValidRequest) {
    res.status(401).send("Bad request signature");
    throw new Error("Bad request signature");
  }

  if (req.method === "POST") {
    // Process a POST request
    const message = req.body;
    console.log("message", message);
    if (!message) {
      res.status(400).send({ error: "Unknown Request" });
      return;
    }

    if (message.type === InteractionType.PING) {
      console.log("Handling Ping request 123");
      return res.send({ type: InteractionResponseType.PONG });
    } else if (message.type === InteractionType.APPLICATION_COMMAND) {
      console.log(`Handling application command: ${message.data.name}`);
      switch (message.data.name.toLowerCase()) {
        case GET_PROFILE.name.toLowerCase(): {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "123",
            },
          });
          break;
        }
        default:
          console.error("Unknown Command");
          res.status(400).send({ error: "Unknown Type" });
          break;
      }
    }
  } else {
    res.status(200).json({ name: "Hello World" });
  }
}
