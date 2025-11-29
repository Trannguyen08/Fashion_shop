import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Pencil, PlusCircle, Search, EyeIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductFormModal from './ProductFormModal';
import { filterListByFields } from '../../utils/searchUtils';
import './Categories.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFormModal, setShowFormModal] = useState(false); 
    const [editingProduct, setEditingProduct] = useState(null); 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    const fetchProducts = async (page = 1) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/product/all-product/?page=${page}`);
            const mappedProducts = response.data.products.map(mapProduct);
            setProducts(mappedProducts);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
            alert('Không thể tải danh sách sản phẩm.');
        }
    };

    const mapProduct = (p) => ({
        id: p.id,
        name: p.name,
        basePrice: parseFloat(p.old_price),
        salePrice: p.current_price ? parseFloat(p.current_price) : null,
        description: p.description,
        sold: p.sold || 0,
        mainImage: p.product_img,
        variants: p.product_variants.map(v => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock_quantity,
            PV_img: v.PV_img,
            status: v.status
        })),
        product_imgs: p.product_imgs.map(img => ({
            id: img.id,
            PI_img: img.PI_img
        })),
        category: p.category_name,
        status: p.status === 'out-of-stock' ? 'Hết hàng' : p.status,
        isNew: p.is_new,
        isFeatured: p.is_featured,
        createdAt: p.created_at
    });

    const getStatusBadgeClass = (status) => {
        if (status === 'Active') return 'bg-success text-white';
        if (status === 'Hết hàng') return 'bg-danger text-white';
        return 'bg-secondary text-white';
    };

    // Khi click vào nút sửa
    const handleOpenFormModal = (productId = null) => {
        if (productId) {
            // Tìm sản phẩm theo id từ danh sách
            const productToEdit = products.find(p => p.id === productId);
            setEditingProduct(productToEdit || null);
        } else {
            setEditingProduct(null);
        }
        setShowFormModal(true);
    };

    const handleCloseFormModal = () => {
        setShowFormModal(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (responseData) => {
        try {
            console.log("✅ Products nhận được response:", responseData);
            
            let productData;
            
            // Nếu backend chỉ trả {message, product_id} → fetch lại
            if (responseData.product_id && !responseData.name) {
                const res = await axios.get(`http://127.0.0.1:8000/api/product/${responseData.product_id}/`);
                productData = res.data;
            } else {
                // Backend trả đầy đủ data
                productData = responseData;
            }
            
            const updatedProduct = mapProduct(productData);
            
            if (editingProduct) {
                setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
                alert('Cập nhật sản phẩm thành công!');
            } else {
                setProducts([updatedProduct, ...products]);
                alert('Thêm sản phẩm mới thành công!');
            }
            
            handleCloseFormModal();
        } catch (error) {
            console.error('Lỗi khi xử lý dữ liệu sản phẩm:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleToggleStatus = async (productId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Hidden' : 'Active';
            await axios.put(`http://127.0.0.1:8000/api/product/update/status/${productId}/`, { status: newStatus });
            setProducts(products.map(p =>
                p.id === productId ? { ...p, status: newStatus } : p
            ));
        } catch (error) {
            console.error('Cập nhật trạng thái thất bại:', error);
            alert('Không thể cập nhật trạng thái sản phẩm. Vui lòng thử lại.');
        }
    };

    const filteredProducts = useMemo(() => {
        return filterListByFields(products, searchTerm, ['name', 'category']);
    }, [products, searchTerm]);

    return (
        <div className="container-fluid">
            <div className="mb-4">
                <h2 className="text-3xl fw-bold text-dark mb-1">
                    <span className="me-2">📦</span> Quản Lý Sản Phẩm
                </h2>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="input-group" style={{ maxWidth: '350px' }}>
                    <span className="input-group-text bg-light border-end-0">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Nhập tên sản phẩm..."
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button 
                    className="btn btn-primary"
                    style={{maxWidth: '200px'}}
                    onClick={() => handleOpenFormModal(null)}
                >
                    <PlusCircle size={18} className="me-1" /> Thêm sản phẩm
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light">
                                <tr className='text-uppercase text-secondary text-xs fw-bolder'>
                                    <th className="px-4 py-3" style={{minWidth: '250px'}}>Sản phẩm</th>
                                    <th className="px-4 py-3">Danh mục</th>
                                    <th className="text-center px-4 py-3">Giá Gốc</th>
                                    <th className="text-center px-4 py-3">Giá KM</th>
                                    <th className="text-center px-4 py-3">Lượt bán</th>
                                    <th className="text-center px-4 py-3">Tồn kho</th>
                                    <th className="text-center px-4 py-3">Trạng thái</th>
                                    <th className="text-center px-4 py-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <img 
                                                        src={product.mainImage} 
                                                        alt={product.name}
                                                        className="rounded border me-3"
                                                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                                    />
                                                    <div>
                                                        <div className="fw-bold text-dark">{product.name}</div>
                                                        <small className="text-muted" style={{fontSize: '0.8rem'}}>
                                                            {product.variants.length} biến thể
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className="badge bg-light text-dark border">{product.category}</span>
                                            </td>

                                            <td className="text-center px-4 py-3">
                                                {product.basePrice.toLocaleString('vi-VN')}
                                            </td>

                                            <td className="text-center px-4 py-3">
                                                {product.salePrice ? (
                                                    <span className="text-danger fw-bold">
                                                        {product.salePrice.toLocaleString('vi-VN')}
                                                    </span>
                                                ) : <span className="text-muted">-</span>}
                                            </td>

                                            <td className="text-center px-4 py-3">
                                                {product.sold.toLocaleString('vi-VN')}
                                            </td>

                                            <td className="text-center px-4 py-3">
                                                {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                                            </td>

                                            <td className="text-center px-4 py-3">
                                                <span className={`badge rounded-pill px-3 py-1 ${getStatusBadgeClass(product.status)}`}>
                                                    {product.status}
                                                </span>
                                            </td>

                                            <td className="text-center px-4 py-3">
                                                <button 
                                                    className="btn btn-sm btn-link text-info icon-btn"
                                                    onClick={() => handleOpenFormModal(product.id)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil size={18} />
                                                </button>

                                                <button 
                                                    className="btn btn-sm btn-link text-warning icon-btn"
                                                    onClick={() => handleToggleStatus(product.id, product.status)}
                                                    title="Đổi trạng thái"
                                                >
                                                    <EyeIcon size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            <Search size={40} className="mb-2 opacity-50"/>
                                            Không tìm thấy sản phẩm nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination-container">
                <button 
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    <ChevronLeft size={12} />
                </button>

                <span className="pagination-info">
                    {currentPage} / {totalPages}
                </span>

                <button 
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    <ChevronRight size={12} />
                </button>
            </div>

            {/* MODAL FORM */}
            {showFormModal && (
                <ProductFormModal 
                    show={showFormModal}
                    handleClose={handleCloseFormModal}
                    productData={editingProduct}
                    handleSave={handleSaveProduct}
                />
            )}
        </div>
    );
};

export default Products;
