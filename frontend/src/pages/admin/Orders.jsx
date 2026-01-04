import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Eye, Pencil, Search } from 'lucide-react';
import axios from 'axios';
import OrderDetailModal from "./OrderDetailModal";
import { filterListByFields } from '../../utils/searchUtils';
import './Common.css'; 

const API_BASE_URL = "http://127.0.0.1:8000/api/order"; 
const token = localStorage.getItem('admin_accessToken');

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editableMode, setEditableMode] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const actionBtnStyle = {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    border: 'none'
  };

  // Fetch dữ liệu
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/all-orders/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.data);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': case 'Chờ xác nhận': return 'bg-warning text-dark';
      case 'Confirmed': case 'Đã xác nhận': return 'bg-primary text-white';
      case 'Shipping': case 'Đang giao': return 'bg-info text-dark';
      case 'Delivered': case 'Đã giao': return 'bg-success text-white';
      case 'Cancelled': case 'Đã hủy': return 'bg-danger text-white';
      default: return 'bg-light text-dark';
    }
  };

  const nextStatusOptions = {
    'Pending': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Shipping', 'Cancelled'],
    'Shipping': ['Delivered', 'Cancelled'],
    'Delivered': [],
    'Cancelled': [],
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.ship_status);
    setEditableMode(false);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.ship_status);
    setCancelReason('');
    setEditableMode(true);
  };

  const handleSaveUpdate = async () => {
    if (!newStatus) return;
    try {
      await axios.patch(`${API_BASE_URL}/admin/update-status/${selectedOrder.id}/`, {
        status: newStatus,
        note: cancelReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert("Cập nhật trạng thái thất bại: " + (err.response?.data?.error || err.message));
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    result = filterListByFields(result, searchTerm, ['id', 'customer']);
    if (statusFilter) result = result.filter(o => o.ship_status === statusFilter);
    if (paymentFilter) result = result.filter(o =>
      paymentFilter === 'paid' ? o.payment_status === 'Paid' : o.payment_status !== 'Paid'
    );
    return result;
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  return (
    <div className="container-fluid">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">🛒</span> Quản Lý Đơn Hàng
        </h2>
      </div>

      {/* Tìm kiếm + filter */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text bg-white border-end-0">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Mã ĐH hoặc tên khách..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-select" style={{ maxWidth: '200px' }}
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.keys(nextStatusOptions).map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        <select className="form-select" style={{ maxWidth: '200px' }}
          value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="">Tất cả thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="unpaid">Chưa thanh toán</option>
        </select>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Mã ĐH</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Ngày đặt</th>
                  <th className="text-center px-4 py-3">Tổng tiền</th>
                  <th className="text-center px-4 py-3">Trạng thái</th>
                  <th className="text-center px-4 py-3">Thanh toán</th>
                  <th className="text-center px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                ) : filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="align-middle px-4 py-3 fw-medium">#{order.id}</td>

                    {/* 🛍 Cột sản phẩm */}
                    <td className="align-middle px-4 py-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="d-flex align-items-start mb-2">
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "6px", marginRight: "8px" }}
                          />
                          <div>
                            <div className="fw-semibold">{item.product_name}</div>
                            <div className="text-muted small">
                              {item.size} • {item.color} — SL: {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </td>

                    <td className="align-middle px-4 py-3">
                        {new Date(order.order_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="text-center align-middle px-4 py-3 fw-bold text-danger">
                        {parseFloat(order.total_amount).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="text-center align-middle px-4 py-3">
                      <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(order.ship_status)}`}>
                        {order.ship_status}
                      </span>
                    </td>
                    <td className="text-center align-middle px-4 py-3">
                        <span className={`badge px-3 py-2 ${order.payment_status === 'Paid' ? 'bg-success' : 'bg-danger'}`}>
                            {order.payment_status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                    </td>
                    <td className="text-center align-middle px-4 py-3">
                      <div className='d-inline-flex align-items-center rounded overflow-hidden'>
                          <button style={actionBtnStyle} className="btn btn-light text-info" onClick={() => handleViewOrder(order)}>
                            <Eye size={18} />
                          </button>
                          {nextStatusOptions[order.ship_status]?.length > 0 && (
                            <button
                              style={actionBtnStyle}
                              className="btn btn-light text-success"
                              onClick={() => handleEditOrder(order)}
                            >
                              <Pencil size={18} />
                            </button>
                          )}
                      </div>
                      
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">Không có đơn hàng nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          show={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          editable={editableMode}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          nextStatusOptions={nextStatusOptions}
          onSaveStatus={handleSaveUpdate}
        />
      )}
    </div>
  );
};

export default Orders;
