import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/login/Login';     
import Register from '../pages/login/Register'; 
import Home from '../pages/client/Home';
import About from '../pages/client/About';
import Contact from '../pages/client/Contact';
import Category from '../pages/client/Category';
import CheckoutPage from '../pages/client/CheckoutPage';
import Profile from '../pages/client/Profile';
import ProductDetail from '../components/Product/ProductDetail';
import Cart from '../pages/client/Cart';

const ProductDetailPage = () => {
  const location = useLocation();
  const product = location.state?.product;
  return <ProductDetail product={product} />;
};

export default function RouteConfig() {
  return (
    <Routes>
      {/* Routes AVEC Header/Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/category/:category" element={<Category />} />
        <Route path="/best-seller" element={<Category />} />
        <Route path="/shop" element={<Category />} />
        <Route path="/new-arrival" element={<Category />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
      </Route>

      {/* Routes SANS Header/Footer (Login/Register) */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* 404 */}
      <Route path="*" element={<h1>404 - Not Found</h1>} />
    </Routes>
  );
}