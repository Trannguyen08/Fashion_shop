import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import CartItem from '../../components/CartItem/CartItem';
import CartSummary from '../../components/CartItem/CartSummary';
import useCart from '../../hooks/useCart';


const Cart = () => {
  const navigate = useNavigate();
  const { cart, error } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const [displayCart, setDisplayCart] = useState([]);

  // 🔄 Sync display cart with hook cart
  useEffect(() => {
    if (Array.isArray(cart)) {
      setDisplayCart(cart);
    }
  }, [cart]);

  // ⚠️ Xử lý lỗi
  useEffect(() => {
    if (error) {
      console.error('Lỗi giỏ hàng:', error);
    }
  }, [error]);

  // ✅ Xử lý checkbox - chọn/bỏ chọn sản phẩm
  const handleCheckbox = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // 🔄 Xử lý cập nhật số lượng
  const handleQuantityChange = (productId, newQuantity) => {
    setDisplayCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // ❌ Xử lý xóa sản phẩm
  const handleDelete = (productId) => {
    // Xóa khỏi display cart
    setDisplayCart((prev) =>
      prev.filter((item) => item.id !== productId)
    );

    // Xóa khỏi selectedItems nếu được chọn
    setSelectedItems((prev) =>
      prev.filter((id) => id !== productId)
    );
  };

  // 💰 Tính tổng tiền của các sản phẩm được chọn
  const totalAmount = displayCart
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.current_price || item.price) * item.quantity, 0);

  // 📤 Chuyển đến trang thanh toán
  const handleCheckout = () => {
    const itemsForCheckout = displayCart.filter((item) =>
      selectedItems.includes(item.id)
    );

    if (itemsForCheckout.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    navigate('/checkout', {
      state: {
        items: itemsForCheckout,
        total: totalAmount,
      },
    });
  };

  // 📍 Loading state
  if (!Array.isArray(displayCart)) {
    return (
      <div className="cart-container">
        <div className="cart-content" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  // 📍 Empty cart state
  if (displayCart.length === 0) {
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

  // 📍 Cart with items
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div className="cart-container" style={{ flex: 1 }}>
        <div className="cart-content">
          <h1 className="cart-title">Giỏ hàng của bạn</h1>

          <div className="cart-main">
            {/* Items section */}
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
                {displayCart.map((item) => (
                  <CartItem
                    key={`${item.id}-${item.product_variant_id}`}
                    item={item}
                    isSelected={selectedItems.includes(item.id)}
                    onCheckbox={handleCheckbox}
                    onQuantityChange={handleQuantityChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>

            {/* Summary section */}
            <CartSummary
              selectedItems={displayCart.filter((item) =>
                selectedItems.includes(item.id)
              )}
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