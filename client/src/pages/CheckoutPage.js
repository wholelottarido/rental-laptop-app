import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext'; // Pastikan path ini benar

const CheckoutPage = () => {
  const { state } = useLocation();
  const { laptop } = state || {}; // Ambil data laptop dari state navigasi
  const navigate = useNavigate();
  const { token } = useContext(AuthContext); // Ambil token untuk verifikasi

  // State untuk semua input dan data di halaman ini
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [delivery, setDelivery] = useState('ambil'); // 'ambil' atau 'delivery'
  const [ktp, setKtp] = useState(null); // State untuk file KTP
  const [biayaAntar, setBiayaAntar] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); // State untuk loading saat checkout

  // Redirect jika halaman diakses tanpa data laptop atau tanpa login
  useEffect(() => {
    if (!token || !laptop) {
      alert("Sesi tidak valid atau data laptop tidak ditemukan. Anda akan diarahkan ke halaman utama.");
      navigate('/');
    }
  }, [laptop, token, navigate]);

  // Fungsi untuk meminta izin dan mendapatkan lokasi pengguna
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          // Simulasi perhitungan biaya antar berdasarkan lokasi (di aplikasi nyata, ini bisa memanggil API)
          setBiayaAntar(Math.floor(Math.random() * (50000 - 15000 + 1)) + 15000);
          setLocationError('');
        },
        () => {
          setLocationError('Gagal mendapatkan lokasi. Pastikan izin lokasi sudah diaktifkan di browser Anda.');
        }
      );
    } else {
      setLocationError('Geolocation tidak didukung oleh browser ini.');
    }
  };

  // Fungsi untuk menghitung durasi sewa dalam hari
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const durasiSewa = calculateDays();
  const totalBiayaSewa = durasiSewa * Number(laptop?.hargaSewaPerHari || 0);
  const totalPembayaran = totalBiayaSewa + (delivery === 'delivery' ? biayaAntar : 0);

  // Fungsi yang dijalankan saat tombol "Proses Pembayaran" diklik
  const handleCheckout = async () => {
    // Validasi input
    if (!startDate || !endDate || durasiSewa <= 0) {
      alert("Harap pilih tanggal mulai dan selesai sewa yang valid.");
      return;
    }
    if (delivery === 'delivery' && !userLocation) {
      alert("Harap aktifkan lokasi untuk opsi pengantaran atau pilih 'Ambil Sendiri'.");
      return;
    }
    if (!ktp) {
      alert("Harap unggah foto KTP sebagai jaminan.");
      return;
    }

    setIsProcessing(true);

    // Siapkan data untuk dikirim ke API
    const checkoutData = {
        laptop: laptop,
        startDate: startDate,
        endDate: endDate,
        durasiSewa: durasiSewa,
        deliveryMethod: delivery,
        deliveryFee: delivery === 'delivery' ? biayaAntar : 0,
        totalPayment: totalPembayaran,
        ktpFilename: ktp.name // Di aplikasi nyata, Anda akan mengunggah file ini
    };

    try {
        // Panggil API checkout di back-end
        const response = await axios.post('http://localhost:5001/api/rentals/new', checkoutData);
        alert(response.data.message);
        navigate('/'); // Arahkan kembali ke halaman utama setelah berhasil
    } catch (error) {
        alert(error.response?.data?.message || "Checkout gagal. Silakan coba lagi.");
        setIsProcessing(false);
    }
  };

  // Mencegah render jika data laptop belum ada (sebelum redirect)
  if (!laptop) return null;

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 border-b pb-4">Checkout Penyewaan</h1>
      
      {/* Detail Laptop */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold">{laptop.nama}</h2>
        <p className="text-lg text-indigo-600 font-semibold">Rp {Number(laptop.hargaSewaPerHari).toLocaleString('id-ID')}/hari</p>
      </div>
      
      <div className="lg:flex lg:gap-8">
        <div className="lg:w-2/3 space-y-6">
            {/* Step 1: Durasi Sewa */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">1. Tentukan Durasi Sewa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                    </div>
                </div>
            </div>

            {/* Step 2: Opsi Pengambilan */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">2. Pilih Opsi Pengambilan</h3>
                <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="delivery" value="ambil" checked={delivery === 'ambil'} onChange={() => setDelivery('ambil')} className="h-4 w-4 text-indigo-600 border-gray-300"/>
                        <span className="ml-3 text-gray-700">Ambil Sendiri (di lokasi kami)</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="delivery" value="delivery" checked={delivery === 'delivery'} onChange={() => setDelivery('delivery')} className="h-4 w-4 text-indigo-600 border-gray-300"/>
                        <span className="ml-3 text-gray-700">Delivery (diantar ke lokasi Anda)</span>
                    </label>
                </div>
                {delivery === 'delivery' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        {!userLocation ? (
                            <>
                                <button onClick={handleGetLocation} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm font-medium">Aktifkan Izin Lokasi</button>
                                {locationError && <p className="text-red-500 mt-2 text-sm">{locationError}</p>}
                            </>
                        ) : (
                            <p className="text-green-600 font-medium">✅ Lokasi berhasil dideteksi.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Step 3: Jaminan */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">3. Unggah Jaminan</h3>
                <p className="text-sm text-gray-600 mb-2">Untuk keamanan, harap unggah foto KTP Anda yang jelas.</p>
                <input type="file" accept="image/*" onChange={e => setKtp(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                {ktp && <p className="text-green-600 mt-2 text-sm">✅ File dipilih: {ktp.name}</p>}
            </div>
        </div>

        <div className="lg:w-1/3">
            {/* Step 4: Ringkasan & Pembayaran */}
            <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
                <h3 className="text-2xl font-bold mb-4">Ringkasan Biaya</h3>
                <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between"><span>Biaya Sewa ({durasiSewa > 0 ? durasiSewa : '...'} hari)</span> <span>Rp {totalBiayaSewa.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between"><span>Biaya Antar</span> <span>Rp {delivery === 'delivery' ? biayaAntar.toLocaleString('id-ID') : 0}</span></div>
                    <hr className="my-2"/>
                    <div className="flex justify-between font-bold text-xl text-black"><span>Total Pembayaran</span> <span>Rp {totalPembayaran.toLocaleString('id-ID')}</span></div>
                </div>
                <button 
                    onClick={handleCheckout} 
                    disabled={isProcessing}
                    className="mt-6 w-full bg-green-500 text-white py-3 rounded-md font-bold text-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Memproses...' : 'Lanjutkan Pembayaran'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
