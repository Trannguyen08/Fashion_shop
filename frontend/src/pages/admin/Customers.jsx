import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Lock, Unlock, Search } from 'lucide-react'; 
import { filterListByFields } from '../../utils/searchUtils';
import axios from 'axios';
import './Categories.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Lấy danh sách khách hàng từ API
  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/account/all-customers/'); 
      setCustomers(response.data.customers);
      console.log("Fetched customers:", response.data.customers);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách hàng:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Cập nhật trạng thái khách hàng
  const toggleStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    try {
      await axios.post(`http://127.0.0.1:8000/api/account/update-status/${customerId}/`, {
        status: newStatus,
      });

      // Cập nhật giao diện local ngay lập tức
      setCustomers(prev =>
        prev.map(c =>
          c.account_id === customerId
            ? { ...c, is_active: newStatus === 'Active' } // chuyển sang boolean
            : c
        )
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    return status ? 'bg-success text-white' : 'bg-danger text-white';
  };

  const filteredCustomers = useMemo(() => {
    return filterListByFields(customers, searchTerm, ['name', 'email']);
  }, [customers, searchTerm]);

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
            className="form-control w-25" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng Danh sách Khách hàng */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th scope="col" className="fs-6 px-4 py-3">ID</th>
                  <th scope="col" className="fs-6 px-4 py-3">Tên Khách hàng</th>
                  <th scope="col" className="fs-6 px-4 py-3">Email</th>
                  <th scope="col" className="fs-6 px-4 py-3">SĐT</th>
                  <th scope="col" className="text-center fs-6 px-4 py-3">Tổng Đơn</th>
                  <th scope="col" className="text-center fs-6 px-4 py-3">Trạng thái</th>
                  <th scope="col" className="fs-6 px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="align-middle px-4 py-3">{customer.account_id}</td>
                      <td className="align-middle px-4 py-3 fw-bold text-dark">{customer.full_name}</td>
                      <td className="align-middle px-4 py-3">{customer.email}</td>
                      <td className="align-middle px-4 py-3">{customer.phone}</td>
                      <td className="text-center align-middle px-4 py-3">{customer.totalOrders}</td>
                      <td className="text-center align-middle px-4 py-3">
                        <span className={`badge ${getStatusBadgeClass(customer.is_active)} fw-normal`}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="align-middle px-4 py-3 text-center">
                        <button 
                            className="btn btn-sm btn-link text-info p-0 me-2 icon-action" 
                            title="Xem chi tiết"
                        >
                            <Eye size={18} />
                        </button>
                        
                        <button 
                            className={`btn btn-sm btn-link p-0 icon-action ${customer.is_active ? 'text-warning' : 'text-success'}`}
                            title={customer.is_active ? 'Khóa khách hàng' : 'Mở khóa khách hàng'}
                            onClick={() => toggleStatus(customer.account_id, customer.is_active ? 'Active' : 'Inactive')}
                        >
                            {customer.is_active ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Không tìm thấy khách hàng nào khớp với từ khóa "{searchTerm}".
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
