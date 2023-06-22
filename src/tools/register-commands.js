import { request } from "gaxios";
import "dotenv/config";
import { DISCONNECT, GET_PROFILE } from "../commands.js";
import loadConfig from "../config.js";

const config = loadConfig();
console.log("Config", config);

export async function registerGuildCommands() {
  if (!config.DISCORD_TEST_GUILD_ID) {
    throw new Error(
      "The DISCORD_TEST_GUILD_ID environment variable is required."
    );
  }
  const url = `https://discord.com/api/v10/applications/${config.DISCORD_CLIENT_ID}/guilds/${config.DISCORD_TEST_GUILD_ID}/commands`;
  const json = await registerCommands(url);
  console.log(json);
  json.forEach(async (cmd) => {
    await request({
      url: `https://discord.com/api/v10/applications/${config.DISCORD_CLIENT_ID}/guilds/${config.DISCORD_TEST_GUILD_ID}/commands/${cmd.id}`,
    });
  });
}

async function registerCommands(url) {
  const res = await request({
    url,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${config.DISCORD_TOKEN}`,
    },
    method: "PUT",
    body: JSON.stringify([GET_PROFILE, DISCONNECT]),
  });
  console.log("Registered all commands");
  return res.data;
}

/**
 * Register all commands globally.  This can take o(minutes), so wait until
 * you're sure these are the commands you want.
 */
async function registerGlobalCommands() {
  const url = `https://discord.com/api/v10/applications/${config.DISCORD_CLIENT_ID}/commands`;
  await registerCommands(url);
}

await registerGlobalCommands();
