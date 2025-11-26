import React, { useState, useMemo } from 'react';
import { Eye, Pencil, Search } from 'lucide-react';
import OrderDetailModal from "./OrderDetailModal";
import { filterListByFields } from '../../utils/searchUtils';
import './Categories.css'; 

const Orders = () => {
  const [orders, setOrders] = useState([
    {
      id: 'DH001',
      customer: 'Nguyễn Văn A',
      productName: 'Áo thun Nam',
      variant: 'Size L - Màu Đen',
      date: '15/11/2025',
      total: 350000,
      status: 'Chờ xác nhận',
      paid: false,
      cancelReason: '',
      phone: '0901234567',
      address: '123 Nguyễn Trãi, Hà Nội',
      paymentMethod: 'COD',
      shipMethod: 'Giao hàng nhanh',
      quantity: 2,
      price: 175000
    },
    {
      id: 'DH002',
      customer: 'Trần Thị B',
      productName: 'Giày sneaker',
      variant: 'Size 39 - Màu Trắng',
      date: '14/11/2025',
      total: 1250000,
      status: 'Đã xác nhận',
      paid: true,
      cancelReason: '',
      phone: '0912345678',
      address: '456 Lê Lợi, TP.HCM',
      paymentMethod: 'Chuyển khoản',
      shipMethod: 'Giao hàng tiêu chuẩn',
      quantity: 1,
      price: 1250000
    },
    {
      id: 'DH003',
      customer: 'Lê Văn C',
      productName: 'Nón lưỡi trai',
      variant: 'Màu Xanh Navy',
      date: '13/11/2025',
      total: 95000,
      status: 'Đang giao',
      paid: true,
      cancelReason: '',
      phone: '0923456789',
      address: '789 Trần Phú, Đà Nẵng',
      paymentMethod: 'COD',
      shipMethod: 'Giao hàng nhanh',
      quantity: 1,
      price: 95000
    },
    {
      id: 'DH004',
      customer: 'Phạm Thị D',
      productName: 'Balo laptop',
      variant: '15 inch - Chống sốc',
      date: '12/11/2025',
      total: 500000,
      status: 'Đã giao',
      paid: true,
      cancelReason: '',
      phone: '0934567890',
      address: '321 Hai Bà Trưng, Hà Nội',
      paymentMethod: 'COD',
      shipMethod: 'Giao hàng tiêu chuẩn',
      quantity: 1,
      price: 500000
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editableMode, setEditableMode] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Class badge trạng thái
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

  // Các bước trạng thái tiếp theo
  const nextStatusOptions = {
    'Chờ xác nhận': ['Đã xác nhận', 'Đã hủy'],
    'Đã xác nhận': ['Đang giao', 'Đã hủy'],
    'Đang giao': ['Đã giao', 'Đã hủy'],
    'Đã giao': ['Hoàn hàng'],
    'Đã hủy': [],
    'Hoàn hàng': [],
  };

  // Xem chi tiết
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setEditableMode(false);
  };

  // Chỉnh sửa
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus('');
    setCancelReason('');
    setEditableMode(true);
  };

  // Lưu cập nhật trạng thái
  const handleSaveUpdate = () => {
    if (!newStatus) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, status: newStatus, cancelReason: newStatus === 'Đã hủy' ? cancelReason : '' }
          : o
      )
    );
    setSelectedOrder(null);
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    result = filterListByFields(result, searchTerm, ['id', 'customer']);

    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    if (paymentFilter) {
      result = result.filter(order =>
        paymentFilter === 'paid' ? order.paid : !order.paid
      );
    }

    return result;
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">🛒</span> Quản Lý Đơn Hàng
        </h2>
      </div>

      {/* Thanh tìm kiếm + filter */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text bg-light border-end-0">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hoặc khách hàng..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter trạng thái */}
        <select
          className="form-select"
          style={{ maxWidth: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.keys(nextStatusOptions).map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        {/* Filter thanh toán */}
        <select
          className="form-select"
          style={{ maxWidth: '200px' }}
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">Tất cả thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="unpaid">Chưa thanh toán</option>
        </select>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="fs-6 px-4 py-3">Mã ĐH</th>
                  <th className="fs-6 px-4 py-3">Khách hàng</th>
                  <th className="fs-6 px-4 py-3">Ngày đặt</th>
                  <th className="text-center fs-6 px-4 py-3">Tổng tiền</th>
                  <th className="text-center fs-6 px-4 py-3">Trạng thái</th>
                  <th className="text-center fs-6 px-4 py-3">Thanh toán</th>
                  <th className="text-center fs-6 px-4 py-3 text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="align-middle px-4 py-3">{order.id}</td>
                    <td className="align-middle px-4 py-3">{order.customer}</td>
                    <td className="align-middle px-4 py-3">{order.date}</td>
                    <td className="text-center align-middle px-4 py-3 fw-bold text-danger">{order.total.toLocaleString('vi-VN')}</td>
                    <td className="text-center align-middle px-4 py-3">
                      <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-center align-middle px-4 py-3">
                      {order.paid ? (
                        <span className="badge bg-success px-3 py-2">Đã thanh toán</span>
                      ) : (
                        <span className="badge bg-danger px-3 py-2">Chưa thanh toán</span>
                      )}
                    </td>
                    <td className="text-center align-middle px-4 py-3">
                      <button
                        className="btn btn-sm btn-link text-info icon-btn"
                        title="Xem chi tiết"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        disabled={nextStatusOptions[order.status].length === 0}
                        className="btn btn-sm btn-link text-success icon-btn"
                        onClick={() => handleEditOrder(order)}
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">Không tìm thấy đơn hàng phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
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
