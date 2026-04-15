import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { createServer } from "http";
import depthLimit from "graphql-depth-limit";

import helmet from "helmet";
import { rateLimitingMiddleware } from "./src/middleware/applyRateLimit.js";

import { schema } from "./graphQL/schema.js";
import { context } from "./graphQL/context.js";
import { setupWebSocket } from "./websocket.js";
import { corsMiddleware } from "./src/middleware/cors.js";
import { csrfMiddleware } from "./src/middleware/csrf.js";

const app = express();
const httpServer = createServer(app);

const server = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== "production",
  validationRules: [depthLimit(5)],
});

await server.start();
let count = 0;
app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  `/graphql`,
  corsMiddleware,
  express.json(),
  rateLimitingMiddleware,
  csrfMiddleware,
  cookieParser(),
  expressMiddleware(server, { context }),
);

setupWebSocket(httpServer, schema);

httpServer.listen(process.env.PORT, () => {
  console.log(`server is listening on port ${process.env.PORT}`);
});
