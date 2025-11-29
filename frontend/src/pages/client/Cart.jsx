import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

import CartItem from '../../components/CartItem/CartItem';
import CartSummary from '../../components/CartItem/CartSummary';

import { useCartContext } from '../../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, error } = useCartContext();

  // 🟦 Danh sách ID sản phẩm được chọn
  const [selectedIds, setSelectedIds] = useState([]);

  // 🟦 Sao chép cart ra local để chỉnh sửa mà không ảnh hưởng API
  const [localCart, setLocalCart] = useState([]);

  // 🔄 Đồng bộ cart vào localCart
  useEffect(() => {
    if (Array.isArray(cart)) {
      setLocalCart(cart);
    }
  }, [cart]);

  // ⚠️ Log lỗi nếu có
  useEffect(() => {
    if (error) console.error("Cart Error:", error);
  }, [error]);

  // 🟩 Chọn / bỏ chọn 1 sản phẩm
  const handleCheckbox = (productId) => {
    setSelectedIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // 🔄 Cập nhật số lượng
  const handleQuantityChange = (productId, newQuantity) => {
    setLocalCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // ❌ Xóa sản phẩm
  const handleDelete = (productId) => {
    setLocalCart(prev => prev.filter(item => item.id !== productId));
    setSelectedIds(prev => prev.filter(id => id !== productId));
  };

  // ▶️ Những item được chọn
  const selectedItems = useMemo(() => {
    return localCart.filter(item => selectedIds.includes(item.id));
  }, [localCart, selectedIds]);

  // 💰 Tổng tiền
  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const price = item.current_price || item.total_price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [selectedItems]);

  // ▶️ Chuyển sang trang thanh toán
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    navigate('/checkout', {
      state: {
        items: selectedItems,
        total: totalAmount
      }
    });
  };

  // 🟡 Loading state
  if (!Array.isArray(localCart)) {
    return (
      <div className="cart-container">
        <div className="cart-content" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  // 🟡 Empty cart
  if (localCart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="cart-container" style={{ flex: 1 }}>
          <div className="cart-content">
            <h1 className="cart-title">Giỏ hàng của bạn</h1>

            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                marginTop: '20px',
              }}
            >
              <p style={{ fontSize: '16px', color: '#999' }}>
                Giỏ hàng trống. Hãy thêm sản phẩm vào giỏ!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🟡 Hiển thị giỏ hàng
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="cart-container" style={{ flex: 1 }}>
        <div className="cart-content">
          <h1 className="cart-title">Giỏ hàng của bạn</h1>

          <div className="cart-main">
            {/* Items */}
            <div className="cart-items-section">
              <div className="cart-header">
                <div className="header-checkbox"></div>
                <div className="header-product">Sản phẩm</div>
                <div className="header-price">Đơn giá</div>
                <div className="header-quantity">Số lượng</div>
                <div className="header-total">Thành tiền</div>
                <div className="header-action">Thao tác</div>
              </div>

              <div className="cart-items">
                {localCart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    isSelected={selectedIds.includes(item.id)}
                    onCheckbox={() => handleCheckbox(item.id)}
                    onQuantityChange={(newQty) =>
                      handleQuantityChange(item.id, newQty)
                    }
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            <CartSummary
              selectedItems={selectedItems}
              selectedCount={selectedItems.length}
              totalAmount={totalAmount}
              itemCount={selectedItems.length}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
