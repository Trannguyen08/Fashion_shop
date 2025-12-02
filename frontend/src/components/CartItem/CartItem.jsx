import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import './CartItem.css';

const CartItem = ({ item, isSelected, onCheckbox, onDelete }) => {
  const { updateCartItem, removeFromCart } = useCartContext();
  
  const debounceTimer = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  // 🔥 Cập nhật số lượng với debounce
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    // 1️⃣ Cập nhật UI ngay
    setLocalQuantity(newQuantity);

    // 2️⃣ Clear timer cũ
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // 3️⃣ Debounce API call
    setIsUpdating(true);
    debounceTimer.current = setTimeout(async () => {
      const success = await updateCartItem(item.id, item.product_variant_id, newQuantity);
      setIsUpdating(false);
      
      if (!success) {
        console.error('❌ Cập nhật thất bại');
        setLocalQuantity(item.quantity); // Rollback
      }
    }, 500);
  };

  // ❌ Xóa sản phẩm
  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }

    const success = await removeFromCart(item.id);
    if (success) {
      onDelete?.(item.id);
    }
  };

  return (
    <div className="cart-item">
      {/* Checkbox */}
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={isSelected || false}
          onChange={onCheckbox}
          className="checkbox"
        />
      </div>

      {/* Product info */}
      <div className="item-product">
        <img 
          src={item.product_img || '/placeholder.png'} 
          alt={item.product_name} 
          className="item-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder.png';
          }}
        />
        <div className="item-info">
          <h3 className="item-name" title={item.product_name}>
            {item.product_name?.length > 40 
              ? item.product_name.substring(0, 40) + '...' 
              : item.product_name}
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
          {parseFloat(item.current_price || 0).toLocaleString('vi-VN')}₫
        </span>
      </div>

      {/* Quantity control */}
      <div className="item-quantity">
        <button 
          className="qty-btn"
          onClick={() => handleQuantityChange(localQuantity - 1)}
          disabled={localQuantity <= 1 || isUpdating}
        >
          −
        </button>
        <input
          type="number"
          value={localQuantity}
          onChange={(e) => {
            const newQty = parseInt(e.target.value) || 1;
            if (newQty >= 1) {
              handleQuantityChange(newQty);
            }
          }}
          className="qty-input"
          min="1"
          disabled={isUpdating}
        />
        <button 
          className="qty-btn"
          onClick={() => handleQuantityChange(localQuantity + 1)}
          disabled={isUpdating}
        >
          +
        </button>
      </div>

      {/* Total price */}
      <div className="item-total">
        <span className="total-amount">
          {parseFloat(item.total_price || 0).toLocaleString('vi-VN')}₫
        </span>
      </div>

      {/* Delete button */}
      <div className="item-action">
        <button 
          className="delete-btn"
          onClick={handleDelete}
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