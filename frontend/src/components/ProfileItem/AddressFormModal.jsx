import React from "react";
import { FaTimes } from "react-icons/fa";
import "./AddressFormModal.css";

const AddressFormModal = ({
  show,
  editingAddressId,
  formData,
  provinces,
  districts,
  wards,
  loading,
  loadingLocation,
  onClose,
  onSubmit,
  onInputChange,
  onProvinceChange,
  onDistrictChange,
  onWardChange
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{editingAddressId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="address-form">
          {/* ROW 1: Tên và Số điện thoại */}
          <div className="form-row">
            <div className="form-group">
              <label>Tên người nhận *</label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={onInputChange}
                placeholder="Nhập tên người nhận"
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại *</label>
              <input
                type="tel"
                name="recipientPhone"
                value={formData.recipientPhone}
                onChange={onInputChange}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          {/* ROW 2: Tỉnh, Quận, Phường */}
          <div className="form-row-3">
            <div className="form-group">
              <label>Tỉnh/TP *</label>
              <select
                name="provinceCode"
                value={formData.provinceCode}
                onChange={onProvinceChange}
                disabled={loadingLocation}
              >
                <option value="">-- Chọn tỉnh --</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quận/Huyện *</label>
              <select
                name="districtCode"
                value={formData.districtCode}
                onChange={onDistrictChange}
                disabled={!formData.provinceCode || loadingLocation}
              >
                <option value="">-- Chọn quận --</option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Phường/Xã *</label>
              <select
                name="wardCode"
                value={formData.wardCode}
                onChange={onWardChange}
                disabled={!formData.districtCode || loadingLocation}
              >
                <option value="">-- Chọn phường --</option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 3: Địa chỉ cụ thể */}
          <div className="form-group">
            <label>Địa chỉ cụ thể</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              placeholder="Nhập số nhà, tên đường..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Đang lưu..." : editingAddressId ? "Cập nhật" : "Thêm địa chỉ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;