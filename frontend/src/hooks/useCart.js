import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://127.0.0.1:8000";
const CART_STORAGE_KEY = "cart";
const USER_STORAGE_KEY = "user";

export default function useCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Khởi tạo giỏ hàng - Load từ localStorage hoặc API
  useEffect(() => {
    const initializeCart = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));

        if (user?.id) {
          // ✅ User tồn tại - Check xem có data trong local hay không
          const localCartData = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || { items: [] };
          const localCart = localCartData.items || [];

          if (localCart.length === 0 || localCartData.userId !== user.id) {
            // 📥 Không có data trong local hoặc userId không trùng → Gọi API để lấy từ DB
            await syncCartFromDB(user.id);
          } else {
            // ✅ Có data trong local và userId trùng → Dùng local (đã được đồng bộ trước)
            setCart(localCart);
          }
        } else {
          // 👤 Không có user → Chỉ dùng local storage (anonymous)
          const localCartData = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || { items: [] };
          const localCart = localCartData.items || [];
          setCart(localCart);
        }
        setError(null);
      } catch (err) {
        console.error("Lỗi khởi tạo giỏ hàng:", err);
        setError(err.message);
        // Fallback: lấy từ local nếu có lỗi
        const fallbackCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
        setCart(fallbackCart);
      } finally {
        setLoading(false);
      }
    };

    initializeCart();
  }, []);

  // 🔹 Đồng bộ giỏ hàng từ DB về local
  const syncCartFromDB = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
      const dbCart = response.data.cart || [];

      // 💾 Lưu vào localStorage
      const cartData = {
        userId: userId,
        items: dbCart,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      setCart(dbCart);
    } catch (err) {
      console.error("Lỗi đồng bộ giỏ hàng từ DB:", err);
      throw err;
    }
  };

  // 🔹 Lưu giỏ hàng vào cả localStorage và DB
  const saveCart = async (newCart) => {
    try {
      // 💾 Luôn lưu vào localStorage (local-first) kèm userId
      const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
      const cartData = {
        userId: user?.id || null,
        items: newCart,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      setCart(newCart);

      // 📤 Nếu có user → Đồng bộ lên DB
      if (user?.id) {
        await axios.post(`${API_BASE_URL}/cart/sync`, {
          userId: user.id,
          cart: newCart,
        });
      }
    } catch (err) {
      console.error("Lỗi lưu giỏ hàng:", err);
      setError(err.message);
    }
  };

  // 🔹 Thêm sản phẩm vào giỏ
  const addToCart = async (product, quantity = 1) => {
    try {
      const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
      const existingIndex = cart.findIndex((item) => item.id === product.id);

      let newCart;

      if (existingIndex !== -1) {
        // Sản phẩm đã tồn tại → tăng số lượng
        newCart = [...cart];
        newCart[existingIndex].quantity += quantity;
      } else {
        // Sản phẩm mới → thêm vào
        newCart = [...cart, { ...product, quantity, checked: false }];
      }

      // 💾 Lưu giỏ hàng
      await saveCart(newCart);

      // 📤 Nếu có user → Gửi request thêm vào DB
      if (user?.id) {
        try {
          await axios.post(`${API_BASE_URL}/cart/add`, {
            userId: user.id,
            productId: product.id,
            quantity: existingIndex !== -1 
              ? newCart[existingIndex].quantity 
              : quantity,
          });
        } catch (err) {
          console.error("Lỗi thêm vào DB (nhưng đã lưu local):", err);
        }
      }

      return true;
    } catch (err) {
      console.error("Lỗi thêm sản phẩm:", err);
      setError(err.message);
      return false;
    }
  };

  // 🔹 Cập nhật số lượng sản phẩm
  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) {
        // Nếu số lượng = 0 → Xóa sản phẩm
        return removeFromCart(productId);
      }

      const newCart = cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );

      await saveCart(newCart);

      const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
      if (user?.id) {
        try {
          await axios.put(`${API_BASE_URL}/cart/update`, {
            userId: user.id,
            productId,
            quantity,
          });
        } catch (err) {
          console.error("Lỗi cập nhật DB (nhưng đã lưu local):", err);
        }
      }

      return true;
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
      setError(err.message);
      return false;
    }
  };

  // 🔹 Xóa sản phẩm khỏi giỏ
  const removeFromCart = async (productId) => {
    try {
      const newCart = cart.filter((item) => item.id !== productId);
      await saveCart(newCart);

      const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
      if (user?.id) {
        try {
          await axios.delete(`${API_BASE_URL}/cart/remove`, {
            data: { userId: user.id, productId },
          });
        } catch (err) {
          console.error("Lỗi xóa từ DB (nhưng đã lưu local):", err);
        }
      }

      return true;
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      setError(err.message);
      return false;
    }
  };

  // 🔹 Update trạng thái checked của sản phẩm
  const updateItemChecked = async (productId, checked) => {
    try {
      const newCart = cart.map((item) =>
        item.id === productId ? { ...item, checked } : item
      );

      await saveCart(newCart);
      return true;
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái checked:", err);
      setError(err.message);
      return false;
    }
  };

  // 🔹 Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);

      const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
      if (user?.id) {
        try {
          await axios.delete(`${API_BASE_URL}/cart/clear`, {
            data: { userId: user.id },
          });
        } catch (err) {
          console.error("Lỗi xóa DB (nhưng đã xóa local):", err);
        }
      }

      return true;
    } catch (err) {
      console.error("Lỗi xóa giỏ hàng:", err);
      setError(err.message);
      return false;
    }
  };

  // 🔹 Lấy thông tin user hiện tại
  const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  };

  // 🔹 Lấy tổng số sản phẩm trong giỏ
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // 🔹 Lấy tổng tiền giỏ hàng
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // 🔹 Lấy sản phẩm đã được chọn
  const getSelectedItems = () => {
    return cart.filter((item) => item.checked);
  };

  return {
    // State
    cart,
    loading,
    error,

    // Methods
    addToCart,
    updateQuantity,
    removeFromCart,
    updateItemChecked,
    clearCart,
    syncCartFromDB,

    // Utils
    getCurrentUser,
    getTotalItems,
    getTotalPrice,
    getSelectedItems,
  };
}