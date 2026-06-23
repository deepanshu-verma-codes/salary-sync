const { db, initDb } = require('../db/database');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const SEED_COUNT = 10000;
const BATCH_SIZE = 500;

const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Product', 'Support'];
const countries = ['USA', 'UK', 'India', 'Canada', 'Australia', 'Germany', 'France', 'Japan'];

async function seed() {
  try {
    // Recreate DB completely for new schema
    await new Promise((resolve, reject) => {
      db.run('DROP TABLE IF EXISTS payslips', err => err ? reject(err) : resolve());
    });
    await new Promise((resolve, reject) => {
      db.run('DROP TABLE IF EXISTS employees', err => err ? reject(err) : resolve());
    });
    
    await initDb();
    
    console.log('Generating password hashes...');
    const adminHash = await bcrypt.hash('Admin@123456', 10);
    const hrHash = await bcrypt.hash('HR@123456', 10);
    const userHash = await bcrypt.hash('ABC@123456', 10); // default for randoms
    
    // Insert Admin
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO employees (name, email, password, role, job_title, department, country, salary, experience, date_joined) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Admin User', 'iAmAdmin@yopmail.com', adminHash, 'ADMIN', 'CEO', 'Management', 'USA', 0, 10, '2020-01-01'],
        err => err ? reject(err) : resolve()
      );
    });
    
    // Insert HR / Subadmin
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO employees (name, email, password, role, job_title, department, country, salary, experience, date_joined) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['HR Manager', 'hr@yopmail.com', hrHash, 'SUBADMIN', 'HR Manager', 'HR', 'USA', 150000, 5, '2021-01-01'],
        err => err ? reject(err) : resolve()
      );
    });

    console.log('Database seeded successfully with Admin and HR users!');

    await new Promise((resolve, reject) => {
      console.log('Generating remaining 9998 employees in bulk...');
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare(`INSERT INTO employees (name, email, password, role, job_title, department, country, salary, experience, date_joined) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        for (let i = 0; i < 9998; i++) {
          const dept = departments[Math.floor(Math.random() * departments.length)];
          const country = countries[Math.floor(Math.random() * countries.length)];
          stmt.run(
            faker.person.fullName(),
            faker.internet.email().toLowerCase() + i, // prevent unique constraint conflicts
            userHash,
            'USER',
            faker.person.jobTitle(),
            dept,
            country,
            Math.floor(Math.random() * 100000) + 40000,
            Math.floor(Math.random() * 20) + 1,
            faker.date.past({ years: 10 }).toISOString().split('T')[0]
          );
        }
        stmt.finalize();
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    console.log('Database seeded successfully with 10000 total employees!');
    db.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    db.close();
  }
}

seed();
