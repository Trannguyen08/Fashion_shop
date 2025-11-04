import React from "react";
import "./Footer.css";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1: About Shop */}
        <div className="footer-column">
          <h3 className="footer-logo">LocalBrand</h3>
          <p className="footer-description">
            Your trusted destination for quality fashion. We bring you the latest trends 
            and timeless classics with exceptional service and style.
          </p>
          <div className="social-icons">
            <a href="#" className="social-icon" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" className="social-icon" aria-label="Youtube">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#shop">Shop</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Customer Service */}
        <div className="footer-column">
          <h4 className="footer-title">Customer Service</h4>
          <ul className="footer-links">
            <li><a href="#faqs">FAQs</a></li>
            <li><a href="#shipping">Shipping Policy</a></li>
            <li><a href="#return">Return Policy</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div className="footer-column">
          <h4 className="footer-title">Contact Us</h4>
          <ul className="footer-contact">
            <li>
              <MapPin size={18} />
              <span>123 Fashion Street, District 1, Ho Chi Minh City</span>
            </li>
            <li>
              <Phone size={18} />
              <span>Hotline: 1900 1234</span>
            </li>
            <li>
              <Mail size={18} />
              <span>support@localbrand.com</span>
            </li>
            <li>
              <Clock size={18} />
              <span>Mon - Sat: 8:00 AM - 10:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© 2025 LocalBrand. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;