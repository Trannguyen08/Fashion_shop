import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import CartItem from '../../../components/CartItem/CartItem';
import CartSummary from '../../../components/CartItem/CartSummary';
import useCart from '../../../hooks/useCart';

const Cart = () => {
  const navigate = useNavigate();

  const {
    cart,
    loading,
    error,
    updateItemChecked,
    updateQuantity,
    removeFromCart,
    getSelectedItems,
    getTotalPrice,
  } = useCart();

  // Xử lý lỗi
  useEffect(() => {
    if (error) {
      console.error("Lỗi giỏ hàng:", error);
    }
  }, [error]);

  const handleCheckbox = async (id) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      await updateItemChecked(id, !item.checked);
    }
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(id, newQuantity);
  };

  const handleDelete = async (id) => {
    await removeFromCart(id);
  };

  const handleCheckout = () => {
    // Lưu vào sessionStorage (tùy chọn, có thể không cần)
    // sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    // sessionStorage.setItem('checkoutTotal', JSON.stringify(totalAmount));
    navigate('/checkout');
  };

  const selectedItems = getSelectedItems();
  const totalAmount = getTotalPrice();

  // Loading state
  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị Cart
  return (
    <div className="cart-container">
      <div className="cart-content">
        <h1 className="cart-title">Giỏ hàng của bạn</h1>

        {cart.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p style={{ fontSize: '16px', color: '#999' }}>
              Giỏ hàng trống. Hãy thêm sản phẩm vào giỏ!
            </p>
          </div>
        ) : (
          <div className="cart-main">
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
                {cart.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onCheckbox={handleCheckbox}
                    onQuantityChange={handleQuantityChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>

            <CartSummary 
              selectedItems={selectedItems}
              totalAmount={totalAmount}
              itemCount={selectedItems.length}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;