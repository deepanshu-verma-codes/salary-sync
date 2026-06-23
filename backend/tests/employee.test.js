const request = require('supertest');
const app = require('../src/app');
const { db, initDb } = require('../src/db/database');
const jwt = require('jsonwebtoken');

let token;

beforeAll(async () => {
  await initDb();
  await new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO employees (name, email, password, job_title, department, country, salary, date_joined, role)
      VALUES 
      ('Alice', 'alice@test.com', 'hashed', 'Engineer', 'Engineering', 'USA', 100000, '2022-01-01', 'ADMIN'),
      ('Bob', 'bob@test.com', 'hashed', 'Sales', 'Sales', 'UK', 80000, '2023-01-01', 'USER')
    `, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
  
  // Create an Admin token to bypass the requireRole middleware
  token = jwt.sign(
    { id: 1, role: 'ADMIN', email: 'alice@test.com' },
    process.env.JWT_SECRET || 'super-secret-jwt-key',
    { expiresIn: '1h' }
  );
});

afterAll((done) => {
  db.close(done);
});

describe('Employee API', () => {
  it('should fetch stats', async () => {
    const res = await request(app).get('/api/employees/stats').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.totalEmployees).toBe(1); // Admin is excluded from stats
    expect(res.body.totalPayroll).toBe(80000);
  });

  it('should fetch employees with pagination', async () => {
    const res = await request(app).get('/api/employees?limit=1').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter employees by department', async () => {
    const res = await request(app).get('/api/employees?department=Engineering').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Alice');
  });
});
