import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const Testimonials = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          fill={i <= rating ? "#FFD700" : "none"}
          stroke={i <= rating ? "#FFD700" : "#ddd"}
        />
      );
    }
    return stars;
  };

  const nextSlide = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlay || testimonials.length === 0) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlay, testimonials.length]);

  if (testimonials.length === 0) {
    return <p>Chưa có đánh giá nào.</p>;
  }

  const current = testimonials[currentIndex];

  return (
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
              <img src={current.avatar_img} alt={current.full_name} />
            </div>
            <h4 className="testimonial-name">{current.full_name}</h4>
            <div className="testimonial-rating">{renderStars(current.rating)}</div>
            <p className="testimonial-comment">"{current.comment}"</p>
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
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
