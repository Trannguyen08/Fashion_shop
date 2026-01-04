import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VoucherCard.css';
import { toast } from 'react-toastify';
import { formatNumberSmart } from "../utils/formatUtils";
import axios from 'axios';

const VoucherCard = ({ voucher }) => {
    const [saved, setSaved] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const navigate = useNavigate();

    const handleSaveVoucher = async () => {
        try {
            const token = localStorage.getItem('user_accessToken');
            
            if (!token) {
                setShowLoginModal(true);
                return;
            }

            // Gọi API lưu voucher
            const response = await axios.post(
                `http://127.0.0.1:8000/voucher/save/${voucher.id}/`,
                {}, // Body trống vì voucher.id đã có trong URL
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Axios trả về response.data, không cần .ok
            if (response.status === 200 || response.status === 201) {
                setSaved(true);
                toast.success(`Đã lưu voucher ${voucher.code}!`, {
                    position: "bottom-right",
                    autoClose: 2000
                });
            }
        } catch (error) {
            console.error('Error saving voucher:', error);
            
            // Xử lý lỗi từ backend
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.error 
                || 'Không thể lưu voucher!';
            
            toast.error(errorMessage, {
                position: "bottom-right",
                autoClose: 3000
            });
        }
    };

    const handleGoToLogin = () => {
        setShowLoginModal(false);
        navigate('/login', { state: { from: window.location.pathname } });
    };

    const handleCloseModal = () => {
        setShowLoginModal(false);
    };

    const formatCurrency = (amount) => {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'tr';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'k';
        }
        return amount.toString();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    const isExpired = () => {
        const endDate = new Date(voucher.end_date);
        return endDate < new Date();
    };

    const getRemainingCount = () => {
        const used = voucher.used_count;
        const max = voucher.quantity;
        return Math.max(max - used, 0);
    };

    return (
        <>
            <div className={`voucher-card-compact ${isExpired() ? 'expired' : ''}`}>
                {/* Header với giá trị giảm */}
                <div className="voucher-header-compact">
                    <div className="discount-value-compact">
                        Giảm: {formatNumberSmart(voucher.discount_value)}
                        {voucher.discount_type === 'percent' || voucher.discount_type === 'percentage' ? '%' : '₫'}
                    </div>
                </div>

                {/* Mã voucher */}
                <div className="voucher-code-compact">
                    <div className="code-text">{voucher.code}</div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="voucher-details-compact">
                    <div className="detail-row-compact">
                        <span className="detail-label">Đơn tối thiểu</span>
                        <span className="detail-value">{formatCurrency(voucher.min_order_amount)}₫</span>
                    </div>
                    <div className="detail-row-compact">
                        <span className="detail-label">HSD</span>
                        <span className="detail-value">{formatDate(voucher.end_date)}</span>
                    </div>
                    <div className="detail-row-compact">
                        <span className="detail-label">Còn lại</span>
                        <span className="detail-value highlight">{getRemainingCount()}</span>
                    </div>
                </div>

                {/* Button lưu */}
                <button 
                    className={`save-btn-compact ${saved ? 'saved' : ''}`}
                    onClick={handleSaveVoucher}
                    disabled={isExpired() || saved}
                >
                    {saved ? '✓ Đã lưu' : '💾 Lưu'}
                </button>
            </div>

            {/* Login Required Modal */}
            {showLoginModal && (
                <div className="login-modal-overlay" onClick={handleCloseModal}>
                    <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={handleCloseModal}>
                            ✕
                        </button>
                        
                        <h3 className="modal-title">Yêu cầu đăng nhập</h3>
                        
                        <p className="modal-message">
                            Bạn cần đăng nhập để lưu voucher này vào tài khoản của mình.
                        </p>

                        <div className="modal-actions">
                            <button 
                                className="modal-btn-secondary" 
                                onClick={handleCloseModal}
                            >
                                Để sau
                            </button>
                            <button 
                                className="modal-btn-primary" 
                                onClick={handleGoToLogin}
                            >
                                Đăng nhập
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VoucherCard;