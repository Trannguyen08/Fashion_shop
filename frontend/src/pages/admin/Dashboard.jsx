import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

// --- HÀM TẠO DỮ LIỆU NGÀY THÁNG ĐỘNG (7 NGÀY) ---
const generateLast7DaysData = () => {
  const data = [];
  // Mảng 7 giá trị giả lập cho doanh thu
  const baseValues = [15, 25, 22, 30, 28, 35, 40]; 
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    // Định dạng ngày/tháng (VD: 29/12)
    const dateString = `${d.getDate()}/${d.getMonth() + 1}`;
    
    data.push({
      date: dateString,
      val: baseValues[6 - i]
    });
  }
  return data;
};

const REVENUE_DATA = generateLast7DaysData();

const DATA = {
  summary: [
    { title: "Tổng Doanh Thu", value: "1.25B₫", color: "bg-primary", icon: "💰" },
    { title: "Tổng Đơn Hàng", value: "15,420", color: "bg-info", icon: "📦" },
    { title: "Tổng User", value: "8,900", color: "bg-dark", icon: "👤" },
  ],
  categories: [
    { name: 'Điện tử', value: 45, color: '#0d6efd' },
    { name: 'Thời trang', value: 30, color: '#ffc107' },
    { name: 'Gia dụng', value: 25, color: '#198754' },
  ],
  topProducts: [
    { name: "iPhone 15 Pro", sales: 120, rev: "3.6B" },
    { name: "Apple Watch S9", sales: 85, rev: "850M" },
    { name: "AirPods Pro", sales: 200, rev: "1.2B" },
    { name: "Sony WH-1000XM5", sales: 45, rev: "400M" },
    { name: "Logitech MX Master", sales: 90, rev: "180M" },
  ],
  topCustomers: [
    { name: "Nguyễn Công Trình", orders: 52, total: "150M" },
    { name: "Lê Mỹ Huyền", orders: 48, total: "120M" },
    { name: "Trần Hoàng Bách", orders: 42, total: "95M" },
    { name: "Phạm Minh Tâm", orders: 38, total: "80M" },
    { name: "Võ Thị Sáu", orders: 35, total: "70M" },
  ]
};

const Dashboard = () => {
  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      
      {/* --- PHẦN TRÊN --- */}
      <div className="row g-4 mb-4">
        <div className="col-lg-9">
          <div className="row g-3 mb-4">
            {DATA.summary.map((item, idx) => (
              <div className="col-md-4" key={idx}>
                <div className={`card border-0 shadow-sm ${item.color} text-white`}>
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div><small className="opacity-75">{item.title}</small><h4 className="fw-bold mb-0">{item.value}</h4></div>
                    <span className="fs-2 opacity-50">{item.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3">
            {/* BIỂU ĐỒ 7 NGÀY QUA */}
            <div className="col-md-8">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="fw-bold text-muted text-uppercase small mb-0">Doanh thu 7 ngày qua (Triệu đồng)</h6>
                    <span className="badge bg-soft-primary text-primary border-0 small px-3">Tuần này</span>
                  </div>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      {/* margin left: -20 giúp kéo biểu đồ về sát lề trái hơn */}
                      <LineChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{fontSize: 11, fill: '#999'}} 
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis 
                          tick={{fontSize: 11, fill: '#999'}} 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="val" 
                          stroke="#0d6efd" 
                          strokeWidth={3} 
                          dot={{r:4, fill: '#0d6efd', strokeWidth: 2, stroke: '#fff'}} 
                          activeDot={{r:6, strokeWidth: 0}} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="d-flex flex-column h-100 gap-3">
                <div className="card border-0 shadow-sm flex-fill border-start border-success border-4 p-3">
                   <small className="text-muted fw-bold text-uppercase" style={{fontSize: '10px'}}>Đơn hàng hôm nay</small>
                   <h3 className="text-success fw-bold mb-0">+145</h3>
                </div>
                <div className="card border-0 shadow-sm flex-fill border-start border-warning border-4 p-3">
                   <small className="text-muted fw-bold text-uppercase" style={{fontSize: '10px'}}>Doanh thu hôm nay</small>
                   <h3 className="text-warning fw-bold mb-0">18.2M</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3">
          {/* Pie Chart Category */}
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex flex-column p-4">
              <h6 className="fw-bold mb-4 text-muted text-uppercase small text-center">Tỷ trọng danh mục</h6>
              <div className="flex-grow-1">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={DATA.categories} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {DATA.categories.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                {DATA.categories.map((cat, i) => (
                  <div key={i} className="d-flex justify-content-between small mb-2 p-2 bg-light rounded">
                    <span><i className="fas fa-circle me-2" style={{color: cat.color}}></i> {cat.name}</span>
                    <span className="fw-bold">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PHẦN DƯỚI --- */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 px-4"><h6 className="fw-bold mb-0 small text-muted text-uppercase">Sản phẩm bán chạy nhất tuần</h6></div>
            <div className="card-body p-4">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light"><tr className="small text-muted"><th>Sản phẩm</th><th className="text-center">Số lượng</th><th className="text-end">Doanh thu</th></tr></thead>
                  <tbody className="small">
                    {DATA.topProducts.map((p, i) => (
                      <tr key={i}><td>{p.name}</td><td className="text-center"><span className="badge bg-primary bg-opacity-10 text-primary">{p.sales}</span></td><td className="text-end fw-bold">{p.rev}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 px-4"><h6 className="fw-bold mb-0 small text-muted text-uppercase">Khách hàng VIP tuần này</h6></div>
            <div className="card-body p-4">
              <ul className="list-group list-group-flush">
                {DATA.topCustomers.map((c, i) => (
                  <li key={i} className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold" style={{width: '35px', height: '35px', fontSize: '11px'}}>{i+1}</div>
                      <div><div className="fw-bold small">{c.name}</div><small className="text-muted" style={{fontSize: '11px'}}>{c.orders} đơn hàng</small></div>
                    </div>
                    <span className="fw-bold small">{c.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;