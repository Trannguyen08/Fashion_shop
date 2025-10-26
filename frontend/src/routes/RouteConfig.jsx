import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login';     
import Register from '../pages/login/Register'; 

export default function RouteConfig() {
  return (
    <Routes>
      {/* Route chính (Trang Đăng nhập) */}
      <Route path="/" element={<Login />} />
      
      {/* Route Đăng ký */}
      <Route path="/register" element={<Register />} />
      
      <Route path="*" element={<h1>404 - Not Found</h1>} />
    </Routes>
  );
}