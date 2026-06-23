const { db } = require('../db/database');

const createPayslip = (req, res) => {
  const { employee_id, month, year, amount } = req.body;
  if (!employee_id || !month || !year || !amount) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const paid_at = new Date().toISOString().split('T')[0];

  db.run(`INSERT INTO payslips (employee_id, month, year, amount, paid_at) VALUES (?, ?, ?, ?, ?)`,
    [employee_id, month, year, amount, paid_at],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, employee_id, month, year, amount, paid_at });
    }
  );
};

const getPayslips = (req, res) => {
  const { user } = req;
  const { employee_id } = req.query;

  // If USER, they can only see their own
  if (user.role === 'USER') {
    db.all(`SELECT p.*, e.name as employee_name, e.department as employee_department, e.job_title as employee_job_title, e.date_joined as employee_date_joined FROM payslips p JOIN employees e ON p.employee_id = e.id WHERE p.employee_id = ? ORDER BY p.year DESC, p.month DESC`, [user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
    return;
  }

  // Admin/Subadmin can see specific employee or all
  if (employee_id) {
    db.all(`SELECT p.*, e.name as employee_name, e.department as employee_department, e.job_title as employee_job_title, e.date_joined as employee_date_joined FROM payslips p JOIN employees e ON p.employee_id = e.id WHERE p.employee_id = ? ORDER BY p.year DESC, p.month DESC`, [employee_id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all(`SELECT p.*, e.name as employee_name, e.department as employee_department, e.job_title as employee_job_title, e.date_joined as employee_date_joined FROM payslips p JOIN employees e ON p.employee_id = e.id ORDER BY p.year DESC, p.month DESC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
};

module.exports = { createPayslip, getPayslips };
