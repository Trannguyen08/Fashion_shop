import React from 'react';

const Shipping = () => {
  const shippingRules = [
    { id: 1, region: 'Nội thành TP.HCM', cost: 25000, threshold: 500000, carrier: 'GHN' },
    { id: 2, region: 'Ngoại thành/Tỉnh', cost: 40000, threshold: 700000, carrier: 'Viettel Post' },
    { id: 3, region: 'Miễn phí mặc định', cost: 0, threshold: 1000000, carrier: 'Tất cả' },
  ];

  return (
    <div className="container-fluid my-4">
      
      <div className="mb-4">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">🚚</span> Quản Lý Vận Chuyển/Ship
        </h2>
      </div>
      
      {/* Container chính cho thiết lập */}
      <div className="card shadow-sm">
        <div className="card-body p-4">
          
          {/* Tiêu đề card */}
          <h3 className="card-title fs-5 fw-semibold mb-4 text-secondary">Thiết Lập Phí Vận Chuyển</h3>
          
          {/* Nút Thêm quy tắc */}
          {/* flex justify-end mb-4 -> d-flex justify-content-end mb-3 */}
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-primary">
              <i className="bi bi-plus-lg me-1"></i> + Thêm Quy Tắc Vận Chuyển
            </button>
          </div>

          {/* Bảng quy tắc vận chuyển */}
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">ID</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Khu vực/Quy tắc</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Phí cơ bản (VNĐ)</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Miễn phí từ (VNĐ)</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Đơn vị áp dụng</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3 text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {shippingRules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="align-middle px-4 py-3">{rule.id}</td>
                    <td className="align-middle px-4 py-3 fw-bold text-dark">{rule.region}</td>
                    <td className="align-middle px-4 py-3">{rule.cost.toLocaleString('vi-VN')}</td>
                    <td className="align-middle px-4 py-3">{rule.threshold.toLocaleString('vi-VN')}</td>
                    <td className="align-middle px-4 py-3">{rule.carrier}</td>
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

export default Shipping;