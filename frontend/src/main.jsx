import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext'; 
import { CartProvider } from './context/CartContext'; // ✅ Đã import
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // ⚠️ Tạm thời bỏ StrictMode để tránh double render trong development
  // <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider> {/* ✅ Thêm CartProvider vào đây */}
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  // </React.StrictMode>
);