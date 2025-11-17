import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/AdminHeader';
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    // Dùng position: relative để đảm bảo vh-100 hoạt động tốt hơn
    <div className="d-flex position-relative vh-120 bg-light"> 
      
      {/* Sidebar: Giữ nguyên width cố định (256px) */}
      <Sidebar />
      
      {/* Content Area */}
      {/* overflow-hidden cho khu vực này là quan trọng */}
      <div className="d-flex flex-column flex-grow-1 overflow-hidden"> 
        <Header />
        
        {/* Main Content: Cuộn độc lập */}
        <main className="flex-grow-1 overflow-auto p-4"> 
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;