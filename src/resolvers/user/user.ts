import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  FieldResolver,
  Root,
  Authorized,
  Query,
} from "type-graphql";
import { MyContext } from "../../types";
import { User } from "../../entities/User";
import argon2 from "argon2";
import { FORGET_PASSWORD_PREFIX } from "../../constants";
import { UserRegisterInput } from "./UserRegisterInput";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class UserResponseWithToken extends UserResponse {
  @Field(() => String, { nullable: true })
  token?: String;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    console.log(req);

    return user.email;

    // current user wants to see someone elses email
    // return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 8) {
      console.log(req);

      return {
        errors: [
          {
            field: "newPassword",
            message: "Password must be at least 8 characters",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token not found",
          },
        ],
      };
    }

    const user = await User.findOne(userId);

    if (!user) throw new Error("Inexistent user");

    await User.update(
      { id: userId },
      {
        password: await argon2.hash(newPassword),
      }
    );

    await redis.del(key);

    // TODO: log in user after change password

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // the email is not in the db
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 8
    ); // 8 hours

    // TODO: send password reset email

    return true;
  }

  @Mutation(() => UserResponseWithToken)
  async register(
    @Arg("options") options: UserRegisterInput
  ): Promise<UserResponseWithToken> {
    // TODO: Validate input

    const hashedPassword = await argon2.hash(options.password);
    console.log(hashedPassword);

    let user;
    let apiToken;
    try {
      user = new User();
      user.email = options.email;
      user.familyName = options.familyName;
      user.givenName = options.givenName;
      user.password = hashedPassword;
      apiToken = v4().replace(/-/g, "");
      user.apiToken = apiToken;
      await user.save();
    } catch (err) {
      // duplicate username error
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "email already registered",
            },
          ],
        };
      }
    }

    return { user, token: apiToken };
  }

  @Mutation(() => UserResponseWithToken)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserResponseWithToken> {
    const user = await User.findOne({ where: { email } });
    if (!user)
      throw new Error("The email does not exist or the password is incorrect");
    const valid = await argon2.verify(user.password, password);
    if (!valid)
      throw new Error("The email does not exist or the password is incorrect");

    return { user, token: user.apiToken };
  }

  @Query(() => User)
  @Authorized()
  async me(@Ctx() { user }: MyContext): Promise<User | undefined> {
    return user;
  }
}
