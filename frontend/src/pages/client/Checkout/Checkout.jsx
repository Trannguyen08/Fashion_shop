import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import './Checkout.css';

const Checkout = ({ cartItems = [], totalAmount = 0, onBack = () => {} }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    shippingMethod: 'standard',
    paymentMethod: 'cod',
    notes: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});

  const shippingCost = formData.shippingMethod === 'express' ? 30000 : 15000;
  const finalTotal = totalAmount + shippingCost;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Số điện thoại không hợp lệ';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!formData.city.trim()) newErrors.city = 'Vui lòng chọn thành phố';
    if (!formData.district.trim()) newErrors.district = 'Vui lòng chọn quận/huyện';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Simulate order placement
    console.log('Order placed:', {
      items: cartItems,
      shipping: formData,
      total: finalTotal,
      paymentMethod: formData.paymentMethod
    });

    setOrderPlaced(true);
  };

  if (orderPlaced) {
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
            <p><strong>Người nhận:</strong> {formData.fullName}</p>
            <p><strong>Địa chỉ:</strong> {formData.address}, {formData.ward}, {formData.district}, {formData.city}</p>
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
        {/* Form phía trái */}
        <div className="checkout-form-section">
          <form onSubmit={handleSubmit} className="checkout-form">
            {/* Thông tin giao hàng */}
            <div className="form-section">
              <h2 className="section-title">Thông tin giao hàng</h2>
              
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nguyễn Văn A"
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0901234567"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Đường ABC"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thành phố *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'error' : ''}
                  >
                    <option value="">Chọn thành phố</option>
                    <option value="Ho Chi Minh">TP. Hồ Chí Minh</option>
                    <option value="Hanoi">Hà Nội</option>
                    <option value="Da Nang">Đà Nẵng</option>
                    <option value="Hai Phong">Hải Phòng</option>
                  </select>
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>Quận/Huyện *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={errors.district ? 'error' : ''}
                  >
                    <option value="">Chọn quận/huyện</option>
                    <option value="Q1">Quận 1</option>
                    <option value="Q3">Quận 3</option>
                    <option value="Q7">Quận 7</option>
                    <option value="Binh Thanh">Bình Thạnh</option>
                  </select>
                  {errors.district && <span className="error-text">{errors.district}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Phường/Xã (Tùy chọn)</label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  placeholder="Phường/Xã"
                />
              </div>
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
                    <span className="radio-label">Thanh toán khi nhận hàng</span>
                    <span className="radio-description">Thanh toán tiền mặt cho shipper</span>
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
                    <span className="radio-description">Chuyển khoản qua tài khoản ngân hàng</span>
                  </div>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={formData.paymentMethod === 'wallet'}
                    onChange={handleInputChange}
                  />
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
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ghi chú thêm về đơn hàng của bạn (tùy chọn)"
                className="form-textarea"
                rows="4"
              />
            </div>

            <button type="submit" className="btn-submit">
              Xác nhận đơn hàng
            </button>
          </form>
        </div>

        {/* Tóm tắt đơn hàng phía phải */}
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
                    <p className="item-price">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Tạm tính:</span>
                <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="total-row">
                <span>Vận chuyển:</span>
                <span>{shippingCost.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="total-row">
                <span>Giảm giá:</span>
                <span>0₫</span>
              </div>
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