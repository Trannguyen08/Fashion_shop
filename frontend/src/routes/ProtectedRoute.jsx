import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const adminUser = JSON.parse(localStorage.getItem('admin_user') || 'null');
  const regularUser = JSON.parse(localStorage.getItem('user_user') || 'null');
  
  const user = adminUser || regularUser;

  console.log("ProtectedRoute check:", { adminUser, regularUser, user });

  if (!user || (user.role?.toLowerCase() !== 'admin' && user.is_admin !== true)) {
    console.log("Access denied - not admin");
    return <Navigate to={redirectPath} replace />;
  }

  console.log("Access granted - admin verified");
  return <Outlet />;
};

export default ProtectedRoute;