import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChallengeAndPartnershipTables1709790000000 implements MigrationInterface {
    name = 'CreateChallengeAndPartnershipTables1709790000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create challenge_type_enum
        await queryRunner.query(`
            CREATE TYPE "challenge_type_enum" AS ENUM('government', 'corporate', 'individual')
        `);

        // Create challenge_status_enum
        await queryRunner.query(`
            CREATE TYPE "challenge_status_enum" AS ENUM('open', 'in-progress', 'completed')
        `);

        // Create challenges table
        await queryRunner.query(`
            CREATE TABLE "challenges" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "organization" character varying NOT NULL,
                "type" "challenge_type_enum" NOT NULL DEFAULT 'corporate',
                "status" "challenge_status_enum" NOT NULL DEFAULT 'open',
                "deadline" character varying,
                "reward" character varying,
                "eligibilityCriteria" text,
                "createdById" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_challenges" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key for createdBy
        await queryRunner.query(`
            ALTER TABLE "challenges" 
            ADD CONSTRAINT "FK_challenges_createdBy" 
            FOREIGN KEY ("createdById") 
            REFERENCES "users"("id") 
            ON DELETE SET NULL
        `);

        // Create partnership_status_enum
        await queryRunner.query(`
            CREATE TYPE "partnership_status_enum" AS ENUM('proposed', 'active', 'completed')
        `);

        // Create partnerships table
        await queryRunner.query(`
            CREATE TABLE "partnerships" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "participants" text NOT NULL,
                "status" "partnership_status_enum" NOT NULL DEFAULT 'proposed',
                "duration" character varying,
                "resources" text,
                "expectedOutcomes" text,
                "createdById" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_partnerships" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key for createdBy
        await queryRunner.query(`
            ALTER TABLE "partnerships" 
            ADD CONSTRAINT "FK_partnerships_createdBy" 
            FOREIGN KEY ("createdById") 
            REFERENCES "users"("id") 
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`
            ALTER TABLE "partnerships" 
            DROP CONSTRAINT "FK_partnerships_createdBy"
        `);

        await queryRunner.query(`
            ALTER TABLE "challenges" 
            DROP CONSTRAINT "FK_challenges_createdBy"
        `);

        // Drop tables
        await queryRunner.query(`DROP TABLE "partnerships"`);
        await queryRunner.query(`DROP TABLE "challenges"`);

        // Drop enums
        await queryRunner.query(`DROP TYPE "partnership_status_enum"`);
        await queryRunner.query(`DROP TYPE "challenge_status_enum"`);
        await queryRunner.query(`DROP TYPE "challenge_type_enum"`);
    }
} 