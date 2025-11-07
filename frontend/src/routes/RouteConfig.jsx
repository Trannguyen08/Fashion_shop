import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login';     
import Register from '../pages/login/Register'; 
import Home from '../pages/client/Home/Home';
import About from '../pages/client/About/About';
import Top from '../pages/client/Category/Top';

export default function RouteConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/top" element={<Top />} />
      <Route path="*" element={<h1>404 - Not Found</h1>} />
    </Routes>
  );
}