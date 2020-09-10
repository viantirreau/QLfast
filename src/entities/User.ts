import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from "typeorm";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
@Entity()
@Unique(["email"])
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field() // Fields are the GraphQL exposed fields
  @Column() // Columns are the TypeORM, actual DB columns
  givenName!: string;

  @Field()
  @Column()
  familyName!: string;

  @Field()
  @Column()
  email!: string;

  @Column() // We don't expose the hashed password!
  password!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Index()
  apiToken!: string;
}
