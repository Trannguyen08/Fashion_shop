import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const LOGIN_URL = "http://127.0.0.1:8000/account/login/";
const REFRESH_URL = "http://127.0.0.1:8000/account/token/refresh/";

// ============================
//   STORAGE KEY HELPERS
// ============================
const getStorageKeys = (isAdmin) => {
    const prefix = isAdmin ? "admin" : "user";
    return {
        user: `${prefix}_user`,
        accessToken: `${prefix}_accessToken`,
        refreshToken: `${prefix}_refreshToken`,
    };
};

const clearAllSessions = () => {
    // Xóa tất cả session (admin + user)
    ["admin", "user"].forEach(prefix => {
        localStorage.removeItem(`${prefix}_user`);
        localStorage.removeItem(`${prefix}_accessToken`);
        localStorage.removeItem(`${prefix}_refreshToken`);
    });
};

const getStoredSession = () => {
    // Ưu tiên admin session, sau đó user session
    for (const isAdmin of [true, false]) {
        const keys = getStorageKeys(isAdmin);
        const token = localStorage.getItem(keys.accessToken);
        const userStr = localStorage.getItem(keys.user);
        
        if (token && userStr) {
            try {
                return {
                    user: JSON.parse(userStr),
                    accessToken: token,
                    isAdmin
                };
            } catch {
                continue;
            }
        }
    }
    return null;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshSubscribersRef = useRef([]);

    // Load session khi mount
    useEffect(() => {
        const session = getStoredSession();
        if (session) {
            setUser(session.user);
            setAccessToken(session.accessToken);
        }
    }, []);

    // ============================
    //       LOGOUT
    // ============================
    const logout = useCallback(() => {
        const currentIsAdmin = user?.role === "admin" || user?.is_admin === true;
        const keys = getStorageKeys(currentIsAdmin);

        // Chỉ xóa session hiện tại
        localStorage.removeItem(keys.user);
        localStorage.removeItem(keys.accessToken);
        localStorage.removeItem(keys.refreshToken);

        setUser(null);
        setAccessToken(null);
        refreshSubscribersRef.current = [];

        // Không navigate ở đây nữa - component tự xử lý
    }, [user]);

    // ============================
    //   TOKEN REFRESH HANDLING
    // ============================
    const onRefreshed = (newToken) => {
        refreshSubscribersRef.current.forEach((cb) => cb(newToken));
        refreshSubscribersRef.current = [];
    };

    const addRefreshSubscriber = (callback) => {
        refreshSubscribersRef.current.push(callback);
    };

    const refreshAccessToken = useCallback(async () => {
        if (isRefreshing) {
            return new Promise((resolve) => {
                addRefreshSubscriber(resolve);
            });
        }

        setIsRefreshing(true);

        try {
            const currentIsAdmin = user?.role === "admin" || user?.is_admin === true;
            const keys = getStorageKeys(currentIsAdmin);
            const refreshToken = localStorage.getItem(keys.refreshToken);

            if (!refreshToken) {
                throw new Error("NO_REFRESH_TOKEN");
            }

            const response = await axios.post(
                REFRESH_URL,
                { refresh_token: refreshToken },
                {
                    headers: { "Content-Type": "application/json" },
                    skipAuthRefresh: true,
                }
            );

            const newToken = response.data.access_token;

            setAccessToken(newToken);
            localStorage.setItem(keys.accessToken, newToken);

            setIsRefreshing(false);
            onRefreshed(newToken);

            return newToken;
        } catch (error) {
            setIsRefreshing(false);
            logout();
            throw error;
        }
    }, [isRefreshing, user, logout]);

    // ============================
    //       AXIOS INTERCEPTORS
    // ============================
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (config.skipAuthRefresh) {
                    return config;
                }

                const currentIsAdmin = user?.role === "admin" || user?.is_admin === true;
                const keys = getStorageKeys(currentIsAdmin);
                const token = localStorage.getItem(keys.accessToken);
                const isLoginRequest = config.url === LOGIN_URL;

                if (token && !isLoginRequest) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status !== 401) {
                    return Promise.reject(error);
                }

                if (
                    originalRequest.url === LOGIN_URL ||
                    originalRequest.url === REFRESH_URL ||
                    originalRequest.skipAuthRefresh
                ) {
                    return Promise.reject(error);
                }

                if (originalRequest._retry) {
                    logout();
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                try {
                    const newToken = await refreshAccessToken();
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axios(originalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [user, refreshAccessToken, logout]);

    // ============================
    //            LOGIN
    // ============================
    const login = useCallback((data) => {
        const { access_token, refresh_token, user: userData } = data;
        const isAdminUser = userData.role === "admin" || userData.is_admin === true;
        const keys = getStorageKeys(isAdminUser);

        // Xóa session cũ của role này (nếu có)
        localStorage.removeItem(keys.user);
        localStorage.removeItem(keys.accessToken);
        localStorage.removeItem(keys.refreshToken);

        // Lưu session mới
        localStorage.setItem(keys.accessToken, access_token);
        localStorage.setItem(keys.refreshToken, refresh_token);
        localStorage.setItem(keys.user, JSON.stringify(userData));

        setAccessToken(access_token);
        setUser(userData);

        // Không navigate ở đây - để component tự xử lý
    }, []);

    // ============================
    //      HELPER FUNCTIONS
    // ============================
    const isAdmin = user?.role === "admin" || user?.is_admin === true;
    const isAuthenticated = !!user && !!accessToken;

    // Function để switch giữa các session
    const switchSession = useCallback((toAdmin) => {
        const keys = getStorageKeys(toAdmin);
        const token = localStorage.getItem(keys.accessToken);
        const userStr = localStorage.getItem(keys.user);

        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setAccessToken(token);
                return true;
            } catch {
                return false;
            }
        }
        return false;
    }, []);

    // ============================
    //      CONTEXT VALUE
    // ============================
    const contextValue = {
        user,
        accessToken,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        refreshAccessToken,
        switchSession,
        clearAllSessions,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};