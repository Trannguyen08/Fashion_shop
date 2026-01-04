import React, { useState, useEffect } from "react";
import ProductCard from "../../components/Product/ProductCard";
import VoucherCard from "../../components/VoucherCard"; // ← Import VoucherCard có sẵn
import Testimonials from "../../components/Testimonials"; 
import ChatWidget from "../../components/ChatWidget";
import { Link } from "react-router-dom";
import { FaShippingFast, FaUndo, FaShieldAlt, FaHeadset, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Home.css";

const GET_VOUCHERS_URL = 'http://127.0.0.1:8000/voucher/get-voucher-active/';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voucherLoading, setVoucherLoading] = useState(true);
  const [voucherIndex, setVoucherIndex] = useState(0);
  
  // Flash Sale Countdown State
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 30
  });

  const fetchHomeProducts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/product/get_home_products/");
      const data = await response.json();
      setFeaturedProducts(data.featured);
      setNewArrivals(data.new);
      setTestimonials(data.reviews);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await fetch(GET_VOUCHERS_URL);
      const data = await response.json();
      setVouchers(data.data || []);
    } catch (error) {
      console.error("Lỗi khi tải voucher:", error);
    } finally {
      setVoucherLoading(false);
    }
  };

  // Countdown Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchHomeProducts();
    fetchVouchers();
  }, []);

  // Voucher Slider Functions
  const voucherItemsPerPage = 3;
  
  const handleVoucherPrev = () => {
    setVoucherIndex((prev) => 
      prev === 0 ? Math.max(0, vouchers.length - voucherItemsPerPage) : prev - 1
    );
  };

  const handleVoucherNext = () => {
    setVoucherIndex((prev) => 
      prev >= vouchers.length - voucherItemsPerPage ? 0 : prev + 1
    );
  };

  const visibleVouchers = vouchers.slice(voucherIndex, voucherIndex + voucherItemsPerPage);
  const canGoPrev = voucherIndex > 0;
  const canGoNext = voucherIndex < vouchers.length - voucherItemsPerPage;

  return (
    <div className="homePage">

      {/* Banner */}
      <div className="banner-box">
        <div className="banner-content">
          <h1 className="banner-title">Premium Products for Your Lifestyle</h1>
          <p className="banner-subtitle">
            Discover our exclusive collection of high-quality fashion items designed to elevate your everyday look.
          </p>
          <Link to="/shop">
            <button className="banner-button">Shop Now</button>
          </Link>
        </div>
      </div>

      {/* ===== VOUCHER SECTION ===== */}
      {!voucherLoading && vouchers.length > 0 && (
        <div className="voucher-section">
          <h2 className="section-title">🎟️ Mã Giảm Giá Hấp Dẫn</h2>
          <p className="section-subtitle">Áp dụng ngay để nhận ưu đãi tốt nhất!</p>

          <div className="voucher-slider-wrapper">
            {/* Previous Button */}
            {canGoPrev && (
              <button 
                className="voucher-nav-btn voucher-prev-btn" 
                onClick={handleVoucherPrev}
                aria-label="Previous vouchers"
              >
                <FaChevronLeft size={24} />
              </button>
            )}

            {/* Voucher List */}
            <div className="voucher-list-container">
              <div className="voucher-list">
                {visibleVouchers.map((voucher) => (
                  <VoucherCard key={voucher.id} voucher={voucher} />
                ))}
              </div>
            </div>

            {/* Next Button */}
            {canGoNext && (
              <button 
                className="voucher-nav-btn voucher-next-btn" 
                onClick={handleVoucherNext}
                aria-label="Next vouchers"
              >
                <FaChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Dots Indicator */}
          {vouchers.length > voucherItemsPerPage && (
            <div className="voucher-dots">
              {Array.from({ length: Math.ceil(vouchers.length / voucherItemsPerPage) }).map((_, idx) => (
                <button
                  key={idx}
                  className={`voucher-dot ${Math.floor(voucherIndex / voucherItemsPerPage) === idx ? 'active' : ''}`}
                  onClick={() => setVoucherIndex(idx * voucherItemsPerPage)}
                  aria-label={`Go to voucher slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== WHY CHOOSE US SECTION ===== */}
      <div className="why-choose-us-section">
        <h2 className="section-title">Vì sao chọn chúng tôi?</h2>
        <p className="section-subtitle">Cam kết mang đến trải nghiệm mua sắm tốt nhất</p>
        
        <div className="usp-grid">
          <div className="usp-item">
            <div className="usp-icon-wrapper">
              <FaShippingFast className="usp-icon" />
            </div>
            <h4 className="usp-title">Giao hàng nhanh chóng</h4>
            <p className="usp-description">
              Giao hàng toàn quốc trong 2-5 ngày. 
              Miễn phí ship cho đơn hàng từ 500.000đ
            </p>
          </div>

          <div className="usp-item">
            <div className="usp-icon-wrapper">
              <FaUndo className="usp-icon" />
            </div>
            <h4 className="usp-title">Đổi trả dễ dàng</h4>
            <p className="usp-description">
              Chính sách đổi trả trong 7 ngày. 
              Hoàn tiền 100% nếu sản phẩm lỗi
            </p>
          </div>

          <div className="usp-item">
            <div className="usp-icon-wrapper">
              <FaShieldAlt className="usp-icon" />
            </div>
            <h4 className="usp-title">Hàng chính hãng 100%</h4>
            <p className="usp-description">
              Cam kết sản phẩm chính hãng. 
              Bảo hành đầy đủ theo quy định
            </p>
          </div>

          <div className="usp-item">
            <div className="usp-icon-wrapper">
              <FaHeadset className="usp-icon" />
            </div>
            <h4 className="usp-title">Hỗ trợ 24/7</h4>
            <p className="usp-description">
              Đội ngũ tư vấn nhiệt tình. 
              Sẵn sàng hỗ trợ mọi lúc mọi nơi
            </p>
          </div>
        </div>
      </div>

      {/* ===== FLASH SALE SECTION ===== */}
      <div className="promotions-section">
        <h2 className="section-title">Flash Sale</h2>
        {loading ? (
          <p className="loading-text">Đang tải sản phẩm flash sale...</p>
        ) : (
          <div className="sale-products-grid">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="flash-sale-footer">
          <Link to="/flash-sale">
            <button className="view-all-btn">Xem tất cả Flash Sale →</button>
          </Link>
        </div>
      </div>

      {/* Featured */}
      <div className="promotions-section">
        <h2 className="section-title">Featured Products</h2>
        {loading ? (
          <p>Đang tải sản phẩm nổi bật...</p>
        ) : (
          <div className="featured-products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="flash-sale-footer">
          <Link to="/shop">
            <button className="view-all-btn">Xem thêm</button>
          </Link>
        </div>
      </div>

      {/* New arrivals */}
      <div className="promotions-section">
        <h2 className="section-title">New Arrivals</h2>
        {loading ? (
          <p>Đang tải sản phẩm mới...</p>
        ) : (
          <div className="new-arrivals-products-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="flash-sale-footer">
          <Link to="/shop">
            <button className="view-all-btn">Xem thêm</button>
          </Link>
        </div>
      </div>

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />

      {/* Newsletter */}
      <div className="newsletter-section">
        <div className="newsletter-content">
          <h2 className="newsletter-title">Subscribe to Our Newsletter</h2>
          <p className="newsletter-subtitle">
            Get the latest updates on new products, exclusive offers, and shopping tips delivered straight to your inbox.
          </p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" className="newsletter-input" />
            <button className="newsletter-button">Subscribe</button>
          </div>
        </div>
      </div>

      <ChatWidget />

    </div>
  );
};

export default Home;