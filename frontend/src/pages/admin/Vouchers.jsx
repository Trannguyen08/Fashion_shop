import React from 'react';

const Vouchers = () => {
  const vouchers = [
    { id: 1, code: 'SALE20', type: 'Phần trăm', value: '20%', minOrder: 500000, expires: '31/12/2025', used: 150 },
    { id: 2, code: 'FREESHIP', type: 'Miễn phí Ship', value: '0₫', minOrder: 300000, expires: '30/11/2025', used: 250 },
    { id: 3, code: 'GIAM100K', type: 'Số tiền', value: '100.000₫', minOrder: 1000000, expires: 'Hết hạn', used: 50 },
  ];

  return (
    <div className="container-fluid my-4">
      
      <div className="mb-4">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">🎟️</span> Quản Lý Voucher
        </h2>
      </div>
      
      {/* Thanh công cụ (Nút Thêm) */}
      {/* flex justify-end bg-white p-4 rounded-lg shadow-md */}
      <div className="d-flex justify-content-end align-items-center bg-white p-3 rounded shadow-sm mb-4">
        <button className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i> + Tạo Voucher Mới
        </button>
      </div>

      {/* Bảng danh sách Voucher */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">ID</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Mã Voucher</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Loại</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Giá trị</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Đơn tối thiểu</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Hạn dùng</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Đã dùng</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3 text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id}>
                    <td className="align-middle px-4 py-3">{v.id}</td>
                    <td className="align-middle px-4 py-3 fw-bold text-success">{v.code}</td>
                    <td className="align-middle px-4 py-3">{v.type}</td>
                    <td className="align-middle px-4 py-3">{v.value}</td>
                    <td className="align-middle px-4 py-3">{v.minOrder.toLocaleString('vi-VN') || '—'}</td>
                    <td className={`align-middle px-4 py-3 small ${v.expires === 'Hết hạn' ? 'text-danger fw-bold' : 'text-muted'}`}>
                      {v.expires}
                    </td>
                    <td className="align-middle px-4 py-3">{v.used}</td>
                    <td className="align-middle px-4 py-3 text-end">
                      <button className="btn btn-sm btn-link text-info p-0 me-2">Sửa</button>
                      <button className="btn btn-sm btn-link text-danger p-0">Xóa</button>
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

export default Vouchers;