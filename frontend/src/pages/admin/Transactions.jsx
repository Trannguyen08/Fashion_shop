import React from 'react';

const Transactions = () => {
  const transactions = [
    { id: 'TXN1001', orderId: 'DH004', method: 'Chuyển khoản', amount: 500000, date: '12/11/2025 14:30', status: 'Success' },
    { id: 'TXN1002', orderId: 'DH002', method: 'Momo', amount: 1250000, date: '14/11/2025 10:15', status: 'Success' },
    { id: 'TXN1003', orderId: 'DH003', method: 'Thẻ Visa', amount: 95000, date: '13/11/2025 08:00', status: 'Failed' },
  ];
  
  // Hàm helper để xác định class màu Bootstrap dựa trên trạng thái
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Success': return 'bg-success text-white'; // Tương đương bg-green-100 text-green-800
      case 'Failed': return 'bg-danger text-white';   // Tương đương bg-red-100 text-red-800
      default: return 'bg-secondary text-white';
    }
  };

  return (
    <div className="container-fluid my-4">
      
      <div className="mb-4">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">💳</span> Quản Lý Giao Dịch
        </h2>
      </div>
      
      {/* Thanh công cụ (Tìm kiếm và Lọc) */}
      <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo Mã Giao dịch/Mã ĐH..."
          className="form-control w-25 me-3" // w-25 tương đương w-1/3
        />
        <select className="form-select w-auto">
          <option>Lọc theo phương thức</option>
          <option>Chuyển khoản</option>
          <option>Momo</option>
          <option>COD</option>
        </select>
      </div>

      {/* Bảng Giao dịch */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Mã Giao dịch</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Mã Đơn hàng</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Phương thức</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Số tiền (VNĐ)</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Thời gian</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Trạng thái</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3 text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="align-middle px-4 py-3 fw-bold text-dark">{txn.id}</td>
                    <td className="align-middle px-4 py-3 text-primary">{txn.orderId}</td>
                    <td className="align-middle px-4 py-3">{txn.method}</td>
                    <td className="align-middle px-4 py-3 fw-bold">{txn.amount.toLocaleString('vi-VN')}</td>
                    <td className="align-middle px-4 py-3 small text-muted">{txn.date}</td>
                    <td className="align-middle px-4 py-3">
                      <span className={`badge rounded-pill px-3 py-1 ${getStatusBadgeClass(txn.status)} fw-normal`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="align-middle px-4 py-3 text-end">
                      <button className="btn btn-sm btn-link text-info p-0">Chi tiết</button>
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

export default Transactions;