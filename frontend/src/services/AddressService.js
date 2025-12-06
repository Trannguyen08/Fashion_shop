// src/services/AddressService.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/customers'; 

class AddressService {
  // Lấy account_id từ localStorage
  getAccountId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id || user?.account_id;
  }

  // Lấy tất cả địa chỉ
  async getAllAddresses(accountId = null) {
    try {
      const id = accountId || this.getAccountId();
      const response = await axios.get(`${API_BASE_URL}/address/get-all/${id}/`);
      return {
        success: true,
        data: response.data.addresses
      };
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tải danh sách địa chỉ'
      };
    }
  }

  // Thêm địa chỉ mới
  async addAddress(addressData, accountId = null) {
    try {
      const id = accountId || this.getAccountId();
      const response = await axios.post(
        `${API_BASE_URL}/address/add/${id}/`,
        {
          receiver_name: addressData.recipientName,
          phone: addressData.recipientPhone,
          province: addressData.province,
          district: addressData.district,
          ward: addressData.ward,
          address_detail: addressData.address,
          is_default: addressData.isDefault || false
        }
      );
      return {
        success: true,
        message: response.data.message,
        data: response.data.address
      };
    } catch (error) {
      console.error('Error adding address:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể thêm địa chỉ'
      };
    }
  }

  // Cập nhật địa chỉ
  async updateAddress(addressId, addressData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/address/update/${addressId}/`,
        {
          receiver_name: addressData.recipientName,
          phone: addressData.recipientPhone,
          province: addressData.province,
          district: addressData.district,
          ward: addressData.ward,
          address_detail: addressData.address,
          is_default: addressData.isDefault || false
        }
      );
      return {
        success: true,
        message: response.data.message,
        data: response.data.address
      };
    } catch (error) {
      console.error('Error updating address:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể cập nhật địa chỉ'
      };
    }
  }

  // Xóa địa chỉ
  async deleteAddress(addressId) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/address/delete/${addressId}/`
      );
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error deleting address:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể xóa địa chỉ'
      };
    }
  }

  // Set địa chỉ mặc định
  async setDefaultAddress(addressId, accountId = null) {
    try {
      // Đầu tiên, lấy thông tin địa chỉ hiện tại
      const id = accountId || this.getAccountId();
      const allAddresses = await this.getAllAddresses(id);
      
      if (!allAddresses.success) {
        return allAddresses;
      }

      const currentAddress = allAddresses.data.find(addr => addr.id === addressId);
      
      if (!currentAddress) {
        return {
          success: false,
          error: 'Không tìm thấy địa chỉ'
        };
      }

      // Cập nhật địa chỉ với is_default = true
      const response = await axios.put(
        `${API_BASE_URL}/address/update/${addressId}/`,
        {
          receiver_name: currentAddress.receiver_name,
          phone: currentAddress.phone,
          province: currentAddress.province,
          ward: currentAddress.ward,
          address_detail: currentAddress.address_detail,
          is_default: true
        }
      );

      return {
        success: true,
        message: 'Đã đặt làm địa chỉ mặc định',
        data: response.data.address
      };
    } catch (error) {
      console.error('Error setting default address:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể đặt địa chỉ mặc định'
      };
    }
  }

  // Sync địa chỉ với localStorage (backup)
  syncToLocalStorage(addresses) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        user.addresses = addresses;
        const defaultAddress = addresses.find(addr => addr.is_default);
        user.defaultAddressId = defaultAddress?.id || null;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error syncing to localStorage:', error);
    }
  }

  // Transform data từ backend sang frontend format
  transformAddressFromBackend(backendAddress) {
    return {
      id: backendAddress.id,
      recipientName: backendAddress.receiver_name,
      recipientPhone: backendAddress.phone,
      province: backendAddress.province,
      district: backendAddress.district,
      ward: backendAddress.ward,
      address: backendAddress.address_detail,
      isDefault: backendAddress.is_default
    };
  }

  // Transform data từ frontend sang backend format
  transformAddressToBackend(frontendAddress) {
    return {
      receiver_name: frontendAddress.recipientName,
      phone: frontendAddress.recipientPhone,
      province: frontendAddress.province,
      ward: frontendAddress.district,
      address_detail: frontendAddress.address,
      is_default: frontendAddress.isDefault || false
    };
  }
}

export default new AddressService();