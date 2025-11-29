import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";
const CART_STORAGE_KEY = "cart";
const USER_STORAGE_KEY = "user";

export default function useCart() {
  const [cart, setCart] = useState([]);                // luôn là mảng items[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: JSON safe
  const safeJSON = (key, defaultValue = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // 🟦 Load giỏ hàng ban đầu
  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        setLoading(true);
        const user = safeJSON(USER_STORAGE_KEY);

        if (user?.id) {
          const res = await axios.get(`${API_BASE_URL}/cart/${user.id}/`);
          const items = res.data.data?.items || [];
          if (active) setCart(items);
        } else {
          const localCart = safeJSON(CART_STORAGE_KEY, []);
          if (active) setCart(localCart);
        }
      } catch (err) {
        console.error("Init cart error:", err);
        if (active) setCart([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    init();
    return () => { active = false; };
  }, []);

  // 🟦 Load từ DB
  const syncCartFromDB = async (userId) => {
    const res = await axios.get(`${API_BASE_URL}/cart/${userId}/`);
    const items = res.data.data?.items || [];
    setCart(items);
  };

  // 🟦 THÊM SẢN PHẨM
  const addToCart = useCallback(async (product, variantId, quantity = 1, variantInfo = {}) => {
    const user = safeJSON(USER_STORAGE_KEY);

    try {
      if (user?.id) {
        await axios.post(`${API_BASE_URL}/cart/${user.id}/add/`, {
          product_id: product.id,
          product_variant_id: variantId,
          quantity
        });
        await syncCartFromDB(user.id);
        return true;
      }

      // KHÁCH → local storage
      const prev = safeJSON(CART_STORAGE_KEY, []);

      let newCart = [...prev];
      const existIndex = newCart.findIndex(
        (i) => i.product_id === product.id && i.product_variant_id === variantId
      );

      if (existIndex !== -1) {
        newCart[existIndex].quantity += quantity;
        newCart[existIndex].total_price =
          newCart[existIndex].quantity *
          parseFloat(newCart[existIndex].current_price);
      } else {
        newCart.push({
          id: Date.now(), // fake id (DB sẽ thay thế sau)
          product_id: product.id,
          product_name: product.product_name || product.name || "",
          old_price: product.old_price || "0",
          current_price: product.current_price || product.price || 0,
          product_variant_id: variantId,
          size: variantInfo.size || "",
          color: variantInfo.color || "",
          quantity,
          total_price: quantity * parseFloat(product.current_price || product.price || 0),
        });
      }

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      setCart(newCart);
      return true;

    } catch (err) {
      console.error("Add error:", err);
      setError(err.message);
      return false;
    }
  }, [cart]);

  // 🟦 CẬP NHẬT SỐ LƯỢNG
  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    const user = safeJSON(USER_STORAGE_KEY);

    if (quantity < 1) return removeFromCart(cartItemId);

    try {
      if (user?.id) {
        await axios.put(`${API_BASE_URL}/cart/${user.id}/item/${cartItemId}/`, {
          quantity,
        });
        await syncCartFromDB(user.id);
        return true;
      }

      // local
      const newCart = cart.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity,
              total_price: quantity * parseFloat(item.current_price)
            }
          : item
      );

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      setCart(newCart);
      return true;

    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
      return false;
    }
  }, [cart]);

  // 🟦 XÓA 1 ITEM
  const removeFromCart = useCallback(async (cartItemId) => {
    const user = safeJSON(USER_STORAGE_KEY);

    try {
      if (user?.id) {
        await axios.delete(`${API_BASE_URL}/cart/${user.id}/item/${cartItemId}/`);
        await syncCartFromDB(user.id);
      } else {
        const newCart = cart.filter((i) => i.id !== cartItemId);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        setCart(newCart);
      }

      return true;

    } catch (err) {
      console.error("Remove error:", err);
      setError(err.message);
      return false;
    }
  }, [cart]);

  // 🟦 XÓA TOÀN BỘ
  const clearCart = useCallback(async () => {
    const user = safeJSON(USER_STORAGE_KEY);

    try {
      if (user?.id) {
        await axios.delete(`${API_BASE_URL}/cart/${user.id}/clear/`);
        setCart([]);
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
        setCart([]);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // 🟦 Utils
  const getTotalItems = () =>
    cart.reduce((sum, i) => sum + i.quantity, 0);

  const getTotalPrice = () =>
    cart.reduce((sum, i) => sum + (i.total_price || 0), 0);

  return {
    cart,
    loading,
    error,

    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCartFromDB,

    getTotalItems,
    getTotalPrice,
  };
}
