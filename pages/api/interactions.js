import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import { GET_PROFILE, CHECK_WL } from "../../src/commands.js";
import withDiscordInteraction from "../../middlewares/discord-interaction.js";
import withErrorHandler from "../../middlewares/error-handler";
import { connectToDb } from "../../src/db";
import Entry from "../../src/db/models/Entry.js";

const handler = async (req, res, interaction) => {
  if (req.method === "POST") {
    // Process a POST request

    const { type } = interaction;

    if (type === InteractionType.APPLICATION_COMMAND) {
      const {
        data: { name, options },
      } = interaction;
      if (!name) {
        res.status(400).send({ error: "Unknown Request" });
        return;
      }
      switch (name) {
        case GET_PROFILE.name.toLowerCase(): {
          const {
            member: { nick, user },
          } = interaction;

          const { id } = user;
          await connectToDb();
          const entry = Entry.where({ userId: id });
          const { publicKey } = await entry.findOne();

          if (entry) {
            return res.status(200).json({
              type: 4,
              data: {
                embeds: [
                  {
                    color: 0x0099ff,
                    author: {
                      name: nick,
                      // icon_url: "https://i.imgur.com/AfFp7pu.png",
                      // url: "https://discord.js.org",
                    },
                    fields: [
                      {
                        name: "ID",
                        value: user.id,
                      },
                      {
                        name: "Wallet",
                        value: `:white_check_mark: [${publicKey}](https://cspr.live/account/${publicKey})`,
                      },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                      text: "CasperDash",
                      icon_url: "https://assets.eggforce.io/casperdash.webp",
                    },
                  },
                ],
                components: [
                  {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                      {
                        type: MessageComponentTypes.BUTTON,
                        // Value for your app to identify the button
                        // custom_id: "link_wallet",
                        label: "Link Wallet",
                        style: ButtonStyleTypes.LINK,
                        url: "https://discord.casperdash.io/verify-wallet",
                      },
                    ],
                  },
                ],
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            });
          }
          const message = {
            color: 0x0099ff,
            author: {
              name: nick,
            },
            fields: [
              {
                name: "ID",
                value: user.id,
              },
              {
                name: "Wallet",
                value: `:white_check_mark: [${publicKey}](https://cspr.live/account/${publicKey})`,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: "CasperDash",
              icon_url: "https://assets.eggforce.io/casperdash.webp",
            },
          };

          return res.status(200).json({
            type: 4,
            data: {
              embeds: [message],
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        case CHECK_WL.name.toLocaleLowerCase(): {
          const { id } = user;
          await connectToDb();
          const entry = Entry.where({ userId: id });
          const { isWLWinner } = await entry.findOne();
          if (entry) {
            const wlRoundMessage = isWLWinner
              ? ":white_check_mark: Your wallet is eligible to mint Eggs in WL Round on July 17th 20203"
              : ":x: Your wallet is unqualified to min Eggs in WL Round. Please join us as Public Round on 27th 2023";
            return res.status(200).json({
              type: 4,
              data: {
                embeds: [
                  {
                    color: 0x0099ff,
                    author: {
                      name: nick,
                      // icon_url: "https://i.imgur.com/AfFp7pu.png",
                      // url: "https://discord.js.org",
                    },
                    fields: [
                      {
                        name: "ID",
                        value: user.id,
                      },
                      {
                        value: "Whitelist Round Eligibility",
                        value: wlRoundMessage,
                      },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                      text: "EggForce",
                      icon_url:
                        "https://eggforce.io/static/media/eggforce--logo__ver2_color.1b48c729ba5a2f91b7cd.webp",
                    },
                  },
                ],
                components: [
                  {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                      {
                        type: MessageComponentTypes.BUTTON,
                        // Value for your app to identify the button
                        // custom_id: "link_wallet",
                        label: "Link Wallet",
                        style: ButtonStyleTypes.LINK,
                        url: "https://discord.casperdash.io/verify-wallet",
                      },
                    ],
                  },
                ],
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            });
          }

          const message = {
            color: 0x0099ff,
            author: {
              name: nick,
            },
            fields: [
              {
                name: "ID",
                value: user.id,
              },
              {
                name: "Whitelist Round Eligibility",
                value: `You have never registered the Whitelist Ticket. Claim it eggforce.io/world now.`,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: "CasperDash",
              icon_url: "https://assets.eggforce.io/casperdash.webp",
            },
          };

          return res.status(200).json({
            type: 4,
            data: {
              embeds: [message],
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        default:
          console.error("Unknown Command");
          res.status(400).send({ error: "Unknown Type" });
          break;
      }
    }

    console.log("COmpo", type);

    if (type === InteractionType.MESSAGE_COMPONENT) {
      const {
        data: { custom_id },
      } = interaction;
      const componentId = custom_id;
      if (componentId === "link_wallet") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `Clicked the button` },
        });
      }
    }
  } else {
    res.status(200).json({ name: "Hello World" });
  }
};

// disable body parsing, need the raw body as per https://discord.com/developers/docs/interactions/slash-commands#security-and-authorization
export const config = {
  api: {
    bodyParser: false,
  },
};
export default withErrorHandler(withDiscordInteraction(handler));
