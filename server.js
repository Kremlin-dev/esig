const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
};

let db;

// Initialize database connection and create table
async function initDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
    
    // Create submissions table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS esig_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employeeName VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        staffId VARCHAR(100) NOT NULL,
        signatureData LONGTEXT NOT NULL,
        submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database table created/verified');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Initialize database on startup
initDatabase();

app.get('/admin-dash', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/api/submit', async (req, res) => {
  const { employeeName, department, staffId, signatureData } = req.body;
  
  if (!employeeName || !department || !staffId || !signatureData) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO esig_submissions (employeeName, department, staffId, signatureData) VALUES (?, ?, ?, ?)`,
      [employeeName, department, staffId, signatureData]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM esig_submissions ORDER BY submittedAt DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/export-excel', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM esig_submissions ORDER BY submittedAt DESC');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Petition Submissions');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Employee Name', key: 'employeeName', width: 25 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Staff ID', key: 'staffId', width: 15 },
      { header: 'Submitted At', key: 'submittedAt', width: 20 }
    ];

    rows.forEach(row => {
      worksheet.addRow({
        id: row.id,
        employeeName: row.employeeName,
        department: row.department,
        staffId: row.staffId,
        submittedAt: new Date(row.submittedAt).toLocaleString()
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF11336E' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="petition-submissions.xlsx"');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Export error' });
  }
});

app.get('/api/export-html', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM esig_submissions ORDER BY submittedAt DESC');

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Employee Petition Submissions</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 15px; 
            background: white;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #11336e; 
            border-bottom: 2px solid #11336e;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #11336e;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            border: 1px solid #ddd;
          }
          td {
            padding: 6px 8px;
            border: 1px solid #ddd;
            vertical-align: middle;
            font-size: 11px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .signature-cell {
            text-align: center;
            width: 120px;
          }
          .signature {
            width: 100px;
            height: 40px;
            object-fit: contain;
          }
          .name-cell {
            font-weight: bold;
            color: #11336e;
          }
          @media print {
            body { margin: 10px; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Employee Petition Submissions</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Submissions: ${rows.length}</strong></p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Staff ID</th>
              <th>Date Submitted</th>
              <th>Signature</th>
            </tr>
          </thead>
          <tbody>
    `;

    rows.forEach((row, index) => {
      html += `
            <tr>
              <td>${index + 1}</td>
              <td class="name-cell">${row.employeeName}</td>
              <td>${row.department}</td>
              <td>${row.staffId}</td>
              <td>${new Date(row.submittedAt).toLocaleDateString()}</td>
              <td class="signature-cell">
                <img src="${row.signatureData}" class="signature" alt="Signature">
              </td>
            </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        
        <script>
          // Auto-print when opened
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'HTML generation error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
