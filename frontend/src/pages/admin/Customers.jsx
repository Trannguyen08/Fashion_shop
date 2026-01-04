import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Lock, Unlock, Search } from 'lucide-react'; 
import { filterListByFields } from '../../utils/searchUtils';
import axios from 'axios';
import UserDetail from './UserDetail'; 
// 1. Import Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Common.css';

const token = localStorage.getItem('admin_accessToken');
const API_BASE_URL = 'http://127.0.0.1:8000/api/account';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all-customers/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = response.data.data || [];
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách hàng:', error);
      toast.error("Không thể tải danh sách khách hàng!"); 
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleStatus = async (customerId, currentStatus) => {
    const toastId = toast.loading("Đang cập nhật trạng thái...");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/update-status/${customerId}/`, 
        {}, // Body trống
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setCustomers(prevCustomers =>
          prevCustomers.map(c => 
            c.id === customerId ? { ...c, status: !currentStatus } : c
          )
        );
        
        toast.update(toastId, { 
          render: currentStatus ? "Đã khóa tài khoản thành công!" : "Đã mở khóa tài khoản!", 
          type: "success", 
          isLoading: false,
          autoClose: 2000,
          position: 'bottom-right' 
        });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      toast.update(toastId, { 
        render: "Lỗi: Không thể cập nhật trạng thái!", 
        type: "error", 
        isLoading: false,
        autoClose: 3000,
        position: 'bottom-right' 
      });
    }
  };

  const getStatusBadgeClass = (status) => {
    return status ? 'bg-success text-white' : 'bg-danger text-white';
  };

  const filteredCustomers = useMemo(() => {
    return filterListByFields(customers || [], searchTerm, ['full_name', 'email']) || [];
  }, [customers, searchTerm]);

  if (selectedCustomerId) {
    return <UserDetail accountId={selectedCustomerId} onBack={() => setSelectedCustomerId(null)} />;
  }

  if (loading) {
    return <div className="text-center py-5">Đang tải danh sách khách hàng...</div>;
  }

  return (
    <div className="container-fluid">
      {/* 2. Đặt ToastContainer ở đây để hiển thị thông báo */}
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-3xl font-weight-bold text-dark mb-4">
        <span className="me-2">👤</span> Quản Lý Khách Hàng
      </h2>

      {/* ... Phần search bar giữ nguyên ... */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: '350px' }}>
          <span className="input-group-text bg-light border-end-0"><Search size={18} /></span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="form-control" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên Khách hàng</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-center">Tổng Đơn</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-4 py-3">{customer.id}</td>
                      <td className="px-4 py-3 fw-bold">{customer.full_name}</td>
                      <td className="px-4 py-3">{customer.email}</td>
                      <td className="text-center px-4 py-3">{customer.total_orders || 0}</td>
                      <td className="text-center px-4 py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(customer.status)}`}>
                          {customer.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <div className="d-inline-flex border rounded bg-white overflow-hidden shadow-sm">
                          <button 
                            className="btn btn-sm btn-light text-info border-end" 
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            onClick={() => setSelectedCustomerId(customer.id)}
                          >
                            <Eye size={16} className="mx-auto" />
                          </button>
                          
                          <button 
                            className={`btn btn-sm btn-light ${customer.status ? 'text-warning' : 'text-success'}`}
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            title={customer.status ? 'Khóa' : 'Mở khóa'}
                            onClick={() => toggleStatus(customer.id, customer.status)}
                          >
                            {customer.status ? <Lock size={16} className="mx-auto" /> : <Unlock size={16} className="mx-auto" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted fst-italic">
                      Không tìm thấy khách hàng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;