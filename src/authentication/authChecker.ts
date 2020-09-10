import { AuthChecker } from "type-graphql";
import { MyContext } from "../types";

export const authChecker: AuthChecker<MyContext> = async ({
  context: { req },
}) => {
  console.log(req.requestContext.get("user"));
  if (req.requestContext.get("user")) {
    return true;
  }
  return false;
};
