import React, { useState, useEffect } from 'react';
import './Checkout.css';
import AddressService from '../../services/AddressService';

const PROVINCES = {
  "HN": { name: "Hà Nội", districts: ["Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy"] },
  "HCM": { name: "TP. Hồ Chí Minh", districts: ["Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5"] },
  "DN": { name: "Đà Nẵng", districts: ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"] },
  "CT": { name: "Cần Thơ", districts: ["Ninh Kiều", "Bình Thủy", "Cờ Đỏ", "Phong Điền", "Vĩnh Thạnh"] },
  "HP": { name: "Hải Phòng", districts: ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Kiến An", "Đồ Sơn"] }
};

const Checkout = ({ cartItems = [], totalAmount = 0, onBack = () => {} }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    shippingMethod: 'standard',
    paymentMethod: 'cod',
    notes: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});

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
      
      // Tự động chọn địa chỉ mặc định
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    console.log('Order placed:', {
      items: cartItems,
      address: selectedAddress,
      shipping: formData,
      total: finalTotal,
      paymentMethod: formData.paymentMethod
    });
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    return (
      <div className="checkout-container">
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h2>Đặt hàng thành công!</h2>
          <p>Mã đơn hàng: #ORD{Date.now().toString().slice(-6)}</p>
          <p className="success-message">
            Chúng tôi sẽ xác nhận đơn hàng của bạn trong vòng 24 giờ
          </p>
          <div className="success-info">
            <p><strong>Người nhận:</strong> {selectedAddress?.recipientName}</p>
            <p><strong>Số điện thoại:</strong> {selectedAddress?.recipientPhone}</p>
            <p><strong>Địa chỉ:</strong> {selectedAddress?.address && `${selectedAddress.address}, `}
              {selectedAddress?.district}, {PROVINCES[selectedAddress?.province]?.name}</p>
            <p><strong>Tổng tiền:</strong> {finalTotal.toLocaleString('vi-VN')}₫</p>
          </div>
          <button className="btn-continue" onClick={onBack}>
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

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
                        <p className="address-detail"><span>Địa chỉ:  </span> {address.address && `${address.address}, `}
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

            {/* Phương thức vận chuyển */}
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

            {/* Phương thức thanh toán */}
            <div className="form-section">
              <h2 className="section-title">Phương thức thanh toán</h2>
              <div className="payment-options">
                <label className="radio-option">
                  <input type="radio" name="paymentMethod" value="cod"
                    checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} />
                  <div className="radio-content">
                    <span className="radio-label">Thanh toán khi nhận hàng</span>
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

            {/* Ghi chú */}
            <div className="form-section">
              <h2 className="section-title">Ghi chú đơn hàng</h2>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange}
                placeholder="Ghi chú thêm về đơn hàng của bạn (tùy chọn)"
                className="form-textarea" rows="4" />
            </div>

            <button onClick={handleSubmit} className="btn-submit">Xác nhận đơn hàng</button>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="checkout-summary-section">
          <div className="checkout-summary">
            <h2 className="summary-title">Tóm tắt đơn hàng</h2>
            <div className="summary-items">
              {cartItems.length === 0 ? (
                <p className="empty-message">Không có sản phẩm trong đơn hàng</p>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="item-info">
                      <p className="item-name">{item.name.substring(0, 30)}...</p>
                      <p className="item-quantity">x{item.quantity}</p>
                    </div>
                    <p className="item-price">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                  </div>
                ))
              )}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-totals">
              <div className="total-row"><span>Tạm tính:</span><span>{totalAmount.toLocaleString('vi-VN')}₫</span></div>
              <div className="total-row"><span>Vận chuyển:</span><span>{shippingCost.toLocaleString('vi-VN')}₫</span></div>
              <div className="total-row"><span>Giảm giá:</span><span>0₫</span></div>
            </div>
            <div className="summary-divider"></div>
            <div className="total-final">
              <span>Tổng cộng:</span>
              <span className="final-price">{finalTotal.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;