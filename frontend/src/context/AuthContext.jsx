import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const REFRESH_URL = "/account/token/refresh/"; 

export const useAuth = () => useContext(AuthContext);

// Hàm thiết lập Axios Interceptor
const setupAxiosInterceptors = (authContext) => {
    // 1. Thêm Access Token vào mọi request đi
    axios.interceptors.request.use(
        config => {
            const token = authContext.accessToken;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => Promise.reject(error)
    );

    // 2. Xử lý lỗi 401 và làm mới Token
    axios.interceptors.response.use(
        response => response,
        async (error) => {
            const originalRequest = error.config;
            
            // Nếu lỗi là 401 và đây không phải request làm mới token
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true; // Đánh dấu đã thử lại một lần

                try {
                    const newAccessToken = await authContext.refreshAccessToken();
                    if (newAccessToken) {
                        // Thử lại request ban đầu với token mới
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axios(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh Token thất bại -> Đăng xuất
                    authContext.logout();
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        }
    );
};


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const navigate = useNavigate();

    // Dùng useCallback để hàm này không tạo lại vô ích
    const refreshAccessToken = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            // Không có Refresh Token -> Yêu cầu đăng nhập lại
            logout();
            throw new Error("No refresh token available");
        }

        try {
            const response = await axios.post(REFRESH_URL, { refresh_token: refreshToken });
            const newAccessToken = response.data.access_token;
            
            // Cập nhật và lưu Access Token mới
            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);
            
            return newAccessToken;
        } catch (error) {
            console.error("Lỗi làm mới token:", error);
            // Refresh Token không hợp lệ/hết hạn -> Đăng xuất
            logout();
            throw error;
        }
    }, [navigate]);

    const logout = useCallback(() => {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
    }, [navigate]);

    // Khởi tạo trạng thái ban đầu và Interceptor
    useEffect(() => {
        // Lấy thông tin user đã lưu
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        // Thiết lập Interceptor sau khi Context được tạo
        setupAxiosInterceptors({ accessToken, refreshAccessToken, logout });

    }, [accessToken, refreshAccessToken, logout]); // Re-run khi token/hàm thay đổi

    // Hàm login sẽ được gọi từ Login.js
    const login = (data) => {
        const { access_token, refresh_token, user: userData } = data;
        
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        setAccessToken(access_token);
        setUser(userData);
    };

    const contextValue = {
        user,
        accessToken,
        isAuthenticated: !!user,
        login,
        logout,
        refreshAccessToken
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};