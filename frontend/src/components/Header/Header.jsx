import React, { useState, useRef, useEffect } from "react";
import "./Header.css";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import defaultAvatar from "../../assets/images/user.png";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const timeoutRef = useRef(null);
  const location = useLocation();

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

  // ✅ Lấy SỐ LƯỢNG SẢN PHẨM KHÁC NHAU trong giỏ hàng từ localStorage
  useEffect(() => {
    const loadCartCount = () => {
      try {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        // Lấy số lượng items (sản phẩm khác nhau), không phải tổng quantity
        const count = cartData?.items?.length || 0;
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();

    // Theo dõi sự thay đổi giỏ hàng trong localStorage
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
              <li><Link to="/category/shirt">Shirt</Link></li>
              <li><Link to="/category/t-shirt">T-shirt</Link></li>
              <li><Link to="/category/polo">Polo</Link></li>
              <li><Link to="/category/pants">Pants</Link></li>
              <li><Link to="/category/short">Short</Link></li>
              <li><Link to="/category/jacket">Jacket</Link></li>
              <li><Link to="/category/hoodies">Hoodies</Link></li>
              <li><Link to="/category/cardigan">Cardigan</Link></li>
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
          <input type="text" placeholder="Search..." />
          <FaSearch className="search-icon" />
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
