import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Membuat context yang akan diakses oleh komponen lain
const AuthContext = createContext();

// Komponen Provider yang akan "membungkus" seluruh aplikasi
// dan menyediakan data serta fungsi ke semua komponen di dalamnya.
export const AuthProvider = ({ children }) => {
  // State untuk menyimpan token login, mengambil dari localStorage jika ada
  const [token, setToken] = useState(localStorage.getItem('token'));
  // State untuk menyimpan peran (role) pengguna, mengambil dari localStorage jika ada
  const [role, setRole] = useState(localStorage.getItem('role'));
  // State untuk menyimpan isi keranjang, mengambil dari localStorage jika ada
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  // useEffect ini berjalan setiap kali 'token' berubah
  useEffect(() => {
    if (token) {
      // Jika ada token, atur sebagai header default untuk semua request axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Simpan token ke localStorage agar tidak hilang saat refresh
      localStorage.setItem('token', token);
    } else {
      // Jika tidak ada token (logout), hapus header Authorization
      delete axios.defaults.headers.common['Authorization'];
      // Hapus token dari localStorage
      localStorage.removeItem('token');
    }
  }, [token]);

  // useEffect ini berjalan setiap kali 'cart' berubah
  useEffect(() => {
    // Simpan isi keranjang ke localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fungsi untuk menangani proses login
  const loginAction = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      setToken(response.data.token);
      setRole(response.data.role); // Simpan role dari respons API
      localStorage.setItem('role', response.data.role); // Simpan role ke localStorage
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login gagal.' };
    }
  };

  // Fungsi untuk menangani proses logout
  const logOut = () => {
    setToken(null);
    setRole(null);
    setCart([]);
    localStorage.removeItem('role');
  };

  // Fungsi untuk menambah laptop ke keranjang
  const addToCart = (laptop) => {
    if (cart.find(item => item.laptopID === laptop.laptopID)) {
      alert('Laptop ini sudah ada di keranjang Anda.');
      return;
    }
    setCart([...cart, laptop]);
    alert(`${laptop.nama} telah ditambahkan ke keranjang!`);
  };

  // Fungsi untuk menghapus laptop dari keranjang
  const removeFromCart = (laptopID) => {
    setCart(cart.filter(item => item.laptopID !== laptopID));
  };

  // Fungsi untuk checkout dari keranjang (banyak barang)
  const checkoutCart = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/rentals/checkout-cart', { items: cart });
      alert(response.data.message);
      setCart([]); // Kosongkan keranjang setelah berhasil
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.message || "Checkout dari keranjang gagal.");
      return { success: false };
    }
  };

  // Menyediakan semua state dan fungsi ke komponen anak melalui Provider
  return (
    <AuthContext.Provider value={{ token, role, cart, loginAction, logOut, addToCart, removeFromCart, checkoutCart }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
