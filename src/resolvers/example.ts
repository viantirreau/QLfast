import { Resolver, Query, Arg, Authorized, Ctx } from "type-graphql";
import { MyContext } from "src/types";

@Resolver()
export class ExampleResolver {
  @Authorized()
  @Query(() => Number)
  // The argument for @Arg is the name of the field in the GraphQL endpoint
  // You can pass options as a second parameter for @Arg, such as nullable, default...
  // Then comes the variable name for the function scope, followed by its type
  // Finally, the return type is specified
  async add(
    @Arg("x") x: number,
    @Arg("y") y: number,
    @Ctx() { user }: MyContext
  ): Promise<number> {
    console.log(await user);

    return x + y;
  }
}
