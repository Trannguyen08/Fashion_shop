import React from 'react';

const Orders = () => {
  const orders = [
    { id: 'DH001', customer: 'Nguyễn Văn A', date: '15/11/2025', total: 350000, status: 'Đang xử lý' },
    { id: 'DH002', customer: 'Trần Thị B', date: '14/11/2025', total: 1250000, status: 'Đang giao' },
    { id: 'DH003', customer: 'Lê Văn C', date: '13/11/2025', total: 95000, status: 'Đã hủy' },
    { id: 'DH004', customer: 'Phạm Thị D', date: '12/11/2025', total: 500000, status: 'Hoàn thành' },
  ];

  // Hàm helper để xác định class màu Bootstrap dựa trên trạng thái
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Đang xử lý': return 'bg-warning text-dark'; // Tương đương với bg-yellow
      case 'Đang giao': return 'bg-info text-dark';    // Tương đương với bg-blue
      case 'Hoàn thành': return 'bg-success text-white';// Tương đương với bg-green
      case 'Đã hủy': return 'bg-danger text-white';     // Tương đương với bg-red
      default: return 'bg-secondary text-white';
    }
  };

  return (
    <div className="container-fluid my-4">
      
      <div className="mb-4">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">🛒</span> Quản Lý Đơn Hàng
        </h2>
      </div>
      
      {/* Thanh công cụ (Tìm kiếm và Lọc) */}
      <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã ĐH hoặc tên KH..."
          className="form-control w-25 me-3" // w-25 tương đương w-1/3
        />
        <select className="form-select w-auto">
          <option>Lọc theo trạng thái</option>
          <option>Đang xử lý</option>
          <option>Hoàn thành</option>
          <option>Đã hủy</option>
        </select>
      </div>

      {/* Bảng Đơn hàng */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Mã ĐH</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Khách hàng</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Ngày đặt</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Tổng tiền (VNĐ)</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Trạng thái</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3 text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="align-middle px-4 py-3 fw-bold text-primary">{order.id}</td>
                    <td className="align-middle px-4 py-3">{order.customer}</td>
                    <td className="align-middle px-4 py-3">{order.date}</td>
                    <td className="align-middle px-4 py-3 fw-bold">{order.total.toLocaleString('vi-VN')}</td>
                    <td className="align-middle px-4 py-3">
                      <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(order.status)} fw-normal`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="align-middle px-4 py-3 text-end">
                      <button className="btn btn-sm btn-link text-info p-0 me-2">Chi tiết</button>
                      <button className="btn btn-sm btn-link text-success p-0">Cập nhật</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;