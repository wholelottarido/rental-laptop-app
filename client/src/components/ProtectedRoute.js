import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, role } = useContext(AuthContext);

  if (!token || role !== 'admin') {
    // Jika tidak ada token atau bukan admin, arahkan ke halaman utama
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
