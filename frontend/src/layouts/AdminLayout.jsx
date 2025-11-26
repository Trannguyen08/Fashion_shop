import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/AdminHeader';
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="d-flex position-relative vh-120 bg-light"> 
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1 overflow-hidden"> 
        <Header />
        <main className="flex-grow-1 overflow-auto p-2"> 
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;