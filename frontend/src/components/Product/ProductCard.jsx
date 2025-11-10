import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart'
import './ProductCard.css';

const ProductCard = ({ product, onProductClick }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

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

  const handleProductClick = () => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  return (
    <div className="product-card">
      <div className="product-image" onClick={handleProductClick} style={{ cursor: 'pointer' }}>
        <img src={product.product_img} alt={product.name} />
        {product.is_new && (
          <span className="new-badge">NEW</span>
        )}
      </div>
      
      <div className="product-info">
        <h3 
          className="product-name2" 
          onClick={handleProductClick}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h3>
        
        <div className="product-price2">
          {product.old_price ? (
            <>
              <span className="price-new">{product.current_price?.toLocaleString('vi-VN')}₫</span>
              <span className="price-old">{product.old_price?.toLocaleString('vi-VN')}₫</span>
            </>
          ) : (
            <span className="price-only">{product.current_price?.toLocaleString('vi-VN')}₫</span>
          )}
        </div>
        
        <div className="product-footer">
          <div className="product-rating">
            {renderStars(Math.round(product.average_rating))}
            <span className="rating-count">(0)</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProductCard;