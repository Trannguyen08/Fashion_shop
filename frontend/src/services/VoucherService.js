import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

class VoucherService {
    /**
     * Lấy danh sách voucher khả dụng cho user
     */
    static async getAvailableVouchers() {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                return {
                    success: false,
                    error: 'Vui lòng đăng nhập để xem voucher',
                    needLogin: true
                };
            }

            const response = await axios.get(`${API_URL}/voucher/get-voucher-active/`, {
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
        if (voucher.status !== 'active') {
            errors.push('Voucher đã bị vô hiệu hóa');
        }

        // Kiểm tra thời hạn
        const now = new Date();
        const startDate = new Date(voucher.start_date || voucher.startDate);
        const endDate = new Date(voucher.end_date || voucher.endDate);

        if (now < startDate) {
            errors.push('Voucher chưa có hiệu lực');
        }

        if (now > endDate) {
            errors.push('Voucher đã hết hạn');
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        const minOrder = voucher.min_order_value || voucher.minOrder || 0;
        if (orderTotal < minOrder) {
            errors.push(`Đơn hàng tối thiểu ${this.formatCurrency(minOrder)}`);
        }

        // Kiểm tra số lượng đã sử dụng
        const maxUsage = voucher.max_usage || voucher.maxUsage || 0;
        const usedCount = voucher.used_count || voucher.used || 0;
        
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
     * Transform voucher data từ backend
     */
    static transformVoucherFromBackend(voucherData) {
        return {
            id: voucherData.id || voucherData.voucher_id,
            code: voucherData.code || voucherData.voucher_code,
            type: voucherData.discount_type || voucherData.type,
            value: voucherData.discount_value || voucherData.value,
            minOrder: voucherData.min_order_value || voucherData.minOrder || 0,
            maxUsage: voucherData.max_usage || voucherData.maxUsage,
            used: voucherData.used_count || voucherData.used || 0,
            startDate: voucherData.start_date || voucherData.startDate,
            endDate: voucherData.end_date || voucherData.endDate,
            status: voucherData.status || 'active',
            description: voucherData.description || '',
            maxDiscountAmount: voucherData.max_discount_amount || voucherData.maxDiscountAmount,
            // Raw data để gửi lên server
            rawData: voucherData
        };
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