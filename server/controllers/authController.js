const mysql = require('mysql2/promise'); // Gunakan versi promise untuk async/await
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Konfigurasi database (lebih baik dipisah, tapi untuk sekarang kita taruh di sini)
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Fungsi untuk Registrasi Pengguna Baru
exports.register = async (req, res) => {
  const { nama, email, password } = req.body;

  // Validasi input dasar
  if (!nama || !email || !password) {
    return res.status(400).json({ message: 'Harap isi semua field.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Cek apakah email sudah terdaftar
    const [rows] = await connection.execute('SELECT email FROM pengguna WHERE email = ?', [email]);
    if (rows.length > 0) {
      await connection.end(); // Tutup koneksi sebelum mengirim respons
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 8);

    // Simpan pengguna baru ke database
    await connection.execute('INSERT INTO pengguna (nama, email, password) VALUES (?, ?, ?)', [nama, email, hashedPassword]);
    
    await connection.end(); // Tutup koneksi
    res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });

  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Fungsi untuk Login Pengguna
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Harap isi email dan password.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM pengguna WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      await connection.end();
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await connection.end();
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // Buat token JWT dengan menyertakan id dan role
    const token = jwt.sign(
      { id: user.userID, role: user.role }, // Tambahkan role di sini
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );
    
    await connection.end();
    
    // Kirim role pengguna bersama dengan token
    res.status(200).json({ token, role: user.role, message: 'Login berhasil!' });

  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

