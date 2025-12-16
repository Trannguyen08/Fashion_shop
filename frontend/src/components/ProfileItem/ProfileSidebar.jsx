import React from "react";
import { FaUpload, FaSignOutAlt, FaUser, FaBox, FaKey } from "react-icons/fa";
import defaultAvatar from "../../assets/images/user.png";
import "./ProfileSidebar.css";

const ProfileSidebar = ({ user, activeTab, onTabChange, onAvatarUpload, onLogout }) => {
  return (
    <aside className="profile-sidebar">
      <div className="avatar-section">
        <img 
          src={user.avatar_img || defaultAvatar} 
          alt="avatar" 
          className="profile-avatar" 
        />
        <label htmlFor="avatar-upload" className="avatar-upload-btn">
          <FaUpload />
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={onAvatarUpload}
          style={{ display: "none" }}
        />
      </div>

      <h2 className="profile-name">{user.fullName || "Người dùng"}</h2>
      <p className="profile-email">{user.email}</p>

      <nav className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
          onClick={() => onTabChange("info")}
        >
          <FaUser /> Thông tin
        </button>
        <button
          className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => onTabChange("orders")}
        >
          <FaBox /> Đơn hàng
        </button>
        <button
          className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
          onClick={() => onTabChange("password")}
        >
          <FaKey /> Đổi mật khẩu
        </button>
        <button className="tab-btn logout-btn" onClick={onLogout}>
          <FaSignOutAlt /> Đăng xuất
        </button>
      </nav>
    </aside>
  );
};

export default ProfileSidebar;