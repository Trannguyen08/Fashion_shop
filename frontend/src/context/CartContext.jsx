import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import useCart from '../hooks/useCart'; // Đường dẫn có thể cần điều chỉnh

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const cartData = useCart();
  const [selectedIds, setSelectedIds] = useState([]);

  // Hàm chọn/bỏ chọn một item
  const toggleSelectItem = useCallback((itemId) => {
    setSelectedIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []); // Dependency rỗng

  // Hàm chọn tất cả
  const selectAll = useCallback(() => {
    if (cartData.cart?.length > 0) {
      setSelectedIds(cartData.cart.map(item => item.id));
    }
  }, [cartData.cart]); // Phụ thuộc vào cartData.cart

  // Hàm bỏ chọn tất cả
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []); // Dependency rỗng

  // Tính toán các item được chọn (sử dụng useMemo)
  const getSelectedItems = useMemo(() => {
    if (!Array.isArray(cartData.cart)) return [];
    return cartData.cart.filter(item => selectedIds.includes(item.id));
  }, [cartData.cart, selectedIds]); // Phụ thuộc vào cart và selectedIds

  // Tính tổng tiền của các item được chọn (sử dụng useMemo)
  const getSelectedTotal = useMemo(() => {
    return getSelectedItems.reduce(
      (sum, item) => sum + (item.total_price || 0),
      0
    );
  }, [getSelectedItems]);

  // Tính số lượng item được chọn
  const getSelectedCount = useMemo(() => getSelectedItems.length, [getSelectedItems]);


  // ⭐ Dùng useMemo để tạo ra context value, đảm bảo chỉ thay đổi khi cần thiết
  const contextValue = useMemo(() => ({
    // Dữ liệu từ useCart: cart, loading, error, addToCart, v.v.
    ...cartData,
    // Dữ liệu selection mới
    selectedIds,
    toggleSelectItem,
    selectAll,
    clearSelection,
    getSelectedItems,
    // Các giá trị tính toán
    getSelectedTotal,
    getSelectedCount
  }), [
    cartData, // Dữ liệu giỏ hàng thay đổi (cart, loading,...)
    selectedIds,
    setSelectedIds,
    toggleSelectItem,
    selectAll,
    clearSelection,
    getSelectedItems,
    getSelectedTotal,
    getSelectedCount
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used inside CartProvider");
  return ctx;
};