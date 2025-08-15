import { AppDataSource } from '../config/data-source';
import logger from '../utils/logger';

const runMigrations = async () => {
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Run migrations
    const migrations = await AppDataSource.runMigrations();
    logger.info(`Successfully ran ${migrations.length} migrations`);

    // Close the connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');

    process.exit(0);
  } catch (error) {
    logger.error(`Error running migrations: ${error}`);
    process.exit(1);
  }
};

runMigrations();
