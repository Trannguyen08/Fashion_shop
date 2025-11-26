import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { FaUpload, FaSignOutAlt, FaEdit, FaLock, FaBox, FaUser, FaKey } from "react-icons/fa";
import defaultAvatar from "../../assets/images/user.png";

// Data tỉnh/thành phố và phường/xã (ví dụ)
const PROVINCES = {
  "HN": { name: "Hà Nội", districts: ["Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy"] },
  "HCM": { name: "TP. Hồ Chí Minh", districts: ["Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5"] },
  "DN": { name: "Đà Nẵng", districts: ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"] },
  "CT": { name: "Cần Thơ", districts: ["Ninh Kiều", "Bình Thủy", "Cờ Đỏ", "Phong Điền", "Vĩnh Thạnh"] },
  "HP": { name: "Hải Phòng", districts: ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Kiến An", "Đồ Sơn"] }
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          province: userData.province || "",
          district: userData.district || "",
          address: userData.address || ""
        });
        
        const storedOrders = localStorage.getItem("orders");
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch (error) {
        console.error("Lỗi khi tải user:", error);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...user, avatar_img: reader.result };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setLoading(false);
        setMessage("Cập nhật ảnh đại diện thành công!");
        setTimeout(() => setMessage(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData(prev => ({ ...prev, province, district: "" }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInfo = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.fullName || !formData.email || !formData.phone) {
      setMessage("Vui lòng điền đầy đủ thông tin cá nhân!");
      setLoading(false);
      return;
    }

    const updatedUser = { ...user, ...formData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setLoading(false);
    setEditMode(false);
    setMessage("Cập nhật thông tin thành công!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("Mật khẩu mới không khớp!");
      setLoading(false);
      return;
    }

    if (passwordData.currentPassword !== user.password) {
      setMessage("Mật khẩu hiện tại không chính xác!");
      setLoading(false);
      return;
    }

    const updatedUser = { ...user, password: passwordData.newPassword };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setLoading(false);
    setMessage("Đổi mật khẩu thành công!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return <div className="profile-loading">Đang tải...</div>;
  }

  const currentProvinceDistricts = formData.province && PROVINCES[formData.province] 
    ? PROVINCES[formData.province].districts 
    : [];

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* SIDEBAR */}
        <aside className="profile-sidebar">
          <div className="avatar-section">
            <img src={user.avatar_img || defaultAvatar} alt="avatar" className="profile-avatar" />
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              <FaUpload /> 
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: "none" }}
            />
          </div>

          <h2 className="profile-name">{user.fullName || "Người dùng"}</h2>
          <p className="profile-email">{user.email}</p>

          <nav className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              <FaUser /> Thông tin
            </button>
            <button
              className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <FaBox /> Đơn hàng
            </button>
            <button
              className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              <FaKey /> Đổi mật khẩu
            </button>
            <button className="tab-btn logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Đăng xuất
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="profile-content">
          {message && <div className="alert alert-success">{message}</div>}

          {/* INFO TAB */}
          {activeTab === "info" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Thông tin tài khoản</h2>
                <button
                  className="edit-btn"
                  onClick={() => setEditMode(!editMode)}
                >
                  <FaEdit /> {editMode ? "Hủy" : "Chỉnh sửa"}
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateInfo} className="form-edit-layout">
                  <div className="form-section">
                    <h3 className="form-section-title">Thông tin cá nhân</h3>
                    
                    <div className="form-group">
                      <label>Họ và tên *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email"
                      />
                    </div>

                    <div className="form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">Địa chỉ giao hàng</h3>

                    <div className="form-group">
                      <label>Tỉnh/Thành phố</label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleProvinceChange}
                      >
                        <option value="">-- Chọn tỉnh/thành phố --</option>
                        {Object.entries(PROVINCES).map(([key, value]) => (
                          <option key={key} value={key}>{value.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Phường/Xã</label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        disabled={!formData.province}
                      >
                        <option value="">-- Chọn phường/xã --</option>
                        {currentProvinceDistricts.map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ cụ thể</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Nhập số nhà, tên đường... (tùy chọn)"
                      />
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </form>
              ) : (
                <div className="info-display">
                  <div className="info-card">
                    <h3>Thông tin cá nhân</h3>
                    <div className="info-item">
                      <span className="label">Họ và tên:</span>
                      <span className="value">{formData.fullName || "Chưa cập nhật"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{formData.email || "Chưa cập nhật"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Số điện thoại:</span>
                      <span className="value">{formData.phone || "Chưa cập nhật"}</span>
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Địa chỉ giao hàng</h3>
                    <div className="info-item">
                      <span className="label">Tỉnh/Thành phố:</span>
                      <span className="value">
                        {formData.province && PROVINCES[formData.province] 
                          ? PROVINCES[formData.province].name 
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phường/Xã:</span>
                      <span className="value">{formData.district || "Chưa cập nhật"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Địa chỉ cụ thể:</span>
                      <span className="value">{formData.address || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="tab-content">
              <h2>Lịch sử đơn hàng</h2>
              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map((order, index) => (
                    <div key={index} className="order-card">
                      <div className="order-header">
                        <span className="order-id">Đơn hàng #{order.id || index + 1}</span>
                        <span className={`order-status ${order.status || "pending"}`}>
                          {order.status === "completed" ? "Hoàn thành" : "Đang xử lý"}
                        </span>
                      </div>
                      <div className="order-info">
                        <p><strong>Ngày:</strong> {order.date || "N/A"}</p>
                        <p><strong>Tổng tiền:</strong> {order.total ? `${order.total.toLocaleString()}đ` : "N/A"}</p>
                        <p><strong>Số lượng sản phẩm:</strong> {order.items || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaBox size={48} />
                  <p>Bạn chưa có đơn hàng nào</p>
                </div>
              )}
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === "password" && (
            <div className="tab-content">
              <h2>Đổi mật khẩu</h2>
              <form onSubmit={handleChangePassword} className="form password-form">
                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Xác nhận mật khẩu mới"
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;