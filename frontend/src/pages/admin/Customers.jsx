import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Lock, Unlock, Search } from 'lucide-react'; 
import { filterListByFields } from '../../utils/searchUtils';
import axios from 'axios';
import UserDetail from './UserDetail'; // Giả sử file bạn lưu tên là UserDetail.jsx
import './Categories.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State mới để điều hướng
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/account/all-customers/'); 
      setCustomers(response.data.customers);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách hàng:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await axios.post(`http://127.0.0.1:8000/api/account/update-status/${customerId}/`, {
        status: newStatus,
      });
      setCustomers(prev =>
        prev.map(c => c.account_id === customerId ? { ...c, is_active: newStatus === 'Active' } : c)
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    return status ? 'bg-success text-white' : 'bg-danger text-white';
  };

  const filteredCustomers = useMemo(() => {
    return filterListByFields(customers, searchTerm, ['full_name', 'email']);
  }, [customers, searchTerm]);

  // Điều kiện hiển thị: Nếu có ID được chọn, hiển thị trang chi tiết
  if (selectedCustomerId) {
    return (
      <UserDetail 
        userId={selectedCustomerId} 
        onBack={() => setSelectedCustomerId(null)} 
      />
    );
  }

  if (loading) {
    return <div className="text-center py-5">Đang tải danh sách khách hàng...</div>;
  }

  return (
    <div className="container-fluid">
      <h2 className="text-3xl font-weight-bold text-dark mb-4">
        <span className="me-2">👤</span> Quản Lý Khách Hàng
      </h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: '350px' }}>
          <span className="input-group-text bg-light border-end-0">
            <Search size={18} />
          </span>
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
                    <tr key={customer.account_id}>
                      <td className="px-4 py-3">{customer.account_id}</td>
                      <td className="px-4 py-3 fw-bold">{customer.full_name}</td>
                      <td className="px-4 py-3">{customer.email}</td>
                      <td className="text-center px-4 py-3">{customer.totalOrders || 0}</td>
                      <td className="text-center px-4 py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(customer.is_active)}`}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-center px-4 py-3">
                        {/* Cụm nút hành động sát nhau */}
                        <div className="d-inline-flex border rounded bg-white overflow-hidden shadow-sm">
                          <button 
                            className="btn btn-sm btn-light text-info border-end" 
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            title="Xem chi tiết"
                            onClick={() => setSelectedCustomerId(customer.account_id)}
                          >
                            <Eye size={16} className="mx-auto" />
                          </button>
                          
                          <button 
                            className={`btn btn-sm btn-light ${customer.is_active ? 'text-warning' : 'text-success'}`}
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            title={customer.is_active ? 'Khóa' : 'Mở khóa'}
                            onClick={() => toggleStatus(customer.account_id, customer.is_active ? 'Active' : 'Inactive')}
                          >
                            {customer.is_active ? <Lock size={16} className="mx-auto" /> : <Unlock size={16} className="mx-auto" />}
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