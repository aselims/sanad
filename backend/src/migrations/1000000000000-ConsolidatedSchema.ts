import { MigrationInterface, QueryRunner } from "typeorm";

export class ConsolidatedSchema1000000000000 implements MigrationInterface {
    name = 'ConsolidatedSchema1000000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types first
        await queryRunner.query(`
            CREATE TYPE "users_role_enum" AS ENUM(
                'admin', 
                'startup', 
                'research', 
                'corporate', 
                'government', 
                'investor', 
                'individual',
                'organization',
                'accelerator',
                'incubator'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "connections_status_enum" AS ENUM(
                'pending',
                'accepted',
                'rejected'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "ideas_status_enum" AS ENUM(
                'proposed',
                'active',
                'completed'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "ideas_stage_enum" AS ENUM(
                'concept',
                'prototype',
                'validated',
                'scaling'
            )
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying(100) NOT NULL,
                "lastName" character varying(100) NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "users_role_enum" NOT NULL DEFAULT 'individual',
                "profilePicture" character varying,
                "bio" character varying(500),
                "organization" character varying,
                "position" character varying,
                "location" character varying,
                "tags" text,
                "interests" text,
                "isVerified" boolean NOT NULL DEFAULT false,
                "isActive" boolean NOT NULL DEFAULT true,
                "allowMessages" boolean NOT NULL DEFAULT true,
                "allowConnections" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Create connections table
        await queryRunner.query(`
            CREATE TABLE "connections" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "requesterId" uuid NOT NULL,
                "receiverId" uuid NOT NULL,
                "status" "connections_status_enum" NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_connections" PRIMARY KEY ("id")
            )
        `);

        // Create messages table
        await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "senderId" uuid NOT NULL,
                "receiverId" uuid NOT NULL,
                "content" text NOT NULL,
                "isRead" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_messages" PRIMARY KEY ("id")
            )
        `);

        // Create ideas table
        await queryRunner.query(`
            CREATE TABLE "ideas" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "participants" text array NOT NULL,
                "status" "ideas_status_enum" NOT NULL DEFAULT 'proposed',
                "category" character varying NOT NULL,
                "stage" "ideas_stage_enum" NOT NULL DEFAULT 'concept',
                "target_audience" character varying NOT NULL,
                "potential_impact" character varying NOT NULL,
                "resources_needed" text,
                "created_by_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ideas" PRIMARY KEY ("id")
            )
        `);

        // Create notifications table
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "type" character varying NOT NULL,
                "content" text NOT NULL,
                "isRead" boolean NOT NULL DEFAULT false,
                "referenceId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
            )
        `);

        // Create challenges table
        await queryRunner.query(`
            CREATE TABLE "challenges" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "organization" character varying NOT NULL,
                "deadline" TIMESTAMP,
                "criteria" text,
                "created_by_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_challenges" PRIMARY KEY ("id")
            )
        `);

        // Create partnerships table
        await queryRunner.query(`
            CREATE TABLE "partnerships" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "status" character varying NOT NULL,
                "initiator_id" uuid NOT NULL,
                "partner_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_partnerships" PRIMARY KEY ("id")
            )
        `);

        // Create matches table
        await queryRunner.query(`
            CREATE TABLE "matches" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user1Id" uuid NOT NULL,
                "user2Id" uuid NOT NULL,
                "score" numeric NOT NULL,
                "matchReason" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_matches" PRIMARY KEY ("id")
            )
        `);

        // Create collaborations table
        await queryRunner.query(`
            CREATE TABLE "collaborations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "status" character varying NOT NULL DEFAULT 'active',
                "ownerId" uuid NOT NULL,
                "members" text array NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_collaborations" PRIMARY KEY ("id")
            )
        `);

        // Create collaboration_files table
        await queryRunner.query(`
            CREATE TABLE "collaboration_files" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fileName" character varying NOT NULL,
                "fileUrl" character varying NOT NULL,
                "fileType" character varying NOT NULL,
                "collaborationId" uuid NOT NULL,
                "uploadedById" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_collaboration_files" PRIMARY KEY ("id")
            )
        `);

        // Create milestones table
        await queryRunner.query(`
            CREATE TABLE "milestones" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "dueDate" TIMESTAMP NOT NULL,
                "completed" boolean NOT NULL DEFAULT false,
                "collaborationId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_milestones" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "connections" 
            ADD CONSTRAINT "FK_connections_requester" 
            FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "connections" 
            ADD CONSTRAINT "FK_connections_receiver" 
            FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "messages" 
            ADD CONSTRAINT "FK_messages_sender" 
            FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "messages" 
            ADD CONSTRAINT "FK_messages_receiver" 
            FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "ideas" 
            ADD CONSTRAINT "FK_ideas_created_by" 
            FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "notifications" 
            ADD CONSTRAINT "FK_notifications_user" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "challenges" 
            ADD CONSTRAINT "FK_challenges_created_by" 
            FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "partnerships" 
            ADD CONSTRAINT "FK_partnerships_initiator" 
            FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "partnerships" 
            ADD CONSTRAINT "FK_partnerships_partner" 
            FOREIGN KEY ("partner_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "matches" 
            ADD CONSTRAINT "FK_matches_user1" 
            FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "matches" 
            ADD CONSTRAINT "FK_matches_user2" 
            FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "collaborations" 
            ADD CONSTRAINT "FK_collaborations_owner" 
            FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "collaboration_files" 
            ADD CONSTRAINT "FK_collaboration_files_collaboration" 
            FOREIGN KEY ("collaborationId") REFERENCES "collaborations"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "collaboration_files" 
            ADD CONSTRAINT "FK_collaboration_files_uploaded_by" 
            FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "milestones" 
            ADD CONSTRAINT "FK_milestones_collaboration" 
            FOREIGN KEY ("collaborationId") REFERENCES "collaborations"("id") ON DELETE CASCADE
        `);

        // Add indexes for performance
        await queryRunner.query(`
            CREATE INDEX "IDX_users_email" ON "users" ("email")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_users_role" ON "users" ("role")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_connections_users" ON "connections" ("requesterId", "receiverId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_messages_users" ON "messages" ("senderId", "receiverId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_ideas_created_by" ON "ideas" ("created_by_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_user" ON "notifications" ("userId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_partnerships_users" ON "partnerships" ("initiator_id", "partner_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_matches_users" ON "matches" ("user1Id", "user2Id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_collaborations_owner" ON "collaborations" ("ownerId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_collaboration_files_collaboration" ON "collaboration_files" ("collaborationId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_milestones_collaboration" ON "milestones" ("collaborationId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all tables in reverse order (respecting foreign key constraints)
        await queryRunner.query(`DROP INDEX "IDX_milestones_collaboration"`);
        await queryRunner.query(`DROP INDEX "IDX_collaboration_files_collaboration"`);
        await queryRunner.query(`DROP INDEX "IDX_collaborations_owner"`);
        await queryRunner.query(`DROP INDEX "IDX_matches_users"`);
        await queryRunner.query(`DROP INDEX "IDX_partnerships_users"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_user"`);
        await queryRunner.query(`DROP INDEX "IDX_ideas_created_by"`);
        await queryRunner.query(`DROP INDEX "IDX_messages_users"`);
        await queryRunner.query(`DROP INDEX "IDX_connections_users"`);
        await queryRunner.query(`DROP INDEX "IDX_users_role"`);
        await queryRunner.query(`DROP INDEX "IDX_users_email"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "milestones" DROP CONSTRAINT "FK_milestones_collaboration"`);
        await queryRunner.query(`ALTER TABLE "collaboration_files" DROP CONSTRAINT "FK_collaboration_files_uploaded_by"`);
        await queryRunner.query(`ALTER TABLE "collaboration_files" DROP CONSTRAINT "FK_collaboration_files_collaboration"`);
        await queryRunner.query(`ALTER TABLE "collaborations" DROP CONSTRAINT "FK_collaborations_owner"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_matches_user2"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_matches_user1"`);
        await queryRunner.query(`ALTER TABLE "partnerships" DROP CONSTRAINT "FK_partnerships_partner"`);
        await queryRunner.query(`ALTER TABLE "partnerships" DROP CONSTRAINT "FK_partnerships_initiator"`);
        await queryRunner.query(`ALTER TABLE "challenges" DROP CONSTRAINT "FK_challenges_created_by"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`);
        await queryRunner.query(`ALTER TABLE "ideas" DROP CONSTRAINT "FK_ideas_created_by"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_receiver"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_sender"`);
        await queryRunner.query(`ALTER TABLE "connections" DROP CONSTRAINT "FK_connections_receiver"`);
        await queryRunner.query(`ALTER TABLE "connections" DROP CONSTRAINT "FK_connections_requester"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "milestones"`);
        await queryRunner.query(`DROP TABLE "collaboration_files"`);
        await queryRunner.query(`DROP TABLE "collaborations"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TABLE "partnerships"`);
        await queryRunner.query(`DROP TABLE "challenges"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "ideas"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "connections"`);
        await queryRunner.query(`DROP TABLE "users"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE "ideas_stage_enum"`);
        await queryRunner.query(`DROP TYPE "ideas_status_enum"`);
        await queryRunner.query(`DROP TYPE "connections_status_enum"`);
        await queryRunner.query(`DROP TYPE "users_role_enum"`);
    }
} 