import { InputType, Field } from "type-graphql";
import { IsEmail } from "class-validator";
@InputType()
export class UserRegisterInput {
  @Field()
  @IsEmail({}, { message: "Invalid email" })
  email: string;

  @Field()
  password: string;

  @Field({ description: "AKA firstname" })
  givenName: string;

  @Field({ description: "AKA lastname" })
  familyName: string;
}
