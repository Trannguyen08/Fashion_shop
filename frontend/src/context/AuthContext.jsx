import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const LOGIN_URL = "http://127.0.0.1:8000/account/login/";
const REFRESH_URL = "http://127.0.0.1:8000/account/token/refresh/";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user")) || null;
    });

    const [accessToken, setAccessToken] = useState(() =>
        localStorage.getItem("accessToken")
    );

    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshSubscribers = [];

    const navigate = useNavigate();

    // ============================
    //       LOGOUT
    // ============================
    const logout = useCallback(() => {
        setUser(null);
        setAccessToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        navigate("/login");
    }, [navigate]);

    // ============================
    //   TOKEN REFRESH HANDLING
    // ============================

    const onRefreshed = (newToken) => {
        refreshSubscribers.forEach((cb) => cb(newToken));
        refreshSubscribers.length = 0; // clear queue
    };

    const addRefreshSubscriber = (callback) => {
        refreshSubscribers.push(callback);
    };

    const refreshAccessToken = useCallback(async () => {
        if (isRefreshing) {
            // Nếu đang refresh → trả promise chờ token mới
            return new Promise((resolve) => {
                addRefreshSubscriber(resolve);
            });
        }

        setIsRefreshing(true);

        try {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                logout();
                throw new Error("NO_REFRESH_TOKEN");
            }

            const response = await axios.post(REFRESH_URL, 
                {
                    refresh_token: refreshToken,
                }
            );

            const newToken = response.data.access_token;

            // Cập nhật token
            setAccessToken(newToken);
            localStorage.setItem("accessToken", newToken);

            setIsRefreshing(false);
            onRefreshed(newToken);

            return newToken;
        } catch (error) {
            setIsRefreshing(false);
            logout();
            throw error;
        }
    }, [isRefreshing, logout]);

    // ============================
    //       AXIOS INTERCEPTORS
    // ============================

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                // KIỂM TRA: Nếu request là đến endpoint đăng nhập, KHÔNG thêm token.
                const token = localStorage.getItem("accessToken");
                const isLoginRequest = config.url === LOGIN_URL; 

                if (token && !isLoginRequest) { 
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Nếu lỗi không phải 401 -> bỏ qua
                if (error.response?.status !== 401) {
                    return Promise.reject(error);
                }

                // Nếu đã retry rồi thì không retry nữa
                if (originalRequest._retry) {
                    logout();
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                try {
                    const newToken = await refreshAccessToken();

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axios(originalRequest); // Retry request
                } catch (err) {
                    return Promise.reject(err);
                }
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [refreshAccessToken, logout]);

    // ============================
    //            LOGIN
    // ============================

    const login = (data) => {
        const { access_token, refresh_token, user: userData } = data;

        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        localStorage.setItem("user", JSON.stringify(userData));

        setAccessToken(access_token);
        setUser(userData);
    };

    // ============================
    //      CONTEXT VALUE
    // ============================

    const contextValue = {
        user,
        accessToken,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
