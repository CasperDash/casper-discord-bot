import fetch from "node-fetch";
import loadConfig from "../../src/config.js";

export default async function handler(req, res) {
  const config = loadConfig();
  /**
   * Register the metadata to be stored by Discord. This should be a one time action.
   * Note: uses a Bot token for authentication, not a user token.
   */
  const url = `https://discord.com/api/v10/applications/${config.DISCORD_CLIENT_ID}/role-connections/metadata`;
  // supported types: number_lt=1, number_gt=2, number_eq=3 number_neq=4, datetime_lt=5, datetime_gt=6, boolean_eq=7
  const body = [
    {
      key: "casperwallet",
      name: "Connected to Casper Wallet",
      description: "Is Connected to Casper Wallet",
      type: 7,
    },
    {
      key: "havehammer",
      name: "Hammer Hodler",
      description: "Have Hammer",
      type: 7,
    },
    {
      key: "iswlwinner",
      name: "Whitelist Winner",
      description: "Whitelist Winner",
      type: 7,
    },
    {
      key: "csprstakinggoldsquad",
      name: "$CSPR Staking Amount on Gold Squad",
      description: "$CSPR Staking Amount on Gold Squad Greater Than",
      type: 2,
    },
    {
      key: "eggs",
      name: "Own Eggs",
      description: "The number of Eggs Greater Than",
      type: 2,
    },
  ];

  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${config.DISCORD_TOKEN}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    res.status(200).json(data);
  } else {
    //throw new Error(`Error pushing discord metadata schema: [${response.status}] ${response.statusText}`);
    const data = await response.text();
    res.status(200).json({
      error: data,
    });
  }
}
