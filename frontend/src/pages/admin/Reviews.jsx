import React, { useState, useMemo } from 'react';
import { 
  Star, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  MessageSquare,
  Clock,
  BarChart3
} from 'lucide-react';

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [starFilter, setStarFilter] = useState('All');

  const [reviews, setReviews] = useState([
    { id: 1, product: 'Áo thun cơ bản', customer: 'Nguyễn Văn A', rating: 5, content: 'Sản phẩm chất lượng tốt, giao hàng nhanh.', status: 'Đã duyệt', hidden: false },
    { id: 2, product: 'Tai nghe Bluetooth X5', customer: 'Trần Thị B', rating: 3, content: 'Âm thanh không được như kỳ vọng, nhưng chấp nhận được.', status: 'Chờ duyệt', hidden: false },
    { id: 3, product: 'Sách nấu ăn 101', customer: 'Lê Văn C', rating: 5, content: 'Tuyệt vời, sách rất hữu ích!', status: 'Đã duyệt', hidden: false },
    { id: 4, product: 'Giày chạy bộ', customer: 'Phạm Đăng D', rating: 2, content: 'Đế hơi cứng, đi đau chân.', status: 'Chờ duyệt', hidden: false },
  ]);

  // --- LOGIC TÍNH TOÁN DASHBOARD ---
  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'Chờ duyệt').length;
    const avgRating = total > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) : 0;
    
    const starCounts = [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(r => r.rating === star).length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return { star, count, percentage };
    });

    return { total, pending, avgRating, starCounts };
  }, [reviews]);

  // --- LOGIC BỘ LỌC ---
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || review.status === statusFilter;
    const matchesStar = starFilter === 'All' || review.rating === parseInt(starFilter);
    return matchesSearch && matchesStatus && matchesStar;
  });

  const toggleHide = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));
  };

  const approveReview = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: 'Đã duyệt' } : r));
  };

  // Style chung cho các nút hành động nhỏ
  const actionBtnStyle = {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    border: 'none'
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      {/* HEADER & DASHBOARD (Giữ nguyên cấu trúc đã tối ưu) */}
      <div className="mb-4">
        <h2 className="fw-bold d-flex align-items-center">
          <BarChart3 className="me-2 text-primary" size={28} /> Quản Lý Đánh Giá
        </h2>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3"><MessageSquare className="text-primary" /></div>
              <div><small className="text-muted d-block">Tổng đánh giá</small><span className="h4 fw-bold">{stats.total}</span></div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-3 me-3"><Clock className="text-warning" /></div>
              <div><small className="text-muted d-block">Chờ duyệt</small><span className="h4 fw-bold">{stats.pending}</span></div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <small className="text-muted d-block">Trung bình</small>
              <span className="h2 fw-bold text-warning">{stats.avgRating}</span>
              <div className="text-warning mt-n1">★</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 px-3 py-2">
            <small className="text-muted mb-1 d-block">Phân bổ</small>
            {stats.starCounts.map(item => (
              <div key={item.star} className="d-flex align-items-center mb-1" style={{ fontSize: '0.75rem' }}>
                <span style={{ width: '35px' }}>{item.star} ★</span>
                <div className="progress flex-grow-1 mx-2" style={{ height: '4px' }}>
                  <div className="progress-bar bg-warning" style={{ width: `${item.percentage}%` }}></div>
                </div>
                <span className="text-muted">{Math.round(item.percentage)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MULTI-FILTER BOX */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body row g-2">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0"><Search size={16} /></span>
              <input type="text" className="form-control border-start-0" placeholder="Tìm sản phẩm..." onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">Tất cả trạng thái</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" onChange={(e) => setStarFilter(e.target.value)}>
              <option value="All">Tất cả sao</option>
              {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} sao</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small">
                <th className="ps-4">SẢN PHẨM</th>
                <th>KHÁCH HÀNG</th>
                <th>ĐÁNH GIÁ</th>
                <th style={{ width: '30%' }}>NỘI DUNG</th>
                <th className="text-center">TRẠNG THÁI</th>
                <th className="text-center pe-4">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id} className={review.hidden ? "opacity-50" : ""}>
                  <td className="ps-4 fw-semibold">{review.product}</td>
                  <td>{review.customer}</td>
                  <td>
                    <div className="d-flex text-warning">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? "orange" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                      ))}
                    </div>
                  </td>
                  <td><div className="text-truncate small" style={{ maxWidth: '280px' }}>{review.content}</div></td>
                  <td className="text-center">
                    <span className={`badge rounded-pill ${review.status === 'Đã duyệt' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="text-center pe-4">
                    <div className="d-inline-flex align-items-center rounded overflow-hidden">
                      {review.status === 'Chờ duyệt' && (
                        <button 
                          style={actionBtnStyle} 
                          className="btn btn-light text-success border-end" 
                          onClick={() => approveReview(review.id)}
                          title="Duyệt"
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}
                      <button style={actionBtnStyle} className="btn btn-light text-primary border-end" title="Xem">
                        <Eye size={20} />
                      </button>
                      <button 
                        style={actionBtnStyle} 
                        className={`btn btn-light ${review.hidden ? 'text-secondary' : 'text-info'}`} 
                        onClick={() => toggleHide(review.id)}
                        title={review.hidden ? "Bỏ ẩn" : "Ẩn"}
                      >
                        {review.hidden ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reviews;