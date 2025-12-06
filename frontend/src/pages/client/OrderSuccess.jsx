import React from "react";
import { useLocation } from "react-router-dom";
import {
    CheckCircle,
    Package,
    Truck,
    User,
    Phone,
    MapPin,
    CreditCard,
    CalendarDays
} from "lucide-react";

const OrderSuccess = ({ onContinueShopping }) => {
    const location = useLocation();
    const orderDetails = location.state?.orderDetails || {};
    const items = orderDetails.items || [];

    console.log("Order Details:", orderDetails);
    console.log("Purchased Items:", items);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount || 0);
    };

    const isValidOrder = !!orderDetails.orderCode;

    if (!isValidOrder) {
        return (
            <div className="container my-5 text-center">
                <h1 className="text-danger fw-bold">Không tìm thấy đơn hàng</h1>
                <p className="text-muted">
                    Vui lòng kiểm tra lại trong mục <strong>Lịch sử đơn hàng</strong>.
                </p>
                <a href="/shop" className="btn btn-primary mt-3">
                    Quay lại trang mua sắm
                </a>
            </div>
        );
    }

    const order = orderDetails;

    return (
        <div className="container my-5">

            {/* ================= HEADER ================= */}
            <div className="text-center mb-5">
                <CheckCircle size={70} className="text-success mb-3" />
                <h1 className="fw-bold text-success">Đặt hàng thành công!</h1>
                <p className="text-muted fs-5">Mã đơn hàng: #{order.orderCode}</p>
            </div>

            {/* ============== 3 BLOCKS ============== */}
            <div className="row g-4">

                {/* BLOCK 1 - ORDER INFO */}
                <div className="col-lg-4 col-md-6">
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                        <div className="card-body">
                            <h5 className="fw-bold text-primary d-flex align-items-center mb-3">
                                <Package size={20} className="me-2" /> Thông tin Đơn hàng
                            </h5>

                            <ul className="list-unstyled small">
                                <li className="py-2 d-flex justify-content-between">
                                    <span>Mã đơn:</span> <strong>#{order.orderCode}</strong>
                                </li>
                                <li className="py-2 d-flex justify-content-between">
                                    <span>Ngày đặt:</span> {order.orderDate}
                                </li>
                                <li className="py-2 d-flex justify-content-between">
                                    <span>Tạm tính:</span> {formatCurrency(order.subTotal)}
                                </li>
                                <li className="py-2 d-flex justify-content-between">
                                    <span>Phí vận chuyển:</span> {formatCurrency(order.shippingCost)}
                                </li>
                                <li className="py-2 d-flex justify-content-between">
                                    <strong>Tổng thanh toán:</strong>
                                    <span className="text-danger fw-bold">
                                        {formatCurrency(order.finalTotal)}
                                    </span>
                                </li>
                                <li className="py-2 d-flex justify-content-between">
                                    <span className="d-flex align-items-center">
                                        <CreditCard size={16} className="me-1" /> Thanh toán:
                                    </span>
                                    <strong className="text-success">{order.paymentMethod}</strong>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* BLOCK 2 - PRODUCT SUMMARY */}
                <div className="col-lg-4 col-md-6">
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                        <div className="card-body">
                            <h5 className="fw-bold text-primary d-flex align-items-center mb-3">
                                <Package size={20} className="me-2" /> Sản phẩm đã mua
                            </h5>

                            {/* Danh sách sản phẩm */}
                            {items?.map((p, i) => (
                                <div key={i} className="d-flex mb-3">
                                    <img
                                        src={p.product_img || "/placeholder.png"}
                                        alt={p.productName}
                                        width={60}
                                        height={60}
                                        className="rounded border me-3"
                                    />
                                    <div>
                                        <p className="mb-1 fw-bold">{p.productName}</p>
                                        <p className="small text-muted mb-0">
                                            Size: {p.size} – Màu: {p.color}
                                        </p>
                                        <p className="small mb-0">
                                            SL: {p.quantity} × {formatCurrency(p.current_price)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BLOCK 3 - SHIPPING INFO */}
                <div className="col-lg-4 col-md-12">
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                        <div className="card-body">
                            <h5 className="fw-bold text-primary d-flex align-items-center mb-3">
                                <Truck size={20} className="me-2" /> Thông tin Giao hàng
                            </h5>

                            <p>
                                <strong>Trạng thái:</strong>{" "}
                                <span className="badge bg-warning text-dark">
                                    {order.status}
                                </span>
                            </p>

                            <p>
                                <strong>Phương thức:</strong> {order.shippingMethodLabel}
                            </p>

                            <p>
                                <strong>Dự kiến giao:</strong> {order.estimatedDelivery}
                            </p>

                            <p className="d-flex align-items-center">
                                <User size={18} className="me-2 text-primary" />
                                <strong className="me-2">Người nhận:</strong> {order.recipientName}
                            </p>

                            <p className="d-flex align-items-center">
                                <Phone size={18} className="me-2 text-primary" />
                                <strong className="me-2">SĐT:</strong> {order.recipientPhone}
                            </p>

                            <p className="d-flex align-items-start">
                                <MapPin size={18} className="me-2 mt-1 text-primary" />
                                <span><strong>Địa chỉ:</strong> {order.addressDetail}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BUTTON */}
            <div className="text-center mt-5">
                <a
                    href="/shop"
                    className="btn btn-primary btn-lg px-4"
                    onClick={(e) => {
                        if (onContinueShopping) {
                            e.preventDefault();
                            onContinueShopping();
                        }
                    }}
                >
                    Tiếp tục mua sắm
                </a>
            </div>
        </div>
    );
};

export default OrderSuccess;
