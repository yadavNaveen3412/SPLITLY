import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { findUser } from "./src/utils/auth.js";
import prisma from "./src/loaders/prisma.js";
import { pubsub } from "./src/pubsub.js";
import { verifyWebSocketOrigin } from "./src/middleware/cors.js";

export function setupWebSocket(httpServer, schema) {
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
    verifyClient: verifyWebSocketOrigin,
  });

  useServer(
    {
      schema,
      context: async (ctx) => {
        const { extra } = ctx;

        let token = null;

        try {
          const cookieHeader = extra?.request?.headers?.cookie;
          if (cookieHeader) {
            const cookies = Object.fromEntries(
              cookieHeader.split(";").map((c) => c.trim().split("=")),
            );
            token = cookies.jwt;
          }
        } catch (err) {
          console.log("Error parsing cookie:", err);
        }

        const user = token ? await findUser(token) : null;
        return { prisma, pubsub, user };
      },
      keepAlive: 10000,
      onConnect: () => {
        console.log("WebSocket client connected");
      },
      onDisconnect: () => {
        console.log("WebSocket client disconnected!");
      },
    },
    wsServer,
  );

  console.log("WS ready!");
}
