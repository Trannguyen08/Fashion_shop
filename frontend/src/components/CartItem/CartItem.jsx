import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import useCart from '../../hooks/useCart';
import './CartItem.css';

const CartItem = ({ item, isSelected, onCheckbox, onQuantityChange, onDelete }) => {
  const { updateCartItem, removeFromCart } = useCart();
  
  // ⏱️ Debounce: chỉ gọi API sau khi user dừng tương tác
  const debounceTimer = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔄 Xử lý cập nhật số lượng (có debounce)
  const handleQuantityChange = async (productId, productVariantId, newQuantity) => {
    // Kiểm tra hợp lệ
    if (newQuantity < 1) return;

    // 1️⃣ Cập nhật UI ngay lập tức (callback to parent)
    onQuantityChange?.(productId, newQuantity);

    // 2️⃣ Clear timer cũ (nếu có)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // 3️⃣ Set timer mới - chờ 500ms rồi gọi API
    setIsUpdating(true);
    debounceTimer.current = setTimeout(async () => {
      const success = await updateCartItem(productId, productVariantId, newQuantity);
      setIsUpdating(false);
      
      if (!success) {
        console.error('❌ Cập nhật thất bại');
      }
    }, 500);
  };

  // ❌ Xử lý xóa sản phẩm
  const handleDelete = async (productId, productVariantId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }

    const success = await removeFromCart(productId, productVariantId);
    if (success) {
      onDelete?.(productId);
      console.log("✅ Xóa sản phẩm thành công");
    }
  };

  const itemTotal = (item.current_price || item.price) * item.quantity;

  return (
    <div className="cart-item">
      {/* Checkbox */}
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={isSelected || false}
          onChange={() => onCheckbox?.(item.id)}
          className="checkbox"
        />
      </div>

      {/* Product info */}
      <div className="item-product">
        <img src={item.product_img} alt={item.name} className="item-image" />
        <div className="item-info">
          <h3 className="item-name" title={item.name}>
            {item.name?.length > 40 ? item.name.substring(0, 40) + '...' : item.name}
          </h3>
          <p className="item-details">
            <span className="detail-label">Size:</span> {item.size || 'N/A'} | 
            <span className="detail-label"> Màu:</span> {item.color || 'N/A'}
          </p>
        </div>
      </div>

      {/* Unit price */}
      <div className="item-price">
        <span className="price-amount">
          {(item.current_price || item.price)?.toLocaleString('vi-VN')}đ
        </span>
      </div>

      {/* Quantity control */}
      <div className="item-quantity">
        <button 
          className="qty-btn"
          onClick={() => handleQuantityChange(item.id, item.product_variant_id, item.quantity - 1)}
          disabled={item.quantity <= 1 || isUpdating}
        >
          −
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => {
            const newQty = parseInt(e.target.value) || 1;
            if (newQty >= 1) {
              handleQuantityChange(item.id, item.product_variant_id, newQty);
            }
          }}
          className="qty-input"
          min="1"
          disabled={isUpdating}
        />
        <button 
          className="qty-btn"
          onClick={() => handleQuantityChange(item.id, item.product_variant_id, item.quantity + 1)}
          disabled={isUpdating}
        >
          +
        </button>
      </div>

      {/* Total price */}
      <div className="item-total">
        <span className="total-amount">
          {itemTotal.toLocaleString('vi-VN')}đ
        </span>
      </div>

      {/* Delete button */}
      <div className="item-action">
        <button 
          className="delete-btn"
          onClick={() => handleDelete(item.id, item.product_variant_id)}
          title="Xóa sản phẩm"
          disabled={isUpdating}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;