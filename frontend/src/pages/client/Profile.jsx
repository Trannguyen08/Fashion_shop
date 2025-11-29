import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { FaUpload, FaSignOutAlt, FaEdit, FaBox, FaUser, FaKey, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import defaultAvatar from "../../assets/images/user.png";
import AddressService from '../../services/AddressService';
import UserService from '../../services/UserService';

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
  });

  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  const [addressFormData, setAddressFormData] = useState({
    recipientName: "",
    recipientPhone: "",
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
    const initProfile = async () => {
      try {
        // Lấy user hiện tại từ UserService (API)
        const result = await UserService.getUserInfo(); 
        if (result.success) {
          const userData = result.data;
          setUser(userData);
          setFormData({
            fullName: userData.full_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });

          // Load địa chỉ từ API
          await loadAddresses();

          // Load orders từ localStorage (hoặc API nếu có)
          const storedOrders = localStorage.getItem("orders");
          if (storedOrders) {
            setOrders(JSON.parse(storedOrders));
          }

        } 
      } catch (error) {
        console.error("Lỗi khi tải user:", error);
        navigate("/login");
      }
    };

    initProfile();
  }, [navigate]);


  const loadAddresses = async () => {
    setLoading(true);
    const result = await AddressService.getAllAddresses();
    
    if (result.success) {
      // Transform data từ backend format sang frontend format
      const transformedAddresses = result.data.map(addr => 
        AddressService.transformAddressFromBackend(addr)
      );
      setAddresses(transformedAddresses);
      
      // Tìm địa chỉ mặc định
      const defaultAddr = transformedAddresses.find(addr => addr.isDefault);
      setDefaultAddressId(defaultAddr?.id || null);
      
      // Sync với localStorage
      AddressService.syncToLocalStorage(result.data);
    } else {
      setMessage(result.error);
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };

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

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setAddressFormData(prev => ({ ...prev, province, district: "" }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.fullName || !formData.email || !formData.phone) {
      setMessage("Vui lòng điền đầy đủ thông tin cá nhân!");
      setLoading(false);
      return;
    }

    try {
      const result = await UserService.updateUserInfo(formData);
      if (result.success) {
        setUser(result.data);
        setFormData({
          fullName: result.data.full_name,
          email: result.data.email,
          phone: result.data.phone
        });
        setMessage(result.message);
        setEditMode(false);
      } else {
        setMessage(result.error);
      }
    } catch (err) {
      console.error("Lỗi cập nhật thông tin:", err);
      setMessage("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setTimeout(() => setMessage(""), 3000);
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setShowAddressForm(true);
    setEditingAddressId(null);
    setAddressFormData({
      recipientName: "",
      recipientPhone: "",
      province: "",
      district: "",
      address: "",
    });
  };

  const handleEditAddress = (address) => {
    setShowAddressForm(true);
    setEditingAddressId(address.id);
    setAddressFormData({
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      province: address.province,
      district: address.district,
      address: address.address,
    });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    // --- Validate form ---
    const { recipientName, recipientPhone, province, district } = addressFormData;
    if (!recipientName || !recipientPhone || !province || !district) {
        showMessage("Vui lòng điền đầy đủ thông tin địa chỉ!");
        return;
    }

    setLoading(true);

    try {
        const apiCall = editingAddressId
            ? AddressService.updateAddress(editingAddressId, addressFormData)
            : AddressService.addAddress(addressFormData);

        const result = await apiCall;

        if (!result.success) {
            showMessage(result.error);
            return;
        }

        const updatedAddress = AddressService.transformAddressFromBackend(result.data);

        setAddresses(prev => {
            if (editingAddressId) {
                // Update địa chỉ cũ
                return prev.map(addr =>
                    addr.id === editingAddressId ? updatedAddress : addr
                );
            }
            // Thêm mới
            return [...prev, updatedAddress];
        });

        // --- Nếu địa chỉ mới là mặc định thì cập nhật ---
        if (updatedAddress.isDefault) {
            setDefaultAddressId(updatedAddress.id);
        }

        // --- UI feedback ---
        setShowAddressForm(false);
        showMessage(result.message);
        
    } catch (err) {
        console.error("Lỗi khi lưu địa chỉ:", err);
        showMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
        setLoading(false);
    }
  };


  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

    setLoading(true);

    try {
      const result = await AddressService.deleteAddress(addressId);

      if (result.success) {
        // Xóa khỏi danh sách địa chỉ
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));

        // Nếu xóa địa chỉ mặc định → reset
        if (defaultAddressId === addressId) {
          setDefaultAddressId(null);
        }

        setMessage(result.message);
      } else {
        setMessage(result.error || "Xóa địa chỉ thất bại");
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      // Clear message sau 3s
      setTimeout(() => setMessage(""), 3000);
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setLoading(true);

    try {
      const result = await AddressService.setDefaultAddress(addressId);

      if (result.success) {
        setAddresses(prev =>
          prev.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
          }))
        );

        setDefaultAddressId(addressId);
        setMessage(result.message);
      } else {
        setMessage(result.error || "Không thể đặt mặc định");
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setTimeout(() => setMessage(""), 3000);
      setLoading(false);
    }
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

  const currentProvinceDistricts = addressFormData.province && PROVINCES[addressFormData.province] 
    ? PROVINCES[addressFormData.province].districts 
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
          {/* INFO TAB */}
          {activeTab === "info" && (
            <div className="tab-content">
              <div className="info-grid-layout">
                {/* THÔNG TIN CÁ NHÂN */}
                <div className="info-section">
                  <div className="section-header">
                    <h2>Thông tin cá nhân</h2>
                    <button
                      className="edit-btn"
                      onClick={() => setEditMode(!editMode)}
                    >
                      <FaEdit /> {editMode ? "Hủy" : "Chỉnh sửa"}
                    </button>
                  </div>

                  {editMode ? (
                    <form onSubmit={handleUpdateInfo} className="form-edit">
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

                {/* DANH SÁCH ĐỊA CHỈ */}
                <div className="address-section">
                  <div className="section-header">
                    <h2>Địa chỉ giao hàng</h2>
                    <button className="add-btn" onClick={handleAddAddress}>
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
                              onChange={() => handleSetDefaultAddress(address.id)}
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
                                {address.district}, {PROVINCES[address.province]?.name}
                              </p>
                            </div>
                          </div>
                          <div className="address-actions">
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditAddress(address)}
                            >
                              <FaEdit /> Sửa
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteAddress(address.id)}
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
              </div>

              {/* FORM THÊM/SỬA ĐỊA CHỈ */}
              {showAddressForm && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>{editingAddressId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>
                      <button 
                        className="close-btn"
                        onClick={() => setShowAddressForm(false)}
                      >
                        <FaTimes />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAddress} className="address-form">
                      <div className="form-group">
                        <label>Tên người nhận *</label>
                        <input
                          type="text"
                          name="recipientName"
                          value={addressFormData.recipientName}
                          onChange={handleAddressFormChange}
                          placeholder="Nhập tên người nhận"
                        />
                      </div>

                      <div className="form-group">
                        <label>Số điện thoại người nhận *</label>
                        <input
                          type="tel"
                          name="recipientPhone"
                          value={addressFormData.recipientPhone}
                          onChange={handleAddressFormChange}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div className="form-group">
                        <label>Tỉnh/Thành phố *</label>
                        <select
                          name="province"
                          value={addressFormData.province}
                          onChange={handleProvinceChange}
                        >
                          <option value="">-- Chọn tỉnh/thành phố --</option>
                          {Object.entries(PROVINCES).map(([key, value]) => (
                            <option key={key} value={key}>{value.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Phường/Xã *</label>
                        <select
                          name="district"
                          value={addressFormData.district}
                          onChange={handleAddressFormChange}
                          disabled={!addressFormData.province}
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
                          value={addressFormData.address}
                          onChange={handleAddressFormChange}
                          placeholder="Nhập số nhà, tên đường..."
                        />
                      </div>

                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => setShowAddressForm(false)}
                        >
                          Hủy
                        </button>
                        <button type="submit" className="submit-btn">
                          {editingAddressId ? "Cập nhật" : "Thêm địa chỉ"}
                        </button>
                      </div>
                    </form>
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