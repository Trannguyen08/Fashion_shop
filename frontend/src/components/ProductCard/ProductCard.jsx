import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= rating ? '#FFD700' : 'none'}
          stroke={i <= rating ? '#FFD700' : '#ddd'}
        />
      );
    }
    return stars;
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {product.isNew && (
          <span className="new-badge">NEW</span>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-price">
          {product.newPrice && (
            <span className="price-new">{product.newPrice.toLocaleString('vi-VN')}₫</span>
          )}
          <span className={product.newPrice ? "price-old" : "price-current no-discount"}>
            {product.oldPrice.toLocaleString('vi-VN')}₫
          </span>

        </div>
        
        <div className="product-footer">
          <div className="product-rating">
            {renderStars(product.rating)}
            <span className="rating-count">({product.reviewCount})</span>
          </div>
          
          <button className="add-to-cart-btn" aria-label="Thêm vào giỏ hàng">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;