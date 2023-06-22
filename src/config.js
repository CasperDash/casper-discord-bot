// import nconf from "nconf";

/**
 * Parse configuration data from either environment variables, command line
 * arguments, or a local file.  The local file containing the actual
 * configuration should not be checked into source control.
 */

const loadConfig = () => {
  // nconf.env().argv().file("config.json");
  const config = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
    DISCORD_TEST_GUILD_ID: process.env.DISCORD_TEST_GUILD_ID,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
  };
  return config;
};
export default loadConfig;
