import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase1CoreVentureDevelopment1724518400000 implements MigrationInterface {
  name = 'Phase1CoreVentureDevelopment1724518400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums for Phase 1 entities
    await queryRunner.query(`
      CREATE TYPE "project_status_enum" AS ENUM(
        'planning', 'development', 'mvp', 'growth', 'mature'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "project_stage_enum" AS ENUM(
        'pre_seed', 'seed', 'series_a', 'series_b'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "milestone_status_enum" AS ENUM(
        'not_started', 'in_progress', 'completed', 'blocked'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "team_status_enum" AS ENUM(
        'forming', 'active', 'completed', 'disbanded'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "team_type_enum" AS ENUM(
        'core_team', 'advisory_board', 'project_team', 'working_group'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "team_member_role_enum" AS ENUM(
        'founder', 'co_founder', 'team_lead', 'developer', 'designer', 
        'marketer', 'business_analyst', 'advisor', 'mentor', 'contributor'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "membership_status_enum" AS ENUM(
        'invited', 'active', 'inactive', 'left', 'removed'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "mentor_status_enum" AS ENUM(
        'active', 'busy', 'inactive', 'suspended'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "expertise_level_enum" AS ENUM(
        'senior', 'expert', 'specialist', 'thought_leader'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "session_status_enum" AS ENUM(
        'requested', 'accepted', 'confirmed', 'in_progress', 
        'completed', 'cancelled', 'no_show'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "session_type_enum" AS ENUM(
        'initial_consultation', 'strategy_session', 'technical_review', 
        'business_review', 'pitch_practice', 'problem_solving', 'career_guidance'
      )
    `);

    // Create projects table
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text NOT NULL,
        "source_idea_id" uuid,
        "status" "project_status_enum" NOT NULL DEFAULT 'planning',
        "stage" "project_stage_enum" NOT NULL DEFAULT 'pre_seed',
        "founder_id" uuid NOT NULL,
        "team_lead_id" uuid,
        "core_team_members" text,
        "target_launch_date" TIMESTAMP,
        "estimated_budget" numeric(15,2),
        "funding_goal" numeric(15,2),
        "current_milestone" character varying,
        "overall_progress" integer NOT NULL DEFAULT 0,
        "last_status_update" TIMESTAMP NOT NULL DEFAULT now(),
        "has_validated_idea" boolean NOT NULL DEFAULT false,
        "has_market_research" boolean NOT NULL DEFAULT false,
        "has_business_plan" boolean NOT NULL DEFAULT false,
        "has_mvp" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create project_milestones table
    await queryRunner.query(`
      CREATE TABLE "project_milestones" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "due_date" TIMESTAMP NOT NULL,
        "status" "milestone_status_enum" NOT NULL DEFAULT 'not_started',
        "assignee_id" uuid,
        "completed_at" TIMESTAMP,
        "blockers" text,
        "progress_percentage" integer NOT NULL DEFAULT 0,
        "priority" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create teams table
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "type" "team_type_enum" NOT NULL DEFAULT 'project_team',
        "status" "team_status_enum" NOT NULL DEFAULT 'forming',
        "team_lead_id" uuid NOT NULL,
        "project_id" uuid,
        "max_members" integer NOT NULL DEFAULT 10,
        "current_members_count" integer NOT NULL DEFAULT 1,
        "required_skills" text,
        "preferred_skills" text,
        "is_open_for_members" boolean NOT NULL DEFAULT true,
        "team_charter" text,
        "communication_guidelines" text,
        "equity_split_agreed" boolean NOT NULL DEFAULT false,
        "equity_split" json,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create team_members table
    await queryRunner.query(`
      CREATE TABLE "team_members" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "team_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "team_member_role_enum" NOT NULL DEFAULT 'contributor',
        "status" "membership_status_enum" NOT NULL DEFAULT 'active',
        "joined_at" TIMESTAMP NOT NULL,
        "left_at" TIMESTAMP,
        "equity_percentage" numeric(5,2),
        "responsibilities" text,
        "time_commitment_hours" integer,
        "invited_by_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create mentors table
    await queryRunner.query(`
      CREATE TABLE "mentors" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL UNIQUE,
        "status" "mentor_status_enum" NOT NULL DEFAULT 'active',
        "company_name" character varying,
        "job_title" character varying,
        "years_of_experience" integer NOT NULL,
        "expertise_level" "expertise_level_enum" NOT NULL DEFAULT 'senior',
        "industry_focus" text NOT NULL,
        "functional_expertise" text NOT NULL,
        "stage_preference" text NOT NULL,
        "max_mentees" integer NOT NULL DEFAULT 5,
        "current_mentees" integer NOT NULL DEFAULT 0,
        "hours_per_week" integer,
        "session_duration_minutes" integer NOT NULL DEFAULT 60,
        "is_paid_mentoring" boolean NOT NULL DEFAULT false,
        "hourly_rate" numeric(10,2),
        "available_days" text NOT NULL,
        "timezone" character varying NOT NULL DEFAULT 'UTC',
        "available_time_slots" text NOT NULL,
        "total_sessions" integer NOT NULL DEFAULT 0,
        "average_rating" numeric(3,2),
        "total_reviews" integer NOT NULL DEFAULT 0,
        "response_time_hours" integer NOT NULL DEFAULT 24,
        "bio" text,
        "mentoring_philosophy" text,
        "success_stories" text,
        "linkedin_url" character varying,
        "website_url" character varying,
        "is_verified" boolean NOT NULL DEFAULT false,
        "verified_at" TIMESTAMP,
        "verification_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create mentor_sessions table
    await queryRunner.query(`
      CREATE TABLE "mentor_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "mentor_id" uuid NOT NULL,
        "mentee_id" uuid NOT NULL,
        "project_id" uuid,
        "type" "session_type_enum" NOT NULL DEFAULT 'initial_consultation',
        "status" "session_status_enum" NOT NULL DEFAULT 'requested',
        "scheduled_at" TIMESTAMP NOT NULL,
        "duration_minutes" integer NOT NULL DEFAULT 60,
        "started_at" TIMESTAMP,
        "ended_at" TIMESTAMP,
        "description" text NOT NULL,
        "objectives" text,
        "preparation_notes" text,
        "meeting_url" character varying,
        "meeting_id" character varying,
        "meeting_password" character varying,
        "session_notes" text,
        "action_items" text,
        "resources_shared" text,
        "mentee_rating" integer,
        "mentee_feedback" text,
        "mentor_rating" integer,
        "mentor_feedback" text,
        "is_paid" boolean NOT NULL DEFAULT false,
        "amount" numeric(10,2),
        "payment_status" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_source_idea_id" 
      FOREIGN KEY ("source_idea_id") REFERENCES "ideas"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_founder_id" 
      FOREIGN KEY ("founder_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_team_lead_id" 
      FOREIGN KEY ("team_lead_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "project_milestones" ADD CONSTRAINT "FK_project_milestones_project_id" 
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "project_milestones" ADD CONSTRAINT "FK_project_milestones_assignee_id" 
      FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_team_lead_id" 
      FOREIGN KEY ("team_lead_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_project_id" 
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_team_id" 
      FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_invited_by_id" 
      FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "mentors" ADD CONSTRAINT "FK_mentors_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "mentor_sessions" ADD CONSTRAINT "FK_mentor_sessions_mentor_id" 
      FOREIGN KEY ("mentor_id") REFERENCES "mentors"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "mentor_sessions" ADD CONSTRAINT "FK_mentor_sessions_mentee_id" 
      FOREIGN KEY ("mentee_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "mentor_sessions" ADD CONSTRAINT "FK_mentor_sessions_project_id" 
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_projects_status" ON "projects" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_stage" ON "projects" ("stage")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_founder_id" ON "projects" ("founder_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_target_launch_date" ON "projects" ("target_launch_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_overall_progress" ON "projects" ("overall_progress")`);

    await queryRunner.query(`CREATE INDEX "IDX_project_milestones_project_id" ON "project_milestones" ("project_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_milestones_status" ON "project_milestones" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_milestones_due_date" ON "project_milestones" ("due_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_milestones_assignee_id" ON "project_milestones" ("assignee_id")`);

    await queryRunner.query(`CREATE INDEX "IDX_teams_status" ON "teams" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_teams_type" ON "teams" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_teams_project_id" ON "teams" ("project_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_teams_team_lead_id" ON "teams" ("team_lead_id")`);

    await queryRunner.query(`CREATE INDEX "IDX_team_members_team_id" ON "team_members" ("team_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_team_members_user_id" ON "team_members" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_team_members_status" ON "team_members" ("status")`);

    await queryRunner.query(`CREATE INDEX "IDX_mentors_user_id" ON "mentors" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_mentors_status" ON "mentors" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_mentors_expertise_level" ON "mentors" ("expertise_level")`);
    await queryRunner.query(`CREATE INDEX "IDX_mentors_is_verified" ON "mentors" ("is_verified")`);

    await queryRunner.query(`CREATE INDEX "IDX_mentor_sessions_mentor_id" ON "mentor_sessions" ("mentor_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_mentor_sessions_mentee_id" ON "mentor_sessions" ("mentee_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_mentor_sessions_status" ON "mentor_sessions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_mentor_sessions_scheduled_at" ON "mentor_sessions" ("scheduled_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_mentor_sessions_scheduled_at"`);
    await queryRunner.query(`DROP INDEX "IDX_mentor_sessions_status"`);
    await queryRunner.query(`DROP INDEX "IDX_mentor_sessions_mentee_id"`);
    await queryRunner.query(`DROP INDEX "IDX_mentor_sessions_mentor_id"`);
    await queryRunner.query(`DROP INDEX "IDX_mentors_is_verified"`);
    await queryRunner.query(`DROP INDEX "IDX_mentors_expertise_level"`);
    await queryRunner.query(`DROP INDEX "IDX_mentors_status"`);
    await queryRunner.query(`DROP INDEX "IDX_mentors_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_team_members_status"`);
    await queryRunner.query(`DROP INDEX "IDX_team_members_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_team_members_team_id"`);
    await queryRunner.query(`DROP INDEX "IDX_teams_team_lead_id"`);
    await queryRunner.query(`DROP INDEX "IDX_teams_project_id"`);
    await queryRunner.query(`DROP INDEX "IDX_teams_type"`);
    await queryRunner.query(`DROP INDEX "IDX_teams_status"`);
    await queryRunner.query(`DROP INDEX "IDX_project_milestones_assignee_id"`);
    await queryRunner.query(`DROP INDEX "IDX_project_milestones_due_date"`);
    await queryRunner.query(`DROP INDEX "IDX_project_milestones_status"`);
    await queryRunner.query(`DROP INDEX "IDX_project_milestones_project_id"`);
    await queryRunner.query(`DROP INDEX "IDX_projects_overall_progress"`);
    await queryRunner.query(`DROP INDEX "IDX_projects_target_launch_date"`);
    await queryRunner.query(`DROP INDEX "IDX_projects_founder_id"`);
    await queryRunner.query(`DROP INDEX "IDX_projects_stage"`);
    await queryRunner.query(`DROP INDEX "IDX_projects_status"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "mentor_sessions" DROP CONSTRAINT "FK_mentor_sessions_project_id"`);
    await queryRunner.query(`ALTER TABLE "mentor_sessions" DROP CONSTRAINT "FK_mentor_sessions_mentee_id"`);
    await queryRunner.query(`ALTER TABLE "mentor_sessions" DROP CONSTRAINT "FK_mentor_sessions_mentor_id"`);
    await queryRunner.query(`ALTER TABLE "mentors" DROP CONSTRAINT "FK_mentors_user_id"`);
    await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_invited_by_id"`);
    await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_user_id"`);
    await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_team_id"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_project_id"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_team_lead_id"`);
    await queryRunner.query(`ALTER TABLE "project_milestones" DROP CONSTRAINT "FK_project_milestones_assignee_id"`);
    await queryRunner.query(`ALTER TABLE "project_milestones" DROP CONSTRAINT "FK_project_milestones_project_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_team_lead_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_founder_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_source_idea_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "mentor_sessions"`);
    await queryRunner.query(`DROP TABLE "mentors"`);
    await queryRunner.query(`DROP TABLE "team_members"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP TABLE "project_milestones"`);
    await queryRunner.query(`DROP TABLE "projects"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "session_type_enum"`);
    await queryRunner.query(`DROP TYPE "session_status_enum"`);
    await queryRunner.query(`DROP TYPE "expertise_level_enum"`);
    await queryRunner.query(`DROP TYPE "mentor_status_enum"`);
    await queryRunner.query(`DROP TYPE "membership_status_enum"`);
    await queryRunner.query(`DROP TYPE "team_member_role_enum"`);
    await queryRunner.query(`DROP TYPE "team_type_enum"`);
    await queryRunner.query(`DROP TYPE "team_status_enum"`);
    await queryRunner.query(`DROP TYPE "milestone_status_enum"`);
    await queryRunner.query(`DROP TYPE "project_stage_enum"`);
    await queryRunner.query(`DROP TYPE "project_status_enum"`);
  }
}