import React from 'react';
import './CartSummary.css';

const CartSummary = ({ selectedItems = [], totalAmount = 0, itemCount = 0, onCheckout }) => {
  // 🛡️ Safety check
  const items = Array.isArray(selectedItems) ? selectedItems : [];
  const total = typeof totalAmount === 'number' ? totalAmount : 0;
  const count = typeof itemCount === 'number' ? itemCount : 0;

  return (
    <div className="cart-summary">
      <h2 className="summary-title">Đơn hàng</h2>
      
      {items.length === 0 ? (
        <div className="summary-empty">
          <p>Chưa chọn sản phẩm nào</p>
        </div>
      ) : (
        <>
          <div className="summary-items">
            {items.map(item => (
              <div key={`${item.id}-${item.product_variant_id}`} className="summary-item">
                <div className="summary-item-info">
                  <p className="summary-item-name">
                    {item.name?.substring(0, 25)}...
                  </p>
                  <p className="summary-item-detail">
                    x{item.quantity}
                  </p>
                </div>
                <p className="summary-item-price">
                  {((item.current_price || item.price) * item.quantity).toLocaleString('vi-VN')}đ
                </p>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-info">
            <div className="summary-row">
              <span className="summary-label">Tạm tính:</span>
              <span className="summary-value">{total.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Vận chuyển:</span>
              <span className="summary-value summary-shipping">Miễn phí</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Giảm giá:</span>
              <span className="summary-value">0đ</span>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span className="total-label">Tổng cộng:</span>
            <span className="total-price">{total.toLocaleString('vi-VN')}đ</span>
          </div>

          <button 
            className="checkout-btn" 
            onClick={onCheckout}
            disabled={count === 0}
          >
            Thanh toán ({count})
          </button>
        </>
      )}
    </div>
  );
};

export default CartSummary;