import React from 'react';
import './CartSummary.css';

// Đã đổi tên selectedItems thành items
const CartSummary = ({ 
    items = [], 
    totalAmount = 0, 
    itemCount = 0, 
    onCheckout,
    isCheckout = false,
    shippingFee = 0
}) => {
    // Safety check
    const validItems = Array.isArray(items) ? items : [];
    const total = typeof totalAmount === 'number' ? totalAmount : 0;
    const count = typeof itemCount === 'number' ? itemCount : 0;

    const finalTotal = total + shippingFee;

    return (
        <div className="cart-summary">
            <h2 className="summary-title">{isCheckout ? 'Tóm tắt đơn hàng' : 'Đơn hàng'}</h2>
            
            {validItems.length === 0 ? (
                <div className="summary-empty">
                    <p>Chưa chọn sản phẩm nào</p>
                </div>
            ) : (
                <>
                    {/* Danh sách sản phẩm */}
                    <div className="summary-items">
                        {validItems.map(item => (
                            <div key={`${item.id}-${item.product_variant_id}`} className="summary-item">
                                
                                <div className="summary-item-left">
                                    <img 
                                        src={item.product_img || 'placeholder.jpg'}
                                        alt={item.product_name} 
                                        className="summary-item-thumbnail" 
                                    />
                                    
                                    <div className="summary-item-info">
                                        <p className="summary-item-name">
                                            {item.product_name?.substring(0, 25)}...
                                        </p>
                                        
                                        <div className='summary-item-details'>
                                            {(item.size || item.color) && (
                                                <p className="summary-item-variant">(
                                                    {item.size && <span>{item.size}</span>}
                                                    {item.size && item.color && <span>, </span>}
                                                    {item.color && <span>{item.color}</span>})
                                                </p>
                                            )}

                                            <p className="summary-item-quantity">
                                                x{item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="summary-item-price">
                                    {item.total_price.toLocaleString('vi-VN')}₫
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="summary-divider"></div>

                    {/* Thông tin chi phí */}
                    <div className="summary-info">
                        <div className="summary-row">
                            <span className="summary-label">Tạm tính:</span>
                            <span className="summary-value">{total.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Vận chuyển:</span>
                            {/* Chỉ hiển thị chi phí vận chuyển cố định nếu ở Checkout */}
                            <span className="summary-value summary-shipping">
                                {isCheckout ? shippingFee.toLocaleString('vi-VN') + '₫' : 'Tính sau'} 
                            </span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Giảm giá:</span>
                            <span className="summary-value">0₫</span>
                        </div>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-total">
                        <span className="total-label">Tổng cộng:</span>
                        <span className="total-price">{finalTotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    
                    {/* ✨ Logic ẩn/hiện nút Thanh toán */}
                    {!isCheckout && (
                        <button 
                            className="checkout-btn" 
                            onClick={onCheckout}
                            disabled={count === 0}
                        >
                            Thanh toán ({count})
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default CartSummary;