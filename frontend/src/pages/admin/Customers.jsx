import React from 'react';

const Customers = () => {
  const customers = [
    { id: 101, name: 'Nguyễn Văn A', email: 'vana@example.com', phone: '0901234567', totalOrders: 5, status: 'Active' },
    { id: 102, name: 'Trần Thị B', email: 'thib@example.com', phone: '0987654321', totalOrders: 12, status: 'Active' },
    { id: 103, name: 'Lê Văn C', email: 'vanc@example.com', phone: '0912345678', totalOrders: 0, status: 'Inactive' },
  ];

  // Hàm helper để xác định class màu dựa trên trạng thái
  const getStatusBadgeClass = (status) => {
    return status === 'Active' ? 'bg-success text-white' : 'bg-danger text-white';
  };

  return (
    <div className="container-fluid">
      {/* Tiêu đề */}
      <h2 className="text-3xl font-weight-bold text-dark mb-4">
        <span className="me-2">👤</span> Quản Lý Khách Hàng
      </h2>

      {/* Thanh công cụ (Tìm kiếm) */}
      <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="form-control w-25" 
        />
        {/* Có thể thêm bộ lọc (filter) tại đây */}
      </div>

      {/* Bảng Danh sách Khách hàng */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">ID</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Tên Khách hàng</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Email</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">SĐT</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Tổng ĐH</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Trạng thái</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3 text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="align-middle px-4 py-3">{customer.id}</td>
                    <td className="align-middle px-4 py-3 fw-bold text-dark">{customer.name}</td>
                    <td className="align-middle px-4 py-3">{customer.email}</td>
                    <td className="align-middle px-4 py-3">{customer.phone}</td>
                    <td className="align-middle px-4 py-3">{customer.totalOrders}</td>
                    <td className="align-middle px-4 py-3">
                      <span className={`badge ${getStatusBadgeClass(customer.status)} fw-normal`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="align-middle px-4 py-3 text-end">
                      <button className="btn btn-sm btn-link text-info p-0 me-2">Chi tiết</button>
                      <button className="btn btn-sm btn-link text-danger p-0">
                        {customer.status === 'Active' ? 'Khóa' : 'Mở khóa'}
                      </button>
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

export default Customers;