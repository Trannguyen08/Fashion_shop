import React, { useState, useMemo, useEffect } from 'react';
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
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/review';
const token = localStorage.getItem('admin_accessToken');

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [starFilter, setStarFilter] = useState('All');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch reviews from API
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/all-reviews/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setReviews(response.data.data);
      console.log("Fetched reviews:", response.data.data[0].status);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Không thể tải danh sách đánh giá', {
        position: 'bottom-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Unified function để xử lý tất cả các thao tác: approve, hide, toggle visibility
  const handleReviewAction = async (id, action) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/toggle/${id}/`, 
        { "action": action }, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        setReviews(prevReviews => prevReviews.map(r => {
          if (r.id === id) {
            const newStatus = action === 'approved' ? 'approved' : 'hidden';
            return { ...r, status: newStatus };
          }
          return r;
        }));

        // Thông báo thành công
        const message = action === 'approve' ? 'Đã duyệt đánh giá' : 'Đã ẩn đánh giá';
        toast.success(message, { position: 'bottom-right', autoClose: 2000 });
      }
    } catch (error) {
      console.error('Error handling review action:', error);
      toast.error('Không thể thay đổi trạng thái', { position: 'bottom-right' });
    }
  };

  // --- LOGIC TÍNH TOÁN DASHBOARD ---
  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'Pending').length;
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
    const productName = review.product_name;
    const matchesSearch = (productName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map status từ backend
    let reviewStatus = '';
    if (review.status === 'Pending') reviewStatus = 'Chờ duyệt';
    else if (review.status === 'approved') reviewStatus = 'Đã duyệt';
    else if (review.status === 'hidden') reviewStatus = 'Đã ẩn';
    
    const matchesStatus = statusFilter === 'All' || reviewStatus === statusFilter;
    const matchesStar = starFilter === 'All' || review.rating === parseInt(starFilter);
    
    return matchesSearch && matchesStatus && matchesStar;
  });

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

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Đang tải dữ liệu đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100">
      {/* HEADER & DASHBOARD */}
      <div className="mb-4">
        <h2 className="fw-bold d-flex align-items-center">
          <BarChart3 className="me-2 text-primary" size={28} /> Quản Lý Đánh Giá
        </h2>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                <MessageSquare className="text-primary" />
              </div>
              <div>
                <small className="text-muted d-block">Tổng đánh giá</small>
                <span className="h4 fw-bold">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-3 me-3">
                <Clock className="text-warning" />
              </div>
              <div>
                <small className="text-muted d-block">Chờ duyệt</small>
                <span className="h4 fw-bold">{stats.pending}</span>
              </div>
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
              <span className="input-group-text bg-white border-end-0">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm sản phẩm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select form-select-sm" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Đã ẩn">Đã ẩn</option>
            </select>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select form-select-sm" 
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value)}
            >
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
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <MessageSquare size={48} className="mb-3 opacity-25" />
                    <p className="mb-0">Không có đánh giá nào</p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => {
                  const productName = review.product_name;
                  const customerName = review.full_name;
                  
                  return (
                    <tr key={review.id}>
                      <td className="ps-4 fw-semibold">{productName}</td>
                      <td>{customerName}</td>
                      <td>
                        <div className="d-flex text-warning">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              fill={i < review.rating ? "orange" : "none"} 
                              strokeWidth={i < review.rating ? 0 : 2} 
                            />
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="text-truncate small" style={{ maxWidth: '280px' }}>
                          {review.comment || 'Không có nội dung'}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill ${
                          review.status === 'approved' 
                            ? 'bg-success-subtle text-success' 
                            : review.status === 'Pending'
                            ? 'bg-warning-subtle text-warning'
                            : 'bg-secondary-subtle text-secondary'
                        }`}>
                          {review.status === 'approved' ? 'Đã duyệt' : review.status === 'Pending' ? 'Chờ duyệt' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="text-center pe-4">
                        {/* Chỉ hiển thị nút khi status là pending */}
                        {review.status === 'Pending' ? (
                          <div className="d-inline-flex align-items-center rounded overflow-hidden">
                            <button 
                              style={actionBtnStyle} 
                              className="btn btn-light text-success border-end" 
                              onClick={() => handleReviewAction(review.id, 'approved')}
                              title="Duyệt"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button 
                              style={actionBtnStyle} 
                              className="btn btn-light text-danger" 
                              onClick={() => handleReviewAction(review.id, 'hide')}
                              title="Ẩn"
                            >
                              <EyeOff size={20} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reviews;