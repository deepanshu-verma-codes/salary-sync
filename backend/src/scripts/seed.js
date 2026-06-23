const { db, initDb } = require('../db/database');
const { faker } = require('@faker-js/faker');

const SEED_COUNT = 10000;
const BATCH_SIZE = 500;

const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Product', 'Support'];
const countries = ['USA', 'UK', 'India', 'Canada', 'Australia', 'Germany', 'France', 'Japan'];

async function seed() {
  try {
    await initDb();
    
    // Clear existing
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM employees', err => err ? reject(err) : resolve());
    });
    
    console.log(`Starting to seed ${SEED_COUNT} employees...`);
    
    for (let i = 0; i < SEED_COUNT; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, SEED_COUNT - i);
      const placeholders = [];
      const values = [];
      
      for (let j = 0; j < batchSize; j++) {
        placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
        values.push(
          faker.person.fullName(),
          faker.internet.email() + Math.random(), // ensure unique
          faker.person.jobTitle(),
          faker.helpers.arrayElement(departments),
          faker.helpers.arrayElement(countries),
          faker.number.int({ min: 40000, max: 250000 }),
          faker.date.past({ years: 5 }).toISOString().split('T')[0]
        );
      }
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO employees (name, email, job_title, department, country, salary, date_joined) VALUES ${placeholders.join(',')}`, values, (err) => {
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
