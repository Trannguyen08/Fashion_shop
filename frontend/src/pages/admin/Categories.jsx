import React, { useState } from 'react';
import { Pencil, Trash, PlusCircle } from 'lucide-react';
import './Categories.css';

const categories = [
  { id: 1, name: 'Thời trang', parent: '—', productCount: 450 },
  { id: 2, name: 'Áo nam', parent: 'Thời trang', productCount: 200 },
  { id: 3, name: 'Điện tử & Phụ kiện', parent: '—', productCount: 120 },
];

const Categories = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const parentCategories = categories.filter(c => c.parent === '—');

  return (
    <div className="container-fluid">
      {/* Tiêu đề */}
      <h2 className="fw-bold text-dark mb-4">
        <span className="me-2">🗂️</span> Quản Lý Danh Mục
      </h2>

      {/* Button Thêm danh mục */}
      <div className="text-end mb-3">
        <button
          className="btn btn-primary btn-sm w-auto py-2"
          onClick={handleOpenModal}
        >
          <PlusCircle size={18} className="me-1" /> Thêm Danh Mục
        </button>
      </div>

      {/* Bảng danh mục */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-center px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên Danh mục</th>
                  <th className="px-4 py-3">Danh mục cha</th>
                  <th className="text-center px-4 py-3">Số SP</th>
                  <th className="text-center px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td className="text-center px-4 py-3">{cat.id}</td>
                    <td className="px-4 py-3 fw-bold text-dark">{cat.name}</td>
                    <td className="px-4 py-3 text-muted">{cat.parent}</td>
                    <td className="text-center px-4 py-3">{cat.productCount}</td>
                    <td className="text-center px-4 py-3">
                      <button
                        className="btn btn-sm btn-link text-info p-0 me-2 icon-action"
                        title="Sửa"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn btn-sm btn-link text-danger p-0 icon-action delete"
                        title="Xóa"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Thêm danh mục */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm Danh Mục Mới</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="categoryName" className="form-label">
                      Tên Danh mục
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="categoryName"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="parentCategory" className="form-label">
                      Danh mục cha
                    </label>
                    <select className="form-select" id="parentCategory">
                      <option value="">— Không có (Danh mục gốc)</option>
                      {parentCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Đóng
                </button>
                <button type="button" className="btn btn-primary">
                  Lưu Danh Mục
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
