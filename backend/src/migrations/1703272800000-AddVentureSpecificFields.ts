import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVentureSpecificFields1703272800000 implements MigrationInterface {
  name = 'AddVentureSpecificFields1703272800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_skills table
    await queryRunner.query(`
      CREATE TABLE "user_skills" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "skill_name" character varying(100) NOT NULL,
        "proficiency_level" integer NOT NULL DEFAULT 1,
        "years_experience" integer NOT NULL DEFAULT 0,
        "certifications" text,
        "portfolio_items" json,
        "endorsed_by" text,
        "is_highlighted" boolean NOT NULL DEFAULT false,
        "is_visible" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_updated" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_skills" PRIMARY KEY ("id")
      )
    `);

    // Create team_invitations table
    await queryRunner.query(`
      CREATE TYPE "invitation_status_enum" AS ENUM(
        'pending', 'accepted', 'rejected', 'expired', 'cancelled'
      )
    `);
    
    await queryRunner.query(`
      CREATE TYPE "invitation_type_enum" AS ENUM(
        'co_founder', 'team_member', 'advisor', 'mentor', 'collaborator'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "team_invitations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "from_user_id" uuid NOT NULL,
        "to_user_id" uuid NOT NULL,
        "idea_id" uuid,
        "invitation_type" "invitation_type_enum" NOT NULL DEFAULT 'team_member',
        "message" character varying(500) NOT NULL,
        "status" "invitation_status_enum" NOT NULL DEFAULT 'pending',
        "response_message" character varying(500),
        "responded_at" TIMESTAMP,
        "expires_at" TIMESTAMP NOT NULL,
        "additional_data" json,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_team_invitations" PRIMARY KEY ("id")
      )
    `);

    // Add new user role enum values
    await queryRunner.query(`
      ALTER TYPE "user_role_enum" RENAME TO "user_role_enum_old"
    `);
    
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM(
        'admin', 'startup', 'startup_founder', 'research', 'corporate', 
        'government', 'investor', 'investor_individual', 'individual', 
        'organization', 'accelerator', 'incubator', 'mentor'
      )
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role_enum" 
      USING "role"::text::"user_role_enum"
    `);
    
    await queryRunner.query(`DROP TYPE "user_role_enum_old"`);

    // Create new enums for user fields
    await queryRunner.query(`
      CREATE TYPE "availability_status_enum" AS ENUM(
        'available', 'busy', 'not_available'
      )
    `);
    
    await queryRunner.query(`
      CREATE TYPE "work_type_enum" AS ENUM(
        'fulltime', 'parttime', 'contract', 'equity', 'hybrid'
      )
    `);
    
    await queryRunner.query(`
      CREATE TYPE "experience_level_enum" AS ENUM(
        'entry', 'mid', 'senior', 'expert'
      )
    `);

    // Add new columns to users table
    await queryRunner.query(`
      ALTER TABLE "users" ADD "availability_status" "availability_status_enum" NOT NULL DEFAULT 'available'
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "hourly_rate" numeric(10,2)
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "currency" character varying(3) DEFAULT 'USD'
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "preferred_work_type" "work_type_enum" NOT NULL DEFAULT 'fulltime'
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "experience_level" "experience_level_enum" NOT NULL DEFAULT 'mid'
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "profile_completion_percentage" integer NOT NULL DEFAULT 0
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "profile_completed" boolean NOT NULL DEFAULT false
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "profile_completed_at" TIMESTAMP
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "linkedin_url" character varying
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "github_url" character varying
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "website_url" character varying
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "portfolio_url" character varying
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "languages" json
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "time_zone" character varying(50)
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "working_hours" json
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "looking_for_cofounder" boolean NOT NULL DEFAULT true
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "looking_for_team_members" boolean NOT NULL DEFAULT true
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "open_to_mentoring" boolean NOT NULL DEFAULT true
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "seeking_mentor" boolean NOT NULL DEFAULT true
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "preferred_industries" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "preferred_company_stages" text
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "verification_level" integer NOT NULL DEFAULT 0
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "verified_at" TIMESTAMP
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "verified_by" character varying
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "achievements" json
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "connections_count" integer NOT NULL DEFAULT 0
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "endorsements_received" integer NOT NULL DEFAULT 0
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "endorsements_given" integer NOT NULL DEFAULT 0
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ADD "last_active_at" TIMESTAMP
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "user_skills" ADD CONSTRAINT "FK_user_skills_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    
    await queryRunner.query(`
      ALTER TABLE "team_invitations" ADD CONSTRAINT "FK_team_invitations_from_user_id" 
      FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    
    await queryRunner.query(`
      ALTER TABLE "team_invitations" ADD CONSTRAINT "FK_team_invitations_to_user_id" 
      FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    
    await queryRunner.query(`
      ALTER TABLE "team_invitations" ADD CONSTRAINT "FK_team_invitations_idea_id" 
      FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_user_skills_user_id" ON "user_skills" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_skills_skill_name" ON "user_skills" ("skill_name")`);
    await queryRunner.query(`CREATE INDEX "IDX_team_invitations_from_user_id" ON "team_invitations" ("from_user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_team_invitations_to_user_id" ON "team_invitations" ("to_user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_team_invitations_status" ON "team_invitations" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_availability_status" ON "users" ("availability_status")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_experience_level" ON "users" ("experience_level")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_looking_for_cofounder" ON "users" ("looking_for_cofounder")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX "IDX_users_looking_for_cofounder"`);
    await queryRunner.query(`DROP INDEX "IDX_users_experience_level"`);
    await queryRunner.query(`DROP INDEX "IDX_users_availability_status"`);
    await queryRunner.query(`DROP INDEX "IDX_team_invitations_status"`);
    await queryRunner.query(`DROP INDEX "IDX_team_invitations_to_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_team_invitations_from_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_skills_skill_name"`);
    await queryRunner.query(`DROP INDEX "IDX_user_skills_user_id"`);

    // Remove foreign key constraints
    await queryRunner.query(`ALTER TABLE "team_invitations" DROP CONSTRAINT "FK_team_invitations_idea_id"`);
    await queryRunner.query(`ALTER TABLE "team_invitations" DROP CONSTRAINT "FK_team_invitations_to_user_id"`);
    await queryRunner.query(`ALTER TABLE "team_invitations" DROP CONSTRAINT "FK_team_invitations_from_user_id"`);
    await queryRunner.query(`ALTER TABLE "user_skills" DROP CONSTRAINT "FK_user_skills_user_id"`);

    // Remove new columns from users table
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_active_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "endorsements_given"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "endorsements_received"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "connections_count"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "achievements"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verified_by"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verified_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verification_level"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "preferred_company_stages"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "preferred_industries"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "seeking_mentor"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "open_to_mentoring"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "looking_for_team_members"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "looking_for_cofounder"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "working_hours"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "time_zone"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "languages"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "portfolio_url"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "website_url"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "github_url"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "linkedin_url"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_completed_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_completed"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_completion_percentage"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "experience_level"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "preferred_work_type"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "currency"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "hourly_rate"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "availability_status"`);

    // Restore original user role enum
    await queryRunner.query(`
      ALTER TYPE "user_role_enum" RENAME TO "user_role_enum_old"
    `);
    
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM(
        'admin', 'startup', 'research', 'corporate', 'government', 
        'investor', 'individual', 'organization', 'accelerator', 'incubator'
      )
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role_enum" 
      USING "role"::text::"user_role_enum"
    `);
    
    await queryRunner.query(`DROP TYPE "user_role_enum_old"`);

    // Drop new tables
    await queryRunner.query(`DROP TABLE "team_invitations"`);
    await queryRunner.query(`DROP TABLE "user_skills"`);

    // Drop new enums
    await queryRunner.query(`DROP TYPE "experience_level_enum"`);
    await queryRunner.query(`DROP TYPE "work_type_enum"`);
    await queryRunner.query(`DROP TYPE "availability_status_enum"`);
    await queryRunner.query(`DROP TYPE "invitation_type_enum"`);
    await queryRunner.query(`DROP TYPE "invitation_status_enum"`);
  }
}
