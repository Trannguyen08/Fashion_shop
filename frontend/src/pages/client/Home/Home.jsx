import React, { useState, useEffect } from "react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import CategoryItem from "../../../components/CategoryItem/CategoryItem";
import ProductCard from "../../../components/ProductCard/ProductCard";
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import tops from "../../../assets/images/tops.webp";
import bottoms from "../../../assets/images/bottoms.webp";
import caps from "../../../assets/images/caps.jpg";
import bags from "../../../assets/images/bags.jpg";
import { Link } from "react-router-dom"
import "./Home.css";

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const featuredProducts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      name: "Classic White T-Shirt Premium Cotton",
      newPrice: 299000,
      oldPrice: 499000,
      rating: 5,
      reviewCount: 245,
      isFeatured: true
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      name: "Denim Jeans Slim Fit Blue",
      newPrice: 799000,
      oldPrice: 1200000,
      rating: 4,
      reviewCount: 189,
      isFeatured: true
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
      name: "Baseball Cap Streetwear Black",
      oldPrice: 350000,
      rating: 4,
      reviewCount: 67,
      isFeatured: true
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      name: "Leather Backpack Urban Style",
      newPrice: 1290000,
      oldPrice: 1890000,
      rating: 5,
      reviewCount: 312,
      isFeatured: true
    }
  ];

  const newArrivals = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      name: "Classic White T-Shirt Premium Cotton",
      newPrice: 299000,
      oldPrice: 499000,
      rating: 5,
      reviewCount: 245,
      isNew: true
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      name: "Denim Jeans Slim Fit Blue",
      newPrice: 799000,
      oldPrice: 1200000,
      rating: 4,
      reviewCount: 189,
      isNew: true
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
      name: "Baseball Cap Streetwear Black",
      oldPrice: 350000,
      rating: 4,
      reviewCount: 67,
      isNew: true
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      name: "Leather Backpack Urban Style",
      newPrice: 1290000,
      oldPrice: 1890000,
      rating: 5,
      reviewCount: 312,
      isNew: true
    }
  ];

  const testimonials = [
    {
      id: 1,
      avatar: "https://i.pravatar.cc/150?img=1",
      name: "Nguyễn Minh Anh",
      rating: 5,
      comment: "Sản phẩm rất chất lượng, vải mềm mại và form dáng đẹp. Mình đã mua 3 chiếc và sẽ tiếp tục ủng hộ shop!"
    },
    {
      id: 2,
      avatar: "https://i.pravatar.cc/150?img=5",
      name: "Trần Văn Bình",
      rating: 5,
      comment: "Giao hàng nhanh, đóng gói cẩn thận. Áo đẹp hơn ảnh, giá cả hợp lý. Highly recommended!"
    },
    {
      id: 3,
      avatar: "https://i.pravatar.cc/150?img=9",
      name: "Lê Thị Cẩm",
      rating: 4,
      comment: "Shop tư vấn nhiệt tình, sản phẩm đúng mô tả. Chỉ có điều size hơi nhỏ một chút so với bảng size."
    },
    {
      id: 4,
      avatar: "https://i.pravatar.cc/150?img=12",
      name: "Phạm Hoàng Dũng",
      rating: 5,
      comment: "Lần đầu mua hàng online mà hài lòng đến vậy. Chất liệu vải tốt, không xù lông, không phai màu!"
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          fill={i <= rating ? '#FFD700' : 'none'}
          stroke={i <= rating ? '#FFD700' : '#ddd'}
        />
      );
    }
    return stars;
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlay]);

  return (
    <div className="homePage">
      <Header />

      {/* Banner Section */}
      <div className="banner-box">
        <div className="banner-content">
          <h1 className="banner-title">Preminum Products for Your Lifestyle</h1>
          <p className="banner-subtitle">Discover our exclusive collection of high-quality fashion items designed to elevate your everyday look.</p>
          <Link to="/shop"><button className="banner-button">Shop Now</button></Link>
        </div>
      </div>

      {/* Shop by Categories Section */}
      <div className="promotions-section">
        <h2 className="section-title">Shop by Categories</h2>
        <div className="categories-grid">
          <CategoryItem image={tops} title="TOP" onView={() => console.log('View Top')} />
          <CategoryItem image={bottoms} title="BOTTOM" onView={() => console.log('View Bottom')} />
          <CategoryItem image={caps} title="CAP" onView={() => console.log('View Cap')} />
          <CategoryItem image={bags} title="BAG" onView={() => console.log('View Bag')} />
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="promotions-section">
        <h2 className="section-title">Featured Products</h2>
        <div className="featured-products-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="promotions-section">
        <h2 className="section-title">New Arrivals</h2>
        <div className="new-arrivals-products-grid">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Customer Testimonials Section */}
      <div className="promotions-section">
        <h2 className="section-title">What our customers say</h2>
        
        <div className="testimonials-container">
          <div className="testimonials-slider">
            <button 
              className="slider-btn prev-btn" 
              onClick={prevSlide}
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="testimonial-card">
              <div className="testimonial-avatar">
                <img 
                  src={testimonials[currentIndex].avatar} 
                  alt={testimonials[currentIndex].name} 
                />
              </div>

              <h4 className="testimonial-name">
                {testimonials[currentIndex].name}
              </h4>

              <div className="testimonial-rating">
                {renderStars(testimonials[currentIndex].rating)}
              </div>

              <p className="testimonial-comment">
                "{testimonials[currentIndex].comment}"
              </p>
            </div>

            <button 
              className="slider-btn next-btn" 
              onClick={nextSlide}
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="slider-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="newsletter-content">
          <h2 className="newsletter-title">Subscribe to Our Newsletter</h2>
          <p className="newsletter-subtitle">
            Get the latest updates on new products, exclusive offers, and shopping tips delivered straight to your inbox.
          </p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="newsletter-input"
            />
            <button className="newsletter-button">Subscribe</button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;