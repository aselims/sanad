# Database Migration Consolidation

## Overview

This directory contains TypeORM migration files for managing the database schema. As part of the application migration and cleanup, we've consolidated all the incremental migrations into a single file that represents the final state of the database schema.

## Consolidated Migration

The file `1000000000000-ConsolidatedSchema.ts` contains a single migration that will create the entire database schema from scratch. This includes:

- All necessary enum types
- All tables with their columns and constraints
- All foreign key relationships
- Appropriate indexes for query optimization

## How to Use

### For New Deployments

For new deployments or when setting up a fresh database, you can use the consolidated migration file:

```bash
# Run just the consolidated migration
npm run typeorm migration:run -- -d src/data-source.ts
```

### For Existing Deployments

If you already have a database with existing data and previous migrations applied:

1. **Backup your database first!**
2. Check which migrations have been applied:
   ```bash
   npm run typeorm migration:show -- -d src/data-source.ts
   ```
3. If you want to use the consolidated migration instead of the individual migrations:
   - Drop the existing database or truncate all tables (after backing up!)
   - Run the consolidated migration

## Future Migrations

For future schema changes:

1. Keep the consolidated migration as a baseline
2. Create new migration files for incremental changes
3. Periodically consolidate all migrations again if needed

## Migration Benefits

1. **Simplified Setup**: New deployments can be set up with a single migration
2. **Clear Schema Definition**: One file shows the entire database structure
3. **Performance**: Setting up a new database is faster with one migration instead of many
4. **Maintainability**: Easier to understand the complete schema in one place 