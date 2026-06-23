const { db } = require('../db/database');

const getStats = (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as totalEmployees,
      SUM(salary) as totalPayroll,
      AVG(salary) as averageSalary
    FROM employees
  `;
  
  db.get(query, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
};

const getDistributionByDepartment = (req, res) => {
  const query = `
    SELECT department, COUNT(*) as count, AVG(salary) as averageSalary
    FROM employees
    GROUP BY department
    ORDER BY count DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const getDistributionByCountry = (req, res) => {
  const query = `
    SELECT country, COUNT(*) as count, AVG(salary) as averageSalary
    FROM employees
    GROUP BY country
    ORDER BY count DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const getEmployees = (req, res) => {
  const { page = 1, limit = 50, search = '', department, country, sortBy = 'id', sortDir = 'ASC' } = req.query;
  
  const offset = (page - 1) * limit;
  const params = [];
  let whereClauses = [];
  
  if (search) {
    whereClauses.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (department) {
    whereClauses.push('department = ?');
    params.push(department);
  }
  
  if (country) {
    whereClauses.push('country = ?');
    params.push(country);
  }
  
  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  
  const allowedSortCols = ['id', 'name', 'salary', 'date_joined'];
  const sortCol = allowedSortCols.includes(sortBy) ? sortBy : 'id';
  const order = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  const countQuery = `SELECT COUNT(*) as total FROM employees ${whereSql}`;
  const dataQuery = `SELECT * FROM employees ${whereSql} ORDER BY ${sortCol} ${order} LIMIT ? OFFSET ?`;
  
  db.get(countQuery, params, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all(dataQuery, [...params, limit, offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        data: rows,
        pagination: {
          total: countRow.total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
};

const getEmployeeById = (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Employee not found' });
    res.json(row);
  });
};

module.exports = {
  getStats,
  getDistributionByDepartment,
  getDistributionByCountry,
  getEmployees,
  getEmployeeById
};
