import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConnectionsAndMessages1715000000000 implements MigrationInterface {
    name = 'CreateConnectionsAndMessages1715000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add allowConnections column to users table
        await queryRunner.query(`ALTER TABLE "users" ADD "allowConnections" boolean NOT NULL DEFAULT true`);

        // Create connections table
        await queryRunner.query(`
            CREATE TYPE "public"."connections_status_enum" AS ENUM('pending', 'accepted', 'rejected')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "connections" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "requesterId" uuid NOT NULL,
                "receiverId" uuid NOT NULL,
                "status" "public"."connections_status_enum" NOT NULL DEFAULT 'pending',
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_receiver"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_sender"`);
        await queryRunner.query(`ALTER TABLE "connections" DROP CONSTRAINT "FK_connections_receiver"`);
        await queryRunner.query(`ALTER TABLE "connections" DROP CONSTRAINT "FK_connections_requester"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "connections"`);
        await queryRunner.query(`DROP TYPE "public"."connections_status_enum"`);

        // Drop allowConnections column from users table
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "allowConnections"`);
    }
} 