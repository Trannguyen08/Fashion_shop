import React, { useState, useEffect } from 'react';
import './Checkout.css';
import AddressService from '../../services/AddressService';
import OrderService from '../../services/OrderService';
import CartSummary from '../../components/CartItem/CartSummary'; 
import { useNavigate } from 'react-router-dom'; 
import { toast } from "react-toastify";

const Checkout = ({ cartItems = [], totalAmount = 0, onBack = () => {} }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 
    
    const [formData, setFormData] = useState({
        shippingMethod: 'standard',
        paymentMethod: 'cod',
        notes: '',
    });

    const [isProcessing, setIsProcessing] = useState(false); 
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        setLoading(true);
        const result = await AddressService.getAllAddresses(); 
        
        if (result.success) {
            const transformedAddresses = result.data.map(addr => 
                AddressService.transformAddressFromBackend(addr)
            );
            setAddresses(transformedAddresses);
            
            const defaultAddr = transformedAddresses.find(addr => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            } else if (transformedAddresses.length > 0) {
                setSelectedAddressId(transformedAddresses[0].id);
            }
        }
        setLoading(false);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!selectedAddressId) {
            newErrors.address = 'Vui lòng chọn địa chỉ giao hàng';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation cơ bản
        if (!validateForm()) {
            toast.warning("Vui lòng chọn địa chỉ giao hàng!", {
                position: "bottom-right"
            });
            return;
        }

        if (cartItems.length === 0) {
            toast.warning("Giỏ hàng của bạn đang trống!", {
                position: "bottom-right"
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Lấy userId
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?.id || user?.account_id;

            if (!userId) {
                toast.error("Vui lòng đăng nhập để tiếp tục!", {
                    position: "bottom-right"
                });
                navigate('/login');
                return;
            }

            // Chuẩn bị data cho OrderService
            const orderPayload = {
                address: selectedAddressId,
                ship_method: formData.shippingMethod,
                payment_method: formData.paymentMethod,
                note: formData.notes || "   ",
                items: cartItems.map(item => ({
                    product_variant: item.product_variant_id,
                    quantity: item.quantity,
                    price: item.price || item.current_price
                }))
            };
            console.log('📝 Order payload:', orderPayload);

            // Validate data
            const validation = OrderService.validateOrderData(orderPayload);
            if (!validation.isValid) {
                toast.error(validation.errors[0], {
                    position: "bottom-right"
                });
                setIsProcessing(false);
                return;
            }

            // Gọi API tạo đơn hàng
            const result = await OrderService.createOrder(orderPayload);

            if (result.success) {
                toast.success(result.message || "Đặt hàng thành công!", {
                    position: "bottom-right",
                    autoClose: 2000
                });

                localStorage.removeItem('cart');

                const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
                const shippingFee = formData.shippingMethod === 'express' ? 30000 : 15000;
                const getEstimatedDeliveryDate = (method) => {
                    const days = method === 'express' ? 2 : 5;
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    return date.toLocaleDateString('vi-VN'); 
                };

                const calculatedSubTotal = cartItems.reduce((sum, item) => 
                    sum + item.quantity * (item.price || item.current_price), 0
                );

                navigate('/order-success', {
                    state: { 
                        orderDetails: {
                            orderId: result.data.order_id,
                            message: result.data.message,
                            subTotal: calculatedSubTotal, 
                            shippingFee: shippingFee,
                            items: cartItems,
                            status: 'Chờ xác nhận',
                            paymentMethod: formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng',
                            shippingMethod: formData.shippingMethod === 'express' ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn',
                            notes: formData.notes,

                            // SỬA ĐỔI 2: Thêm các trường bị thiếu/sai tên
                            recipientName: selectedAddress.recipientName,
                            recipientPhone: selectedAddress.recipientPhone,
                            // SỬA ĐỔI 3: Gửi đi chuỗi địa chỉ đầy đủ
                            addressFullText: `${selectedAddress.address}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`,
                            orderDate: new Date().toLocaleDateString('vi-VN'), // Thêm ngày đặt hàng
                            estimatedDelivery: getEstimatedDeliveryDate(formData.shippingMethod) // Thêm ngày dự kiến
                        }
                    }
                });

            } else {
                // Thất bại
                toast.error(result.error || "Không thể tạo đơn hàng!", {
                    position: "bottom-right",
                    autoClose: 5000
                });

                // Nếu cần login lại
                if (result.needLogin) {
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                }
            }

        } catch (error) {
            console.error("Unexpected error:", error);
            toast.error("Đã có lỗi xảy ra!", {
                position: "bottom-right"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Tính shipping fee
    const getShippingFee = () => {
        return formData.shippingMethod === 'express' ? 30000 : 15000;
    };

    return (
        <div className="checkout-container">
            <div className="checkout-main">
                <div className="checkout-form-section">
                    <form onSubmit={handleSubmit} className="checkout-form">
                        
                        {/* Địa chỉ giao hàng */}
                        <div className="form-section">
                            <h2 className="section-title">Địa chỉ giao hàng</h2>
                            {loading ? (
                                <p className="loading-text">Đang tải địa chỉ...</p>
                            ) : addresses.length > 0 ? (
                                <div className="address-selection">
                                    {addresses.map((address) => (
                                        <label 
                                            key={address.id} 
                                            className={`address-option ${selectedAddressId === address.id ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="selectedAddress"
                                                value={address.id}
                                                checked={selectedAddressId === address.id}
                                                onChange={() => setSelectedAddressId(address.id)}
                                            />
                                            <div className="address-content">
                                                <div className="address-header-row">
                                                    <strong className="address-name">
                                                        {address.recipientName}
                                                    </strong>
                                                    {address.isDefault && (
                                                        <span className="default-badge">Mặc định</span>
                                                    )}
                                                </div>
                                                <p className="address-phone">
                                                    {address.recipientPhone}
                                                </p>
                                                <p className="address-detail">
                                                    {address.address && `${address.address}, `}
                                                    {address.ward && `${address.ward}, `}
                                                    {address.district}, {address.province}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-address">
                                    <p>Bạn chưa có địa chỉ giao hàng nào.</p>
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/profile')}
                                        className="btn-add-address"
                                    >
                                        Thêm địa chỉ
                                    </button>
                                </div>
                            )}
                            {errors.address && (
                                <span className="error-text">{errors.address}</span>
                            )}
                        </div>

                        {/* Phương thức vận chuyển */}
                        <div className="form-section">
                            <h2 className="section-title">Phương thức vận chuyển</h2>
                            <div className="shipping-options">
                                <label className="radio-option">
                                    <input 
                                        type="radio" 
                                        name="shippingMethod" 
                                        value="standard"
                                        checked={formData.shippingMethod === 'standard'} 
                                        onChange={handleInputChange} 
                                    />
                                    <div className="radio-content">
                                        <span className="radio-label">Giao hàng tiêu chuẩn</span>
                                        <span className="radio-description">3-5 ngày làm việc</span>
                                    </div>
                                    <span className="radio-price">15.000₫</span>
                                </label>
                                <label className="radio-option">
                                    <input 
                                        type="radio" 
                                        name="shippingMethod" 
                                        value="express"
                                        checked={formData.shippingMethod === 'express'} 
                                        onChange={handleInputChange} 
                                    />
                                    <div className="radio-content">
                                        <span className="radio-label">Giao hàng nhanh</span>
                                        <span className="radio-description">1-2 ngày làm việc</span>
                                    </div>
                                    <span className="radio-price">30.000₫</span>
                                </label>
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="form-section">
                            <h2 className="section-title">Phương thức thanh toán</h2>
                            <div className="payment-options">
                                <label className="radio-option">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'} 
                                        onChange={handleInputChange} 
                                    />
                                    <div className="radio-content">
                                        <span className="radio-label">
                                            Thanh toán khi nhận hàng (COD)
                                        </span>
                                        <span className="radio-description">
                                            Thanh toán tiền mặt cho shipper
                                        </span>
                                    </div>
                                </label>
                                <label className="radio-option">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="bank"
                                        checked={formData.paymentMethod === 'bank'} 
                                        onChange={handleInputChange} 
                                    />
                                    <div className="radio-content">
                                        <span className="radio-label">Chuyển khoản ngân hàng</span>
                                        <span className="radio-description">
                                            Chuyển khoản qua tài khoản ngân hàng
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="form-section">
                            <h2 className="section-title">Ghi chú đơn hàng</h2>
                            <textarea 
                                name="notes" 
                                value={formData.notes} 
                                onChange={handleInputChange}
                                placeholder="Ghi chú thêm về đơn hàng của bạn (tùy chọn)"
                                className="form-textarea" 
                                rows="4" 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={isProcessing || loading || cartItems.length === 0 || !selectedAddressId}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner"></span>
                                    Đang xử lý...
                                </>
                            ) : (
                                'Xác nhận đặt hàng'
                            )}
                        </button>
                    </form>
                </div>

                <div className="checkout-summary-section">
                    <CartSummary
                        items={cartItems}         
                        totalAmount={totalAmount} 
                        itemCount={cartItems.length}
                        isCheckout={true}
                        shippingFee={getShippingFee()}
                    />
                </div>
            </div>
        </div>
    );
};

export default Checkout;