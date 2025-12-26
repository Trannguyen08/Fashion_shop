import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  ShoppingBag, Star, ShieldCheck, ArrowLeft 
} from 'lucide-react';

const UserDetail = ({ userId = "KH001", onBack }) => {
  const [activeTab, setActiveTab] = useState('orders');

  // Dữ liệu giả lập của User
  const userData = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    phone: "0901234567",
    address: "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    joinDate: "15/01/2024",
    role: "Khách hàng thân thiết",
    avatar: "https://via.placeholder.com/150",
    totalSpent: 15450000,
    orderCount: 12
  };

  // Danh sách đơn hàng đã mua
  const purchaseHistory = [
    { id: 'DH001', date: '15/11/2025', total: 350000, status: 'Đã giao' },
    { id: 'DH052', date: '20/10/2025', total: 1250000, status: 'Đã giao' },
    { id: 'DH104', date: '05/09/2025', total: 500000, status: 'Đã hủy' },
  ];

  // Danh sách đánh giá đã thực hiện
  const reviewHistory = [
    { id: 1, product: 'Áo thun Nam', rating: 5, comment: 'Vải rất đẹp, mặc mát.', date: '16/11/2025' },
    { id: 2, product: 'Giày sneaker', rating: 4, comment: 'Giày đẹp nhưng giao hàng hơi lâu.', date: '22/10/2025' },
  ];

  const actionBtnStyle = { width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' };

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
              <img src={userData.avatar} className="rounded-circle border p-1" width="120" height="120" alt="Avatar" />
            </div>
            <h4 className="fw-bold mb-1">{userData.name}</h4>
            <span className="badge bg-primary-subtle text-primary rounded-pill mb-3 px-3">{userData.role}</span>
            
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
                  <span className="fw-bold text-danger">{userData.totalSpent.toLocaleString()}đ</span>
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
                <div><div className="text-muted">Email</div><div className="fw-semibold">{userData.email}</div></div>
              </div>
              <div className="d-flex align-items-center">
                <Phone size={16} className="text-muted me-3" />
                <div><div className="text-muted">Số điện thoại</div><div className="fw-semibold">{userData.phone}</div></div>
              </div>
              <div className="d-flex align-items-center">
                <MapPin size={16} className="text-muted me-3" />
                <div><div className="text-muted">Địa chỉ</div><div className="fw-semibold">{userData.address}</div></div>
              </div>
              <div className="d-flex align-items-center">
                <Calendar size={16} className="text-muted me-3" />
                <div><div className="text-muted">Ngày tham gia</div><div className="fw-semibold">{userData.joinDate}</div></div>
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
                    <ShoppingBag size={18} className="me-2" /> Đơn hàng đã mua
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link border-0 px-4 fw-bold ${activeTab === 'reviews' ? 'active text-primary border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    <Star size={18} className="me-2" /> Đánh giá của tôi
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-0 mt-3">
              {activeTab === 'orders' ? (
                <div className="table-responsive">
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
                      {purchaseHistory.map(order => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 fw-bold">{order.id}</td>
                          <td className="py-3">{order.date}</td>
                          <td className="py-3 text-end fw-bold">{order.total.toLocaleString()}đ</td>
                          <td className="py-3 text-center">
                            <span className={`badge rounded-pill ${order.status === 'Đã giao' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="btn btn-sm btn-outline-primary rounded-circle mx-auto" style={actionBtnStyle}>
                              <ShieldCheck size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 vstack gap-4">
                  {reviewHistory.map(rev => (
                    <div key={rev.id} className="border-bottom pb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <h6 className="fw-bold mb-0">{rev.product}</h6>
                        <small className="text-muted">{rev.date}</small>
                      </div>
                      <div className="text-warning mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < rev.rating ? "orange" : "none"} strokeWidth={i < rev.rating ? 0 : 2} />
                        ))}
                      </div>
                      <p className="text-secondary small mb-0 fst-italic">"{rev.comment}"</p>
                    </div>
                  ))}
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