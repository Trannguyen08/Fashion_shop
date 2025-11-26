import React, { useMemo } from "react";
import { X } from "lucide-react";

const OrderDetailModal = ({
  order,
  show,
  onClose,
  onSaveStatus,
  editable = false,
  newStatus,
  setNewStatus,
  cancelReason,
  setCancelReason,
  nextStatusOptions = {}
}) => {
  if (!show || !order) return null;

  // Trạng thái cho select
  const canEditStatus = editable && order.status !== "Đã hủy" && order.status !== "Đã giao";
  const statusOptions = nextStatusOptions[order.status] || [];

  // Tính tổng tiền đơn hàng
  const totalAmount = useMemo(() => {
    if (!order.items) return 0;
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [order.items]);

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg">

          {/* Header */}
          <div className="modal-header text-white mh">
            <h5 className="modal-title fw-bold mb-0">
              {canEditStatus ? "Cập nhật đơn hàng" : "Chi tiết đơn hàng"}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>


          {/* Body */}
          <div className="modal-body">

            {/* Thông tin đơn hàng */}
            <h6 className="fw-bold mb-3">📦 Thông tin đơn hàng</h6>
            <div className="row mb-3">
              <div className="col-6"><strong>Mã đơn:</strong> {order.id}</div>
              <div className="col-6"><strong>Ngày đặt:</strong> {order.date}</div>
              <div className="col-6"><strong>Khách hàng:</strong> {order.customer}</div>
              <div className="col-6">
                <strong>Thanh toán:</strong>{" "}
                {order.paid ? (
                  <span className="badge bg-success">Đã thanh toán</span>
                ) : (
                  <span className="badge bg-danger">Chưa thanh toán</span>
                )}
              </div>
              
            </div>

            {/* Sản phẩm */}
            <h6 className="fw-bold mb-3">🛍 Sản phẩm</h6>
            <div className="table-responsive mb-3">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Biến thể</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <img
                          src={item.image}
                          alt={item.productName}
                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                          className="rounded border"
                        />
                      </td>
                      <td>{item.productName}</td>
                      <td>{item.variant}</td>
                      <td>{item.price.toLocaleString("vi-VN")} ₫</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tổng tiền */}
            <div className="mb-4">
              <h6 className="fw-bold">💰 Tổng tiền đơn hàng</h6>
              <div className="fs-5 text-danger fw-bold">
                {totalAmount.toLocaleString("vi-VN")} ₫
              </div>
            </div>

            {/* Thông tin giao hàng */}
            <h6 className="fw-bold mb-2">🚚 Thông tin giao hàng</h6>
            <div className="mb-4">
              <div><strong>Địa chỉ:</strong> {order.address}</div>
              <div><strong>SĐT:</strong> {order.phone}</div>
              <div><strong>Ghi chú:</strong> {order.note || "—"}</div>
              <div><strong>Phương thức thanh toán:</strong> {order.paymentMethod || "—"}</div>
              <div><strong>Phương thức giao hàng:</strong> {order.shippingMethod || "—"}</div>
            </div>

            {/* Trạng thái */}
            <h6 className="fw-bold mb-2">🔄 Trạng thái đơn</h6>
            {canEditStatus ? (
              <>
                <select
                  className="form-select mb-2"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">-- Chọn trạng thái tiếp theo --</option>
                  {statusOptions.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                {newStatus === "Đã hủy" && (
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Nhập lý do hủy..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                )}
              </>
            ) : (
              <div className="badge bg-primary px-3 py-2">{order.status}</div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
            {canEditStatus && (
              <button className="btn btn-primary" onClick={onSaveStatus}>Cập nhật trạng thái</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
