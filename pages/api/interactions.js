import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import { request } from "gaxios";
import {
  GET_PROFILE,
  CHECK_WL,
  GET_HATCHERS_PROFILE,
} from "../../src/commands.js";
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
      const {
        member: { nick, user },
      } = interaction;
      switch (name) {
        case GET_PROFILE.name.toLowerCase(): {
          const { id } = user;
          await connectToDb();
          const entry = await Entry.where({ userId: id }).findOne();
          if (entry) {
            const { publicKey } = entry;
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
                components: [],
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
          try {
            const { id } = user;
            console.log("Connecting to DB");
            await connectToDb();
            const entry = await Entry.where({ userId: id }).findOne();
            console.log("DEBUG", entry);
            if (entry) {
              const { publicKey } = entry;
              const wlRes = await request({
                url: `https://api.eggforce.io/lead/${publicKey}/wl-winner`,
              });
              const wlRoundMessage = wlRes?.data?.isWLWinner
                ? ":white_check_mark: Your wallet is eligible to mint Eggs in WL Round on July 17th 2023"
                : ":no_entry_sign: Your wallet is unqualified to mint Eggs in the WL Round. Please join us as the Public Round on 27th July 2023! :tada:";
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
                          name: "Whitelist Eligibility",
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

                  flags: InteractionResponseFlags.EPHEMERAL,
                },
              });
            }

            console.log("Could not find the entry");
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
                  name: "Whitelist Eligibility",
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
          } catch (error) {
            console.error("Something is wrong", error);
          }
        }
        case GET_HATCHERS_PROFILE.name.toLocaleLowerCase(): {
          const { id } = user;
          console.log("Connecting to DB");
          await connectToDb();
          const entry = await Entry.where({ userId: id }).findOne();
          console.log("entry", entry);
          if (entry) {
            const { publicKey } = entry;
            const wlRes = await request({
              url: `https://api.eggforce.io/user/${publicKey}`,
            });
            const { totalEgg } = wlRes?.data;
            await Entry.updateOne(
              {
                userId,
              },
              {
                noEggs: totalEgg,
              },
              {
                upsert: true,
              }
            );
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
                        name: "# Eggs",
                        value: totalEgg,
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
                components: [],
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            });
          }
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
