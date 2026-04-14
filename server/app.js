import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";

import { schema } from "./graphQL/schema.js";
import { context } from "./graphQL/context.js";
import { setupWebSocket } from "./websocket.js";

const app = express();
const httpServer = createServer(app);

const server = new ApolloServer({
  schema,
});

await server.start();

app.use(
  `/graphql`,
  cors({
    origin: `http://localhost:${process.env.FRONTEND_PORT}`,
    credentials: true,
  }),
  express.json(),
  cookieParser(),
  expressMiddleware(server, { context }),
);

setupWebSocket(httpServer, schema);

httpServer.listen(process.env.PORT, () => {
  console.log(`server is listening on port ${process.env.PORT}`);
});
