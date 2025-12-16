// src/utils/validators.js

/**
 * Kiểm tra tên đăng nhập
 * - Không rỗng
 * - Tối thiểu 3 ký tự
 * - Chỉ chứa chữ cái (hoa, thường), số và dấu gạch dưới (_)
 */
export const validateUsername = (username) => {
  if (!username.trim()) return "Tên đăng nhập không được để trống";
  const usernameRegex = /^[A-Za-z0-9_]{3,}$/;
  if (!usernameRegex.test(username.trim()))
    return "Tên đăng nhập không hợp lệ! (Chỉ chứa chữ, số, _, tối thiểu 3 ký tự)";
  return null;
};

/**
 * Kiểm tra họ và tên
 * - Không rỗng
 * - Tối thiểu 3 ký tự
 * - Chỉ chứa chữ cái (bao gồm tiếng Việt có dấu) và khoảng trắng
 */
export const validateFullName = (fullName) => {
  if (!fullName.trim()) return "Họ và tên không được để trống";
  const nameRegex = /^[A-Za-zÀ-ỹ\s]{3,}$/u;
  if (!nameRegex.test(fullName.trim()))
    return "Họ tên không hợp lệ! (Chỉ chứa chữ cái và khoảng trắng, tối thiểu 3 ký tự)";
  return null;
};

/**
 * Kiểm tra số điện thoại
 * - Không rỗng
 * - Theo định dạng số điện thoại Việt Nam (0xx... hoặc +84xx...)
 */
export const validatePhone = (phone) => {
  if (!phone.trim()) return "Số điện thoại không được để trống";
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  if (!phoneRegex.test(phone.trim())) return "Số điện thoại không hợp lệ!";
  return null;
};

/**
 * Kiểm tra email
 * - Không rỗng
 * - Theo định dạng email chuẩn
 */
export const validateEmail = (email) => {
  if (!email.trim()) return "Email không được để trống";
  const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) return "Email không hợp lệ!";
  return null;
};

/**
 * Kiểm tra mật khẩu
 * - Không rỗng
 * - Tối thiểu 6 ký tự
 */
export const validatePassword = (password) => {
  if (!password.trim()) return "Mật khẩu không được để trống";
  if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
  return null;
};

// Hàm này không cần thiết trong component Register, nhưng tôi vẫn giữ lại từ file utils ban đầu.
export const validateConfirmPassword = (password, confirmPassword) => {
  if (password !== confirmPassword) return "Mật khẩu nhập lại không khớp";
  return null;
};