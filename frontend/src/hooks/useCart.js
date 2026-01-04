import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";
const CART_STORAGE_KEY = "cart";
const USER_STORAGE_KEY = "user";
const token = localStorage.getItem("user_accessToken");

export default function useCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeJSON = (key, defaultValue = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const isCustomer = (user) => user?.id && user?.role === "customer";

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = safeJSON(USER_STORAGE_KEY);

      // ⛔ ADMIN / GUEST → không gọi API
      if (!isCustomer(user)) {
        console.log("Skip cart load — user is not customer");
        setCart([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/cart/${user.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(res.data.data?.items || []);
    } catch (err) {
      console.error("Load cart error:", err);
      setError(err.message);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === USER_STORAGE_KEY || e.key === CART_STORAGE_KEY) {
        loadCart();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleCustomStorageChange = () => loadCart();
    window.addEventListener("cartStorageChange", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartStorageChange", handleCustomStorageChange);
    };
  }, [loadCart]);

  const syncCartFromDB = useCallback(async (userId) => {
    const user = safeJSON(USER_STORAGE_KEY);
    if (!isCustomer(user)) return; // ⛔ Block admin

    try {
      const res = await axios.get(`${API_BASE_URL}/cart/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.data?.items || []);
    } catch (err) {
      console.error("Sync cart error:", err);
    }
  }, []);

  const addToCart = useCallback(
    async (product, variantId, quantity = 1, variantInfo = {}) => {
      const user = safeJSON(USER_STORAGE_KEY);

      try {
        if (isCustomer(user)) {
          await axios.post(
            `${API_BASE_URL}/cart/${user.id}/add/`,
            {
              product_id: product.id,
              product_variant_id: variantId,
              quantity,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          await syncCartFromDB(user.id);
          return true;
        }

        // Guest → localStorage
        const prev = safeJSON(CART_STORAGE_KEY, []);
        let newCart = [...prev];

        const existIndex = newCart.findIndex(
          (i) =>
            i.product_id === product.id &&
            i.product_variant_id === variantId
        );

        if (existIndex !== -1) {
          newCart[existIndex].quantity += quantity;
          newCart[existIndex].total_price =
            newCart[existIndex].quantity *
            parseFloat(newCart[existIndex].current_price);
        } else {
          newCart.push({
            id: Date.now(),
            product_id: product.id,
            product_name: product.name || "",
            old_price: String(product.old_price || 0),
            current_price: String(product.current_price || 0),
            product_img: product.product_img || "",
            product_variant_id: variantId,
            size: variantInfo.size || "",
            color: variantInfo.color || "",
            quantity,
            total_price:
              quantity * parseFloat(product.current_price || 0),
          });
        }

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        setCart(newCart);
        window.dispatchEvent(new Event("cartStorageChange"));
        return true;
      } catch (err) {
        console.error("Add to cart error:", err);
        setError(err.message);
        return false;
      }
    },
    [syncCartFromDB]
  );

  const updateCartItem = useCallback(
    async (cartItemId, productVariantId, quantity) => {
      const user = safeJSON(USER_STORAGE_KEY);

      if (quantity < 1) return removeFromCart(cartItemId);

      try {
        if (isCustomer(user)) {
          await axios.put(
            `${API_BASE_URL}/cart/${user.id}/item/${cartItemId}/`,
            { quantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          await syncCartFromDB(user.id);
          return true;
        }

        // Guest mode
        const newCart = cart.map((item) =>
          item.id === cartItemId
            ? {
                ...item,
                quantity,
                total_price: quantity * parseFloat(item.current_price),
              }
            : item
        );

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        setCart(newCart);
        window.dispatchEvent(new Event("cartStorageChange"));
        return true;
      } catch (err) {
        console.error("Update cart error:", err);
        setError(err.message);
        return false;
      }
    },
    [cart, syncCartFromDB]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      const user = safeJSON(USER_STORAGE_KEY);

      try {
        if (isCustomer(user)) {
          await axios.delete(
            `${API_BASE_URL}/cart/${user.id}/item/${cartItemId}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          await syncCartFromDB(user.id);
        } else {
          const newCart = cart.filter((i) => i.id !== cartItemId);
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
          setCart(newCart);
          window.dispatchEvent(new Event("cartStorageChange"));
        }
        return true;
      } catch (err) {
        console.error("Remove cart error:", err);
        setError(err.message);
        return false;
      }
    },
    [cart, syncCartFromDB]
  );

  const clearCart = useCallback(async () => {
    const user = safeJSON(USER_STORAGE_KEY);

    try {
      if (isCustomer(user)) {
        await axios.delete(`${API_BASE_URL}/cart/${user.id}/clear/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      localStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);
      window.dispatchEvent(new Event("cartStorageChange"));
    } catch (err) {
      console.error("Clear cart error:", err);
      setError(err.message);
    }
  }, []);

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
    loadCart,
    getTotalItems,
    getTotalPrice,
  };
}
