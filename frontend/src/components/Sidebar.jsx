import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Tag, Package, ShoppingCart, 
    Ticket, Star, MessageCircle, CreditCard 
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/admin', Icon: LayoutDashboard },
    { name: 'Quản lý khách hàng', path: '/admin/customers', Icon: Users },
    { name: 'Quản lý danh mục', path: '/admin/categories', Icon: Tag },
    { name: 'Quản lý sản phẩm', path: '/admin/products', Icon: Package },
    { name: 'Quản lý đơn hàng', path: '/admin/orders', Icon: ShoppingCart },
    { name: 'Quản lý Voucher', path: '/admin/vouchers', Icon: Ticket },
    { name: 'Quản lý Đánh giá', path: '/admin/reviews', Icon: Star },
    { name: 'Quản lý Giao dịch', path: '/admin/transactions', Icon: CreditCard },
    { name: 'Hỗ trợ khách hàng', path: '/admin/support', Icon: MessageCircle },
];

const Sidebar = () => {
    return (
        <div className="bg-dark text-white d-flex flex-column" style={{ width: '280px', height: '100vh', flexShrink: 0 }}>
            <div className="p-4 fs-4 fw-bold text-center border-bottom border-secondary">
                E-commerce Admin
            </div>
            
            <nav className="flex-grow-1 p-3 d-flex flex-column gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center p-2 rounded text-light transition-base 
                            ${isActive 
                                ? 'bg-primary shadow-sm fw-bold' 
                                : 'text-opacity-75 hover-bg-secondary'
                            }`
                        }
                        end 
                    >
                        <span className="me-3 fs-5 d-flex align-items-center">
                            <item.Icon size={20} /> 
                        </span>
                        <span className="fw-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            
            <div className="p-4 small text-muted border-top border-secondary">
                © 2025 Admin Panel
            </div>
            
            <style jsx="true">{`
                .hover-bg-secondary:hover {
                    background-color: rgba(255, 255, 255, 0.1); 
                }
                .transition-base {
                    transition: background-color 0.2s, box-shadow 0.2s;
                }
                /* Tùy chỉnh nhỏ để căn giữa icon nếu cần */
                .nav-link {
                    align-items: center; 
                }
            `}</style>
        </div>
    );
};

export default Sidebar;