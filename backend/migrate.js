const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Simple migration script to add new columns to existing database
const migrateDatabase = () => {
  const dbPath = path.join(__dirname, 'data', 'dashboard.db');
  const db = new sqlite3.Database(dbPath);

  console.log('🔄 Starting database migration...');

  // Add target_value column if it doesn't exist
  db.run(`ALTER TABLE quarterly_data ADD COLUMN target_value REAL`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding target_value column:', err.message);
    } else if (!err) {
      console.log('✅ Added target_value column');
    }
  });

  // Add status column if it doesn't exist
  db.run(`ALTER TABLE quarterly_data ADD COLUMN status TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding status column:', err.message);
    } else if (!err) {
      console.log('✅ Added status column');
    }
  });

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Database migration completed successfully');
    }
  });
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };
