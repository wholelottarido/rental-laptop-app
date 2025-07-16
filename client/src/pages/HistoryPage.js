import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:5001/api/rentals/my-history');
        setHistory(response.data);
      } catch (error) {
        console.error("Gagal mengambil riwayat sewa:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) {
    return <div className="text-center p-10">Memuat riwayat...</div>;
  }

  if (history.length === 0) {
    return <div className="text-center p-10">Anda belum memiliki riwayat penyewaan.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Riwayat Penyewaan Anda</h1>
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.sewaID} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
            <img src={item.gambarURL} alt={item.namaLaptop} className="w-24 h-24 object-cover rounded-md" />
            <div className="flex-grow">
              <h2 className="font-bold text-xl">{item.namaLaptop}</h2>
              <p className="text-sm text-gray-600">
                Disewa dari {new Date(item.tanggalMulai).toLocaleDateString('id-ID')} sampai {new Date(item.tanggalSelesai).toLocaleDateString('id-ID')}
              </p>
              <p className="text-sm text-gray-600">Total Biaya: Rp {Number(item.totalBiaya).toLocaleString('id-ID')}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                item.statusSewa === 'Aktif' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
            }`}>
              {item.statusSewa}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
