import React, { useState, useEffect } from 'react';
import { EyeOff, Edit } from 'lucide-react';
import axios from 'axios';
import { formatDate, formatNumberSmart, formatCurrency } from "../../utils/formatUtils";


const GET_VOUCHERS_URL = 'http://127.0.0.1:8000/voucher/api/get-all/';
const ADD_VOUCHER_URL = 'http://127.0.0.1:8000/voucher/api/add/';
const EDIT_VOUCHER_URL = 'http://127.0.0.1:8000/voucher/api/edit/';
const TOGGLE_VOUCHER_URL = 'http://127.0.0.1:8000/voucher/api/toggle/';
const TOKEN = localStorage.getItem('admin_accessToken');

const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axios.get(GET_VOUCHERS_URL, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        setVouchers(res.data.data); 
      } catch (err) {
        console.error(err);
        alert('Lấy danh sách voucher thất bại');
      }
    };
    fetchVouchers();
  }, []);

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  const isExpired = (endDate) => new Date(endDate) < new Date();

  const handleToggleStatus = async (voucher) => {
    try {
      const newStatus = !voucher.is_active;
      await axios.post(TOGGLE_VOUCHER_URL, { id: voucher.id, is_active: newStatus }, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      setVouchers(vouchers.map(v => v.id === voucher.id ? { ...v, is_active: newStatus } : v));
    } catch (err) {
      console.error(err);
      alert('Cập nhật trạng thái thất bại');
    }
  };

  const handleOpenEdit = (voucher) => {
    setSelectedVoucher(voucher);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedVoucher(null);
    setShowModal(false);
  };

  const handleSaveVoucher = async (formData) => {
    try {
      const payload = {
        ...formData,
        start_date: formData.start_date + 'T00:00:00',
        end_date: formData.end_date + 'T23:59:59',
      };
      if (selectedVoucher) {
        await axios.put(`${EDIT_VOUCHER_URL}${selectedVoucher.id}/`, payload, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        setVouchers(vouchers.map(v => v.id === selectedVoucher.id ? { ...v, ...payload } : v));
      } else {
        const res = await axios.post(ADD_VOUCHER_URL, payload, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        setVouchers([...vouchers, res.data]);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Lưu voucher thất bại');
    }
  };

  const filteredVouchers = vouchers.filter(v =>
    v.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">🎟️</span> Quản Lý Voucher
        </h2>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center" style={{ width: '250px' }}>
          <input 
            type="text"
            className="form-control"
            placeholder="🔍 Tìm mã voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-primary btn-sm w-auto py-2"
          onClick={() => setShowModal(true)}
          style={{maxWidth: '220px'}}
        >
          <i className="bi bi-plus-lg me-1"></i> Tạo Voucher Mới
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Mã Voucher</th>
                  <th>Loại & Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Thông số</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Tình trạng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map(v => {
                  const expired = isExpired(v.end_date);
                  const canEdit = v.used_count === 0 && !expired;
                  return (
                    <tr key={v.id}>
                      <td className="align-middle fw-bold text-success">{v.code}</td>
                      <td className="align-middle">
                        {v.discount_type === "percent"
                          ? `${formatNumberSmart(v.discount_value)}%`
                          : formatCurrency(v.discount_value)}
                      </td>
                      <td className="align-middle">{formatCurrency(v.min_order_amount)}</td>
                      <td className="align-middle">{v.used_count}/{v.quantity}</td>
                      <td className="align-middle">{formatDate(v.start_date)}</td>
                      <td className="align-middle">{formatDate(v.end_date)}</td>
                      <td className="align-middle">
                        {expired ? <span className="badge bg-danger">Hết hạn</span>
                                 : v.is_active ? <span className="badge bg-success">Đang hoạt động</span>
                                 : <span className="badge bg-secondary">Đã ẩn</span>}
                      </td>
                      <td className="align-middle">
                        {canEdit && (
                          <button 
                            style={{ all:'unset', cursor:'pointer', marginRight:4 }}
                            onClick={() => handleToggleStatus(v)}
                            title="Ẩn/Hiện voucher"
                          >
                            <EyeOff size={20}/>
                          </button>
                        )}
                        {canEdit && (
                          <button 
                            style={{ all:'unset', cursor:'pointer' }}
                            onClick={() => handleOpenEdit(v)}
                            title="Sửa voucher"
                          >
                            <Edit size={20}/>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <VoucherModal
          voucher={selectedVoucher}
          onClose={handleCloseModal}
          onSave={handleSaveVoucher}
        />
      )}
    </div>
  );
};

const VoucherModal = ({ voucher, onClose, onSave }) => {
  const isEditMode = !!voucher;
  const [formData, setFormData] = useState({
    code: voucher?.code || '',
    discount_type: voucher?.discount_type || 'percent',
    discount_value: voucher?.discount_value || '',
    min_order_amount: voucher?.min_order_amount || '',
    quantity: voucher?.quantity || '',
    start_date: voucher?.start_date?.split('T')[0] || new Date().toISOString().slice(0,10),
    end_date: voucher?.end_date?.split('T')[0] || new Date().toISOString().slice(0,10),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor:'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content p-4">
          <h5 className="fw-bold mb-3">{voucher ? 'Sửa Voucher' : 'Tạo Voucher Mới'}</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Mã Voucher</label>
              <input type="text" name="code" className="form-control" value={formData.code} onChange={handleChange} disabled={isEditMode} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Loại</label>
              <select className="form-select" name="discount_type" value={formData.discount_type} onChange={handleChange}>
                <option value="percent">Phần trăm</option>
                <option value="fixed">Số tiền</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Giá trị</label>
              <input type="number" name="discount_value" className="form-control" value={formData.discount_value} onChange={handleChange}/>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Đơn tối thiểu</label>
              <input type="number" name="min_order_amount" className="form-control" value={formData.min_order_amount} onChange={handleChange}/>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Số lượng tối đa</label>
              <input type="number" name="quantity" className="form-control" value={formData.quantity} onChange={handleChange}/>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Ngày bắt đầu</label>
              <input type="date" name="start_date" className="form-control" value={formData.start_date} onChange={handleChange}/>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Ngày kết thúc</label>
              <input type="date" name="end_date" className="form-control" value={formData.end_date} onChange={handleChange}/>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{voucher ? 'Lưu' : 'Tạo'}</button>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Vouchers;
