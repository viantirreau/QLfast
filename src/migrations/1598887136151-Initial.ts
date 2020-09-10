import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1598887136151 implements MigrationInterface {
    name = 'Initial1598887136151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "givenName" character varying NOT NULL, "familyName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "apiToken" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_62ad461c58393b337dffc03a0a" ON "user" ("apiToken") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_62ad461c58393b337dffc03a0a"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
