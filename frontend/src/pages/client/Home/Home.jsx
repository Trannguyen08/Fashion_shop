import React, { useState, useEffect } from "react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import CategoryItem from "../../../components/CategoryItem/CategoryItem";
import ProductCard from "../../../components/Product/ProductCard";
import Testimonials from "../../../components/Testimonials"; 
import tops from "../../../assets/images/tops.webp";
import bottoms from "../../../assets/images/bottoms.webp";
import caps from "../../../assets/images/caps.jpg";
import bags from "../../../assets/images/bags.jpg";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeProducts = async () => {
    try {
      const response = await fetch("https://127.0.0.1:8000/product/get_home_products/");
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

  useEffect(() => {
    fetchHomeProducts();
  }, []);

  return (
    <div className="homePage">
      <Header />

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

      {/* Categories */}
      <div className="promotions-section">
        <h2 className="section-title">Shop by Categories</h2>
        <div className="categories-grid">
          <CategoryItem image={tops} title="TOP" link="/category/top" />
          <CategoryItem image={bottoms} title="BOTTOM" link="/category/bottom" />
          <CategoryItem image={caps} title="CAP" link="/category/cap" />
          <CategoryItem image={bags} title="BAG" link="/category/bag" />
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
      </div>

      {/* ✅ Testimonials component */}
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

      <Footer />
    </div>
  );
};

export default Home;
