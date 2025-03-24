import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProgressTracking1689348567891 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add progressValue field to collaborations table
        await queryRunner.query(`
            ALTER TABLE "collaborations" 
            ADD COLUMN IF NOT EXISTS "progressValue" integer DEFAULT 0
        `);

        // Create milestones table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "milestones" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "dueDate" date NOT NULL,
                "completed" boolean NOT NULL DEFAULT false,
                "collaborationId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_milestones_collaborations" FOREIGN KEY ("collaborationId") 
                REFERENCES "collaborations" ("id") ON DELETE CASCADE
            )
        `);

        // Create index on collaborationId for performance
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_milestones_collaborationId" ON "milestones" ("collaborationId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_milestones_collaborationId"
        `);

        // Drop the milestones table
        await queryRunner.query(`
            DROP TABLE IF EXISTS "milestones"
        `);

        // Remove the progressValue column
        await queryRunner.query(`
            ALTER TABLE "collaborations" 
            DROP COLUMN IF EXISTS "progressValue"
        `);
    }
} 