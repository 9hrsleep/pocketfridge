import { initializeDatabase } from './db.js';

async function setup() {
  console.log('🔧 Setting up PocketFridge database...');
  try {
    await initializeDatabase();
    console.log('✨ Database setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to setup database:', error);
    process.exit(1);
  }
}

setup();
