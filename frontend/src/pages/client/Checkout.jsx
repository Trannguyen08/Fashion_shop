import React, { useState, useEffect } from 'react';
import './Checkout.css';
import AddressService from '../../services/AddressService';
import CartSummary from '../../components/CartItem/CartSummary'; 

const PROVINCES = {
    "HN": { name: "Hà Nội", districts: ["Ba Đình", "Hoàn Kiếm", "Tây Hồ"] },
    "HCM": { name: "TP. Hồ Chí Minh", districts: ["Quận 1", "Quận 2", "Quận 3"] },
    "DN": { name: "Đà Nẵng", districts: ["Hải Châu", "Thanh Khê", "Sơn Trà"] },
    "CT": { name: "Cần Thơ", districts: ["Ninh Kiều", "Bình Thủy", "Cờ Đỏ"] },
    "HP": { name: "Hải Phòng", districts: ["Hồng Bàng", "Ngô Quyền", "Lê Chân"] }
};

const Checkout = ({ cartItems = [], totalAmount = 0, onBack = () => {}, onCheckoutSuccess = () => {} }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        shippingMethod: 'standard',
        paymentMethod: 'cod',
        notes: '',
    });

    const [isProcessing, setIsProcessing] = useState(false); 
    const [errors, setErrors] = useState({});

    // Cần tính lại chi phí và tổng tiền dựa trên shippingMethod đã chọn
    const shippingCost = formData.shippingMethod === 'express' ? 30000 : 15000;
    const finalTotal = totalAmount + shippingCost;

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
        
        if (!validateForm()) return;
        
        setIsProcessing(true);
        const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

        // 1. Chuẩn bị dữ liệu đặt hàng
        const orderData = {
            items: cartItems.map(item => ({
                product_id: item.product_id,
                variant_id: item.product_variant_id,
                quantity: item.quantity,
                price: item.current_price,
            })),
            shippingAddress: selectedAddress,
            shippingMethod: formData.shippingMethod,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes,
            total: finalTotal,
        };

        try {
            // const response = await OrderService.placeOrder(orderData); // Gọi API thật
            
            // Mô phỏng thành công
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            console.log('Order Data Sent Successfully:', orderData);

            onCheckoutSuccess(); 

        } catch (error) {
            console.error('Error placing order:', error);
            alert('Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="checkout-container">
            <div className="checkout-main">
                <div className="checkout-form-section">
                    <form onSubmit={handleSubmit} className="checkout-form">
                        
                        {/* Địa chỉ giao hàng (GIỮ NGUYÊN) */}
                        <div className="form-section">
                            <h2 className="section-title">Địa chỉ giao hàng</h2>
                            {loading ? (
                                <p className="loading-text">Đang tải địa chỉ...</p>
                            ) : addresses.length > 0 ? (
                                <div className="address-selection">
                                    {addresses.map((address) => (
                                        <label key={address.id} className={`address-option ${selectedAddressId === address.id ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="selectedAddress"
                                                value={address.id}
                                                checked={selectedAddressId === address.id}
                                                onChange={() => setSelectedAddressId(address.id)}
                                            />
                                            <div className="address-content">
                                                <div className="address-header-row">
                                                    <strong className="address-name">Tên người nhận: {address.recipientName}</strong>
                                                    {address.isDefault && <span className="default-badge">Mặc định</span>}
                                                </div>
                                                <p className="address-phone">Số điện thoại: {address.recipientPhone}</p>
                                                <p className="address-detail">
                                                    <span>Địa chỉ: </span> 
                                                    {address.address && `${address.address}, `}
                                                    {address.district}, {PROVINCES[address.province]?.name}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-address">
                                    <p>Bạn chưa có địa chỉ giao hàng nào.</p>
                                    <p>Vui lòng thêm địa chỉ trong trang hồ sơ của bạn.</p>
                                </div>
                            )}
                            {errors.address && <span className="error-text">{errors.address}</span>}
                        </div>

                        {/* Phương thức vận chuyển (GIỮ NGUYÊN) */}
                        <div className="form-section">
                            <h2 className="section-title">Phương thức vận chuyển</h2>
                            <div className="shipping-options">
                                <label className="radio-option">
                                    <input type="radio" name="shippingMethod" value="standard"
                                        checked={formData.shippingMethod === 'standard'} onChange={handleInputChange} />
                                    <div className="radio-content">
                                        <span className="radio-label">Giao hàng tiêu chuẩn</span>
                                        <span className="radio-description">3-5 ngày làm việc</span>
                                    </div>
                                    <span className="radio-price">15.000₫</span>
                                </label>
                                <label className="radio-option">
                                    <input type="radio" name="shippingMethod" value="express"
                                        checked={formData.shippingMethod === 'express'} onChange={handleInputChange} />
                                    <div className="radio-content">
                                        <span className="radio-label">Giao hàng nhanh</span>
                                        <span className="radio-description">1-2 ngày làm việc</span>
                                    </div>
                                    <span className="radio-price">30.000₫</span>
                                </label>
                            </div>
                        </div>

                        {/* Phương thức thanh toán (GIỮ NGUYÊN) */}
                        <div className="form-section">
                            <h2 className="section-title">Phương thức thanh toán</h2>
                            <div className="payment-options">
                                <label className="radio-option">
                                    <input type="radio" name="paymentMethod" value="cod"
                                        checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} />
                                    <div className="radio-content">
                                        <span className="radio-label">Thanh toán khi nhận hàng (COD)</span>
                                        <span className="radio-description">Thanh toán tiền mặt cho shipper</span>
                                    </div>
                                </label>
                                <label className="radio-option">
                                    <input type="radio" name="paymentMethod" value="bank"
                                        checked={formData.paymentMethod === 'bank'} onChange={handleInputChange} />
                                    <div className="radio-content">
                                        <span className="radio-label">Chuyển khoản ngân hàng</span>
                                        <span className="radio-description">Chuyển khoản qua tài khoản ngân hàng</span>
                                    </div>
                                </label>
                                <label className="radio-option">
                                    <input type="radio" name="paymentMethod" value="wallet"
                                        checked={formData.paymentMethod === 'wallet'} onChange={handleInputChange} />
                                    <div className="radio-content">
                                        <span className="radio-label">Ví điện tử</span>
                                        <span className="radio-description">Thanh toán qua Momo, ZaloPay, v.v.</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Ghi chú (GIỮ NGUYÊN) */}
                        <div className="form-section">
                            <h2 className="section-title">Ghi chú đơn hàng</h2>
                            <textarea name="notes" value={formData.notes} onChange={handleInputChange}
                                placeholder="Ghi chú thêm về đơn hàng của bạn (tùy chọn)"
                                className="form-textarea" rows="4" />
                        </div>

                        <button 
                            type="submit" 
                            onClick={handleSubmit} 
                            className="btn-submit"
                            disabled={isProcessing || loading || cartItems.length === 0}
                        >
                            {isProcessing ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
                        </button>
                    </form>
                </div>

                <div className="checkout-summary-section">
                    <CartSummary
                        items={cartItems}         
                        totalAmount={totalAmount} 
                        itemCount={cartItems.length}
                        isCheckout={true}         
                    />
                </div>
            </div>
        </div>
    );
};

export default Checkout;