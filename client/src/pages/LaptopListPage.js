import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// --- Komponen UI Pendukung ---

// Skeleton card dengan animasi yang lebih halus
const LaptopCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"></div>
    <div className="p-5">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
      <div className="h-10 bg-gray-300 rounded-lg"></div>
      <div className="h-10 bg-gray-200 rounded-lg mt-2"></div>
    </div>
  </div>
);

// Modal Detail dengan desain yang lebih bersih dan animasi yang disempurnakan
const LaptopDetailModal = ({ isOpen, onClose, laptop }) => {
  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-black/70 visible opacity-100' : 'bg-transparent invisible opacity-0'}`} 
      onClick={onClose}
    >
      <div 
        className={`bg-gray-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {laptop && (
          <>
            <div className="relative">
              <img 
                className="w-full h-72 object-cover rounded-t-xl"
                src={`http://localhost:5001/${laptop.gambarURL}`} 
                alt={laptop.nama} 
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Gambar+Rusak' }}
              />
              <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center text-2xl hover:bg-black/75 transition-colors">&times;</button>
            </div>
            <div className="p-8 overflow-y-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{laptop.nama}</h2>
              <p className="text-2xl font-semibold text-indigo-600 mb-6">Rp {Number(laptop.hargaSewaPerHari).toLocaleString('id-ID')}/hari</p>
              
              <div className="mb-6">
                <h3 className="font-bold text-xl mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Deskripsi</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{laptop.deskripsi}</p>
              </div>

              <div>
                <h3 className="font-bold text-xl mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Spesifikasi</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{laptop.spek}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Komponen Utama Halaman Daftar Laptop ---

const LaptopListPage = () => {
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, addToCart } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState(null);

  useEffect(() => {
    const fetchLaptops = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${API_URL}/api/get-laptops`, {
          params: { search: searchTerm, sort: sortBy }
        });
        setLaptops(response.data);
      } catch (err) {
        console.error("Gagal mengambil data laptop:", err);
      } finally {
        // Beri jeda sedikit agar animasi skeleton terlihat lebih natural
        setTimeout(() => setLoading(false), 300);
      }
    };

    const delayDebounceFn = setTimeout(() => {
        fetchLaptops();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy]);

  const handleOpenDetail = (laptop) => {
    setSelectedLaptop(laptop);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
  };

  return (
    <>
      <LaptopDetailModal 
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        laptop={selectedLaptop}
      />

      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Pilihan Laptop Terbaik</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Temukan laptop yang sempurna untuk pekerjaan, proyek, atau kebutuhan hiburan Anda.</p>
          </div>
          
          <div className="mb-10 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col sm:flex-row gap-4 items-center sticky top-24 z-40">
            <div className="relative flex-grow w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
              <input
                type="text"
                placeholder="Cari Macbook, Dell XPS, Thinkpad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
            <div className="w-full sm:w-52">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
              >
                <option value="name_asc">Nama (A-Z)</option>
                <option value="price_asc">Harga (Termurah)</option>
                <option value="price_desc">Harga (Termahal)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => <LaptopCardSkeleton key={index} />)
              ) : laptops.length > 0 ? (
                laptops.map((laptop) => (
                  <div key={laptop.laptopID} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group border border-transparent hover:border-indigo-500/50 hover:shadow-2xl transition-all duration-300">
                    <div onClick={() => handleOpenDetail(laptop)} className="cursor-pointer">
                      <div className="overflow-hidden">
                          <img 
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" 
                              src={`http://localhost:5001/${laptop.gambarURL}`} 
                              alt={laptop.nama} 
                              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Gambar+Rusak' }}
                          />
                      </div>
                      <div className="p-5">
                        <h2 className="text-xl font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{laptop.nama}</h2>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-lg font-bold text-indigo-600">Rp {Number(laptop.hargaSewaPerHari).toLocaleString('id-ID')}/hari</span>
                          {laptop.status === 'Tersedia' ? (
                            <span className="text-xs font-semibold bg-green-100 text-green-800 px-2.5 py-1 rounded-full">Tersedia</span>
                          ) : (
                            <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full">Disewa</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-5 pb-5 mt-auto pt-2 space-y-2">
                      {laptop.status === 'Tersedia' ? (
                          <>
                            <Link to={token ? "/checkout" : "/login"} state={{ laptop: laptop }} className="block w-full text-center bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                              Sewa Langsung
                            </Link>
                            {token && (
                               <button onClick={() => addToCart(laptop)} className="w-full bg-indigo-50 text-indigo-700 font-semibold py-2.5 rounded-lg hover:bg-indigo-100 transition-colors">
                                + Keranjang
                              </button>
                            )}
                          </>
                        ) : (
                           <button disabled className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-lg cursor-not-allowed">
                            Tidak Tersedia
                          </button>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="mt-4 text-2xl font-semibold text-gray-700">Oops! Tidak Ditemukan</h3>
                  <p className="text-gray-500 mt-2">Kami tidak dapat menemukan laptop yang cocok. Coba kata kunci lain.</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LaptopListPage;