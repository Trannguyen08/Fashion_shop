import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Pencil, Search, ShoppingBag, Clock, CheckCircle, DollarSign } from 'lucide-react';
import OrderDetailModal from "./OrderDetailModal";
import { filterListByFields } from '../../utils/searchUtils';
import axios from 'axios'; // Giả sử bạn dùng axios
import './Categories.css'; 

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

  // --- 1. CALL API LẤY DANH SÁCH ---
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Thay URL bằng endpoint thật của bạn
      const response = await axios.get('https://127.0.0.1:8080/api/order/all-orders/');
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      alert("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- 2. CALL API CẬP NHẬT TRẠNG THÁI ---
  const handleSaveUpdate = async () => {
    if (!newStatus) return;

    try {
      // Gửi request cập nhật lên server
      await axios.patch(`https://127.0.0.1:8080/api/order/update/${selectedOrder.id}/`, {
        status: newStatus,
        cancelReason: newStatus === 'Đã hủy' ? cancelReason : ''
      });

      // Cập nhật lại state cục bộ để UI thay đổi ngay lập tức
      setOrders((prev) => 
        prev.map((o) => o.id === selectedOrder.id 
          ? { ...o, status: newStatus, cancelReason: newStatus === 'Đã hủy' ? cancelReason : '' } 
          : o
        )
      );
      
      setSelectedOrder(null);
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Cập nhật thất bại, vui lòng thử lại.");
    }
  };

  // --- LOGIC DASHBOARD ---
  const miniStats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-GB'); 
    const todayOrders = orders.filter(order => order.date === todayStr);

    return {
      totalToday: todayOrders.length,
      pending: orders.filter(order => order.status === 'Chờ xác nhận').length,
      completedToday: todayOrders.filter(order => order.status === 'Đã giao').length,
      revenueToday: todayOrders
        .filter(order => order.status !== 'Đã hủy')
        .reduce((sum, order) => sum + (order.total || 0), 0)
    };
  }, [orders]);

  // Các hàm helper và filter giữ nguyên như cũ...
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Chờ xác nhận': return 'bg-warning text-dark';
      case 'Đã xác nhận': return 'bg-primary text-white';
      case 'Đang giao': return 'bg-info text-dark';
      case 'Đã giao': return 'bg-success text-white';
      case 'Đã hủy': return 'bg-danger text-white';
      case 'Hoàn hàng': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  };

  const nextStatusOptions = {
    'Chờ xác nhận': ['Đã xác nhận', 'Đã hủy'],
    'Đã xác nhận': ['Đang giao', 'Đã hủy'],
    'Đang giao': ['Đã giao', 'Đã hủy'],
    'Đã giao': ['Hoàn hàng'],
    'Đã hủy': [],
    'Hoàn hàng': [],
  };

  const handleViewOrder = (order) => { setSelectedOrder(order); setNewStatus(order.status); setEditableMode(false); };
  const handleEditOrder = (order) => { setSelectedOrder(order); setNewStatus(''); setCancelReason(''); setEditableMode(true); };

  const filteredOrders = useMemo(() => {
    let result = orders;
    result = filterListByFields(result, searchTerm, ['id', 'customer']);
    if (statusFilter) result = result.filter(order => order.status === statusFilter);
    if (paymentFilter) result = result.filter(order => paymentFilter === 'paid' ? order.paid : !order.paid);
    return result;
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  if (loading) return <div className="text-center py-5">Đang tải dữ liệu...</div>;

  return (
    <div className="container-fluid py-3">
      {/* ... Phần JSX Header và Stats (Giữ nguyên) ... */}
      
      {/* BẢNG ĐƠN HÀNG */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            {/* ... Phần thead ... */}
            <tbody>
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-3">{order.id}</td>
                  <td className="px-4 py-3">{order.customer}</td>
                  <td className="px-4 py-3">{order.date}</td>
                  <td className="text-center px-4 py-3 fw-bold text-danger">
                    {order.total?.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    {order.paid ? 
                      <span className="badge bg-success px-3 py-2">Đã thanh toán</span> : 
                      <span className="badge bg-danger px-3 py-2">Chưa thanh toán</span>
                    }
                  </td>
                  <td className="text-center px-4 py-3">
                    <div className="d-inline-flex border rounded bg-white overflow-hidden shadow-sm">
                      <button className="btn btn-light text-info border-end" onClick={() => handleViewOrder(order)}><Eye size={14} /></button>
                      <button 
                        className="btn btn-light text-success" 
                        onClick={() => handleEditOrder(order)} 
                        disabled={nextStatusOptions[order.status]?.length === 0}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Không tìm thấy đơn hàng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder} show={!!selectedOrder} onClose={() => setSelectedOrder(null)}
          editable={editableMode} newStatus={newStatus} setNewStatus={setNewStatus}
          cancelReason={cancelReason} setCancelReason={setCancelReason}
          nextStatusOptions={nextStatusOptions} onSaveStatus={handleSaveUpdate}
        />
      )}
    </div>
  );
};

export default Orders;