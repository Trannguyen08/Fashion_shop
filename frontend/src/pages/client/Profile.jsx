import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

// Components
import ProfileSidebar from "../../components/ProfileItem/ProfileSidebar";
import PersonalInfo from "../../components/ProfileItem/PersonalInfo";
import AddressList from "../../components/ProfileItem/AddressList";
import AddressFormModal from "../../components/ProfileItem/AddressFormModal";
import OrderHistory from "../../components/ProfileItem/OrderHistory";
import ChangePassword from "../../components/ProfileItem/ChangePassword";

// Services
import AddressService from '../../services/AddressService';
import UserService from '../../services/UserService';
import OrderService from '../../services/OrderService';

// API endpoint cho địa phương Việt Nam
const PROVINCE_API = "https://provinces.open-api.vn/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Personal Info State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Address State
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

  // Location Data State
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Orders State
  const [orders, setOrders] = useState([]);

  // Load provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Initialize profile
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

          //localStorage.getItem("orders") || 
          const storedOrders = await OrderService.getUserOrders();
          console.log("Loaded orders:", storedOrders.data);
          if (storedOrders) {
            setOrders(storedOrders.data);
          }
        } 
      } catch (error) {
        console.error("Lỗi khi tải user:", error);
        navigate("/login");
      }
    };

    initProfile();
  }, [navigate]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // ========== LOCATION API ==========
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

  const fetchDistricts = async (provinceCode) => {
    try {
      setLoadingLocation(true);
      const response = await fetch(`${PROVINCE_API}/p/${provinceCode}?depth=2`);
      const data = await response.json();
      setDistricts(data.districts || []);
      setWards([]);
    } catch (error) {
      console.error("Lỗi khi tải danh sách quận/huyện:", error);
      showMessage("Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingLocation(false);
    }
  };

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

  // ========== AVATAR ==========
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

  // ========== PERSONAL INFO ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // ========== ADDRESS ==========
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

  // ========== PASSWORD ==========
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
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

    const token = localStorage.getItem('accessToken');

    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/account/change-password/`,
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
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

  // ========== LOGOUT ==========
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
        <ProfileSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAvatarUpload={handleAvatarUpload}
          onLogout={handleLogout}
        />

        <main className="profile-content">
          {activeTab === "info" && (
            <div className="tab-content">
              <div className="info-grid-layout">
                <PersonalInfo
                  formData={formData}
                  editMode={editMode}
                  loading={loading}
                  onToggleEdit={() => setEditMode(!editMode)}
                  onInputChange={handleInputChange}
                  onSubmit={handleUpdateInfo}
                />

                <AddressList
                  addresses={addresses}
                  defaultAddressId={defaultAddressId}
                  onAddAddress={handleAddAddress}
                  onEditAddress={handleEditAddress}
                  onDeleteAddress={handleDeleteAddress}
                  onSetDefaultAddress={handleSetDefaultAddress}
                />
              </div>

              <AddressFormModal
                show={showAddressForm}
                editingAddressId={editingAddressId}
                formData={addressFormData}
                provinces={provinces}
                districts={districts}
                wards={wards}
                loading={loading}
                loadingLocation={loadingLocation}
                onClose={() => setShowAddressForm(false)}
                onSubmit={handleSaveAddress}
                onInputChange={handleAddressFormChange}
                onProvinceChange={handleProvinceChange}
                onDistrictChange={handleDistrictChange}
                onWardChange={handleWardChange}
              />
            </div>
          )}

          {activeTab === "orders" && <OrderHistory orders={orders} setOrders={setOrders}/>}

          {activeTab === "password" && (
            <ChangePassword
              passwordData={passwordData}
              loading={loading}
              onPasswordChange={handlePasswordChange}
              onSubmit={handleChangePassword}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;