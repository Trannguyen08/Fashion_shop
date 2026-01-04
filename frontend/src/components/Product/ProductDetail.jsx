import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import { Star, TrendingUp } from "lucide-react";
import { formatPrice } from '../../utils/formatUtils';
import userImage from '../../assets/images/user.png';
import axios from 'axios';
import './ProductDetail.css';

const ProductDetail = ({ product }) => {
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const { addToCart } = useCartContext();

  useEffect(() => {
    if (product) {
      setMainImage(product.product_img);

      if (product.product_variants?.length > 0) {
        setSelectedColor(product.product_variants[0].color);
        setSelectedSize(product.product_variants[0].size);
      }

      // Fetch reviews
      fetchReviews(product.id);
    }
  }, [product]);

  const fetchReviews = async (productId) => {
    setLoadingReviews(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/review/all-reviews/${productId}/`);
      console.log('Fetched reviews:', response.data);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const colors = useMemo(() => {
    if (!product?.product_variants) return [];
    return [...new Set(product.product_variants.map(v => v.color))];
  }, [product]);

  const sizes = useMemo(() => {
    if (!product?.product_variants) return [];
    return [...new Set(product.product_variants.map(v => v.size))];
  }, [product]);

  const currentVariant = useMemo(() => {
    if (!product?.product_variants) return null;
    return product.product_variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  const displayImages = useMemo(() => {
    const images = [
      { id: 'main', src: product?.product_img, alt: 'main' }
    ];

    if (product?.product_imgs?.length > 0) {
      product.product_imgs.forEach(img => {
        images.push({ id: `img_${img.id}`, src: img.PI_img, alt: 'product' });
      });
    }

    if (currentVariant?.variant_img) {
      images.push({
        id: `variant_${currentVariant.id}`,
        src: currentVariant.variant_img,
        alt: `${currentVariant.color} - ${currentVariant.size}`,
        isVariant: true
      });
    }

    return images;
  }, [product, currentVariant]);

  useEffect(() => {
    if (currentVariant?.variant_img) {
      setMainImage(currentVariant.variant_img);
    } else {
      setMainImage(product?.product_img);
    }
  }, [currentVariant, product]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setQuantity(1);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    const maxStock = currentVariant?.stock_quantity || 0;
    if (newQty >= 1 && newQty <= maxStock) {
      setQuantity(newQty);
    }
  };

  const handleBuyNow = () => {
    if (!currentVariant) {
      alert('Vui lòng chọn màu sắc và kích thước');
      return;
    }

    const itemForCheckout = {
        id: product.id, 
        product_name: product.name,
        product_img: mainImage, 
        product_variant_id: currentVariant.id, 
        size: selectedSize,
        color: selectedColor,
        price: product.current_price, 
        quantity: quantity,
        total_price: product.current_price * quantity 
    };

    sessionStorage.setItem('checkoutItems', JSON.stringify([itemForCheckout]));
    sessionStorage.setItem('checkoutTotal', JSON.stringify(product.current_price * quantity));

    navigate('/checkout', {
        state: {
            items: [itemForCheckout],
            total: product.current_price * quantity
        }
    });
  };

  const handleAddToCart = async () => {
    if (!currentVariant) {
      alert('Vui lòng chọn màu sắc và kích thước');
      return;
    }

    const productToAdd = {
      id: product.id,
      name: product.name,
      current_price: product.current_price,
      product_img: mainImage,
    };

    const variantInfo = {
      size: selectedSize,
      color: selectedColor,
    };

    const success = await addToCart(
      productToAdd,
      currentVariant.id, 
      quantity,
      variantInfo 
    );

    if (success) {
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
      setQuantity(1);
    }
  };

  if (!product) {
    return (
      <div className="product-detail-container">
        <p>Sản phẩm không tồn tại</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'hidden' }}>
      <div className="product-detail-container">
        <div className="product-detail">

          {/* Nửa trái - Hình ảnh */}
          <div className="product-images-section">
            {product.is_new && (
              <div className="product-new-tag">
                New
              </div>
            )}
            
            <div className="main-image">
              <img src={mainImage} alt={product.name} />
            </div>

            <div className="thumbnail-images">
              {displayImages.map(img => (
                <div key={img.id} className="thumbnail-wrapper">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className={`${mainImage === img.src ? 'active' : ''} ${img.isVariant ? 'variant-thumb' : ''}`}
                    onClick={() => setMainImage(img.src)}
                  />
                  {img.isVariant && (
                    <span className="variant-badge">Variant</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nửa phải - Thông tin sản phẩm */}
          <div className="product-info-section">
            <h1 className="product-name2">
              {product.name}
              {currentVariant?.sku && (
                <span className="product-sku"> | SKU: {currentVariant.sku}</span>
              )}
            </h1>

            <div className="product-stats">
              <div className="product-rating">
                <span className="rating-number">
                  {Number.isInteger(product.average_rating)
                    ? product.average_rating
                    : product.average_rating?.toFixed(1) || 0}
                </span>

                <div className="rating-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.round(product.average_rating || 0) ? "#facc15" : "none"}
                      stroke="#facc15"
                    />
                  ))}
                </div>
              </div>

              <div className="product-divider"></div>

              <div className="product-sold">
                <TrendingUp size={18} />
                <span>Đã bán: <strong>{product.total_sold || 0}</strong></span>
              </div>
            </div>

            <div className="product-price">
              <span className="current-price">
                {formatPrice(product.current_price)}
              </span>
              {product.old_price && (
                <span className="old-price">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>

            <div className="selector-group">
              <label className="selector-label">Màu sắc:</label>
              <div className="color-options">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-option ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="selector-group">
              <label className="selector-label">Kích thước:</label>
              <div className="size-options">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="stock-quantity-group">
              <div>
                <span className="label">Tồn kho: </span>
                <span className="stock-value">
                  {currentVariant?.stock_quantity || 0} sản phẩm
                </span>
              </div>

              <div className="quantity-selector">
                <label className="label">Số lượng:</label>
                <div className="quantity-control">
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="qty-input2"
                    value={quantity}
                    min="1"
                    max={currentVariant?.stock_quantity || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const max = currentVariant?.stock_quantity || 0;
                      if (val >= 1 && val <= max) setQuantity(val);
                    }}
                  />
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (currentVariant?.stock_quantity || 0)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleBuyNow}>
                Mua ngay
              </button>
              <button className="btn btn-secondary" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
            </div>

            <div className="product-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          </div>
        </div>

        {/* 🔥 Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-title">Đánh giá sản phẩm</h2>
          
          {loadingReviews ? (
            <div className="reviews-loading">Đang tải đánh giá...</div>
          ) : reviews.length === 0 ? (
            <div className="reviews-empty">Chưa có đánh giá nào cho sản phẩm này</div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <img
                      src={review.avatar_img || userImage}
                      alt={review.full_name}
                      className="review-avatar"
                      onError={(e) => {
                        e.target.src = userImage;
                      }}
                    />
                    <div className="review-user-info">
                      <div className="review-name">{review.full_name || 'Người dùng'}</div>
                      <div className="review-rating">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? "#facc15" : "none"}
                            stroke="#facc15"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="review-date">
                      {new Date(review.review_date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="review-comment">
                    {review.comment || 'Không có bình luận'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;