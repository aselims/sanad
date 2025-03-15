import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateIdeasTable1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ideas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'stage',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'target_audience',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'potential_impact',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'resources_needed',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'PROPOSED'",
          },
          {
            name: 'participants',
            type: 'text[]',
            isNullable: false,
            default: "'{}'",
          },
          {
            name: 'created_by_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add foreign key for created_by_id
    await queryRunner.createForeignKey(
      'ideas',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('ideas');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('created_by_id') !== -1
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('ideas', foreignKey);
      }
    }
    await queryRunner.dropTable('ideas');
  }
} 