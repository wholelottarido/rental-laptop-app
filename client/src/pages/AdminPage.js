import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Komponen Modal untuk form Tambah/Edit
const AdminModal = ({ isOpen, onClose, onSubmit, formData, setFormData, onFileChange }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6">{formData.laptopID ? 'Edit Laptop' : 'Tambah Laptop Baru'}</h3>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">Nama Laptop</label>
              <input name="nama" value={formData.nama || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" required />
            </div>
            <div>
              <label className="block text-gray-700">Deskripsi</label>
              <textarea name="deskripsi" value={formData.deskripsi || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" required></textarea>
            </div>
            <div>
              <label className="block text-gray-700">Spesifikasi</label>
              <textarea name="spek" value={formData.spek || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" required></textarea>
            </div>
            <div>
              <label className="block text-gray-700">Harga Sewa / hari (Rp)</label>
              <input type="number" name="hargaSewaPerHari" value={formData.hargaSewaPerHari || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" required />
            </div>
            <div>
              <label className="block text-gray-700">Status</label>
              <select name="status" value={formData.status || 'Tersedia'} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1">
                <option value="Tersedia">Tersedia</option>
                <option value="Disewa">Disewa</option>
                <option value="Perbaikan">Perbaikan</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Gambar Laptop</label>
              <input type="file" name="image" onChange={onFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
              <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah gambar saat mengedit.</p>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400">Batal</button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Komponen Halaman Admin Utama
const AdminPage = () => {
    const [laptops, setLaptops] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLaptop, setCurrentLaptop] = useState(null);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchLaptops = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/get-laptops');
            setLaptops(response.data);
        } catch (error) {
            console.error("Gagal mengambil data laptop:", error);
            alert('Gagal mengambil data laptop.');
        }
    };

    useEffect(() => {
        fetchLaptops();
    }, []);

    const openModal = (laptop = null) => {
        setCurrentLaptop(laptop);
        if (laptop) {
            setFormData({
                laptopID: laptop.laptopID,
                nama: laptop.nama,
                deskripsi: laptop.deskripsi,
                spek: laptop.spek,
                hargaSewaPerHari: laptop.hargaSewaPerHari,
                status: laptop.status
            });
        } else {
            setFormData({
                nama: '',
                deskripsi: '',
                spek: '',
                hargaSewaPerHari: '',
                status: 'Tersedia'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentLaptop(null);
        setSelectedFile(null);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('nama', formData.nama);
        data.append('deskripsi', formData.deskripsi);
        data.append('spek', formData.spek);
        data.append('hargaSewaPerHari', formData.hargaSewaPerHari);
        data.append('status', formData.status);
        if (selectedFile) {
            data.append('image', selectedFile);
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (currentLaptop) {
                await axios.put(`http://localhost:5001/api/laptops/${currentLaptop.laptopID}`, data, config);
                alert('Data laptop berhasil diperbarui!');
            } else {
                await axios.post('http://localhost:5001/api/laptops', data, config);
                alert('Laptop baru berhasil ditambahkan!');
            }
            closeModal();
            fetchLaptops();
        } catch (error) {
            console.error("Gagal menyimpan data:", error);
            alert('Gagal menyimpan data.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus laptop ini?')) {
            try {
                await axios.delete(`http://localhost:5001/api/laptops/${id}`);
                alert('Laptop berhasil dihapus');
                fetchLaptops();
            } catch (error) {
                alert(error.response?.data?.message || 'Gagal menghapus laptop.');
            }
        }
    };

    const handleStatusChange = async (laptop) => {
        const newStatus = laptop.status === 'Tersedia' ? 'Disewa' : 'Tersedia';
        if (window.confirm(`Anda yakin ingin mengubah status "${laptop.nama}" menjadi "${newStatus}"?`)) {
            try {
                await axios.patch(`http://localhost:5001/api/laptops/${laptop.laptopID}/status`, { status: newStatus });
                alert('Status berhasil diubah.');
                fetchLaptops();
            } catch (error) {
                console.error("Gagal mengubah status:", error);
                alert('Gagal mengubah status.');
            }
        }
    };

    return (
        <>
            <AdminModal 
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                formData={formData}
                setFormData={setFormData}
                onFileChange={handleFileChange}
            />
            <div className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Manajemen Laptop</h1>
                    <div>
                        <Link to="/admin/history" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 mr-4">
                            Lihat Riwayat Sewa
                        </Link>
                        <button onClick={() => openModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            + Tambah Laptop
                        </button>
                    </div>
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                           <tr>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Laptop</th>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Harga/hari</th>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laptops.map(laptop => (
                                <tr key={laptop.laptopID}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm flex items-center">
                                        <img src={`http://localhost:5001/${laptop.gambarURL}`} alt={laptop.nama} className="w-16 h-16 object-cover rounded-md mr-4"/>
                                        <span className="font-semibold">{laptop.nama}</span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">Rp {Number(laptop.hargaSewaPerHari).toLocaleString('id-ID')}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <button 
                                            onClick={() => handleStatusChange(laptop)}
                                            disabled={laptop.status === 'Perbaikan'}
                                            className={`py-1 px-3 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-200
                                                ${laptop.status === 'Tersedia' ? 'bg-green-200 text-green-900 hover:bg-green-300' : ''}
                                                ${laptop.status === 'Disewa' ? 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300' : ''}
                                                ${laptop.status === 'Perbaikan' ? 'bg-red-200 text-red-900 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            {laptop.status}
                                        </button>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <button onClick={() => openModal(laptop)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(laptop.laptopID)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminPage;
