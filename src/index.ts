import "reflect-metadata";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import path from "path";
import dotenv from "dotenv";
import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import GQL from "fastify-gql";
import { User } from "./entities/User";
import cors from "fastify-cors";
import { ExampleResolver } from "./resolvers/example";
import Redis from "ioredis";
import { UserResolver } from "./resolvers/user/user";
import { authChecker } from "./authentication/authChecker";
import { getUserFromToken } from "./authentication/dbQuery";
import { fastifyRequestContextPlugin } from "fastify-request-context";
dotenv.config();

let DEV = process.env.NODE_ENV === "development";
let PROD = process.env.NODE_ENV === "production";

const main = async () => {
  console.log("Connecting to DB");

  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: DEV,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User],
    cache: {
      duration: 1000 * 10, // 10 seconds
      type: "ioredis",
      options: process.env.REDIS_URL,
    },
    synchronize: DEV,
  });
  console.log("DB connection completed");
  if (PROD) {
    console.log("Migrating DB");
    await conn.runMigrations();
    console.log("Finished DB migrations");
  }

  console.log("Connecting to Redis");
  var redis = new Redis(process.env.REDIS_URL);
  console.log("Redis connection completed");

  const app = Fastify({ logger: DEV });
  app.get("/", async (_, reply) => {
    reply.type("application/json").code(200);
    return { hello: "world" };
  });

  app.register(fastifyRequestContextPlugin);

  app.addHook("onRequest", async (req, _) => {
    // If the request has an Authorization header,
    // parse it and fetch the appropriate user from
    // the corresponding apiToken
    req.requestContext.set("user", await getUserFromToken(req));
    return;
  });

  // Use graphqlbin.com for a GraphQL visual query editor
  app.register(cors, {
    origin: "https://www.graphqlbin.com",
  });

  app.register(GQL, {
    schema: await buildSchema({
      resolvers: [ExampleResolver, UserResolver],
      authChecker,
    }),
    jit: 1,
    graphiql: DEV && "playground",
    context: async (request: FastifyRequest, reply: FastifyReply) => {
      return {
        req: request,
        res: reply,
        redis,
        user: request.requestContext.get("user"),
      };
    },
  });
  app.listen(
    parseInt(<string>process.env.PORT) || 3000,
    "0.0.0.0",
    (err, address) => {
      if (err) throw err;
      app.log.info(`server listening on ${address}`);
    }
  );
};
main().catch((err) => console.error(err));
