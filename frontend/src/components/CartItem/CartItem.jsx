import React from 'react';
import { Trash2 } from 'lucide-react';
import './CartItem.css'

const CartItem = ({ item, onCheckbox, onQuantityChange, onDelete }) => {
  const totalPrice = item.price * item.quantity;

  return (
    <div className="cart-item">
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onCheckbox(item.id)}
          className="checkbox"
        />
      </div>

      <div className="item-product">
        <img src={item.image} alt={item.name} className="item-image" />
        <div className="item-info">
          <h3 className="item-name" title={item.name}>
            {item.name.length > 40 ? item.name.substring(0, 40) + '...' : item.name}
          </h3>
          <p className="item-details">
            <span className="detail-label">Size:</span> {item.size} | 
            <span className="detail-label"> Màu:</span> {item.color}
          </p>
        </div>
      </div>

      <div className="item-price">
        <span className="price-amount">{item.price.toLocaleString('vi-VN')}đ</span>
      </div>

      <div className="item-quantity">
        <button 
          className="qty-btn"
          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
        >
          −
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) || 1)}
          className="qty-input"
        />
        <button 
          className="qty-btn"
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
        >
          +
        </button>
      </div>

      <div className="item-total">
        <span className="total-amount">{totalPrice.toLocaleString('vi-VN')}đ</span>
      </div>

      <div className="item-action">
        <button 
          className="delete-btn"
          onClick={() => onDelete(item.id)}
          title="Xóa sản phẩm"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;