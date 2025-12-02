import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css'; // Đảm bảo bạn có file CSS này
import CartItem from '../../components/CartItem/CartItem'; // Đảm bảo đường dẫn này đúng
import CartSummary from '../../components/CartItem/CartSummary'; // Đảm bảo đường dẫn này đúng
import { useCartContext } from '../../context/CartContext';

// Key dùng để lưu trữ trạng thái chọn của giỏ hàng trong sessionStorage
const STORAGE_KEY = 'checkoutSelectedIds';

const Cart = () => {
    const navigate = useNavigate();
    const { 
        cart,
        error,
        selectedIds,
        setSelectedIds, 
        toggleSelectItem,
        selectAll,
        clearSelection,
        getSelectedItems,
        getSelectedTotal,
        getSelectedCount,
        updateCartItem,
        removeFromCart
    } = useCartContext();

    // Cart.jsx
    useEffect(() => {
        const storedIdsJson = sessionStorage.getItem(STORAGE_KEY);
        
        if (storedIdsJson && Array.isArray(cart) && cart.length > 0) {
            try {
                const storedIds = JSON.parse(storedIdsJson);
                const validIds = storedIds.filter(id => cart.some(item => item.id === id));
                setSelectedIds(validIds); 
                
            } catch (e) {
                console.error("Failed to parse stored selected IDs:", e);
            }
            
        }
    }, [cart, setSelectedIds]); 

    // ⚠️ Log lỗi nếu có
    useEffect(() => {
        if (error) console.error("Cart Error:", error);
    }, [error]);

    // 🔄 Cập nhật số lượng
    const handleQuantityChange = async (itemId, newQuantity) => {
        // updateCartItem(itemId, newQuantity); 
    };

    // ❌ Xóa sản phẩm
    const handleDelete = (itemId) => {
        // removeFromCart(itemId); 
        
        // Đảm bảo xóa khỏi selection nếu nó đang được chọn
        if (selectedIds.includes(itemId)) {
          toggleSelectItem(itemId);
        }
    };

    // 🟢 Chọn/bỏ chọn tất cả
    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            selectAll();
        } else {
            clearSelection();
        }
    };

    // 2. 🔥 LƯU TRẠNG THÁI TRƯỚC KHI CHUYỂN SANG CHECKOUT
    const handleCheckout = () => {
        const itemsToCheckout = getSelectedItems;

        if (itemsToCheckout.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds)); // GIỮ NGUYÊN
        } catch (e) {
            console.error("Could not save selected IDs to session storage:", e);
        }

        navigate('/checkout', {
            state: {
                items: itemsToCheckout,
                total: getSelectedTotal
            }
        });
    };

    // 🟡 Loading
    if (!Array.isArray(cart)) {
        return (
            <div className="cart-container">
                <div className="cart-content" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    // 🟡 Empty cart
    if (cart.length === 0) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div className="cart-container" style={{ flex: 1 }}>
                    <div className="cart-content">
                        <h1 className="cart-title">Giỏ hàng của bạn</h1>
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            marginTop: '20px',
                        }}>
                            <p style={{ fontSize: '16px', color: '#999' }}>
                                Giỏ hàng trống. Hãy thêm sản phẩm vào giỏ!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="cart-container" style={{ flex: 1 }}>
                <div className="cart-content">
                    <div className="cart-main">
                        {/* Items Section */}
                        <div className="cart-items-section">
                            <div className="cart-header">
                                <div className="header-checkbox">
                                    <input 
                                        type="checkbox"
                                        className="checkbox"
                                        checked={selectedIds.length === cart.length && cart.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        title="Chọn tất cả"
                                    />
                                </div>
                                <div className="header-product">Sản phẩm</div>
                                <div className="header-price">Đơn giá</div>
                                <div className="header-quantity">Số lượng</div>
                                <div className="header-total">Thành tiền</div>
                                <div className="header-action">Thao tác</div>
                            </div>

                            <div className="cart-items">
                                {cart.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        isSelected={selectedIds.includes(item.id)}
                                        onCheckbox={() => toggleSelectItem(item.id)}
                                        onQuantityChange={handleQuantityChange}
                                        onDelete={() => handleDelete(item.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Summary Section - ĐÃ SỬA ĐỔI PROPS */}
                        <CartSummary
                            items={getSelectedItems}        
                            totalAmount={getSelectedTotal}
                            itemCount={getSelectedCount}
                            onCheckout={handleCheckout}
                            isCheckout={false}                
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;