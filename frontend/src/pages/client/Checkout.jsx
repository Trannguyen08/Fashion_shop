import React, { useState, useEffect } from 'react';
import './Checkout.css';
import AddressService from '../../services/AddressService';
import OrderService from '../../services/OrderService';
import VoucherService from '../../services/VoucherService';
import CartSummary from '../../components/CartItem/CartSummary'; 
import { useNavigate } from 'react-router-dom'; 
import { toast } from "react-toastify";

const Checkout = ({ cartItems = [], totalAmount = 0, onBack = () => {} }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 
    
    // Voucher states
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [vouchersLoading, setVouchersLoading] = useState(false);
    const [showVoucherList, setShowVoucherList] = useState(false);
    
    const [formData, setFormData] = useState({
        shippingMethod: 'standard',
        paymentMethod: 'cod',
        notes: '',
    });

    const [isProcessing, setIsProcessing] = useState(false); 
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadAddresses();
        loadVouchers();
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
            const addressToSelect = defaultAddr || transformedAddresses[0];
            
            if (addressToSelect) {
                setSelectedAddressId(addressToSelect.id);
                setSelectedAddress(addressToSelect);
            }
        }
        setLoading(false);
    };

    const loadVouchers = async () => {
        setVouchersLoading(true);
        const result = await VoucherService.getAvailableVouchers();
        
        if (result.success) {
            const transformedVouchers = result.data.map(v => 
                VoucherService.transformVoucherFromBackend(v)
            );
            setVouchers(transformedVouchers);
        } else if (result.needLogin) {
            // Không hiển thị lỗi nếu chưa login, chỉ ẩn phần voucher
            setVouchers([]);
        }
        setVouchersLoading(false);
    };

    const handleAddressChange = (e) => {
        const addressId = parseInt(e.target.value);
        const address = addresses.find(addr => addr.id === addressId);
        
        setSelectedAddressId(addressId);
        setSelectedAddress(address);
    };

    const handleVoucherSelect = (voucher) => {
        // Validate voucher
        const orderSubTotal = cartItems.reduce((sum, item) => 
            sum + item.quantity * (item.price || item.current_price), 0
        );
        
        const validation = VoucherService.validateVoucher(voucher, orderSubTotal, cartItems);
        
        if (!validation.isValid) {
            toast.warning(validation.errors[0], {
                position: "bottom-right"
            });
            return;
        }

        setSelectedVoucher(voucher);
        setShowVoucherList(false);
        toast.success(`Áp dụng voucher ${voucher.code} thành công!`, {
            position: "bottom-right",
            autoClose: 2000
        });
    };

    const handleRemoveVoucher = () => {
        setSelectedVoucher(null);
        toast.info("Đã bỏ áp dụng voucher", {
            position: "bottom-right",
            autoClose: 2000
        });
    };

    const calculateTotals = () => {
        const subTotal = cartItems.reduce((sum, item) => 
            sum + item.quantity * (item.price || item.current_price), 0
        );
        
        const shippingFee = formData.shippingMethod === 'express' ? 30000 : 15000;
        
        const discount = selectedVoucher 
            ? VoucherService.calculateDiscount(selectedVoucher, subTotal)
            : 0;
        
        const total = subTotal + shippingFee - discount;
        
        return {
            subTotal,
            shippingFee,
            discount,
            total: Math.max(0, total)
        };
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

        if (!validateForm()) {
            toast.warning("Vui lòng chọn địa chỉ giao hàng!", { position: "bottom-right" });
            return;
        }

        if (cartItems.length === 0) {
            toast.warning("Giỏ hàng của bạn đang trống!", { position: "bottom-right" });
            return;
        }

        setIsProcessing(true);

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?.id || user?.account_id;

            if (!userId) {
                toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "bottom-right" });
                navigate('/login');
                return;
            }

            const totals = calculateTotals();

            const orderPayload = {
                address: selectedAddressId,
                ship_method: formData.shippingMethod,
                payment_method: formData.paymentMethod,
                note: formData.notes || "   ",
                voucher_id: selectedVoucher?.id || null,
                items: cartItems.map(item => ({
                    product_variant: item.product_variant_id,
                    quantity: item.quantity,
                    price: item.price || item.current_price
                }))
            };

            const validation = OrderService.validateOrderData(orderPayload);
            if (!validation.isValid) {
                toast.error(validation.errors[0], { position: "bottom-right" });
                setIsProcessing(false);
                return;
            }

            // Tạo order trên backend
            const result = await OrderService.createOrder(orderPayload);

            if (result.success) {
                // Nếu thanh toán bằng VNPAY
                if (formData.paymentMethod === 'bank') {
                    const paymentResult = await OrderService.createVnpayPayment({
                        order_id: result.data.order_id,
                        amount: totals.total
                    });

                    if (paymentResult.success && paymentResult.payment_url) {
                        // Redirect sang VNPAY
                        window.location.href = paymentResult.payment_url;
                        return;
                    } else {
                        toast.error(paymentResult.error || "Không thể tạo payment VNPAY", { position: "bottom-right" });
                        setIsProcessing(false);
                        return;
                    }
                }

                // Nếu thanh toán COD, đi thẳng trang success
                localStorage.removeItem('cart');

                const getEstimatedDeliveryDate = (method) => {
                    const days = method === 'express' ? 2 : 5;
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    return date.toLocaleDateString('vi-VN'); 
                };

                navigate('/order-success', {
                    state: { 
                        orderDetails: {
                            orderId: result.data.order_id,
                            message: result.data.message,
                            subTotal: totals.subTotal,
                            shippingFee: totals.shippingFee,
                            discount: totals.discount,
                            voucherCode: selectedVoucher?.code || null,
                            items: cartItems,
                            status: 'Chờ xác nhận',
                            paymentMethod: 'Thanh toán khi nhận hàng',
                            shippingMethod: formData.shippingMethod === 'express' 
                                ? 'Giao hàng nhanh' 
                                : 'Giao hàng tiêu chuẩn',
                            notes: formData.notes,
                            recipientName: selectedAddress.recipientName,
                            recipientPhone: selectedAddress.recipientPhone,
                            addressFullText: `${selectedAddress.address}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`,
                            orderDate: new Date().toLocaleDateString('vi-VN'),
                            estimatedDelivery: getEstimatedDeliveryDate(formData.shippingMethod)
                        }
                    }
                });

            } else {
                toast.error(result.error || "Không thể tạo đơn hàng!", { position: "bottom-right" });
                if (result.needLogin) {
                    setTimeout(() => navigate('/login'), 2000);
                }
            }

        } catch (error) {
            console.error("Unexpected error:", error);
            toast.error("Đã có lỗi xảy ra!", { position: "bottom-right" });
        } finally {
            setIsProcessing(false);
        }
    };


    const totals = calculateTotals();

    return (
        <div className="checkout-container">
            <div className="checkout-main">
                <div className="checkout-form-section">
                    <div className="checkout-form">
                        
                        {/* Địa chỉ giao hàng */}
                        <div className="form-section">
                            <h2 className="section-title">Địa chỉ giao hàng</h2>
                            {loading ? (
                                <p className="loading-text">Đang tải địa chỉ...</p>
                            ) : addresses.length > 0 ? (
                                <div className="address-selection-wrapper">
                                    {/* Combobox chọn địa chỉ */}
                                    <div className="address-select-group">
                                        <label htmlFor="addressSelect" className="select-label">
                                            Chọn địa chỉ giao hàng
                                        </label>
                                        <select
                                            id="addressSelect"
                                            className="address-select"
                                            value={selectedAddressId || ''}
                                            onChange={handleAddressChange}
                                        >
                                            {addresses.map(addr => (
                                                <option key={addr.id} value={addr.id}>
                                                    {addr.recipientName} - {addr.recipientPhone}
                                                    {addr.isDefault ? ' (Mặc định)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Hiển thị chi tiết địa chỉ đã chọn */}
                                    {selectedAddress && (
                                        <div className="address-detail-card">
                                            <div className="address-detail-header">
                                                <strong className="address-name">
                                                    {selectedAddress.recipientName}
                                                </strong>
                                                {selectedAddress.isDefault && (
                                                    <span className="default-badge">Mặc định</span>
                                                )}
                                            </div>
                                            <p className="address-phone">
                                                📞 {selectedAddress.recipientPhone}
                                            </p>
                                            <p className="address-full">
                                                📍 {selectedAddress.address && `${selectedAddress.address}, `}
                                                {selectedAddress.ward && `${selectedAddress.ward}, `}
                                                {selectedAddress.district}, {selectedAddress.province}
                                            </p>
                                        </div>
                                    )}
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

                        {/* Voucher Section */}
                        <div className="form-section">
                            <h2 className="section-title">Mã giảm giá</h2>
                            {vouchersLoading ? (
                                <p className="loading-text">Đang tải voucher...</p>
                            ) : vouchers.length > 0 ? (
                                <div className="voucher-selection-wrapper">
                                    {/* Hiển thị voucher đã chọn hoặc nút chọn voucher */}
                                    {selectedVoucher ? (
                                        <div className="selected-voucher-card">
                                            <div className="voucher-header">
                                                <div className="voucher-icon">🎟️</div>
                                                <div className="voucher-info">
                                                    <strong className="voucher-code">{selectedVoucher.code}</strong>
                                                    <span className="voucher-desc">
                                                        Giảm {selectedVoucher.type === 'percent' 
                                                            ? `${selectedVoucher.value}%` 
                                                            : VoucherService.formatCurrency(selectedVoucher.value)}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-remove-voucher"
                                                    onClick={handleRemoveVoucher}
                                                    title="Bỏ áp dụng voucher"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="voucher-discount-info">
                                                💰 Bạn được giảm: {VoucherService.formatCurrency(totals.discount)}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn-select-voucher"
                                            onClick={() => setShowVoucherList(!showVoucherList)}
                                        >
                                            {showVoucherList ? '▼' : '▶'} Chọn voucher ({vouchers.length} khả dụng)
                                        </button>
                                    )}

                                    {/* Danh sách voucher */}
                                    {showVoucherList && !selectedVoucher && (
                                        <div className="voucher-list">
                                            {vouchers.map(voucher => {
                                                const validation = VoucherService.validateVoucher(
                                                    voucher, 
                                                    totals.subTotal, 
                                                    cartItems
                                                );
                                                const isValid = validation.isValid;

                                                return (
                                                    <div 
                                                        key={voucher.id} 
                                                        className={`voucher-item ${!isValid ? 'disabled' : ''}`}
                                                        onClick={() => isValid && handleVoucherSelect(voucher)}
                                                    >
                                                        <div className="voucher-item-header">
                                                            <div className="voucher-icon-small">🎟️</div>
                                                            <div className="voucher-item-info">
                                                                <strong>{voucher.code}</strong>
                                                                <span className="voucher-value">
                                                                    Giảm {voucher.type === 'percent' 
                                                                        ? `${voucher.value}%` 
                                                                        : VoucherService.formatCurrency(voucher.value)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="voucher-item-details">
                                                            <div className="voucher-condition">
                                                                Đơn tối thiểu: {VoucherService.formatCurrency(voucher.minOrder)}
                                                            </div>
                                                            <div className="voucher-expiry">
                                                                HSD: {VoucherService.formatDate(voucher.endDate)}
                                                            </div>
                                                            {!isValid && (
                                                                <div className="voucher-error">
                                                                    ⚠️ {validation.errors[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="empty-voucher">
                                    <p>Không có voucher khả dụng</p>
                                </div>
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
                            type="button"
                            onClick={handleSubmit}
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
                    </div>
                </div>

                <div className="checkout-summary-section">
                    <CartSummary
                        items={cartItems}         
                        totalAmount={totals.total}
                        itemCount={cartItems.length}
                        isCheckout={true}
                        shippingFee={totals.shippingFee}
                        voucherDiscount={totals.discount}
                    />
                </div>
            </div>
        </div>
    );
};

export default Checkout;