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
      db.run(`INSERT INTO employees (name, email, password, role, job_title, department, country, salary, date_joined) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Admin User', 'iAmAdmin@yopmail.com', adminHash, 'ADMIN', 'CEO', 'Management', 'USA', 500000, '2020-01-01'],
        err => err ? reject(err) : resolve()
      );
    });
    
    // Insert HR / Subadmin
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO employees (name, email, password, role, job_title, department, country, salary, date_joined) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['HR Manager', 'hr@yopmail.com', hrHash, 'SUBADMIN', 'HR Manager', 'HR', 'USA', 150000, '2021-01-01'],
        err => err ? reject(err) : resolve()
      );
    });

    console.log(`Starting to seed ${SEED_COUNT} random employees...`);
    
    for (let i = 0; i < SEED_COUNT; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, SEED_COUNT - i);
      const placeholders = [];
      const values = [];
      
      for (let j = 0; j < batchSize; j++) {
        placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
        values.push(
          faker.person.fullName(),
          faker.internet.email() + Math.random(), // ensure unique
          userHash,
          'USER',
          faker.person.jobTitle(),
          faker.helpers.arrayElement(departments),
          faker.helpers.arrayElement(countries),
          faker.number.int({ min: 40000, max: 250000 }),
          faker.date.past({ years: 5 }).toISOString().split('T')[0]
        );
      }
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO employees (name, email, password, role, job_title, department, country, salary, date_joined) VALUES ${placeholders.join(',')}`, values, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log(`Seeded ${i + batchSize} / ${SEED_COUNT}`);
    }
    
    console.log('Database seeded successfully!');
    db.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    db.close();
  }
}

seed();
