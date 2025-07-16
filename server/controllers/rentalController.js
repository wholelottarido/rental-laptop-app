const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Fungsi baru untuk checkout per barang
exports.createSingleRental = async (req, res) => {
  const { 
    laptop, 
    startDate, 
    endDate, 
    durasiSewa, 
    deliveryMethod, 
    deliveryFee, 
    totalPayment, 
    ktpFilename 
  } = req.body;
  
  const userID = req.user.id; // Diambil dari token JWT

  if (!laptop || !startDate || !endDate || durasiSewa <= 0) {
    return res.status(400).json({ message: 'Data penyewaan tidak lengkap.' });
  }

  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.beginTransaction();

    // 1. Buat record di tabel 'penyewaan'
    const [rentalResult] = await connection.execute(
      `INSERT INTO penyewaan (userID, laptopID, tanggalMulai, durasiSewa, tanggalSelesai, totalBiaya, statusSewa, metodePengambilan, biayaAntar, jaminanKTP_URL) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userID, laptop.laptopID, startDate, durasiSewa, endDate, totalPayment, 'Aktif', deliveryMethod, deliveryFee, ktpFilename]
    );
    const sewaID = rentalResult.insertId;

    // 2. Buat record di tabel 'pembayaran'
    await connection.execute(
      'INSERT INTO pembayaran (sewaID, jumlahBayar, metodePembayaran, statusBayar) VALUES (?, ?, ?, ?)',
      [sewaID, totalPayment, 'Virtual Account', 'Berhasil']
    );

    // 3. Update status laptop menjadi 'Disewa'
    await connection.execute(
      "UPDATE laptop SET status = 'Disewa' WHERE laptopID = ?",
      [laptop.laptopID]
    );

    await connection.commit();
    res.status(201).json({ message: 'Checkout berhasil! Laptop telah disewa.' });

  } catch (error) {
    await connection.rollback();
    console.error('Error saat checkout:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat checkout.' });
  } finally {
    await connection.end();
  }
};

exports.createBulkRental = async (req, res) => {
  const { items } = req.body; // items adalah array of laptop objects
  const userID = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Keranjang tidak boleh kosong.' });
  }

  // Gunakan dbConfig yang sudah ada atau definisikan di sini
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.beginTransaction();

    for (const item of items) {
      // Asumsi durasi default 1 hari jika checkout dari keranjang
      const durasiSewa = 1;
      const tanggalMulai = new Date().toISOString().slice(0, 10);
      const tanggalSelesai = new Date(new Date().setDate(new Date().getDate() + durasiSewa)).toISOString().slice(0, 10);
      const totalBiaya = durasiSewa * Number(item.hargaSewaPerHari);

      const [rentalResult] = await connection.execute(
        `INSERT INTO penyewaan (userID, laptopID, tanggalMulai, durasiSewa, tanggalSelesai, totalBiaya, statusSewa, metodePengambilan) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userID, item.laptopID, tanggalMulai, durasiSewa, tanggalSelesai, totalBiaya, 'Aktif', 'Ambil Sendiri']
      );
      const sewaID = rentalResult.insertId;

      await connection.execute(
        'INSERT INTO pembayaran (sewaID, jumlahBayar, metodePembayaran, statusBayar) VALUES (?, ?, ?, ?)',
        [sewaID, totalBiaya, 'Virtual Account', 'Berhasil']
      );

      await connection.execute(
        "UPDATE laptop SET status = 'Disewa' WHERE laptopID = ?",
        [item.laptopID]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Checkout dari keranjang berhasil!' });

  } catch (error) {
    await connection.rollback();
    console.error('Error saat bulk checkout:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  } finally {
    await connection.end();
  }
};

exports.getUserRentals = async (req, res) => {
  const userID = req.user.id; // Ambil ID dari token

  try {
    const connection = await mysql.createConnection(dbConfig);
    // Gabungkan (JOIN) tabel penyewaan dengan tabel laptop untuk mendapatkan nama laptop
    const [rows] = await connection.execute(
      `SELECT p.*, l.nama as namaLaptop, l.gambarURL 
       FROM penyewaan p 
       JOIN laptop l ON p.laptopID = l.laptopID 
       WHERE p.userID = ? 
       ORDER BY p.tanggalMulai DESC`,
      [userID]
    );
    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching user rentals:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Fungsi BARU untuk mengambil semua riwayat sewa (untuk admin)
exports.getAllRentals = async (req, res) => {
  // Pastikan hanya admin yang bisa akses (akan kita perkuat di middleware)
  if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya untuk admin.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    // Gabungkan dengan tabel pengguna dan laptop untuk data yang lebih lengkap
    const [rows] = await connection.execute(
      `SELECT p.*, l.nama as namaLaptop, u.nama as namaPengguna, u.email as emailPengguna
       FROM penyewaan p
       JOIN laptop l ON p.laptopID = l.laptopID
       JOIN pengguna u ON p.userID = u.userID
       ORDER BY p.created_at DESC`
    );
    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching all rentals:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
