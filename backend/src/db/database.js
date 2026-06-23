const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  }
});

const initDb = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          job_title TEXT NOT NULL,
          department TEXT NOT NULL,
          country TEXT NOT NULL,
          salary REAL NOT NULL,
          date_joined TEXT NOT NULL
        )
      `, (err) => {
        if (err) return reject(err);
      });
      
      // Create indices for faster filtering/sorting
      db.run('CREATE INDEX IF NOT EXISTS idx_department ON employees(department)');
      db.run('CREATE INDEX IF NOT EXISTS idx_country ON employees(country)');
      db.run('CREATE INDEX IF NOT EXISTS idx_salary ON employees(salary)', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

module.exports = { db, initDb };
