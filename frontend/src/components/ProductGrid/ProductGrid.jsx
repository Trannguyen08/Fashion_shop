import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard'; 
import './ProductGrid.css'; 

// Cố định số lượng sản phẩm tối đa trên mỗi trang
const ITEMS_PER_PAGE = 32; // Max 8 dòng * 4 item

// Dữ liệu sản phẩm mẫu
const colors = ["Đen", "Trắng", "Đỏ", "Xanh dương", "Nâu", "Xám", "Vàng", "Hồng", "Xanh lá"];
const sizes = ["S", "M", "L", "XL", "OS", "38", "40"];
const names = [
  "Áo phông Basic", "Quần Jeans Slim", "Giày Sneaker", "Váy maxi hoa", "Hoodie", "Túi xách da",
  "Kính râm", "Áo khoác gió", "Mũ lưỡi trai", "Bộ đồ ngủ", "Thắt lưng", "Khăn len",
  "Áo sơ mi", "Quần short", "Đồng hồ", "Balo du lịch", "Áo len", "Áo Blouse", "Sandal", "Túi đeo chéo"
];

export const initialProducts = [];

for (let i = 1; i <= 200; i++) {
  const color = colors[i % colors.length];
  const size = sizes[i % sizes.length];
  const baseName = names[i % names.length];
  const price = Math.floor(50 + (i % 12) * 50 + Math.random() * 20); // Giá từ 50–650
  const rating = Math.floor(Math.random() * 5) + 1;
  const reviewCount = Math.floor(Math.random() * 200) + 5;

  initialProducts.push({
    id: i,
    name: `${baseName} #${i}`,
    price,
    color,
    size,
    image: `https://placehold.co/300x300/${(i * 123456).toString(16).slice(0,6)}/fff?text=Item-${i}`,
    isNew: i % 5 === 0,
    oldPrice: price * 1000,
    newPrice: i % 3 === 0 ? price * 900 : null,
    rating,
    reviewCount
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
    const [currentPage, setCurrentPage] = useState(1); // Thêm state cho trang hiện tại

    // 1. Reset trang về 1 mỗi khi bộ lọc thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.color, filters.size, filters.price, filters.sort]);

    // Xử lý logic lọc
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

    // Hàm xử lý chung để đóng/mở dropdown lọc
    const toggleDropdown = (filterName) => {
        setOpenFilter(openFilter === filterName ? null : filterName);
    };

    // Xử lý lọc giá (Dùng thuộc tính 'price' là giá đơn vị 'ngàn đồng')
    const filterByPrice = useCallback((product) => {
        if (filters.price.length === 0) return true;

        const currentPriceInK = product.price; 
        
        return filters.price.some(label => {
            const range = priceRanges.find(r => r.label === label);
            if (!range) return false;
            // Dùng <= max để bao gồm cả giá 500k
            return currentPriceInK >= range.min && currentPriceInK <= range.max; 
        });
    }, [filters.price]);

    // 2. Sản phẩm ĐÃ được lọc và sắp xếp
    const filteredProducts = useMemo(() => {
        let result = products.filter(product => {
            if (filters.color.length > 0 && !filters.color.includes(product.color)) return false;
            if (filters.size.length > 0 && !filters.size.includes(product.size)) return false;
            if (!filterByPrice(product)) return false;
            return true;
        });

        // Sắp xếp
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

    // 3. Tính tổng số trang
    const totalPages = useMemo(() => {
        return Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    }, [filteredProducts.length]);

    // 4. Giới hạn danh sách sản phẩm hiển thị theo trang
    const productList = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    // 5. Hàm điều khiển phân trang
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

    // 6. Logic hiển thị số trang
    const getPageNumbers = useCallback(() => {
        // Nếu tổng trang <= 5 thì hiển thị tất cả
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Nếu đang ở trang cuối => chỉ hiển thị trang kế cuối và cuối
        if (currentPage === totalPages) {
            return [1, '...', totalPages - 1, totalPages];
        }

        // Nếu ở gần cuối (vd: 8/10 => hiển thị 1 ... 7 8 9 10)
        if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        // Nếu ở trang 1 hoặc 2
        if (currentPage <= 2) {
            return [1, 2, 3, '...', totalPages];
        }

        // Nếu ở giữa (vd: trang 6 trong 10 => 1 ... 5 6 7 ... 10)
        if (currentPage > 2 && currentPage < totalPages - 2) {
            return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }

        // Trường hợp mặc định (fallback)
        return [1, 2, '...', totalPages];
    }, [totalPages, currentPage]);



    return (
        <div className="product-grid-container">
            <div className="filter-bar">
                <div className="filter-group-left">
                    {/* Lọc Màu */}
                    <div className="filter-item">
                        <button className="filter-button" onClick={() => toggleDropdown('color')}>Màu Sắc▾</button>
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
                    {/* Lọc Kích Thước */}
                    <div className="filter-item">
                        <button className="filter-button" onClick={() => toggleDropdown('size')}>Kích Thước▾</button>
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
                    {/* Lọc Giá */}
                    <div className="filter-item">
                        <button className="filter-button" onClick={() => toggleDropdown('price')}>Lọc Giá▾</button>
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
                
                {/* Lọc Căn Lề Phải (Sort) */}
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
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                        />
                    ))
                ) : (
                    <p className="no-products">Không tìm thấy sản phẩm phù hợp.</p>
                )}
            </div>

            {/* Phân Trang */}
            {totalPages > 1 && (
                <div className="pagination">
                    {/* Nút Previous (Không hiển thị ở trang 1) */}
                    {currentPage > 1 && (
                        <button 
                            className="pagination-btn" 
                            onClick={goToPrevPage}
                        >
                            &larr; Trang Trước
                        </button>
                    )}

                    {/* Số trang */}
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
                    
                    {/* Nút Next (Không hiển thị ở trang cuối) */}
                    {currentPage < totalPages && (
                        <button 
                            className="pagination-btn" 
                            onClick={goToNextPage}
                        >
                            Trang Sau &rarr;
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductGrid;