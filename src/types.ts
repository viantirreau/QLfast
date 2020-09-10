import { FastifyRequest, FastifyReply } from "fastify";
import { Redis } from "ioredis";
import { User } from "./entities/User";
// import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
  req: FastifyRequest;
  redis: Redis;
  res: FastifyReply;
  user: Promise<User | undefined>;
  //   userLoader: ReturnType<typeof createUserLoader>;
};
