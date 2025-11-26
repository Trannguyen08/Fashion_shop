import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import useCart from '../../hooks/useCart'
import { Star } from "lucide-react";
import './ProductDetail.css';

const ProductDetail = ({ product }) => {
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    if (product) {
      setMainImage(product.product_img);

      if (product.product_variants?.length > 0) {
        setSelectedColor(product.product_variants[0].color);
        setSelectedSize(product.product_variants[0].size);
      }
    }
  }, [product]);

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

    // Lưu thông tin sản phẩm vào sessionStorage
    const itemForCheckout = {
      id: product.id,
      name: product.name,
      price: product.current_price,
      quantity: quantity,
      image: mainImage,
      color: selectedColor,
      size: selectedSize,
      product_img: product.product_img
    };

    sessionStorage.setItem('checkoutItems', JSON.stringify([itemForCheckout]));
    sessionStorage.setItem('checkoutTotal', JSON.stringify(product.current_price * quantity));

    // Điều hướng đến trang checkout
    navigate('/checkout');
  };

  const handleAddToCart = async () => {
    if (!currentVariant) {
      alert('Vui lòng chọn màu sắc và kích thước');
      return;
    }

    // 📦 Tạo object product
    const productToAdd = {
      id: product.id,
      name: product.name,
      current_price: product.current_price,
      product_img: mainImage,
    };

    // Truyền thêm variantInfo chứa size và color
    const variantInfo = {
      size: selectedSize,
      color: selectedColor,
    };

    // Gọi addToCart với 4 tham số
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
      <Header />
      <div className="product-detail-container">
        <div className="product-detail">

          {/* Nửa trái - Hình ảnh */}
          <div className="product-images-section">
            {/* Tag NEW */}
            {product.is_new && (
              <div className="product-new-tag">
                New
              </div>
            )}
            
            <div className="main-image">
              <img src={mainImage} alt={product.name} />
            </div>
            <div className="thumbnail-images">
              <img
                src={product.product_img}
                alt="main"
                className={mainImage === product.product_img ? 'active' : ''}
                onClick={() => setMainImage(product.product_img)}
              />
              {product.product_images?.map(img => (
                <img
                  key={img.id}
                  src={img.PI_img}
                  alt="product"
                  className={mainImage === img.PI_img ? 'active' : ''}
                  onClick={() => setMainImage(img.PI_img)}
                />
              ))}
            </div>
          </div>

          {/* Nửa phải - Thông tin sản phẩm */}
          <div className="product-info-section">
            <h1 className="product-name">{product.name}</h1>

            <div className="product-rating" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                    {Number.isInteger(product.average_rating)
                    ? product.average_rating
                    : product.average_rating.toFixed(1)}
                </span>

                <div className="rating-stars" style={{ display: "flex", gap: "3px", color: "#facc15" }}>
                    {Array.from({ length: 5 }, (_, i) => (
                    <Star
                        key={i}
                        size={18}
                        fill={i < Math.round(product.average_rating) ? "#facc15" : "none"}
                        stroke="#facc15"
                    />
                    ))}
                </div>
            </div>


            <div className="product-price">
              <span className="current-price">
                {product.current_price?.toLocaleString('vi-VN')}₫
              </span>
              {product.old_price && (
                <span className="old-price">
                  {product.old_price?.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>

            {/* Chọn Màu */}
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

            {/* Chọn Size */}
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

            {/* Stock và Quantity */}
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
                    className="qty-input"
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

            {/* Nút hành động */}
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleBuyNow}>
                Mua ngay
              </button>
              <button className="btn btn-secondary" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
            </div>

            {/* Mô tả sản phẩm */}
            <div className="product-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;