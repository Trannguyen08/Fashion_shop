import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  ShoppingBag, Star, ShieldCheck, ArrowLeft 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import user from '../../assets/images/user.png';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const UserDetail = ({ accountId, onBack }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accountId) {
      fetchUserDetail();
    }
  }, [accountId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_accessToken');
      const response = await axios.get(
        `${API_BASE_URL}/customers/details/${accountId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUserData(response.data.data);
      } else {
        toast.error('Không thể tải thông tin người dùng', {
          position: 'bottom-right'
        });
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
      toast.error('Đã có lỗi xảy ra khi tải thông tin', {
        position: 'bottom-right'
      });
    } finally {
      setLoading(false);
    }
  };

  const actionBtnStyle = { 
    width: '28px', 
    height: '28px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '0' 
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!userData) {
    return (
      <div className="container-fluid bg-light min-vh-100">
        <button className="btn btn-link text-decoration-none text-dark mb-4 p-0 d-flex align-items-center" onClick={onBack}>
          <ArrowLeft size={20} className="me-2" /> Quay lại danh sách
        </button>
        <div className="alert alert-warning">Không tìm thấy thông tin người dùng</div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100">
      {/* Nút quay lại */}
      <button className="btn btn-link text-decoration-none text-dark mb-4 p-0 d-flex align-items-center" onClick={onBack}>
        <ArrowLeft size={20} className="me-2" /> Quay lại danh sách
      </button>

      <div className="row g-4">
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm text-center p-4 mb-4">
            <div className="mx-auto mb-3">
              <img 
                src={userData.avatar} 
                className="rounded-circle border p-1" 
                width="120" 
                height="120" 
                alt="Avatar"
                onError={(e) => {
                  e.target.src = user;
                }}
              />
            </div>
            <h4 className="fw-bold mb-1">{userData.name}</h4>
            <span className="badge bg-primary-subtle text-primary rounded-pill mb-3 px-3">
              {userData.role}
            </span>
            
            {!userData.is_active && (
              <div className="alert alert-danger py-2 small mb-3">
                Tài khoản đã bị vô hiệu hóa
              </div>
            )}
            
            <div className="row g-2 mt-2">
              <div className="col-6">
                <div className="bg-light p-2 rounded">
                  <small className="text-muted d-block">Đơn hàng</small>
                  <span className="fw-bold">{userData.orderCount}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-2 rounded">
                  <small className="text-muted d-block">Đã chi</small>
                  <span className="fw-bold text-danger">
                    {userData.totalSpent.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <User size={18} className="me-2 text-primary" /> Chi tiết tài khoản
            </h6>
            <div className="vstack gap-3 small">
              <div className="d-flex align-items-center">
                <Mail size={16} className="text-muted me-3" />
                <div>
                  <div className="text-muted">Email</div>
                  <div className="fw-semibold">{userData.email}</div>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <Phone size={16} className="text-muted me-3" />
                <div>
                  <div className="text-muted">Số điện thoại</div>
                  <div className="fw-semibold">{userData.phone}</div>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <MapPin size={16} className="text-muted me-3" />
                <div>
                  <div className="text-muted">Địa chỉ</div>
                  <div className="fw-semibold">{userData.address}</div>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <Calendar size={16} className="text-muted me-3" />
                <div>
                  <div className="text-muted">Ngày tham gia</div>
                  <div className="fw-semibold">{userData.joinDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: LỊCH SỬ GIAO DỊCH & ĐÁNH GIÁ */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3">
              <ul className="nav nav-tabs card-header-tabs border-0">
                <li className="nav-item">
                  <button 
                    className={`nav-link border-0 px-4 fw-bold ${activeTab === 'orders' ? 'active text-primary border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <ShoppingBag size={18} className="me-2" /> 
                    Đơn hàng đã mua ({userData.purchaseHistory?.length || 0})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link border-0 px-4 fw-bold ${activeTab === 'reviews' ? 'active text-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    <Star size={18} className="me-2" /> 
                    Đánh giá ({userData.reviewHistory?.length || 0})
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-0 mt-3">
              {activeTab === 'orders' ? (
                <div className="table-responsive">
                  {userData.purchaseHistory && userData.purchaseHistory.length > 0 ? (
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr className="small text-muted">
                          <th className="px-4 py-3">Mã đơn</th>
                          <th className="py-3">Ngày đặt</th>
                          <th className="py-3 text-end">Tổng tiền</th>
                          <th className="py-3 text-center">Trạng thái</th>
                          <th className="px-4 py-3 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.purchaseHistory.map(order => (
                          <tr key={order.id}>
                            <td className="px-4 py-3 fw-bold">{order.id}</td>
                            <td className="py-3">{order.date}</td>
                            <td className="py-3 text-end fw-bold">
                              {order.total.toLocaleString('vi-VN')}₫
                            </td>
                            <td className="py-3 text-center">
                              <span className={`badge rounded-pill ${
                                order.status === 'Delivered' 
                                  ? 'bg-success-subtle text-success' 
                                  : order.status === 'Cancelled'
                                  ? 'bg-danger-subtle text-danger'
                                  : order.status === 'Pending'
                                  ? 'bg-info-subtle text-info'
                                  : 'bg-warning-subtle text-warning'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                className="btn btn-sm btn-outline-primary rounded-circle mx-auto" 
                                style={actionBtnStyle}
                                title="Xem chi tiết"
                              >
                                <ShieldCheck size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <ShoppingBag size={48} className="mb-3 opacity-25" />
                      <p className="mb-0">Chưa có đơn hàng nào</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  {userData.reviewHistory && userData.reviewHistory.length > 0 ? (
                    <div className="vstack gap-4">
                      {userData.reviewHistory.map(rev => (
                        <div key={rev.id} className="border-bottom pb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <h6 className="fw-bold mb-0">{rev.product}</h6>
                            <small className="text-muted">{rev.date}</small>
                          </div>
                          <div className="text-warning mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                fill={i < rev.rating ? "orange" : "none"} 
                                strokeWidth={i < rev.rating ? 0 : 2} 
                              />
                            ))}
                          </div>
                          <p className="text-secondary small mb-0 fst-italic">
                            "{rev.comment || 'Không có nhận xét'}"
                          </p>
                          <span className={`badge rounded-pill mt-2 ${
                            rev.status === 'approved' 
                              ? 'bg-success-subtle text-success'
                              : rev.status === 'pending'
                              ? 'bg-warning-subtle text-warning'
                              : 'bg-secondary-subtle text-secondary'
                          }`}>
                            {rev.status === 'approved' ? 'Đã duyệt' : 
                             rev.status === 'pending' ? 'Chờ duyệt' : 'Đã ẩn'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <Star size={48} className="mb-3 opacity-25" />
                      <p className="mb-0">Chưa có đánh giá nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;