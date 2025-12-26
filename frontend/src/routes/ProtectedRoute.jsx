import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.role?.toLowerCase() !== 'admin') {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};


export default ProtectedRoute;