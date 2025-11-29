import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ProductCard from './ProductCard'; 
import './ProductGrid.css'; 

const ITEMS_PER_PAGE = 32;

// Các filter cố định
const priceRanges = [
  { label: 'Dưới 100.000', min: 0, max: 99000 },
  { label: '100.000 - 200.000', min: 100000, max: 200000 },
  { label: '201.000 - 300.000', min: 201000, max: 300000 },
  { label: '301.000 - 400.000', min: 301000, max: 400000 },
  { label: '401.000 - 500.000', min: 401000, max: 500000 },
  { label: 'Trên 500.000', min: 500000, max: Infinity },
];

const allColors = ['Đen', 'Xanh dương', 'Trắng', 'Đỏ', 'Xám', 'Nâu', 'Xanh lá', 'Vàng', 'Hồng'];
const allSizes = ['S', 'M', 'L', 'XL', '40', 'OS'];

const ProductGrid = ({ products = [] }) => {
  const [filters, setFilters] = useState({
    color: [],
    size: [],
    price: [],
    sort: 'newest',
  });

  const [openFilter, setOpenFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filterBarRef = useRef(null);

  // Reset về page 1 khi đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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

  // Toggle filter
  const handleFilterToggle = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType] || [];

      if (filterType === 'sort') {
        return { ...prev, sort: value };
      }

      const newValues = currentValues.includes(value)
        ? currentValues.filter(x => x !== value)
        : [...currentValues, value];

      return { ...prev, [filterType]: newValues };
    });
  };

  const toggleDropdown = (key) => {
    setOpenFilter(openFilter === key ? null : key);
  };

  // Filter theo giá
  const filterByPrice = useCallback(
    (product) => {
      if (filters.price.length === 0) return true;

      return filters.price.some(label => {
        const range = priceRanges.find(r => r.label === label);
        if (!range) return false;

        const price = product.current_price || 0;
        return price >= range.min && price <= range.max;
      });
    },
    [filters.price]
  );

  // Tổng hợp filter
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (filters.color.length > 0 && !filters.color.includes(p.color)) return false;
        if (filters.size.length > 0 && !filters.size.includes(p.size)) return false;
        if (!filterByPrice(p)) return false;
        return true;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case 'price_asc':
            return (a.current_price || 0) - (b.current_price || 0);
          case 'price_desc':
            return (b.current_price || 0) - (a.current_price || 0);
          case 'newest':
          default:
            return 0;
        }
      });
  }, [products, filters, filterByPrice]);

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const productList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // Tính số trang hiển thị
  const getPageNumbers = () => {
    if (totalPages <= 5) return [...Array(totalPages).keys()].map(n => n + 1);

    if (currentPage <= 2) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 1) return [1, '...', totalPages - 2, totalPages - 1, totalPages];

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="product-grid-container">

      {/* Filter bar */}
      <div className="filter-bar" ref={filterBarRef}>
        <div className="filter-group-left">

          {/* Lọc màu */}
          <div className="filter-item">
            <button className="filter-button" onClick={() => toggleDropdown('color')}>Màu sắc▾</button>
            {openFilter === 'color' && (
              <div className="filter-dropdown">
                {allColors.map(color => (
                  <label key={color} className={`filter-option ${filters.color.includes(color) ? 'is-selected' : ''}`}>
                    <input type="checkbox" checked={filters.color.includes(color)} onChange={() => handleFilterToggle('color', color)} />
                    <span className="checkbox-round"></span>
                    {color}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Lọc size */}
          <div className="filter-item">
            <button className="filter-button" onClick={() => toggleDropdown('size')}>Kích thước▾</button>
            {openFilter === 'size' && (
              <div className="filter-dropdown">
                {allSizes.map(size => (
                  <label key={size} className={`filter-option ${filters.size.includes(size) ? 'is-selected' : ''}`}>
                    <input type="checkbox" checked={filters.size.includes(size)} onChange={() => handleFilterToggle('size', size)} />
                    <span className="checkbox-round"></span>
                    {size}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Lọc giá */}
          <div className="filter-item">
            <button className="filter-button" onClick={() => toggleDropdown('price')}>Lọc giá▾</button>
            {openFilter === 'price' && (
              <div className="filter-dropdown">
                {priceRanges.map(range => (
                  <label key={range.label} className={`filter-option ${filters.price.includes(range.label) ? 'is-selected' : ''}`}>
                    <input type="checkbox" checked={filters.price.includes(range.label)} onChange={() => handleFilterToggle('price', range.label)} />
                    <span className="checkbox-round"></span>
                    {range.label}
                  </label>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sort */}
        <div className="filter-group-right">
          <div className="sort-item">
            <label className="sort-label">Sắp xếp:</label>
            <select className="sort-select" value={filters.sort} onChange={(e) => handleFilterToggle('sort', e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="product-list">
        {productList.length > 0 ? (
          productList.map(item => (
            <ProductCard key={item.id} product={item} />
          ))
        ) : (
          <p className="no-products">Không tìm thấy sản phẩm phù hợp.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 1 && <button className="pagination-btn" onClick={goToPrevPage}>← Trang Trước</button>}

          <div className="page-numbers">
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={i} className="page-ellipsis">...</span>
              ) : (
                <button key={i} className={`page-number ${p === currentPage ? 'active' : ''}`} onClick={() => goToPage(p)}>
                  {p}
                </button>
              )
            )}
          </div>

          {currentPage < totalPages && <button className="pagination-btn" onClick={goToNextPage}>Trang Sau →</button>}
        </div>
      )}

    </div>
  );
};

export default ProductGrid;
