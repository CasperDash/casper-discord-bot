/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const DISCONNECT = {
  name: "disconnect",
  description:
    "Clear all associated Casper Wallet data and disconnect your wallet.",
};

export const GET_PROFILE = {
  name: "profile",
  description: "Fetch the linked Casper Wallet profile information.",
};

export const CHECK_WL = {
  name: "check-whitelist",
  description: "Check the Casper Wallet is Whitelisted to specific NFT project",
};
