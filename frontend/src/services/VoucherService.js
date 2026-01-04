import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

class VoucherService {
    /**
     * Lấy danh sách voucher khả dụng cho user
     */
    static async getAvailableVouchers() {
        try {
            const token = localStorage.getItem('user_accessToken');
            
            if (!token) {
                return {
                    success: false,
                    error: 'Vui lòng đăng nhập để xem voucher',
                    needLogin: true
                };
            }

            const response = await axios.get(`${API_URL}/voucher/get-user-voucher/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                error: 'Không thể tải danh sách voucher'
            };

        } catch (error) {
            console.error('Error fetching vouchers:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'Phiên đăng nhập hết hạn',
                    needLogin: true
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tải voucher'
            };
        }
    }

    /**
     * Validate voucher có thể áp dụng cho đơn hàng không
     */
    static validateVoucher(voucher, orderTotal, items) {
        const errors = [];

        // Kiểm tra voucher còn hiệu lực
        if (voucher.is_active !== true) {
            errors.push('Voucher đã bị vô hiệu hóa');
        }

        // Kiểm tra thời hạn
        const now = new Date();
        const startDate = new Date(voucher.start_date);
        const endDate = new Date(voucher.end_date);

        if (now < startDate) {
            errors.push('Voucher chưa có hiệu lực');
        }

        if (now > endDate) {
            errors.push('Voucher đã hết hạn');
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        const minOrder = voucher.min_order_amount;
        if (orderTotal < minOrder) {
            errors.push(`Đơn hàng tối thiểu ${this.formatCurrency(minOrder)}`);
        }

        // Kiểm tra số lượng đã sử dụng
        const maxUsage = voucher.quantity;
        const usedCount = voucher.used_count;
        
        if (usedCount >= maxUsage) {
            errors.push('Voucher đã hết lượt sử dụng');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Tính toán số tiền được giảm giá
     */
    static calculateDiscount(voucher, orderTotal) {
        if (!voucher) return 0;

        const discountType = voucher.discount_type || voucher.type;
        const discountValue = voucher.discount_value || voucher.value;

        if (discountType === 'percent' || discountType === 'percentage') {
            // Giảm theo phần trăm
            const discount = (orderTotal * discountValue) / 100;
            
            // Kiểm tra giảm tối đa (nếu có)
            const maxDiscount = voucher.max_discount_amount || voucher.maxDiscountAmount;
            if (maxDiscount && discount > maxDiscount) {
                return maxDiscount;
            }
            
            return Math.floor(discount);
        } else if (discountType === 'fixed' || discountType === 'amount') {
            // Giảm số tiền cố định
            return Math.min(discountValue, orderTotal);
        }

        return 0;
    }


    /**
     * Format currency
     */
    static formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    /**
     * Format date
     */
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

export default VoucherService;