import React from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./AddressList.css";

const AddressList = ({ 
  addresses, 
  defaultAddressId, 
  onAddAddress, 
  onEditAddress, 
  onDeleteAddress, 
  onSetDefaultAddress 
}) => {
  return (
    <div className="address-section">
      <div className="section-header">
        <h2>Địa chỉ giao hàng</h2>
        <button className="add-btn" onClick={onAddAddress}>
          <FaPlus /> Thêm địa chỉ
        </button>
      </div>

      {addresses.length > 0 ? (
        <div className="address-list">
          {addresses.map((address) => (
            <div key={address.id} className="address-card">
              <div className="address-header">
                <input
                  type="radio"
                  name="defaultAddress"
                  checked={defaultAddressId === address.id}
                  onChange={() => onSetDefaultAddress(address.id)}
                  className="address-radio"
                />
                <div className="address-info">
                  <div className="address-recipient">
                    <strong>{address.recipientName}</strong>
                    {defaultAddressId === address.id && (
                      <span className="default-badge">Mặc định</span>
                    )}
                  </div>
                  <p className="address-phone">{address.recipientPhone}</p>
                  <p className="address-detail">
                    {address.address && `${address.address}, `}
                    {address.ward && `${address.ward}, `}
                    {address.district}, {address.province}
                  </p>
                </div>
              </div>
              <div className="address-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => onEditAddress(address)}
                >
                  <FaEdit /> Sửa
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => onDeleteAddress(address.id)}
                >
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.</p>
        </div>
      )}
    </div>
  );
};

export default AddressList;