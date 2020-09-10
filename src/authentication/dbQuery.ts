import { User } from "../entities/User";
import { FastifyRequest } from "fastify";
import { getManager } from "typeorm";

export const getUserFromToken = async (
  req: FastifyRequest
): Promise<User | undefined> => {
  if (typeof req.headers.authorization === "undefined") {
    return undefined;
  }
  let split = <Array<String>>req.headers.authorization?.split(" ");
  if (split.length < 2) {
    return undefined;
  }
  let apiToken = split[1];
  let entityManager = getManager();
  return entityManager.findOne(User, {
    where: { apiToken },
    cache: true,
  });
};
