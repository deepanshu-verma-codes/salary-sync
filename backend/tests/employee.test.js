const request = require('supertest');
const app = require('../src/app');
const { db, initDb } = require('../src/db/database');

beforeAll(async () => {
  await initDb();
  await new Promise((resolve) => {
    db.run(`
      INSERT INTO employees (name, email, job_title, department, country, salary, date_joined)
      VALUES 
      ('Alice', 'alice@test.com', 'Engineer', 'Engineering', 'USA', 100000, '2022-01-01'),
      ('Bob', 'bob@test.com', 'Sales', 'Sales', 'UK', 80000, '2023-01-01')
    `, resolve);
  });
});

afterAll((done) => {
  db.close(done);
});

describe('Employee API', () => {
  it('should fetch stats', async () => {
    const res = await request(app).get('/api/employees/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.totalEmployees).toBe(2);
    expect(res.body.totalPayroll).toBe(180000);
  });

  it('should fetch employees with pagination', async () => {
    const res = await request(app).get('/api/employees?limit=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter employees by department', async () => {
    const res = await request(app).get('/api/employees?department=Engineering');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Alice');
  });
});
