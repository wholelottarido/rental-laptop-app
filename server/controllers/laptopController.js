const mysql = require('mysql2/promise');

// Konfigurasi database, diambil dari variabel environment
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Fungsi untuk MENAMBAH laptop baru (Create)
exports.createLaptop = async (req, res) => {
  const { nama, deskripsi, spek, hargaSewaPerHari, status } = req.body;
  
  // Dapatkan path gambar jika ada file yang di-upload
  // req.file disediakan oleh multer
  const gambarURL = req.file ? `uploads/${req.file.filename}` : 'https://placehold.co/600x400/cccccc/ffffff?text=No+Image';

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO laptop (nama, deskripsi, spek, hargaSewaPerHari, status, gambarURL) VALUES (?, ?, ?, ?, ?, ?)',
      [nama, deskripsi, spek, hargaSewaPerHari, status, gambarURL]
    );
    await connection.end();
    res.status(201).json({ message: 'Laptop berhasil ditambahkan.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Fungsi untuk MENGUBAH semua data laptop (Update)
exports.updateLaptop = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, spek, hargaSewaPerHari, status } = req.body;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Bangun query secara dinamis
    let sqlQuery = 'UPDATE laptop SET nama = ?, deskripsi = ?, spek = ?, hargaSewaPerHari = ?, status = ?';
    let params = [nama, deskripsi, spek, hargaSewaPerHari, status];

    // Jika ada file gambar baru yang di-upload, tambahkan ke query
    if (req.file) {
      const gambarURL = `uploads/${req.file.filename}`;
      sqlQuery += ', gambarURL = ?';
      params.push(gambarURL);
    }
    
    sqlQuery += ' WHERE laptopID = ?';
    params.push(id);

    await connection.execute(sqlQuery, params);
    await connection.end();
    res.status(200).json({ message: 'Data laptop berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Fungsi untuk MENGHAPUS laptop (Delete)
exports.deleteLaptop = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Jalankan query SQL untuk menghapus data berdasarkan ID
    await connection.execute('DELETE FROM laptop WHERE laptopID = ?', [id]);
    await connection.end();
    res.status(200).json({ message: 'Laptop berhasil dihapus.' });
  } catch (error) {
    // Error ini biasanya terjadi jika laptop yang akan dihapus masih tercatat
    // di tabel 'penyewaan' (karena ada foreign key constraint)
    console.error("Error deleting laptop:", error);
    res.status(400).json({ message: 'Gagal menghapus. Laptop ini mungkin memiliki riwayat sewa.' });
  }
};

// Fungsi untuk MENGUBAH STATUS laptop saja
exports.updateLaptopStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validasi sederhana untuk memastikan status yang dikirim valid
  if (!status || !['Tersedia', 'Disewa', 'Perbaikan'].includes(status)) {
    return res.status(400).json({ message: 'Status yang dikirim tidak valid.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    // Jalankan query SQL untuk memperbarui kolom 'status' saja
    await connection.execute(
      'UPDATE laptop SET status = ? WHERE laptopID = ?',
      [status, id]
    );
    await connection.end();
    res.status(200).json({ message: 'Status laptop berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
