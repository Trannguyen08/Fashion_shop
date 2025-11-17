import React from 'react';

const Reviews = () => {
  const reviews = [
    { id: 1, product: 'Áo thun cơ bản', customer: 'Nguyễn Văn A', rating: 5, content: 'Sản phẩm chất lượng tốt, giao hàng nhanh.', status: 'Đã duyệt' },
    { id: 2, product: 'Tai nghe Bluetooth X5', customer: 'Trần Thị B', rating: 3, content: 'Âm thanh không được như kỳ vọng, nhưng chấp nhận được.', status: 'Chờ duyệt' },
    { id: 3, product: 'Sách nấu ăn 101', customer: 'Lê Văn C', rating: 5, content: 'Tuyệt vời, sách rất hữu ích!', status: 'Đã duyệt' },
  ];

  // Hàm helper để xác định class màu Bootstrap dựa trên trạng thái
  const getStatusBadgeClass = (status) => {
    // bg-green-100/bg-yellow-100
    return status === 'Đã duyệt' ? 'bg-success text-white' : 'bg-warning text-dark';
  };
  
  // Hàm tạo chuỗi sao
  const renderStars = (rating) => {
    // Giả định sử dụng icon Bootstrap (bi-star-fill) hoặc emoji
    return (
        <span className="text-warning">
            {'⭐'.repeat(rating)} ({rating})
        </span>
    );
  };

  return (
    <div className="container-fluid my-4">
      
      <div className="mb-4">
        <h2 className="text-3xl fw-bold text-dark mb-1">
          <span className="me-2">⭐</span> Quản Lý Đánh Giá
        </h2>
      </div>
      
      {/* Thanh công cụ (Tìm kiếm và Lọc) */}
      <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo sản phẩm..."
          className="form-control w-25 me-3" // w-25 tương đương w-1/3
        />
        <select className="form-select w-auto">
          <option>Lọc theo trạng thái</option>
          <option>Chờ duyệt</option>
          <option>Đã duyệt</option>
        </select>
      </div>

      {/* Bảng Đánh giá */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">ID</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Sản phẩm</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Khách hàng</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Đánh giá</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3" style={{ width: '30%' }}>Nội dung</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3">Trạng thái</th>
                  <th scope="col" className="text-uppercase text-secondary fs-6 px-4 py-3 text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td className="align-middle px-4 py-3">{review.id}</td>
                    <td className="align-middle px-4 py-3 fw-bold text-dark">{review.product}</td>
                    <td className="align-middle px-4 py-3">{review.customer}</td>
                    <td className="align-middle px-4 py-3">{renderStars(review.rating)}</td>
                    {/* Giới hạn chiều rộng và thêm ellipsis cho nội dung dài */}
                    <td className="align-middle px-4 py-3 text-truncate" style={{ maxWidth: '250px' }}>
                        {review.content}
                    </td>
                    <td className="align-middle px-4 py-3">
                      <span className={`badge rounded-pill px-3 py-1 ${getStatusBadgeClass(review.status)} fw-normal`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="align-middle px-4 py-3 text-end">
                      {review.status === 'Chờ duyệt' && (
                        <button className="btn btn-sm btn-link text-success p-0 me-2">Duyệt</button>
                      )}
                      <button className="btn btn-sm btn-link text-danger p-0">Xóa/Ẩn</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;