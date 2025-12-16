import React from "react";
import { FaEdit } from "react-icons/fa";
import "./PersonalInfo.css";

const PersonalInfo = ({ 
  formData, 
  editMode, 
  loading, 
  onToggleEdit, 
  onInputChange, 
  onSubmit 
}) => {
  return (
    <div className="info-section">
      <div className="section-header">
        <h2>Thông tin cá nhân</h2>
        <button className="edit-btn" onClick={onToggleEdit}>
          <FaEdit /> {editMode ? "Hủy" : "Chỉnh sửa"}
        </button>
      </div>

      {editMode ? (
        <form onSubmit={onSubmit} className="form-edit">
          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              placeholder="Nhập email"
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      ) : (
        <div className="info-card">
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
      )}
    </div>
  );
};

export default PersonalInfo;