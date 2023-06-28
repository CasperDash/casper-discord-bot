import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
  verifyKey,
} from "discord-interactions";
import loadConfig from "../../src/config.js";

export default async function handler(req, res) {
  const signature = req.get("X-Signature-Ed25519");
  const timestamp = req.get("X-Signature-Timestamp");

  const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
  if (!isValidRequest) {
    res.status(401).send("Bad request signature");
    throw new Error("Bad request signature");
  }

  if (req.method === "POST") {
    // Process a POST request
    const config = loadConfig();
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
