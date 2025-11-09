import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ProductCard from './ProductCard'; 
import './ProductGrid.css'; 

const ITEMS_PER_PAGE = 32;

const colors = ["Đen", "Trắng", "Đỏ", "Xanh dương", "Nâu", "Xám", "Vàng", "Hồng", "Xanh lá"];
const sizes = ["S", "M", "L", "XL", "OS", "38", "40"];
const names = [
  "Áo phông Basic", "Quần Jeans Slim", "Giày Sneaker", "Váy maxi hoa", "Hoodie", "Túi xách da",
  "Kính râm", "Áo khoác gió", "Mũ lưỡi trai", "Bộ đồ ngủ", "Thắt lưng", "Khăn len",
  "Áo sơ mi", "Quần short", "Đồng hồ", "Balo du lịch", "Áo len", "Áo Blouse", "Sandal", "Túi đeo chéo"
];

export const initialProducts = [];
const categories = ["Tops", "Bottoms", "Shoes", "Accessories"];

for (let i = 1; i <= 200; i++) {
  const color = colors[i % colors.length];
  const size = sizes[i % sizes.length];
  const baseName = names[i % names.length];
  const price = Math.floor(200 + (i % 10) * 50 + Math.random() * 30);
  const category = categories[i % categories.length];
  const rating = (Math.random() * 5).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 200) + 10;
  const stock = Math.floor(Math.random() * 50) + 5;
  const status = stock > 0 ? "available" : "out_of_stock";
  const createdAt = new Date(Date.now() - i * 86400000).toISOString();

  // ảnh đại diện sản phẩm
  const product_img = `https://placehold.co/300x300/${(i * 654321)
    .toString(16)
    .slice(0, 6)}/fff?text=Product-${i}`;

  // nhiều ảnh con (product_imgs)
  const product_imgs = Array.from({ length: 3 }, (_, j) => ({
    id: j + 1,
    PI_img: `https://placehold.co/300x300/${(
      i * (j + 1) * 111111
    )
      .toString(16)
      .slice(0, 6)}/fff?text=Img-${i}-${j + 1}`,
  }));

  // nhiều biến thể (product_variants)
  const product_variants = Array.from({ length: 2 }, (_, j) => ({
    id: j + 1,
    sku: `SKU-${i}-${j + 1}`,
    size: sizes[(i + j) % sizes.length],
    color: colors[(i + j) % colors.length],
    stock_quantity: Math.floor(Math.random() * 20) + 1,
    PV_img: `https://placehold.co/150x150/${(
      i * (j + 5) * 333333
    )
      .toString(16)
      .slice(0, 6)}/fff?text=Var-${i}-${j + 1}`,
    status: Math.random() > 0.2 ? "available" : "out_of_stock",
  }));

  initialProducts.push({
    id: i,
    name: `${baseName} #${i}`,
    old_price: i % 3 === 0 ? price * 1000 : null,
    current_price: price * 900,
    description: `Mẫu sản phẩm ${baseName.toLowerCase()} chất lượng cao, màu ${color}, size ${size}.`,
    stock_quantity: stock,
    status,
    product_img,
    is_featured: i % 7 === 0,
    is_new: i % 5 === 0,
    average_rating: parseFloat(rating),
    created_at: createdAt,
    category_name: category,
    product_imgs,
    product_variants,
  });
}


const priceRanges = [
  { label: 'Dưới 100.000', min: 0, max: 99 },
  { label: '100.000 - 200.000', min: 100, max: 200 },
  { label: '201.000 - 300.000', min: 201, max: 300 },
  { label: '301.000 - 400.000', min: 301, max: 400 },
  { label: '401.000 - 500.000', min: 401, max: 500 },
  { label: 'Trên 500.000', min: 501, max: Infinity },
];

const allColors = ['Đen', 'Xanh dương', 'Trắng', 'Đỏ', 'Xám', 'Nâu', 'Xanh lá', 'Vàng', 'Hồng'];
const allSizes = ['S', 'M', 'L', 'XL', '40', 'OS'];

const ProductGrid = () => {
  const [products] = useState(initialProducts);
  const [filters, setFilters] = useState({
    color: [],
    size: [],
    price: [],
    sort: 'newest',
  });
  const [openFilter, setOpenFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const filterBarRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.color, filters.size, filters.price, filters.sort]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterToggle = (filterType, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[filterType] || [];
      
      if (filterType === 'sort') {
        return { ...prevFilters, [filterType]: value };
      }
      
      const isSelected = currentValues.includes(value);
      const newValues = isSelected
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];

      return { ...prevFilters, [filterType]: newValues };
    });
  };

  const toggleDropdown = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const filterByPrice = useCallback((product) => {
    if (filters.price.length === 0) return true;

    const currentPriceInK = product.price;
    
    return filters.price.some(label => {
      const range = priceRanges.find(r => r.label === label);
      if (!range) return false;
      return currentPriceInK >= range.min && currentPriceInK <= range.max;
    });
  }, [filters.price]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      if (filters.color.length > 0 && !filters.color.includes(product.color)) return false;
      if (filters.size.length > 0 && !filters.size.includes(product.size)) return false;
      if (!filterByPrice(product)) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'newest':
        default:
          return 0;
      }
    });

    return result;
  }, [products, filters.color, filters.size, filters.sort, filterByPrice]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  }, [filteredProducts.length]);

  const productList = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const getPageNumbers = useCallback(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage === totalPages) {
      return [1, '...', totalPages - 1, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    if (currentPage <= 2) {
      return [1, 2, 3, '...', totalPages];
    }

    if (currentPage > 2 && currentPage < totalPages - 2) {
      return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }

    return [1, 2, '...', totalPages];
  }, [totalPages, currentPage]);

  return (
    <div className="product-grid-container">
      <div className="filter-bar" ref={filterBarRef}>
        <div className="filter-group-left">
          {/* Lọc Màu */}
          <div className="filter-item">
            <button className="filter-button" onClick={() => toggleDropdown('color')}>Màu Sắc▾</button>
            {openFilter === 'color' && (
              <div className="filter-dropdown">
                {allColors.map(color => (
                  <label key={color} className={`filter-option ${filters.color.includes(color) ? 'is-selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={filters.color.includes(color)} 
                      onChange={() => handleFilterToggle('color', color)} 
                    />
                    <span className="checkbox-round"></span>
                    {color}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Lọc Kích Thước */}
          <div className="filter-item">
            <button className="filter-button" onClick={() => toggleDropdown('size')}>Kích Thước▾</button>
            {openFilter === 'size' && (
              <div className="filter-dropdown">
                {allSizes.map(size => (
                  <label key={size} className={`filter-option ${filters.size.includes(size) ? 'is-selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={filters.size.includes(size)} 
                      onChange={() => handleFilterToggle('size', size)} 
                    />
                    <span className="checkbox-round"></span>
                    {size}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Lọc Giá */}
          <div className="filter-item">
            <button className="filter-button" onClick={() => toggleDropdown('price')}>Lọc Giá▾</button>
            {openFilter === 'price' && (
              <div className="filter-dropdown">
                {priceRanges.map(range => (
                  <label key={range.label} className={`filter-option ${filters.price.includes(range.label) ? 'is-selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={filters.price.includes(range.label)} 
                      onChange={() => handleFilterToggle('price', range.label)} 
                    />
                    <span className="checkbox-round"></span>
                    {range.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sắp xếp */}
        <div className="filter-group-right">
          <div className="sort-item">
            <label htmlFor="sort-select" className="sort-label">Sắp xếp:</label>
            <select
              id="sort-select"
              className="sort-select"
              value={filters.sort}
              onChange={(e) => handleFilterToggle('sort', e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách Sản phẩm */}
      <div className="product-list">
        {productList.length > 0 ? (
          productList.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="no-products">Không tìm thấy sản phẩm phù hợp.</p>
        )}
      </div>

      {/* Phân Trang */}
      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 1 && (
            <button className="pagination-btn" onClick={goToPrevPage}>
              &larr; Trang Trước
            </button>
          )}

          <div className="page-numbers">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="page-ellipsis">...</span>
                ) : (
                  <button
                    className={`page-number ${page === currentPage ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {currentPage < totalPages && (
            <button className="pagination-btn" onClick={goToNextPage}>
              Trang Sau &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;