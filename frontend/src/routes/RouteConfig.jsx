import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login';     
import Register from '../pages/login/Register'; 
import Home from '../pages/client/Home/Home';

export default function RouteConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="*" element={<h1>404 - Not Found</h1>} />
    </Routes>
  );
}