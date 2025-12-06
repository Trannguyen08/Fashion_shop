import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import { Star, TrendingUp } from "lucide-react";
import { formatPrice } from '../../utils/formatUtils';
import './ProductDetail.css';

const ProductDetail = ({ product }) => {
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  
  const { addToCart } = useCartContext();

  useEffect(() => {
    if (product) {
      setMainImage(product.product_img);

      if (product.product_variants?.length > 0) {
        // Khởi tạo màu và kích thước với variant đầu tiên
        setSelectedColor(product.product_variants[0].color);
        setSelectedSize(product.product_variants[0].size);
      }
    }
  }, [product]);

  // Lọc ra danh sách màu sắc duy nhất
  const colors = useMemo(() => {
    if (!product?.product_variants) return [];
    return [...new Set(product.product_variants.map(v => v.color))];
  }, [product]);

  // Lọc ra danh sách kích thước duy nhất
  const sizes = useMemo(() => {
    if (!product?.product_variants) return [];
    return [...new Set(product.product_variants.map(v => v.size))];
  }, [product]);

  // Tìm biến thể hiện tại dựa trên màu và size đã chọn
  const currentVariant = useMemo(() => {
    if (!product?.product_variants) return null;
    return product.product_variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  // 🔥 Lấy danh sách ảnh hiển thị (ảnh sản phẩm chính + ảnh của variant hiện tại)
  const displayImages = useMemo(() => {
    const images = [
      { id: 'main', src: product?.product_img, alt: 'main' }
    ];

    // Thêm ảnh phụ của sản phẩm
    if (product?.product_imgs?.length > 0) {
      product.product_imgs.forEach(img => {
        images.push({ id: `img_${img.id}`, src: img.PI_img, alt: 'product' });
      });
    }

    // Thêm ảnh của variant hiện tại (nếu có)
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

  // 🔥 Tự động chuyển sang ảnh variant khi chọn màu/size
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
            {/* Tag NEW */}
            {product.is_new && (
              <div className="product-new-tag">
                New
              </div>
            )}
            
            <div className="main-image">
              <img src={mainImage} alt={product.name} />
            </div>

            {/* 🔥 Hiển thị ảnh từ displayImages */}
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

            {/* 🔥 Rating và Số lượt bán trên cùng 1 dòng */}
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
    </div>
  );
};

export default ProductDetail;