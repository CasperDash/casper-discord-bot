import { NextResponse } from "next/server";
import { verifyKeyMiddleware } from "discord-interactions";
import loadConfig from "./src/config.js";

// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: "/api/interactions",
};

export function middleware(request) {
  const config = loadConfig();
  // Call our authentication function to check the request
  //   console.log("ABC", verifyKeyMiddleware(config.DISCORD_PUBLIC_KEY));
  //   if (!verifyKeyMiddleware(config.DISCORD_PUBLIC_KEY)) {
  //     // Respond with JSON indicating an error message
  //     return new NextResponse(
  //       JSON.stringify({ success: false, message: "authentication failed" }),
  //       { status: 401, headers: { "content-type": "application/json" } }
  //     );
  //   }
}
