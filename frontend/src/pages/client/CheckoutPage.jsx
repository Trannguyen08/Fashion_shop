import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Checkout from './Checkout'; // Đảm bảo đường dẫn đúng
import { useCartContext } from '../../context/CartContext'; // Đảm bảo đường dẫn đúng

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearSelection, cart, removeFromCart, syncCartFromDB } = useCartContext(); // Lấy các hàm cần thiết
  const [checkoutData, setCheckoutData] = useState(null);

  // Load và lưu dữ liệu cần thanh toán
  useEffect(() => {
    // 1️⃣ Ưu tiên lấy từ navigate state
    if (location.state?.items?.length > 0 && location.state?.total !== undefined) {
      const data = {
        items: location.state.items,
        total: location.state.total
      };
      setCheckoutData(data);

      // Lưu vào sessionStorage để duy trì khi refresh
      sessionStorage.setItem('checkoutItems', JSON.stringify(data.items));
      sessionStorage.setItem('checkoutTotal', JSON.stringify(data.total));
    }
    // 2️⃣ Nếu không có state, lấy từ sessionStorage
    else {
      const savedItems = sessionStorage.getItem('checkoutItems');
      const savedTotal = sessionStorage.getItem('checkoutTotal');

      if (savedItems && savedTotal) {
        setCheckoutData({
          items: JSON.parse(savedItems),
          total: JSON.parse(savedTotal)
        });
      } else {
        // 3️⃣ Không có dữ liệu → quay về cart
        navigate('/cart', { replace: true });
      }
    }
  }, [location.state, navigate]);

  // 🔥 Xử lý thanh toán thành công
  const handleSuccessfulCheckout = async (itemsToClear) => {
    // 1. Xóa các item đã thanh toán khỏi giỏ hàng chính thức (cart state)
    // Giả sử API backend tự động xử lý khi có order mới, hoặc ta cần gọi
    // hàm xóa từng item một (nếu dùng local storage hoặc không có API tổng)

    const user = JSON.parse(localStorage.getItem('user'));

    if (user?.id) {
        // Nếu có user, chỉ cần sync lại cart từ DB sau khi backend xử lý order
        // (Đây là cách lý tưởng nếu API order tự động cập nhật giỏ hàng)
        await syncCartFromDB(user.id);
    } else {
        // Nếu không có user (local storage), ta phải xóa thủ công
        // Lưu ý: Nếu ID trong checkoutItems là ID của cart item (item.id) thì mới xóa được.
        // Giả định: item.id trong checkoutData là cartItemId
        for (const item of itemsToClear) {
            await removeFromCart(item.id); 
        }
    }
    
    // 2. Xóa dữ liệu tạm thời
    sessionStorage.removeItem('checkoutItems');
    sessionStorage.removeItem('checkoutTotal');
    clearSelection && clearSelection(); // Xóa lựa chọn trên trang giỏ hàng

    // 3. Chuyển hướng
    navigate('/order-success');
  }
  
  // Xử lý Quay lại
  const handleBack = () => {
    sessionStorage.removeItem('checkoutItems');
    sessionStorage.removeItem('checkoutTotal');
    clearSelection && clearSelection();
    navigate('/cart', { replace: true });
  }

  if (!checkoutData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <Checkout
      cartItems={checkoutData.items}
      totalAmount={checkoutData.total}
      onBack={handleBack}
      onCheckoutSuccess={() => handleSuccessfulCheckout(checkoutData.items)}
    />
  );
};

export default CheckoutPage;