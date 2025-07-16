const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil token dari header: 'Bearer [token]'
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

      // PERBAIKAN: Tambahkan 'role' dari token ke object req.user
      // Sebelumnya: req.user = { id: decoded.id };
      req.user = { id: decoded.id, role: decoded.role };

      next(); // Lanjutkan ke controller berikutnya
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
