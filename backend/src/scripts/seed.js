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
    const hrHash = await bcrypt.hash('Abc@123456', 10);
    const userHash = await bcrypt.hash('User@123', 10); // default for randoms
    
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
    
    console.log('Database seeded successfully!');
    db.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    db.close();
  }
}

seed();
