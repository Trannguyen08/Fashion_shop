import React, { useState } from "react";
import { FaBox, FaTrashAlt, FaSearch, FaStar } from "react-icons/fa";
import { formatPrice } from "../../utils/formatUtils";
import OrderService from "../../services/OrderService";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; 
import "./OrderHistory.css";
import RatingModal from "./RatingModal";
import axios from "axios";

const MySwal = withReactContent(Swal); 

const OrderHistory = ({ orders, setOrders }) => {
    const [activeFilter, setActiveFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 2;

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const handleOpenRatingModal = (orderId) => {
        setSelectedOrderId(orderId);
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
        setSelectedOrderId(null);
    };

    const handleRatingSubmit = async ({ orderId, rating, comment }) => {
        const dataToSend = {
            order_id: orderId,
            rating: rating,
            comment: comment
        };

        const token = localStorage.getItem('user_accessToken');

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/review/add-review/', 
                dataToSend, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );
            
            if (response.status === 200) {
                if (setOrders) {
                    const updatedOrders = orders.map(order => 
                        order.id === orderId 
                            ? { ...order, is_reviewed: true } 
                            : order
                    );
                    setOrders(updatedOrders);
                }
                
                // 2. Đóng modal
                handleCloseRatingModal();
                toast.success(`🎉 Đã gửi đánh giá ${rating} sao thành công!`);
            } else {
                toast.error("Gửi đánh giá thành công nhưng không nhận được phản hồi chuẩn.");
            }
            
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            toast.error("Gửi đánh giá thất bại. Vui lòng thử lại sau.");
        }
    };

    const handleCancelOrder = async (orderId) => {
        const result = await OrderService.cancelOrder(orderId);
        
        if (result.success) {
            toast.success("Hủy đơn hàng thành công!");

            if (setOrders) {
                const updatedOrders = orders.map(order => 
                    order.id === orderId 
                        ? { ...order, is_rating: true } 
                        : order
                );
                
                setOrders(updatedOrders);
            } else {
                window.location.reload();
            }
            
        } else {
            toast.error("Hủy đơn hàng thất bại: " + (result.error || "Lỗi không xác định"));
        }
    }

    const handleCancelConfirmation = (orderId) => {
        MySwal.fire({
            title: <p style={{ color: '#d33' }}>Xác nhận hủy đơn hàng</p>,
            html: (
                <div>
                    <p>Bạn có chắc chắn muốn hủy đơn hàng <strong>#{orderId}</strong> không?</p>
                    <p>Thao tác này sẽ **không thể hoàn tác**.</p>
                </div>
            ),
            icon: 'warning', 
            showCancelButton: true,
            confirmButtonColor: '#d33', 
            cancelButtonColor: '#3085d6', 
            confirmButtonText: 'Đồng ý, Hủy đơn!',
            cancelButtonText: 'Không, Quay lại',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                handleCancelOrder(orderId);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
        });
    }

    const getShipStatusText = (status) => {
        switch (status) {
            case "Pending": return "Chờ xác nhận";
            case "Processing": return "Đang xử lý";
            case "Delivering": return "Đang giao";
            case "Delivered": return "Đã giao";
            case "Cancelled": return "Đã hủy";
            default: return "Không xác định";
        }
    }
    
    const getPaymentStatusText = (status) => {
        switch (status) {
            case "Paid": return "Đã thanh toán";
            case "Pending": return "Chưa thanh toán";
            default: return "Không xác định";
        }
    }

    // Lọc đơn hàng theo trạng thái
    const filteredOrders = activeFilter === "All" 
        ? orders 
        : orders.filter(order => order.ship_status === activeFilter);

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    // Reset về trang 1 khi đổi filter
    const handleFilterChange = (filterKey) => {
        setActiveFilter(filterKey);
        setCurrentPage(1);
    };

    // Chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const statusFilters = [
        { key: "All", label: "Tất cả", count: orders.length },
        { key: "Pending", label: "Chờ xác nhận", count: orders.filter(o => o.ship_status === "Pending").length },
        { key: "Processing", label: "Đã xác nhận", count: orders.filter(o => o.ship_status === "Processing").length },
        { key: "Delivering", label: "Đang giao", count: orders.filter(o => o.ship_status === "Delivering").length },
        { key: "Delivered", label: "Đã giao", count: orders.filter(o => o.ship_status === "Delivered").length },
        { key: "Cancelled", label: "Đã hủy", count: orders.filter(o => o.ship_status === "Cancelled").length }
    ];

    return (
        <div className="tab-content">
            <h2>Lịch sử đơn hàng</h2>

            {/* THANH LỌC TRẠNG THÁI */}
            <div className="status-filter-bar">
                {statusFilters.map(filter => (
                    <button
                        key={filter.key}
                        className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                        onClick={() => handleFilterChange(filter.key)}
                    >
                        {filter.label}
                        <span className="filter-count">({filter.count})</span>
                    </button>
                ))}
            </div>

            {currentOrders.length > 0 ? (
                <div className="orders-list">
                    {currentOrders.map((order) => (
                        <div key={order.id} className="order-card">
                            {/* HEADER */}
                            <div className="order-header-new">
                                <div className="od-hd-content">
                                    <p className="od-id">Mã đơn: #{order.id}</p>
                                    <p className="od-date">
                                        Ngày đặt: {new Date(order.order_date).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>

                                <div className="status-wrap">
                                    <span className={`status-badge-new ship-${order.ship_status}`}>
                                        {getShipStatusText(order.ship_status)}
                                    </span>
                                    <span> | </span>
                                    <span className={`status-badge-new pay-${order.payment_status}`}>
                                        {getPaymentStatusText(order.payment_status)}
                                    </span>
                                </div>
                            </div>

                            {/* ITEMS */}
                            <div className="order-items-new">
                                {order.items?.map((item, idx) => (
                                    <div className="order-item-row" key={idx}>
                                        <img src={item.image_url} alt={item.product_name} className="od-item-img" />

                                        <div className="od-item-info">
                                            <p className="od-item-name">{item.product_name}</p>
                                            <p className="od-item-variant">({item.color || ""} + {item.size || ""})</p>
                                            <p className="od-item-qty">Số lượng: {item.quantity} | <span className="od-item-price">Đơn giá: {formatPrice(item.price)}</span></p>
                                        </div>

                                        <p className="od-item-total">Tổng tiền: 
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* FOOTER (ACTIONS) */}
                            <div className="order-footer-new">
                                <div className="footer-right">
                                    {/* Hủy đơn nếu ship_status = pending hoặc processing */}
                                    {(order.ship_status === "Pending" || order.ship_status === "Processing") && (
                                        <button
                                            className="od-btn od-btn-cancel"
                                            onClick={() => handleCancelConfirmation(order.id)} 
                                        >
                                            <FaTrashAlt /> Hủy đơn
                                        </button>
                                    )}

                                    {/* Đánh giá nếu đã giao */}
                                    {(order.ship_status === "Delivered" && !order.is_rating) && (
                                        <button
                                            className="od-btn od-btn-rate"
                                            onClick={() => handleOpenRatingModal(order.id)} // SỬ DỤNG HÀM MỚI
                                        >
                                            <FaStar /> Đánh giá
                                        </button>
                                    )}

                                    {/* Xem chi tiết: luôn luôn có */}
                                    <button
                                        className="od-btn od-btn-detail"
                                        onClick={() => console.log("Chi tiết đơn", order.id)}
                                    >
                                        <FaSearch /> Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <FaBox size={48} />
                    <p>Bạn chưa có đơn hàng nào</p>
                </div>
            )}

            {/* PHÂN TRANG */}
            {filteredOrders.length > ordersPerPage && (
                <div className="pagination">
                    <button 
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        « Trước
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button 
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Sau »
                    </button>
                </div>
            )}

            <RatingModal
                show={showRatingModal}
                handleClose={handleCloseRatingModal}
                orderId={selectedOrderId}
                onSubmit={handleRatingSubmit}
            />
        </div>
    );
};

export default OrderHistory;