import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login';     
import Register from '../pages/login/Register'; 
import Home from '../pages/client/Home/Home';
import About from '../pages/client/About/About';
import Contact from '../pages/client/Contact/Contact';
import Category from '../pages/client/Category/Category';
import ProductDetail from '../components/Product/ProductDetail';
import { useLocation } from 'react-router-dom';

const ProductDetailPage = () => {
  const location = useLocation();
  const product = location.state?.product;
  return <ProductDetail product={product} />;
};

export default function RouteConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/category/:category" element={<Category />} />
      <Route path="/product/:productId" element={<ProductDetailPage />} />
      <Route path="*" element={<h1>404 - Not Found</h1>} />
    </Routes>
  );
}