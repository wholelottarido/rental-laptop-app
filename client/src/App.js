import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Provider untuk state global
import { AuthProvider } from './context/AuthContext';

// Import komponen layout utama
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute'; // Import pelindung rute

// Import semua halaman yang akan digunakan
import LaptopListPage from './pages/LaptopListPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import HistoryPage from './pages/HistoryPage'; // Import halaman riwayat pengguna
import AdminHistoryPage from './pages/AdminHistoryPage'; // Import halaman riwayat admin


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Rute Publik & Pengguna */}
              <Route path="/" element={<LaptopListPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/history" element={<HistoryPage />} /> {/* Rute baru */}
              
              {/* Rute Khusus Admin */}
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/admin/history" element={<ProtectedRoute><AdminHistoryPage /></ProtectedRoute>} /> {/* Rute baru */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

