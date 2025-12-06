import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import './CartItem.css';

const CartItem = ({ item, isSelected, onCheckbox, onDelete }) => {
  const { updateCartItem, removeFromCart } = useCartContext();
  
  const debounceTimer = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // localQuantity luôn được giới hạn bởi stock
  const maxStock = item.stock || 1;
  const [localQuantity, setLocalQuantity] = useState(
    Math.min(item.quantity, maxStock)
  );

  // 🔥 Hàm xử lý số lượng có giới hạn tồn kho
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    // 🚫 Nếu vượt tồn kho → fix lại ngay
    if (newQuantity > maxStock) {
      newQuantity = maxStock;
    }

    // UI update ngay
    setLocalQuantity(newQuantity);

    // Xóa timer cũ
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce update DB 3 giây
    debounceTimer.current = setTimeout(async () => {
      setIsUpdating(true);

      const success = await updateCartItem(
        item.id,
        item.product_variant_id,
        newQuantity
      );

      setIsUpdating(false);

      if (!success) {
        setLocalQuantity(item.quantity); // rollback nếu lỗi
      }
    }, 3000);
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
          <h2 className="item-name" title={item.product_name}>
            {item.product_name?.length > 40 
              ? item.product_name.substring(0, 40) + '...' 
              : item.product_name}
          </h2>
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
            let newQty = parseInt(e.target.value) || 1;

            // Nếu nhập vượt stock → tự fix
            if (newQty > maxStock) newQty = maxStock;
            if (newQty < 1) newQty = 1;

            handleQuantityChange(newQty);
          }}
          className="qty-input"
          min="1"
          max={maxStock}
          disabled={isUpdating}
        />

        <button 
          className="qty-btn"
          onClick={() => handleQuantityChange(localQuantity + 1)}
          disabled={localQuantity >= maxStock || isUpdating}
        >
          +
        </button>
      </div>

      {/* Total price */}
      <div className="item-total">
        <span className="total-amount">
          {(localQuantity * item.current_price).toLocaleString('vi-VN')}₫
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
