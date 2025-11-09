import React, { useState } from "react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/contact/send_message/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contactPage">
      <Header />

      {/* Banner */}
      <div className="contact-banner">
        <div className="contact-banner-content">
          <h1 className="contact-banner-title">Liên Hệ Với Chúng Tôi</h1>
          <p className="contact-banner-subtitle">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-container">
        <div className="contact-info-section">
          <h2 className="contact-section-title">Thông Tin Liên Hệ</h2>
          
          <div className="contact-info-box">
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <h3>Địa Chỉ</h3>
                <p>123 Đường Fashion, Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-content">
                <h3>Điện Thoại</h3>
                <p>+84 (0) 123 456 789</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-content">
                <h3>Email</h3>
                <p>support@fashionstore.com</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">⏰</div>
              <div className="info-content">
                <h3>Giờ Làm Việc</h3>
                <p>Thứ 2 - Thứ 6: 9:00 - 18:00</p>
                <p>Thứ 7 - Chủ nhật: 10:00 - 17:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <h2 className="contact-section-title">Gửi Tin Nhắn Cho Chúng Tôi</h2>

          {submitted && (
            <div className="success-message">
              ✓ Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn của bạn và sẽ liên hệ trong thời gian sớm nhất.
            </div>
          )}

          <div className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Họ Và Tên</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Nhập tên của bạn"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số Điện Thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0123 456 789"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Chủ Đề</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                placeholder="Chủ đề của tin nhắn"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Tin Nhắn</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                placeholder="Nhập tin nhắn của bạn..."
                rows="6"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi Tin Nhắn"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;