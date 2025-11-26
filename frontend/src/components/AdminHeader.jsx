import React from 'react';

const AdminHeader = () => {
  return (
    // flex justify-between items-center p-4 bg-white shadow-md
    <header className="d-flex justify-content-between align-items-center p-2 bg-white shadow-sm border-bottom">
      
      {/* text-xl font-semibold text-gray-700 */}
      <div className="fs-5 fw-semibold text-secondary">
        Chào mừng trở lại!
      </div>
      
      {/* flex items-center space-x-4 */}
      <div className="d-flex align-items-center">
        
        {/* Nút thông báo */}
        {/* p-2 text-gray-600 hover:text-gray-900 focus:outline-none */}
        <button className="btn btn-link text-secondary p-2 me-3 fs-5" style={{ textDecoration: 'none' }}>
          🔔
        </button>
        
        {/* Avatar và Tên Admin */}
        {/* flex items-center space-x-2 cursor-pointer */}
        <div className="d-flex align-items-center cursor-pointer">
          <img
            // w-8 h-8 rounded-full object-cover
            className="rounded-circle object-cover me-2"
            src="https://via.placeholder.com/150" // Thay bằng ảnh đại diện thực tế
            alt="User Avatar"
            style={{ width: '32px', height: '32px' }}
          />
          {/* font-medium text-gray-700 hidden sm:block */}
          <span className="fw-medium text-secondary d-none d-sm-block">Admin Name</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;