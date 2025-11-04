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
          <Link 
            to="/shop" 
            className={`nav-link ${location.pathname.startsWith('/shop') ? 'active' : ''}`}
          >
            Shop
          </Link>
          {showDropdown && (
            <ul className={`dropdown-menu show`}>
              <li><Link to="/shop/shirt">Shirt</Link></li>
              <li><Link to="/shop/t-shirt">T-shirt</Link></li>
              <li><Link to="/shop/polo">Polo</Link></li>
              <li><Link to="/shop/pants">Pants</Link></li>
              <li><Link to="/shop/short">Short</Link></li>
              <li><Link to="/shop/jacket">Jacket</Link></li>
              <li><Link to="/shop/hoodies">Hoodies</Link></li>
              <li><Link to="/shop/cardigan">Cardigan</Link></li>
            </ul>
          )}
        </li>

        <li>
          <Link 
            to="/best-seller" 
            className={`nav-link ${location.pathname === '/best-seller' ? 'active' : ''}`}
          >
            Best Seller
          </Link>
        </li>

        <li>
          <Link 
            to="/new-arrival" 
            className={`nav-link ${location.pathname === '/new-arrival' ? 'active' : ''}`}
          >
            New Arrival
          </Link>
        </li>

        <li>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About
          </Link>
        </li>

        <li>
          <Link 
            to="/contact" 
            className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            Contact
          </Link>
        </li>
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
