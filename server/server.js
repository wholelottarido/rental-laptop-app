if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

// Import rute
const authRoutes = require('./routes/authRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const laptopRoutes = require('./routes/laptopRoutes'); // Rute baru

const app = express();
const PORT = process.env.PORT || 5001;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) { console.error('Error connecting to database:', err.stack); return; }
    console.log('Successfully connected to database as id ' + connection.threadId);
    connection.release();
});

app.use(cors());
app.use(express.json());

// Gunakan Rute
app.use('/api/auth', authRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/laptops', laptopRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Gunakan rute rental

// Rute untuk mendapatkan semua data laptop
app.get('/api/get-laptops', (req, res) => {
  // Ambil parameter dari query URL (contoh: ?search=macbook&sort=price_asc)
  const { search, sort } = req.query;

  let sqlQuery = "SELECT * FROM laptop";
  const params = [];

  // Tambahkan kondisi WHERE jika ada parameter pencarian
  if (search) {
    sqlQuery += " WHERE nama LIKE ? OR spek LIKE ?";
    params.push(`%${search}%`);
    params.push(`%${search}%`);
  }

  // Tambahkan kondisi ORDER BY jika ada parameter pengurutan
  if (sort) {
    switch (sort) {
      case 'price_asc':
        sqlQuery += " ORDER BY hargaSewaPerHari ASC";
        break;
      case 'price_desc':
        sqlQuery += " ORDER BY hargaSewaPerHari DESC";
        break;
      case 'name_asc':
        sqlQuery += " ORDER BY nama ASC";
        break;
      default:
        // Default sort
        sqlQuery += " ORDER BY created_at DESC";
    }
  } else {
    sqlQuery += " ORDER BY created_at DESC";
  }

  // Jalankan query yang sudah dinamis
  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Internal server error." });
    }
    res.status(200).json(results);
  });
});

app.get('/', (req, res) => {
    res.send('Selamat datang di API Server Rental Laptop!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
