import React, { useState } from 'react';
import './VoucherCard.css';
import { toast } from 'react-toastify';

const VoucherCard = ({ voucher }) => {
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(voucher.code);
        setCopied(true);
        toast.success(`Đã sao chép mã ${voucher.code}!`, {
            position: "bottom-right",
            autoClose: 2000
        });

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const handleSaveVoucher = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                toast.warning('Vui lòng đăng nhập để lưu voucher!', {
                    position: "bottom-right"
                });
                return;
            }

            // Gọi API lưu voucher
            const response = await fetch('http://127.0.0.1:8000/voucher/save/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    voucher_id: voucher.id
                })
            });

            if (response.ok) {
                setSaved(true);
                toast.success(`Đã lưu voucher ${voucher.code}!`, {
                    position: "bottom-right",
                    autoClose: 2000
                });
            } else {
                const data = await response.json();
                toast.error(data.message || 'Không thể lưu voucher!', {
                    position: "bottom-right"
                });
            }
        } catch (error) {
            console.error('Error saving voucher:', error);
            toast.error('Đã có lỗi xảy ra!', {
                position: "bottom-right"
            });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const isExpiringSoon = () => {
        const endDate = new Date(voucher.end_date || voucher.endDate);
        const today = new Date();
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3 && daysLeft > 0;
    };

    const isExpired = () => {
        const endDate = new Date(voucher.end_date || voucher.endDate);
        return endDate < new Date();
    };

    const getDiscountDisplay = () => {
        const type = voucher.discount_type || voucher.type;
        const value = voucher.discount_value || voucher.value;

        if (type === 'percent' || type === 'percentage') {
            return (
                <div className="discount-display">
                    <span className="discount-label">GIẢM</span>
                    <span className="discount-amount">{value}%</span>
                </div>
            );
        } else {
            return (
                <div className="discount-display">
                    <span className="discount-label">GIẢM</span>
                    <span className="discount-amount">{value.toLocaleString('vi-VN')}₫</span>
                </div>
            );
        }
    };

    const getUsagePercentage = () => {
        const used = voucher.used_count || voucher.used || 0;
        const max = voucher.max_usage || voucher.maxUsage || 100;
        return Math.min((used / max) * 100, 100);
    };

    const getRemainingCount = () => {
        const used = voucher.used_count || voucher.used || 0;
        const max = voucher.max_usage || voucher.maxUsage || 100;
        return Math.max(max - used, 0);
    };

    return (
        <div className={`voucher-card ${isExpired() ? 'expired' : ''}`}>
            {/* Ribbon cho voucher hot hoặc sắp hết hạn */}
            {!isExpired() && isExpiringSoon() && (
                <div className="voucher-ribbon expiring">Sắp hết hạn!</div>
            )}
            {!isExpired() && voucher.is_hot && (
                <div className="voucher-ribbon hot">HOT</div>
            )}
            {isExpired() && (
                <div className="voucher-overlay">
                    <span className="expired-text">Đã hết hạn</span>
                </div>
            )}

            <div className="voucher-card-left">
                {getDiscountDisplay()}
                <div className="voucher-pattern">
                    <div className="pattern-dot"></div>
                    <div className="pattern-dot"></div>
                    <div className="pattern-dot"></div>
                    <div className="pattern-dot"></div>
                    <div className="pattern-dot"></div>
                </div>
            </div>

            <div className="voucher-card-right">
                <div className="voucher-info">
                    <h3 className="voucher-code">{voucher.code}</h3>
                    
                    <div className="voucher-details">
                        <div className="detail-item">
                            <span className="detail-icon">📅</span>
                            <span className="detail-text">
                                HSD: {formatDate(voucher.start_date || voucher.startDate)} - {formatDate(voucher.end_date || voucher.endDate)}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">🎫</span>
                            <span className="detail-text">
                                Còn lại: <strong>{getRemainingCount()}</strong> lượt
                            </span>
                        </div>
                    </div>

                    {/* Progress bar cho số lượng đã dùng */}
                    <div className="voucher-usage">
                        <div className="usage-info">
                            <span className="usage-text">
                                Đã dùng: {voucher.used_count || voucher.used || 0}/{voucher.max_usage || voucher.maxUsage}
                            </span>
                            <span className="usage-percentage">
                                {getUsagePercentage().toFixed(0)}%
                            </span>
                        </div>
                        <div className="usage-bar">
                            <div 
                                className="usage-progress" 
                                style={{ width: `${getUsagePercentage()}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="voucher-actions">
                    <button 
                        className={`save-btn ${saved ? 'saved' : ''}`}
                        onClick={handleSaveVoucher}
                        disabled={isExpired() || saved}
                    >
                        {saved ? 'Đã lưu' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoucherCard;