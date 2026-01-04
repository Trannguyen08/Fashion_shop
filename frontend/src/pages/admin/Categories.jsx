import React, { useState, useEffect, useMemo } from 'react';
import { Pencil, PlusCircle, Search } from 'lucide-react';
import { filterList } from '../../utils/searchUtils';
import './Common.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://127.0.0.1:8000/api/category';
const token = localStorage.getItem('admin_accessToken');

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    status: 'Active'
  });

  const [searchTerm, setSearchTerm] = useState('');

  // ================= FETCH LIST =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/all-category/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCategories(res.data.data || []);
        console.log("Fetched categories:", res.data.data || []);

      } catch (err) {
        console.error("Fetch categories error:", err);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return filterList(categories, searchTerm, cat => cat.name);
  }, [categories, searchTerm]);

  // ================= FORM MODAL =================
  const handleOpenFormModal = (categoryToEdit = null) => {
    setEditingCategory(categoryToEdit);
    setFormData({
      name: categoryToEdit ? categoryToEdit.name : '',
      status: categoryToEdit ? categoryToEdit.status : 'Active'
    });
    setShowFormModal(true);
  };


  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingCategory(null);
    setFormData({ name: '', status: 'Active' });
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // ================= SAVE (ADD / UPDATE) =================
  const handleSaveCategory = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Tên danh mục không được để trống");
      return;
    }

    try {
      if (editingCategory) {
        // UPDATE
        const res = await axios.put(
          `${API_BASE_URL}/update/${editingCategory.id}/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedCategory = res.data.category;

        setCategories(categories.map(cat =>
          cat.id === editingCategory.id ? { ...cat, ...updatedCategory } : cat
        ));

        handleCloseFormModal();
        toast.success("Cập nhật danh mục thành công", { position: 'bottom-right', autoClose: 2000 });

      } else {
        // ADD
        const res = await axios.post(
          `${API_BASE_URL}/add/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newCategory = res.data.category;

        setCategories([
          ...categories,
          { ...newCategory, product_count: 0 }
        ]);

        handleCloseFormModal();
        toast.success("Thêm danh mục thành công", { position: 'bottom-right', autoClose: 2000 });
      }

      handleCloseFormModal();

    } catch (err) {
      console.error("Save category error:", err);
      toast.error("Lưu danh mục thất bại", { position: 'bottom-right', autoClose: 2000 });
    }
  };

  // ================= DELETE =================
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingCategoryId(null);
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Active') return 'bg-success text-white';
    if (status === 'Hidden') return 'bg-secondary text-white';
    return 'bg-secondary text-white';
  };

  return (
    <div className="container-fluid">
      <h2 className="fw-bold text-dark mb-4">
        <span className="me-2">🗂️</span> Quản Lý Danh Mục
      </h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text bg-light border-end-0">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          className="btn btn-primary btn-sm w-auto py-2"
          style={{maxWidth : '220px'}}
          onClick={() => handleOpenFormModal(null)}
        >
          <PlusCircle size={18} className="me-1" /> Thêm Danh Mục
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th className="text-center px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên Danh mục</th>
                  <th className="text-center px-4 py-3">Số SP</th>
                  <th className="text-center px-4 py-3">Trạng thái</th>
                  <th className="text-center px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(cat => (
                  <tr key={cat.id}>
                    <td className="text-center px-4 py-3">{cat.id}</td>
                    <td className="px-4 py-3 fw-bold text-dark">{cat.name}</td>
                    <td className="text-center px-4 py-3">{cat.product_count}</td>
                    <td className="text-center px-4 py-3">
                      <span className={`badge rounded-pill px-3 py-1 ${getStatusBadgeClass(cat.status)}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">
                      <button
                        className="btn btn-sm btn-link text-info p-0 me-2 icon-action"
                        title="Sửa"
                        onClick={() => handleOpenFormModal(cat)}
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL THÊM/SỬA */}
      {showFormModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingCategory ? 'Cập Nhật Danh Mục' : 'Thêm Danh Mục Mới'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseFormModal}></button>
              </div>
              <form onSubmit={handleSaveCategory}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Tên Danh mục</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  {/* Chỉ hiển thị trạng thái khi đang sửa */}
                  {editingCategory && (
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">Trạng thái</label>
                      <select
                        id="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleFormChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Hidden">Hidden</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseFormModal}>Đóng</button>
                  <button type="submit" className="btn btn-primary">{editingCategory ? 'Cập Nhật Danh Mục' : 'Lưu Danh Mục'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {showDeleteModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Xác Nhận Xóa</h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseDeleteModal}></button>
              </div>
              <div className="modal-body">
                Bạn **chắc chắn** muốn xóa danh mục này (ID: **{deletingCategoryId}**)? 
                <p className='text-danger mt-2'>Thao tác này không thể hoàn tác.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>Hủy</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Xác Nhận Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
