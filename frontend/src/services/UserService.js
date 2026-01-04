// src/services/UserService.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/account'; // URL backend user
const token = localStorage.getItem('user_accessToken');

class UserService {
  // Lấy userId từ localStorage
  getUserId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id || user?.account_id;
  }

  // Lấy thông tin user
  async getUserInfo(userId = null) {
    try {
      const id = userId || this.getUserId();
      const response = await axios.get(`${API_BASE_URL}/info/${id}/`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Fetched user info:', response.data.user);
      return {
        success: true,
        data: response.data.user
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tải thông tin người dùng'
      };
    }
  }

  // Cập nhật thông tin cá nhân (name, email, phone)
  async updateUserInfo(userData, userId = null) {
    try {
      const id = userId || this.getUserId();
      const response = await axios.put(
        `${API_BASE_URL}/update-info/${id}/`,
        {
          full_name: userData.fullName,
          email: userData.email,
          phone: userData.phone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Cập nhật localStorage luôn
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.full_name = response.data.user.full_name;
        storedUser.email = response.data.user.email;
        storedUser.phone = response.data.user.phone;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

      return {
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: response.data
      };
    } catch (error) {
      console.error('Error updating user info:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể cập nhật thông tin'
      };
    }
  }
}

export default new UserService();
