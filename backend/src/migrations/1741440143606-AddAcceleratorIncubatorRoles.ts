import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAcceleratorIncubatorRoles1741440143606 implements MigrationInterface {
    name = 'AddAcceleratorIncubatorRoles1741440143606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partnerships" DROP CONSTRAINT "FK_partnerships_createdById"`);
        await queryRunner.query(`ALTER TABLE "challenges" DROP CONSTRAINT "FK_challenges_createdById"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'startup', 'research', 'corporate', 'government', 'investor', 'individual', 'innovator', 'organization', 'accelerator', 'incubator')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'individual'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."partnership_status_enum" RENAME TO "partnership_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."partnerships_status_enum" AS ENUM('proposed', 'active', 'completed')`);
        await queryRunner.query(`ALTER TABLE "partnerships" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "partnerships" ALTER COLUMN "status" TYPE "public"."partnerships_status_enum" USING "status"::"text"::"public"."partnerships_status_enum"`);
        await queryRunner.query(`ALTER TABLE "partnerships" ALTER COLUMN "status" SET DEFAULT 'proposed'`);
        await queryRunner.query(`DROP TYPE "public"."partnership_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."challenge_type_enum" RENAME TO "challenge_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."challenges_type_enum" AS ENUM('government', 'corporate', 'individual')`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "type" TYPE "public"."challenges_type_enum" USING "type"::"text"::"public"."challenges_type_enum"`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "type" SET DEFAULT 'corporate'`);
        await queryRunner.query(`DROP TYPE "public"."challenge_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."challenge_status_enum" RENAME TO "challenge_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."challenges_status_enum" AS ENUM('open', 'in-progress', 'completed')`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "status" TYPE "public"."challenges_status_enum" USING "status"::"text"::"public"."challenges_status_enum"`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "status" SET DEFAULT 'open'`);
        await queryRunner.query(`DROP TYPE "public"."challenge_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "partnerships" ADD CONSTRAINT "FK_bdf4cc75996af40e02d47bb7954" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "challenges" ADD CONSTRAINT "FK_dffbc0f7f2a4df5d3e399788a6c" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`ALTER TABLE "challenges" DROP CONSTRAINT "FK_dffbc0f7f2a4df5d3e399788a6c"`);
        await queryRunner.query(`ALTER TABLE "partnerships" DROP CONSTRAINT "FK_bdf4cc75996af40e02d47bb7954"`);
        await queryRunner.query(`CREATE TYPE "public"."challenge_status_enum_old" AS ENUM('open', 'in-progress', 'completed')`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "status" TYPE "public"."challenge_status_enum_old" USING "status"::"text"::"public"."challenge_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "status" SET DEFAULT 'open'`);
        await queryRunner.query(`DROP TYPE "public"."challenges_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."challenge_status_enum_old" RENAME TO "challenge_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."challenge_type_enum_old" AS ENUM('government', 'corporate', 'individual')`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "type" TYPE "public"."challenge_type_enum_old" USING "type"::"text"::"public"."challenge_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "challenges" ALTER COLUMN "type" SET DEFAULT 'corporate'`);
        await queryRunner.query(`DROP TYPE "public"."challenges_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."challenge_type_enum_old" RENAME TO "challenge_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."partnership_status_enum_old" AS ENUM('proposed', 'active', 'completed')`);
        await queryRunner.query(`ALTER TABLE "partnerships" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "partnerships" ALTER COLUMN "status" TYPE "public"."partnership_status_enum_old" USING "status"::"text"::"public"."partnership_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "partnerships" ALTER COLUMN "status" SET DEFAULT 'proposed'`);
        await queryRunner.query(`DROP TYPE "public"."partnerships_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."partnership_status_enum_old" RENAME TO "partnership_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('admin', 'innovator', 'organization', 'startup', 'research', 'corporate', 'government', 'investor', 'individual')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'innovator'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "challenges" ADD CONSTRAINT "FK_challenges_createdById" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "partnerships" ADD CONSTRAINT "FK_partnerships_createdById" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
