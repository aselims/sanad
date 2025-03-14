import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMatchesTable1710420000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'matches',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'targetUserId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'matchScore',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'sharedTags',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'highlight',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'preference',
            type: 'enum',
            enum: ['like', 'dislike', 'pending'],
            default: "'pending'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['targetUserId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('matches');
  }
} 