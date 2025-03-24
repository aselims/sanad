import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCollaborationFilesTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "collaboration_files",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "path",
            type: "varchar",
          },
          {
            name: "mimeType",
            type: "varchar",
          },
          {
            name: "size",
            type: "integer",
          },
          {
            name: "uploadedById",
            type: "uuid",
          },
          {
            name: "collaborationId",
            type: "uuid",
          },
          {
            name: "uploadedAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Add foreign key to users table
    await queryRunner.createForeignKey(
      "collaboration_files",
      new TableForeignKey({
        columnNames: ["uploadedById"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    // Add foreign key to collaborations table
    await queryRunner.createForeignKey(
      "collaboration_files",
      new TableForeignKey({
        columnNames: ["collaborationId"],
        referencedColumnNames: ["id"],
        referencedTableName: "collaborations",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("collaboration_files");
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey("collaboration_files", foreignKey);
      }
    }
    await queryRunner.dropTable("collaboration_files");
  }
} 