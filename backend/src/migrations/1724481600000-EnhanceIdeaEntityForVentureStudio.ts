import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceIdeaEntityForVentureStudio1724481600000 implements MigrationInterface {
  name = 'EnhanceIdeaEntityForVentureStudio1724481600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update idea status enum to include new venture-focused statuses
    await queryRunner.query(`
      ALTER TYPE "idea_status_enum" RENAME TO "idea_status_enum_old"
    `);
    
    await queryRunner.query(`
      CREATE TYPE "idea_status_enum" AS ENUM(
        'draft', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed'
      )
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ALTER COLUMN "status" TYPE "idea_status_enum" 
      USING CASE 
        WHEN "status"::text = 'proposed' THEN 'draft'::idea_status_enum
        ELSE "status"::text::idea_status_enum 
      END
    `);
    
    await queryRunner.query(`DROP TYPE "idea_status_enum_old"`);

    // Create approval status enum
    await queryRunner.query(`
      CREATE TYPE "approval_status_enum" AS ENUM(
        'pending', 'approved', 'rejected', 'needs_revision'
      )
    `);

    // Add business-focused fields to ideas table
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "business_model" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "target_market" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "competitive_advantage" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "funding_needed" numeric(15,2)
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "timeline" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "risk_factors" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "success_metrics" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "attachments" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "submission_completed" boolean NOT NULL DEFAULT false
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "submitted_at" TIMESTAMP
    `);

    // Add approval workflow fields
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "approval_status" "approval_status_enum" NOT NULL DEFAULT 'pending'
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "approved_by_id" uuid
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "approved_at" TIMESTAMP
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "rejection_reason" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD "admin_feedback" text
    `);

    // Add foreign key constraint for approved_by_id
    await queryRunner.query(`
      ALTER TABLE "ideas" ADD CONSTRAINT "FK_ideas_approved_by_id" 
      FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_ideas_status" ON "ideas" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_ideas_approval_status" ON "ideas" ("approval_status")`);
    await queryRunner.query(`CREATE INDEX "IDX_ideas_submitted_at" ON "ideas" ("submitted_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_ideas_approved_at" ON "ideas" ("approved_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_ideas_submission_completed" ON "ideas" ("submission_completed")`);
    await queryRunner.query(`CREATE INDEX "IDX_ideas_funding_needed" ON "ideas" ("funding_needed")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX "IDX_ideas_funding_needed"`);
    await queryRunner.query(`DROP INDEX "IDX_ideas_submission_completed"`);
    await queryRunner.query(`DROP INDEX "IDX_ideas_approved_at"`);
    await queryRunner.query(`DROP INDEX "IDX_ideas_submitted_at"`);
    await queryRunner.query(`DROP INDEX "IDX_ideas_approval_status"`);
    await queryRunner.query(`DROP INDEX "IDX_ideas_status"`);

    // Remove foreign key constraint
    await queryRunner.query(`ALTER TABLE "ideas" DROP CONSTRAINT "FK_ideas_approved_by_id"`);

    // Remove new columns
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "admin_feedback"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "rejection_reason"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "approved_at"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "approved_by_id"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "approval_status"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "submitted_at"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "submission_completed"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "attachments"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "success_metrics"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "risk_factors"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "timeline"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "funding_needed"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "competitive_advantage"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "target_market"`);
    await queryRunner.query(`ALTER TABLE "ideas" DROP COLUMN "business_model"`);

    // Restore original idea status enum
    await queryRunner.query(`
      ALTER TYPE "idea_status_enum" RENAME TO "idea_status_enum_old"
    `);
    
    await queryRunner.query(`
      CREATE TYPE "idea_status_enum" AS ENUM('proposed', 'active', 'completed')
    `);
    
    await queryRunner.query(`
      ALTER TABLE "ideas" ALTER COLUMN "status" TYPE "idea_status_enum" 
      USING CASE 
        WHEN "status"::text = 'draft' THEN 'proposed'::idea_status_enum
        WHEN "status"::text IN ('submitted', 'under_review', 'approved', 'rejected') THEN 'proposed'::idea_status_enum
        ELSE "status"::text::idea_status_enum 
      END
    `);
    
    await queryRunner.query(`DROP TYPE "idea_status_enum_old"`);

    // Drop approval status enum
    await queryRunner.query(`DROP TYPE "approval_status_enum"`);
  }
}