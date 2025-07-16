import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5001/api/auth/register', { nama, email, password });
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">Buat Akun Baru</h2>
        {error && <p className="text-red-500 text-center bg-red-100 p-2 rounded">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-600 block">Nama Lengkap</label>
            <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="w-full p-3 mt-1 rounded-md border" required />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 mt-1 rounded-md border" required />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 mt-1 rounded-md border" required />
          </div>
          <button type="submit" className="w-full py-3 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Register</button>
          <p className="text-center text-sm">Sudah punya akun? <Link to="/login" className="font-bold text-indigo-600">Login</Link></p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
