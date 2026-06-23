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
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');

      db.run(`
        CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'USER',
          job_title TEXT NOT NULL,
          department TEXT NOT NULL,
          country TEXT NOT NULL,
          salary REAL NOT NULL,
          date_joined TEXT NOT NULL
        )
      `, (err) => {
        if (err) return reject(err);
      });
      
      db.run(`
        CREATE TABLE IF NOT EXISTS payslips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id INTEGER NOT NULL,
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          amount REAL NOT NULL,
          paid_at TEXT NOT NULL,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) return reject(err);
      });
      
      db.run('CREATE INDEX IF NOT EXISTS idx_department ON employees(department)');
      db.run('CREATE INDEX IF NOT EXISTS idx_country ON employees(country)');
      db.run('CREATE INDEX IF NOT EXISTS idx_salary ON employees(salary)');
      db.run('CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id)', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

module.exports = { db, initDb };
