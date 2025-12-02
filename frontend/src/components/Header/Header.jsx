import React, { useState, useRef, useEffect } from "react";
import "./Header.css";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/images/user.png";
import axios from "axios";
import { 
  createCategorySlug, 
  getCachedCategories, 
  setCachedCategories 
} from "../../utils/categoryUtils";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const timeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Kiểm tra user trong localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error("Lỗi khi parse user từ localStorage");
      }
    }
  }, []);

  // ✅ Lấy danh sách categories từ API hoặc cache
  useEffect(() => {
    const fetchCategories = async () => {
      // Kiểm tra cache trước
      const cachedCategories = getCachedCategories();
      if (cachedCategories) {
        setCategories(cachedCategories);
        setLoadingCategories(false);
        console.log("Categories loaded from cache");
        return;
      }

      // Nếu không có cache, gọi API
      try {
        const response = await axios.get("http://127.0.0.1:8000/category/all-category/");
        const categoriesData = response.data.categories || response.data;
        
        setCategories(categoriesData);
        setCachedCategories(categoriesData); // Lưu vào cache
        setLoadingCategories(false);
        console.log("Categories loaded from API:", categoriesData);
      } catch (error) {
        console.error("Lỗi khi lấy categories:", error);
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Lấy SỐ LƯỢNG SẢN PHẨM KHÁC NHAU trong giỏ hàng từ localStorage
  useEffect(() => {
    const loadCartCount = () => {
      try {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        const count = cartData?.items?.length || 0;
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();
    window.addEventListener("storage", loadCartCount);

    return () => {
      window.removeEventListener("storage", loadCartCount);
    };
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 200);
  };

  // ✅ Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    let cleanedQuery = searchQuery.trim().toLowerCase();
    cleanedQuery = cleanedQuery.replace(/\s+/g, ' '); 

    if (cleanedQuery) {
      navigate(`/search?q=${encodeURIComponent(cleanedQuery)}`);
      setSearchQuery(""); 
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        LocalBrand
      </Link>

      {/* ----- NAV LIST ----- */}
      <ul className="nav-list">
        <li
          className="dropdown"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            to="/shop"
            className={`nav-link ${
              location.pathname.startsWith("/shop") ? "active" : ""
            }`}
          >
            Shop
          </Link>
          {showDropdown && (
            <ul className="dropdown-menu show">
              {loadingCategories ? (
                <li className="loading-item">Đang tải...</li>
              ) : categories.length > 0 ? (
                categories.map((category) => {
                  const categoryName = category.name || category.category_name;
                  const categorySlug = category.slug || createCategorySlug(categoryName);
                  
                  return (
                    <li key={category.id || category.category_id}>
                      <Link to={`/category/${categorySlug}`} >
                        {categoryName}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="loading-item">Không có danh mục</li>
              )}
            </ul>
          )}
        </li>

        <li>
          <Link
            to="/best-seller"
            className={`nav-link ${
              location.pathname === "/best-seller" ? "active" : ""
            }`}
          >
            Best Seller
          </Link>
        </li>

        <li>
          <Link
            to="/new-arrival"
            className={`nav-link ${
              location.pathname === "/new-arrival" ? "active" : ""
            }`}
          >
            New Arrival
          </Link>
        </li>

        <li>
          <Link
            to="/about"
            className={`nav-link ${
              location.pathname === "/about" ? "active" : ""
            }`}
          >
            About
          </Link>
        </li>

        <li>
          <Link
            to="/contact"
            className={`nav-link ${
              location.pathname === "/contact" ? "active" : ""
            }`}
          >
            Contact
          </Link>
        </li>
      </ul>

      {/* ----- RIGHT SECTION ----- */}
      <div className="right-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
          />
          <FaSearch className="search-icon" onClick={handleSearch} />
        </div>

        <Link to="/cart" className="cart-icon-container">
          <FaShoppingCart className="icon" />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>

        {user ? (
          <Link to="/profile" className="user-avatar-link">
            <img
              src={user.avatar_img || defaultAvatar}
              alt="avatar"
              className="user-avatar"
            />
          </Link>
        ) : (
          <Link to="/login">
            <FaUser className="icon" />
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;