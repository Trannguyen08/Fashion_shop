import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "https://127.0.0.1:8000/api";
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
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}/`);
      const dbCart = response.data.data?.items || [];

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

  // 💾 Lưu giỏ hàng vào localStorage
  const saveCart = useCallback(async (newCart) => {
    try {
      const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
      const cartData = {
        userId: user?.id || null,
        items: newCart,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      setCart(newCart);
    } catch (err) {
      console.error('Lỗi lưu giỏ hàng:', err);
      throw err;
    }
  }, []);

  // ➕ Thêm sản phẩm vào giỏ
  const addToCart = useCallback(
    async (product, productVariantId, quantity = 1, variantInfo = {}) => {
      try {
        const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));

        const existingIndex = cart.findIndex(
          (item) => item.id === product.id && item.product_variant_id === productVariantId
        );

        let newCart;

        if (existingIndex !== -1) {
          newCart = [...cart];
          newCart[existingIndex].quantity += quantity;
        } else {
          newCart = [
            ...cart,
            {
              ...product,
              product_variant_id: productVariantId,
              size: variantInfo.size || '',
              color: variantInfo.color || '',
              quantity,
              checked: false,
            },
          ];
        }

        await saveCart(newCart);

        if (user?.id) {
          try {
            await axios.post(
              `${API_BASE_URL}/cart/${user.id}/add/`,
              {
                product_id: product.id,
                product_variant_id: productVariantId,
                quantity:
                  existingIndex !== -1
                    ? newCart[existingIndex].quantity
                    : quantity,
              }
            );
            console.log('✅ Thêm vào DB thành công');
            return true;
          } catch (err) {
            console.error('⚠️ Lỗi thêm vào DB (nhưng đã lưu local):', err.response?.data || err.message);
            return true;
          }
        }

        return true;
      } catch (err) {
        console.error('❌ Lỗi thêm sản phẩm:', err);
        setError(err.message);
        return false;
      }
    },
    [cart, saveCart]
  );

  // 🔄 Cập nhật số lượng sản phẩm
  const updateCartItem = useCallback(
    async (productId, productVariantId, quantity) => {
      try {
        if (quantity < 1) {
          return removeFromCart(productId, productVariantId);
        }

        const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));

        // 1️⃣ Cập nhật local state
        const newCart = cart.map((item) =>
          item.id === productId && item.product_variant_id === productVariantId
            ? { ...item, quantity }
            : item
        );
        await saveCart(newCart);

        // 📤 Gửi request cập nhật DB
        if (user?.id) {
          try {
            await axios.put(
              `${API_BASE_URL}/cart/${user.id}/item/${productVariantId}/`,
              { quantity }
            );
            console.log('✅ Cập nhật giỏ hàng thành công');
            return true;
          } catch (err) {
            console.error('⚠️ Lỗi cập nhật DB (nhưng đã lưu local):', err.response?.data || err.message);
            return true;
          }
        }

        return true;
      } catch (err) {
        console.error('❌ Lỗi cập nhật giỏ hàng:', err);
        setError(err.message);
        return false;
      }
    },
    [cart, saveCart]
  );

  // ❌ Xóa sản phẩm khỏi giỏ
  const removeFromCart = useCallback(
    async (productId, productVariantId) => {
      try {
        const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));

        // 1️⃣ Cập nhật local state
        const newCart = cart.filter(
          (item) =>
            !(item.id === productId && item.product_variant_id === productVariantId)
        );
        await saveCart(newCart);

        // 📤 Gửi request xóa khỏi DB
        if (user?.id) {
          try {
            await axios.delete(
              `${API_BASE_URL}/cart/${user.id}/item/${productVariantId}/`
            );
            console.log('✅ Xóa khỏi giỏ hàng thành công');
            return true;
          } catch (err) {
            console.error('⚠️ Lỗi xóa DB (nhưng đã xóa local):', err.response?.data || err.message);
            return true;
          }
        }

        return true;
      } catch (err) {
        console.error('❌ Lỗi xóa sản phẩm:', err);
        setError(err.message);
        return false;
      }
    },
    [cart, saveCart]
  );

  // ✅ Cập nhật trạng thái checked của sản phẩm
  const updateItemChecked = useCallback(
    async (productId, checked) => {
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
    },
    [cart, saveCart]
  );

  // 🗑️ Xóa toàn bộ giỏ hàng
  const clearCart = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));

      await saveCart([]);

      if (user?.id) {
        try {
          await axios.delete(`${API_BASE_URL}/cart/${user.id}/clear/`);
          console.log('✅ Xóa toàn bộ giỏ thành công');
          return true;
        } catch (err) {
          console.error('⚠️ Lỗi xóa toàn bộ DB:', err.response?.data || err.message);
          return true;
        }
      }

      return true;
    } catch (err) {
      console.error('❌ Lỗi xóa toàn bộ giỏ:', err);
      setError(err.message);
      return false;
    }
  }, [saveCart]);

  // 👤 Lấy thông tin user hiện tại
  const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  };

  // 📊 Lấy tổng số sản phẩm trong giỏ
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // 💰 Lấy tổng tiền giỏ hàng
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.current_price || item.price) * item.quantity, 0);
  };

  // ✔️ Lấy sản phẩm đã được chọn
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
    updateCartItem,
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