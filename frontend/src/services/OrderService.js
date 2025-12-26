import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

class OrderService {
    static async createVnpayPayment({ order_id, amount }){
        try {
            const res = await axios.post(`${API_BASE_URL}/payment/create/`, { order_id, amount });
            return res.data;
        } catch (error) {
            console.error(error);
            return { success: false, error: "Lỗi kết nối server" };
        }
    };
    /**
     * Tạo đơn hàng mới
     */
    static async createOrder(orderData) {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                return {
                    success: false,
                    error: 'Vui lòng đăng nhập để tiếp tục'
                };
            }

            console.log('📤 Creating order with data:', orderData);

            const response = await axios.post(
                `${API_BASE_URL}/order/create-order/`,
                orderData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Order created:', response.data);

            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Đặt hàng thành công'
            };

        } catch (error) {
            console.error('Create order error:', error);

            // Xử lý lỗi từ backend
            if (error.response) {
                const errorData = error.response.data;
                const status = error.response.status;

                // Lỗi validation hoặc business logic
                if (status === 400) {
                    return {
                        success: false,
                        error: errorData.error || 'Dữ liệu không hợp lệ'
                    };
                }

                // Lỗi không tìm thấy
                if (status === 404) {
                    return {
                        success: false,
                        error: errorData.error || 'Không tìm thấy sản phẩm'
                    };
                }

                // Lỗi unauthorized
                if (status === 401) {
                    return {
                        success: false,
                        error: 'Phiên đăng nhập đã hết hạn',
                        needLogin: true
                    };
                }

                // Lỗi server
                if (status === 500) {
                    return {
                        success: false,
                        error: 'Lỗi server, vui lòng thử lại sau'
                    };
                }

                return {
                    success: false,
                    error: errorData.error || 'Không thể tạo đơn hàng'
                };
            }

            // Lỗi network
            if (error.request) {
                return {
                    success: false,
                    error: 'Không thể kết nối tới server'
                };
            }

            // Lỗi khác
            return {
                success: false,
                error: 'Đã có lỗi xảy ra'
            };
        }
    }

    static async cancelOrder(orderId, reason = '') {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                return {
                    success: false,
                    error: 'Vui lòng đăng nhập'
                };
            }
            
            console.log(`Cancelling order ID: ${orderId} with reason: ${reason}`);

            const response = await axios.put(
                `${API_BASE_URL}/order/cancel-order/${orderId}/`,
                { reason: reason, ship_status: 'Cancelled' }, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Cancel order response:', response.data);

            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Hủy đơn hàng thành công'
            };

        } catch (error) {
            console.error('Cancel order error:', error);

            // Xử lý lỗi từ backend
            if (error.response) {
                const errorData = error.response.data;
                const status = error.response.status;

                if (status === 404) {
                    return { success: false, error: 'Không tìm thấy đơn hàng' };
                }
                if (status === 401) {
                    return { success: false, error: 'Phiên đăng nhập đã hết hạn', needLogin: true };
                }
                
                return {
                    success: false,
                    error: errorData.error || 'Không thể hủy đơn hàng'
                };
            }
            
            return {
                success: false,
                error: 'Lỗi mạng hoặc lỗi không xác định'
            };
        }
    }

    /**
     * Lấy danh sách đơn hàng của user
     */
    static async getUserOrders() {
        try {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                return {
                    success: false,
                    error: "Vui lòng đăng nhập"
                };
            }

            const response = await axios.get(`${API_BASE_URL}/order/all-orders/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Backend: response.data.data = mảng orders
            const rawOrders = response.data.data;

            return {
                success: true,
                data: rawOrders
            };

        } catch (error) {
            console.error("Get orders error:", error);
            return {
                success: false,
                error: error.response?.data?.error || "Không thể tải đơn hàng"
            };
        }
    }


    /**
     * Lấy chi tiết đơn hàng
     */
    static async getOrderDetail(orderId) {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                return {
                    success: false,
                    error: 'Vui lòng đăng nhập'
                };
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/orders/${orderId}/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('Get order detail error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Không thể tải chi tiết đơn hàng'
            };
        }
    }

    /**
     * Validate order data trước khi gửi
     */
    static validateOrderData(data) {
        const errors = [];

        if (!data.address) {
            errors.push('Vui lòng chọn địa chỉ giao hàng');
        }

        if (!data.items || data.items.length === 0) {
            errors.push('Giỏ hàng trống');
        }

        // Validate items
        if (data.items) {
            data.items.forEach((item, index) => {
                if (!item.product_variant) {
                    errors.push(`Sản phẩm ${index + 1} thiếu thông tin`);
                }
                if (!item.quantity || item.quantity <= 0) {
                    errors.push(`Số lượng sản phẩm ${index + 1} không hợp lệ`);
                }
                if (!item.price || item.price < 0) {
                    errors.push(`Giá sản phẩm ${index + 1} không hợp lệ`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default OrderService;