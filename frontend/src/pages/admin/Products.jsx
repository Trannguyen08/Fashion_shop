import React from 'react';

const Products = () => {
  // Giả định dữ liệu sản phẩm
  const products = [
    { id: 1, name: 'Áo thun cơ bản', category: 'Thời trang nam', price: 150000, stock: 120, status: 'Active' },
    { id: 2, name: 'Tai nghe Bluetooth X5', category: 'Điện tử', price: 890000, stock: 45, status: 'Active' },
    { id: 3, name: 'Sách nấu ăn 101', category: 'Sách', price: 95000, stock: 0, status: 'Hết hàng' },
  ];

  const getStatusBadgeClass = (status) => {
    // Chuyển đổi màu sắc từ Tailwind sang Bootstrap
    if (status === 'Active') {
      return 'bg-success text-white'; // Tương đương bg-green-100 text-green-800
    }
    if (status === 'Hết hàng') {
      return 'bg-danger text-white'; // Tương đương bg-red-100 text-red-800
    }
    return 'bg-secondary text-white';
  };

  return (
    <div className="container-fluid my-4">
      
      <div className="mb-4">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">📦</span> Quản Lý Sản Phẩm
        </h2>
      </div>
      
      {/* Thanh công cụ */}
      {/* flex justify-between items-center bg-white p-4 rounded-lg shadow-md */}
      <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sản phẩm..."
          className="form-control w-25" // w-25 cho thanh tìm kiếm
        />
        <button className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i> + Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* Bảng danh sách sản phẩm */}
      {/* bg-white p-6 rounded-lg shadow-lg overflow-x-auto */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">ID</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Tên sản phẩm</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Danh mục</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Giá (VNĐ)</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Tồn kho</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Trạng thái</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3 text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="align-middle px-4 py-3">{product.id}</td>
                    <td className="align-middle px-4 py-3 fw-bold text-dark">{product.name}</td>
                    <td className="align-middle px-4 py-3 text-muted">{product.category}</td>
                    <td className="align-middle px-4 py-3">{product.price.toLocaleString('vi-VN')}</td>
                    <td className="align-middle px-4 py-3">{product.stock}</td>
                    <td className="align-middle px-4 py-3">
                      <span className={`badge rounded-pill px-3 py-1 ${getStatusBadgeClass(product.status)} fw-normal`}>
                        {product.status}
                      </span>
                    </td>
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
      
      {/* Component Phân trang */}
      <div className="d-flex justify-content-end mt-3">
          <span className="text-muted small">Hiển thị 1-10 trên 50 sản phẩm</span>
      </div>
    </div>
  );
};

export default Products;