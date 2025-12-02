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


