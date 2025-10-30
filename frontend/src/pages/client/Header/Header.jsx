import React, { useState, useRef } from "react";
import "./Header.css";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <header className="header">
      <Link to="/" className="logo">LocalBrand</Link>

      <ul className="nav-list">
        <li
          className="dropdown"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className="nav-link">Shop</span>
          {showDropdown && (
            <ul className={`dropdown-menu show`}>
              <li>Shirt</li>
              <li>T-shirt</li>
              <li>Polo</li>
              <li>Pants</li>
              <li>Short</li>
              <li>Jacket</li>
              <li>Hoodies</li>
              <li>Cardigan</li>
            </ul>
          )}
        </li>

        <li className="nav-link">Best Seller</li>
        <li className="nav-link">New Arrival</li>
        <li className="nav-link">About</li>
        <li className="nav-link">Contact</li>
      </ul>

      <div className="right-section">
        <div className="search-box">
          <input type="text" placeholder="Search..." />
          <FaSearch className="search-icon" />
        </div>
        <Link to="/cart">
          <FaShoppingCart className="icon" />
        </Link>
        <Link to="/login">
          <FaUser className="icon" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
