import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { token, role, logOut, cart } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          💻 RentalKu
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-indigo-600">Daftar Laptop</Link>
          {token ? (
            <>
              {/* Tampilkan link Riwayat Sewa hanya jika pengguna login dan BUKAN admin */}
              {role !== 'admin' && (
                <Link to="/history" className="text-gray-600 hover:text-indigo-600">Riwayat Sewa</Link>
              )}
              {/* Tampilkan link Admin Panel hanya jika pengguna adalah admin */}
              {role === 'admin' && (
                <Link to="/admin" className="font-semibold text-indigo-600 hover:text-indigo-800">Admin Panel</Link>
              )}
              <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600">
                Keranjang
                {cart.length > 0 &&
                  <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                }
              </Link>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
