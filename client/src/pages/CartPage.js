import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const CartPage = () => {
  const { cart, removeFromCart, checkoutCart } = useContext(AuthContext);
  const navigate = useNavigate();

  const totalBiaya = cart.reduce((total, item) => total + Number(item.hargaSewaPerHari), 0);

  const handleCheckout = async () => {
    const result = await checkoutCart();
    if (result.success) {
      navigate('/');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Keranjang Anda Kosong</h2>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
          Mulai Cari Laptop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Keranjang Sewa</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          {cart.map(item => (
            <div key={item.laptopID} className="flex items-center bg-white p-4 rounded-lg shadow-md mb-4">
              <img src={item.gambarURL} alt={item.nama} className="w-24 h-24 object-cover rounded-md"/>
              <div className="flex-grow ml-4">
                <h3 className="font-bold text-lg">{item.nama}</h3>
                <p className="font-bold text-indigo-600 mt-2">Rp {Number(item.hargaSewaPerHari).toLocaleString('id-ID')}/hari</p>
              </div>
              <button onClick={() => removeFromCart(item.laptopID)} className="text-red-500 hover:text-red-700 font-bold">Hapus</button>
            </div>
          ))}
        </div>
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h3 className="text-xl font-bold mb-4">Ringkasan Pesanan</h3>
            <p className="text-sm text-gray-500 mb-4">Durasi dan detail lain akan dikonfirmasi oleh admin. Biaya di bawah adalah untuk 1 hari.</p>
            <hr className="my-4"/>
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>Rp {totalBiaya.toLocaleString('id-ID')}</span>
            </div>
            <button onClick={handleCheckout} className="mt-6 w-full bg-green-500 text-white py-3 rounded-md font-bold hover:bg-green-600">
              Checkout Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
