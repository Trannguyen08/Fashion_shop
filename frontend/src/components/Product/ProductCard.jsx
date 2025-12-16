import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatUtils';
import './ProductCard.css';

const ProductCard = ({ product, onProductClick }) => {
  const navigate = useNavigate();
  const { addToCart } = useCartContext();

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

  // Tính phần trăm giảm giá
  const calculateDiscount = () => {
    if (product.current_price && product.old_price && product.current_price < product.old_price) {
      const discount = ((product.old_price - product.current_price) / product.old_price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const discountPercent = calculateDiscount();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  return (
    <div className="product-card">
      <div className="product-image" onClick={handleProductClick} style={{ cursor: 'pointer' }}>
        <img src={product.product_img} alt={product.name} />
        
        {/* Badge NEW */}
        {product.is_new && (
          <span className="new-badge">NEW</span>
        )}
        
        {/* Badge SALE - chỉ hiển thị khi có giảm giá */}
        {discountPercent > 0 && (
          <span className="sale-badge">-{discountPercent}%</span>
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
          {product.old_price && product.current_price < product.old_price ? (
            <>
              <span className="price-new">{formatPrice(product.current_price)}</span>
              <span className="price-old">{formatPrice(product.old_price)}</span>
            </>
          ) : (
            <span className="price-only">{formatPrice(product.current_price)}</span>
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