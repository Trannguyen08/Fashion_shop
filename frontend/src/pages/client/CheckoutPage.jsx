import React from 'react';
import { useNavigate } from 'react-router-dom';
import Checkout from './Checkout';
import useCart from '../../hooks/useCart';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { getSelectedItems, getTotalPrice } = useCart();

  const selectedItems = getSelectedItems();
  const totalAmount = getTotalPrice();

  // Nếu không có sản phẩm nào được chọn → quay về cart
  if (selectedItems.length === 0 && !sessionStorage.getItem('checkoutItems')) {
    navigate('/cart', { replace: true });
    return null;
  }

  // Lấy items từ sessionStorage (nếu từ ProductDetail "Mua ngay")
  const checkoutItems = sessionStorage.getItem('checkoutItems') 
    ? JSON.parse(sessionStorage.getItem('checkoutItems'))
    : selectedItems;

  const checkoutTotal = sessionStorage.getItem('checkoutTotal') 
    ? JSON.parse(sessionStorage.getItem('checkoutTotal'))
    : totalAmount;

  return (
    <Checkout
      cartItems={checkoutItems}
      totalAmount={checkoutTotal}
      onBack={() => {
        // Xóa dữ liệu từ sessionStorage
        sessionStorage.removeItem('checkoutItems');
        sessionStorage.removeItem('checkoutTotal');
        navigate('/cart');
      }}
    />
  );
};

export default CheckoutPage;