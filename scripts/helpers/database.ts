import { intro, isCancel, select, log, spinner } from '@clack/prompts';
import { MongoClient } from 'mongodb';
import { selectEnvironmentMenu, useEnvironment, type HelperEnvironment } from './core';
import { readdir } from 'node:fs/promises';
import { join } from 'path';

const PROJECT_ROOT = join(import.meta.dir, '../../');
let CURRENT_ENVIRONMENT_NAME = '';
let CURRENT_ENVIRONMENT: HelperEnvironment = {} as HelperEnvironment;

type HelperDatabaseMainMenuActions = 'goto:migrations' | 'goto:snapshots' | 'select:environment' | 'exit' | symbol;

const logger = log;
let client:MongoClient | null = null;

async function defineMongoClient(mongoUri: string) { 
  if (!mongoUri) {
    logger.error('MongoDB URI is not provided.');
    return null;
  }
  client = new MongoClient(mongoUri);
  await client.connect();
  return client;
}

// Migrations

async function manageMigration(direction: 'up' | 'down') {
  const thisSpinner = spinner();
  if (!client) return logger.error('MongoClient is not initialized. Please select an environment first.');
  const migrationsCollection = client.db().collection('migrations');
  const migrationsFiles = await readdir(join(import.meta.dir, '../migrations'));
  const appliedMigrations = new Set((await migrationsCollection.find({}).toArray()).map(m => m.name));
  const migrationsToRun = direction === 'up'
    ? migrationsFiles.filter(file => !appliedMigrations.has(file))
    : migrationsFiles.filter(file => appliedMigrations.has(file)).reverse().splice(0, 1); // Only rollback the last applied migration

  if (migrationsToRun.length === 0) {
    logger.info(`No migrations to ${direction === 'up' ? 'apply' : 'rollback'}.`);
    return;
  }

  for (const migrationFile of migrationsToRun) {
    thisSpinner.start(`${direction === 'up' ? 'Applying' : 'Rolling back'} migration: ${migrationFile}`);
    const migrationModule = await import(join(import.meta.dir, '../migrations', migrationFile));
    if (direction === 'up') {
      await migrationModule.up(client.db());
      await migrationsCollection.insertOne({ name: migrationFile, appliedAt: new Date() });
    } else {
      await migrationModule.down(client.db());
      await migrationsCollection.deleteOne({ name: migrationFile });
    }
    thisSpinner.stop(`${direction === 'up' ? 'Applied' : 'Rolled back'} migration: ${migrationFile}`);
  }

  logger.success(`Successfully ${direction === 'up' ? 'applied' : 'rolled back'} migrations.`);
}

async function migrationsMenu() {
  const thisSpinner = spinner();
  if (!client) return logger.error('MongoClient is not initialized. Please select an environment first.');
  thisSpinner.start('Checking migrations');
  // Check if "migrations" collection exists
  const collections = await client.db().listCollections().toArray();
  const migrationsCollectionExists = collections.some(col => col.name === 'migrations');
  if (!migrationsCollectionExists) {
    logger.warn('Migrations collection does not exist, creating it...');
    await client.db().createCollection('migrations');
  }
  const appliedMigrations = await client.db().collection('migrations').find().toArray();
  thisSpinner.stop('Checking migrations');
  logger.info(`Applied Migrations: ${appliedMigrations.map(m => m.name).join(', ') || 'None'}`);

  const actions: Record<'apply' | 'rollback', () => Promise<void>> = {
    'apply': async () => {
      logger.info('Applying migrations...');
      await manageMigration('up');
      mainMenu();
    },
    'rollback': async () => {
      logger.info('Rolling back last migration...');
      await manageMigration('down');
      mainMenu();
    }
  };

  const action = await select({
    message: 'Select an action:',
    options: [
      { label: 'Apply Migrations', value: 'apply' },
      { label: 'Rollback Last Migration', value: 'rollback' }
    ]
  });

  if (isCancel(action) || !action) return mainMenu();
  actions[action as keyof typeof actions]();
};

// Snapshots

function getOutputDir(withDate?: boolean) {
  return join(PROJECT_ROOT, `./.data/db-snapshots/${CURRENT_ENVIRONMENT_NAME}`, withDate ? new Date().toISOString() : '');
}

async function saveSnapshot(uri: string) {
  await Bun.$`mongodump --uri="${uri}" --out="${getOutputDir(true)}"`;
}

async function restoreSnapshot(uri: string, snapshotDir: string) {
  const fullSnapshotDir = join(getOutputDir(), snapshotDir);
  const databaseName = uri.split('/').pop()?.split('?')[0]; // Extract database name from URI
  logger.info(`Restoring snapshot from ${fullSnapshotDir} to database ${databaseName}`);
  await Bun.$`mongorestore --uri="${uri}" ${fullSnapshotDir}/${databaseName} -d ${databaseName} --drop`;
}

async function listSnapshots() {
  const snapshotsDir = getOutputDir();
  try {
    return await readdir(snapshotsDir);
  } catch (error) {
    logger.error(`Failed to list snapshots: ${error}`);
    return [];
  }
}

async function snapshotsMenu() {
  if (!client) return logger.error('MongoClient is not initialized. Please select an environment first.');

  const actions: Record<'save' | 'restore', () => Promise<void>> = {
    'save': async () => {
      logger.info('Saving snapshot...');
      await saveSnapshot(CURRENT_ENVIRONMENT.database.uri);
      logger.success('Snapshot saved successfully.');
      mainMenu();
    },
    'restore': async () => {
      const snapshots = await listSnapshots();
      if (snapshots.length === 0) {
        logger.warn('No snapshots available to restore.');
        return mainMenu();
      }
      const snapshotDir = await select({
        message: 'Select a snapshot to restore:',
        options: [
          ...snapshots.map(snapshot => ({ label: snapshot, value: snapshot }))
        ]
      });
      if (!snapshotDir) return mainMenu();
      await restoreSnapshot(CURRENT_ENVIRONMENT.database.uri, snapshotDir as string);
      logger.success('Snapshot restored successfully.');
      mainMenu();
    }
  };

  const action = await select({
    message: 'Select an action:',
    options: [
      { label: 'Save Snapshot', value: 'save' },
      { label: 'Restore Snapshot', value: 'restore' }
    ]
  });
  
  if (isCancel(action) || !action) return mainMenu();
  actions[action as keyof typeof actions]();
}

async function selectLocalEnvironment(): Promise<string | symbol | null | void> {
  const selectedEnvironmentName = await selectEnvironmentMenu();
  if (isCancel(selectedEnvironmentName) || !selectedEnvironmentName) return mainMenu();
  CURRENT_ENVIRONMENT_NAME = selectedEnvironmentName as string;
  logger.step(`Selected Environment: ${CURRENT_ENVIRONMENT_NAME}`);
  const selectedEnvironment = await useEnvironment(CURRENT_ENVIRONMENT_NAME);
  CURRENT_ENVIRONMENT = selectedEnvironment;
  await defineMongoClient(selectedEnvironment.database.uri);
  mainMenu();
}

async function mainMenu() {
  const actions: Record<HelperDatabaseMainMenuActions, () => Promise<void> | void> = {
    'exit': () => process.exit(0),
    'goto:migrations': migrationsMenu,
    'goto:snapshots': snapshotsMenu,
    'select:environment': async () => {
      const selectedEnvironmentName = await selectEnvironmentMenu();
      if (isCancel(selectedEnvironmentName) || !selectedEnvironmentName) return mainMenu();
      CURRENT_ENVIRONMENT_NAME = selectedEnvironmentName as string;
      logger.step(`Selected Environment: ${CURRENT_ENVIRONMENT_NAME}`);
      const selectedEnvironment = await useEnvironment(CURRENT_ENVIRONMENT_NAME);
      CURRENT_ENVIRONMENT = selectedEnvironment;
      await defineMongoClient(selectedEnvironment.database.uri);
      mainMenu();
    }
  };
  intro('Database Helper');
  const action:HelperDatabaseMainMenuActions = await select({
    message: `Select an action (${CURRENT_ENVIRONMENT_NAME}):`,
    options: [
      { label: 'Select Environment', value: 'select:environment' },
      { label: 'Manage Migrations', value: 'goto:migrations' },
      { label: 'Manage Snapshots', value: 'goto:snapshots' },
      { label: 'Exit', value: 'exit' }
    ]
  });
  if (isCancel(action)) actions.exit();
  actions[action]();
};

console.clear();
selectLocalEnvironment();