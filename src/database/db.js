import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || './data/pocketfridge.db';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, err => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('📦 Connected to SQLite database');
  }
});

// Promisify database methods for easier async/await usage
export const dbRun = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Create fridges table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS fridges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create items table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fridge_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit TEXT,
        category TEXT,
        expiry_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fridge_id) REFERENCES fridges(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_items_fridge_id 
      ON items(fridge_id)
    `);

    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_items_expiry_date 
      ON items(expiry_date)
    `);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

export default db;
