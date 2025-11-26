import React from 'react';

// Component con cho thống kê (Bootstrap Card)
const StatCard = ({ title, value, colorClass }) => (
  <div className={`card text-white ${colorClass} shadow-sm border-0`}>
    <div className="card-body p-4">
      <p className="card-title text-opacity-75 mb-1 small">{title}</p>
      <h3 className="card-text fw-bold fs-3 mt-0">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">📊</span> Dashboard Tổng Quan
        </h2>
        <p className="text-muted">Tổng hợp các chỉ số quan trọng của hệ thống.</p>
      </div>
      
      {/* Các Card Thống kê */}
      <div className="row g-4 mb-5"> {/* g-4 là gap */}
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Doanh thu hôm nay" value="12.500.000₫" colorClass="bg-primary" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Đơn hàng mới" value="45" colorClass="bg-success" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Khách hàng mới" value="120" colorClass="bg-warning" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Sản phẩm tồn kho thấp" value="15" colorClass="bg-danger" />
        </div>
      </div>

      {/* Biểu đồ Doanh thu (Placeholder) */}
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="card-title fs-5 fw-semibold mb-4 text-dark">Biểu đồ Doanh thu 7 ngày qua</h3>
          <div className="d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
            {/* Component Chart thực tế sẽ được thêm vào đây */}
            <p className="text-muted">Placeholder: Biểu đồ sẽ được hiển thị ở đây.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;