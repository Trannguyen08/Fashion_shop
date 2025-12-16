import React from "react";
import "./ChangePassword.css";

const ChangePassword = ({ 
  passwordData, 
  loading, 
  onPasswordChange, 
  onSubmit 
}) => {
  return (
    <div className="tab-content">
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={onSubmit} className="password-form">
        <div className="form-group">
          <label>Mật khẩu hiện tại *</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={onPasswordChange}
            placeholder="Nhập mật khẩu hiện tại"
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu mới *</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={onPasswordChange}
            placeholder="Nhập mật khẩu mới"
          />
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu mới *</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={onPasswordChange}
            placeholder="Xác nhận mật khẩu mới"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;