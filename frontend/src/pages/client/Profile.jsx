import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { FaUpload, FaSignOutAlt, FaEdit, FaBox, FaUser, FaKey, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import defaultAvatar from "../../assets/images/user.png";
import AddressService from '../../services/AddressService';
import UserService from '../../services/UserService';

// API endpoint cho địa phương Việt Nam
const PROVINCE_API = "https://provinces.open-api.vn/api";

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
    provinceCode: "",
    district: "",
    districtCode: "",
    ward: "",
    wardCode: "",
    address: "",
  });

  // State cho dữ liệu địa phương từ API
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [orders, setOrders] = useState([]);

  // Load danh sách tỉnh/thành phố khi component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    const initProfile = async () => {
      try {
        const result = await UserService.getUserInfo(); 
        if (result.success) {
          const userData = result.data;
          setUser(userData);
          setFormData({
            fullName: userData.full_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });

          await loadAddresses();

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

  // Fetch danh sách tỉnh/thành phố
  const fetchProvinces = async () => {
    try {
      setLoadingLocation(true);
      const response = await fetch(`${PROVINCE_API}/p/`);
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tỉnh/thành phố:", error);
      showMessage("Không thể tải danh sách tỉnh/thành phố");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Fetch danh sách quận/huyện theo tỉnh
  const fetchDistricts = async (provinceCode) => {
    try {
      setLoadingLocation(true);
      const response = await fetch(`${PROVINCE_API}/p/${provinceCode}?depth=2`);
      const data = await response.json();
      setDistricts(data.districts || []);
      setWards([]); // Reset wards khi đổi tỉnh
    } catch (error) {
      console.error("Lỗi khi tải danh sách quận/huyện:", error);
      showMessage("Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Fetch danh sách phường/xã theo quận
  const fetchWards = async (districtCode) => {
    try {
      setLoadingLocation(true);
      const response = await fetch(`${PROVINCE_API}/d/${districtCode}?depth=2`);
      const data = await response.json();
      setWards(data.wards || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phường/xã:", error);
      showMessage("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingLocation(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadAddresses = async () => {
    setLoading(true);
    const result = await AddressService.getAllAddresses();
    
    if (result.success) {
      const transformedAddresses = result.data.map(addr => 
        AddressService.transformAddressFromBackend(addr)
      );
      setAddresses(transformedAddresses);
      
      const defaultAddr = transformedAddresses.find(addr => addr.isDefault);
      setDefaultAddressId(defaultAddr?.id || null);
      
      AddressService.syncToLocalStorage(result.data);
    } else {
      showMessage(result.error);
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
        showMessage("Cập nhật ảnh đại diện thành công!");
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
    const selectedOption = e.target.options[e.target.selectedIndex];
    const provinceCode = e.target.value;
    const provinceName = selectedOption.text;
    
    setAddressFormData(prev => ({ 
      ...prev, 
      provinceCode,
      province: provinceName,
      district: "",
      districtCode: "",
      ward: "",
      wardCode: ""
    }));
    
    if (provinceCode) {
      fetchDistricts(provinceCode);
    } else {
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const districtCode = e.target.value;
    const districtName = selectedOption.text;
    
    setAddressFormData(prev => ({ 
      ...prev, 
      districtCode,
      district: districtName,
      ward: "",
      wardCode: ""
    }));
    
    if (districtCode) {
      fetchWards(districtCode);
    } else {
      setWards([]);
    }
  };

  const handleWardChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const wardCode = e.target.value;
    const wardName = selectedOption.text;
    
    setAddressFormData(prev => ({ 
      ...prev, 
      wardCode,
      ward: wardName
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.fullName || !formData.email || !formData.phone) {
      showMessage("Vui lòng điền đầy đủ thông tin cá nhân!");
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
        showMessage(result.message);
        setEditMode(false);
      } else {
        showMessage(result.error);
      }
    } catch (err) {
      console.error("Lỗi cập nhật thông tin:", err);
      showMessage("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
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
      provinceCode: "",
      district: "",
      districtCode: "",
      ward: "",
      wardCode: "",
      address: "",
    });
    setDistricts([]);
    setWards([]);
  };

  const handleEditAddress = async (address) => {
    setShowAddressForm(true);
    setEditingAddressId(address.id);
    
    // Tìm province code từ tên tỉnh
    const province = provinces.find(p => p.name === address.province);
    
    setAddressFormData({
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      province: address.province,
      provinceCode: province?.code || address.provinceCode || "",
      district: address.district,
      districtCode: address.districtCode || "",
      ward: address.ward || "",
      wardCode: address.wardCode || "",
      address: address.address,
    });

    // Load districts và wards nếu có provinceCode
    if (province?.code) {
      await fetchDistricts(province.code);
      if (address.districtCode) {
        await fetchWards(address.districtCode);
      }
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

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
                return prev.map(addr =>
                    addr.id === editingAddressId ? updatedAddress : addr
                );
            }
            return [...prev, updatedAddress];
        });

        if (updatedAddress.isDefault) {
            setDefaultAddressId(updatedAddress.id);
        }

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
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));

        if (defaultAddressId === addressId) {
          setDefaultAddressId(null);
        }

        showMessage(result.message);
      } else {
        showMessage(result.error || "Xóa địa chỉ thất bại");
      }
    } catch (error) {
      showMessage("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
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
        showMessage(result.message);
      } else {
        showMessage(result.error || "Không thể đặt mặc định");
      }
    } catch (error) {
      showMessage("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showMessage("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("Mật khẩu mới không khớp!");
      setLoading(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || user?.account_id;
    console.log("User trong local:", user);
    console.log("UserId gửi lên:", userId);


    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/account/change-password/${userId}/`,
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }
      );

      showMessage(res.data.message);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

    } catch (err) {
      const msg = err.response?.data?.error || "Lỗi khi đổi mật khẩu!";
      showMessage(msg);
    }

    setLoading(false);
  };


  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return <div className="profile-loading">Đang tải...</div>;
  }

  return (
    <div className="profile-container">
      {message && <div className="message-toast">{message}</div>}
      
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
                                {address.ward && `${address.ward}, `}
                                {address.district}, {address.province}
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
                      {/* ROW 1: Tên và Số điện thoại */}
                      <div className="form-row">
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
                          <label>Số điện thoại *</label>
                          <input
                            type="tel"
                            name="recipientPhone"
                            value={addressFormData.recipientPhone}
                            onChange={handleAddressFormChange}
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
                            value={addressFormData.provinceCode}
                            onChange={handleProvinceChange}
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
                            value={addressFormData.districtCode}
                            onChange={handleDistrictChange}
                            disabled={!addressFormData.provinceCode || loadingLocation}
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
                            value={addressFormData.wardCode}
                            onChange={handleWardChange}
                            disabled={!addressFormData.districtCode || loadingLocation}
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
                        <button type="submit" className="submit-btn" disabled={loading}>
                          {loading ? "Đang lưu..." : (editingAddressId ? "Cập nhật" : "Thêm địa chỉ")}
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