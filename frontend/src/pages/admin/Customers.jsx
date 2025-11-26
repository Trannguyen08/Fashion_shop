import React, { useState, useMemo } from 'react';
import { Eye, Lock, Unlock, Search } from 'lucide-react'; 
import { filterListByFields } from '../../utils/searchUtils';
import './Categories.css';

const initialCustomers = [
  { id: 101, name: 'Nguyễn Văn A', email: 'vana@example.com', phone: '0901234567', totalOrders: 5, status: 'Active' },
  { id: 102, name: 'Trần Thị B', email: 'thib@example.com', phone: '0987654321', totalOrders: 12, status: 'Active' },
  { id: 103, name: 'Lê Văn C', email: 'vanc@example.com', phone: '0912345678', totalOrders: 0, status: 'Inactive' },
  { id: 104, name: 'Phạm Văn D', email: 'vand@example.com', phone: '0919283746', totalOrders: 7, status: 'Active' },
  { id: 105, name: 'Võ Thị E', email: 'thie@example.com', phone: '0978675645', totalOrders: 1, status: 'Inactive' },
];

const Customers = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadgeClass = (status) => {
    return status === 'Active' ? 'bg-success text-white' : 'bg-danger text-white';
  };

  const filteredCustomers = useMemo(() => {
    return filterListByFields(customers, searchTerm, ['name', 'email']);
  }, [customers, searchTerm]);

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
                      <td className="align-middle px-4 py-3">{customer.id}</td>
                      <td className="align-middle px-4 py-3 fw-bold text-dark">{customer.name}</td>
                      <td className="align-middle px-4 py-3">{customer.email}</td>
                      <td className="align-middle px-4 py-3">{customer.phone}</td>
                      <td className="text-center align-middle px-4 py-3">{customer.totalOrders}</td>
                      <td className="text-center align-middle px-4 py-3">
                        <span className={`badge ${getStatusBadgeClass(customer.status)} fw-normal`}>
                          {customer.status}
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
                            className={`btn btn-sm btn-link p-0 icon-action ${customer.status === 'Active' ? 'text-warning' : 'text-success'}`}
                            title={customer.status === 'Active' ? 'Khóa khách hàng' : 'Mở khóa khách hàng'}
                        >
                            {customer.status === 'Active' ? <Lock size={18} /> : <Unlock size={18} />}
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