// src/utils/categoryUtils.js

/**
 * Chuyển đổi tên category thành slug URL-friendly
 * Ví dụ: "T-Shirt" -> "t-shirt", "Áo Khoác" -> "ao-khoac"
 */
export const createCategorySlug = (categoryName) => {
  if (!categoryName) return "";
  
  return categoryName
    .toLowerCase()
    .normalize("NFD") // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
    .replace(/\s+/g, "-") // Thay space bằng dấu gạch ngang
    .replace(/-+/g, "-") // Xóa nhiều dấu gạch ngang liên tiếp
    .trim();
};

/**
 * So sánh slug từ URL với tên category từ database
 * Dùng để match category khi load trang /category/:slug
 */
export const matchCategorySlug = (urlSlug, categoryName) => {
  if (!urlSlug || !categoryName) return false;
  
  const normalizedSlug = createCategorySlug(categoryName);
  const normalizedUrlSlug = urlSlug.toLowerCase().trim();
  
  return normalizedSlug === normalizedUrlSlug;
};

/**
 * Tìm category object từ danh sách dựa trên slug
 */
export const findCategoryBySlug = (categories, slug) => {
  if (!categories || !slug) return null;
  
  return categories.find(cat => 
    matchCategorySlug(slug, cat.name || cat.category_name)
  );
};

/**
 * Lấy category ID từ slug
 * Dùng khi cần gọi API với ID thay vì slug
 */
export const getCategoryIdFromSlug = (categories, slug) => {
  const category = findCategoryBySlug(categories, slug);
  return category ? (category.id || category.category_id) : null;
};

/**
 * Format tên category để hiển thị
 * Ví dụ: "t-shirt" -> "T-Shirt"
 */
export const formatCategoryName = (slug) => {
  if (!slug) return "";
  
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Kiểm tra xem slug có hợp lệ không
 */
export const isValidSlug = (slug) => {
  if (!slug) return false;
  
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
};

/**
 * Lấy danh sách categories từ localStorage (cache)
 * Để giảm số lần gọi API
 */
export const getCachedCategories = () => {
  try {
    const cached = localStorage.getItem("categories_cache");
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const ONE_HOUR = 60 * 60 * 1000;
    
    // Cache expire sau 1 giờ
    if (Date.now() - timestamp > ONE_HOUR) {
      localStorage.removeItem("categories_cache");
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

/**
 * Lưu danh sách categories vào localStorage
 */
export const setCachedCategories = (categories) => {
  try {
    const cacheData = {
      data: categories,
      timestamp: Date.now()
    };
    localStorage.setItem("categories_cache", JSON.stringify(cacheData));
  } catch (error) {
    console.error("Không thể cache categories:", error);
  }
};