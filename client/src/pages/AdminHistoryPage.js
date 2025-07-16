import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminHistoryPage = () => {
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/rentals/all-history');
        setAllHistory(response.data);
      } catch (error) {
        console.error("Gagal mengambil semua riwayat:", error);
        alert('Gagal mengambil data. Pastikan Anda adalah admin.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllHistory();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Memuat semua riwayat...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Riwayat Semua Penyewaan</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Pengguna</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Laptop</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Tanggal Sewa</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Total Biaya</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {allHistory.map((item) => (
              <tr key={item.sewaID}>
                <td className="px-5 py-5 border-b text-sm">
                    <p className="font-semibold">{item.namaPengguna}</p>
                    <p className="text-gray-600">{item.emailPengguna}</p>
                </td>
                <td className="px-5 py-5 border-b text-sm">{item.namaLaptop}</td>
                <td className="px-5 py-5 border-b text-sm">{new Date(item.tanggalMulai).toLocaleDateString('id-ID')}</td>
                <td className="px-5 py-5 border-b text-sm">Rp {Number(item.totalBiaya).toLocaleString('id-ID')}</td>
                <td className="px-5 py-5 border-b text-sm">{item.statusSewa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHistoryPage;
