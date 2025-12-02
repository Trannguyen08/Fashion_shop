import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// CLIENT IMPORTS
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

// ADMIN IMPORTS
import AdminLayout from '../layouts/AdminLayout'; // Layout Admin
import Dashboard from '../pages/admin/Dashboard';
import Customers from '../pages/admin/Customers';
import Categories from '../pages/admin/Categories';
import Products from '../pages/admin/Products';
import Orders from '../pages/admin/Orders';
import Vouchers from '../pages/admin/Vouchers';
import Reviews from '../pages/admin/Reviews';
import Shipping from '../pages/admin/Shipping';
import Transactions from '../pages/admin/Transactions';

const ProductDetailPage = () => {
  const location = useLocation();
  const product = location.state?.product;
  return <ProductDetail product={product} />;
};

export default function RouteConfig() {
  return (
    <Routes>
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
        <Route path="/search" element={<Category />} />
      </Route>

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} /> 
        <Route path="customers" element={<Customers />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="vouchers" element={<Vouchers />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="*" element={<h1>404 - Admin Page Not Found</h1>} />
      </Route>

      <Route path="*" element={<h1>404 - Not Found</h1>} />
    </Routes>
  );
}