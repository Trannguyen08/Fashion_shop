export const formatPrice = (priceString) => {
    // Chuyển đổi chuỗi thành số thực, nếu không hợp lệ thì gán bằng 0
    const price = parseFloat(priceString) || 0; 

    // Kiểm tra và trả về nếu giá trị là 0 hoặc không phải số
    if (price === 0 && (priceString === null || priceString === undefined || isNaN(parseFloat(priceString)))) {
        return '0₫';
    }
    
    // Sử dụng Intl.NumberFormat để định dạng tiền tệ
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);
};

// 📌 Định dạng ngày -> dd/mm/yyyy
export const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// 📌 Nếu số thập phân nhưng .00 thì hiển thị số nguyên
export const formatNumberSmart = (value) => {
  const num = Number(value);
  if (isNaN(num)) return value;

  return Number.isInteger(num) 
    ? num.toString()
    : num.toString(); // hoặc num.toFixed(2) nếu muốn cố định 2 số thập phân
};

// 📌 Định dạng tiền Việt Nam (giữ nguyên logic của bạn)
export const formatCurrency = (v) => {
  const num = Number(v);
  if (isNaN(num)) return v;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};


