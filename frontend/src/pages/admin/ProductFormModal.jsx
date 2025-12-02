import React, { useState, useEffect } from 'react';
import { PlusCircle, XCircle, Trash2 } from 'lucide-react';
import axios from "axios";
import './ProductFormModal.css';

const SIZES = ['S', 'M', 'L', 'XL', 'Free Size'];
const COLORS = ['Đen', 'Trắng', 'Đỏ', 'Xanh navy'];

const defaultProductState = {
    name: '',
    category: '',
    basePrice: '',
    salePrice: '',
    description: '',
    mainImage: null,
    relatedImages: [],
    status: 'Active',
    isNew: false,
    isFeatured: false,
    variants: [{ size: SIZES[0], color: COLORS[0], sku: '', stock: '', image: null, status: 'Active' }],
};

const API_BASE_URL = "http://127.0.0.1:8000/api/product";
const API_CATEGORY_URL = "http://127.0.0.1:8000/api/category/all-category/";

const ProductFormModal = ({ show, handleClose, productData, handleSave }) => {
    const [formData, setFormData] = useState(defaultProductState);
    const [categories, setCategories] = useState([]);
    const isEditMode = !!productData;

    // 🟢 Lấy danh mục từ API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(API_CATEGORY_URL);
                const data = res.data.categories || [];
                setCategories(data);

                // Khi thêm mới → auto chọn category đầu tiên
                if (!isEditMode && data.length > 0) {
                    setFormData(prev => ({ ...prev, category: data[0].id }));
                }
            } catch (err) {
                console.error("Lỗi lấy category:", err);
            }
        };

        fetchCategories();
    }, [isEditMode]);

    // 🔥 useEffect riêng để set formData khi edit và categories đã load
    useEffect(() => {
        if (isEditMode && productData && categories.length > 0) {
            console.log("Setting edit mode data:", productData);

            // Related Images
            const relatedImages = (productData.product_imgs || []).map(img => ({
                file: null,
                url: img.PI_img
            }));

            // Variants
            const variants = (productData.product_variants || []).map(v => ({
                size: v.size || SIZES[0],
                color: v.color || COLORS[0],
                sku: v.sku || '',
                stock: String(v.stock_quantity || 0),  // 🔥 Đổi từ stock
                status: v.status || 'Active',
                image: v.PV_img ? { file: null, url: v.PV_img } : null
            }));

            // 🔥 Tìm category_id từ category_name
            const categoryId = categories.find(cat => cat.name === productData.category_name)?.id 
                            || productData.category_id 
                            || categories[0]?.id;

            // 🔥 Xử lý giá KM: nếu = 0 hoặc null thì để rỗng
            const salePrice = productData.current_price && productData.current_price > 0 
                ? String(productData.current_price) 
                : '';

            const newFormData = {
                name: productData.name || '',
                category: categoryId,  // 🔥 Dùng categoryId tìm được
                basePrice: String(productData.old_price || 0),
                salePrice: salePrice,
                description: productData.description || '',
                status: productData.status || 'Active',
                isNew: productData.is_new || false,  // 🔥 Đổi từ isNew
                isFeatured: productData.is_featured || false,  // 🔥 Đổi từ isFeatured
                mainImage: productData.product_img ? { file: null, url: productData.product_img } : null,  // 🔥 Đổi từ mainImage
                relatedImages: relatedImages,
                variants: variants.length > 0 ? variants : [{ 
                    size: SIZES[0], 
                    color: COLORS[0], 
                    sku: '', 
                    stock: '', 
                    image: null, 
                    status: 'Active' 
                }]
            };

            console.log("Final formData:", newFormData);
            setFormData(newFormData);
        }
    }, [isEditMode, productData, categories]);

    // 🔥 Reset form khi đóng modal
    useEffect(() => {
        if (!show) {
            setFormData(defaultProductState);
        }
    }, [show]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
    
    const handleMainImageChange = (e) => setFormData({ 
        ...formData, 
        mainImage: { file: e.target.files[0], url: null } 
    });
    
    const handleRelatedImageChange = (e) => setFormData({ 
        ...formData, 
        relatedImages: [...formData.relatedImages, ...Array.from(e.target.files).map(f => ({ file: f, url: null }))] 
    });
    
    const handleVariantImageChange = (index, e) => handleVariantChange(index, "image", { 
        file: e.target.files[0], 
        url: null 
    });
    
    const handleVariantChange = (index, field, value) => {
        const updated = [...formData.variants];
        updated[index][field] = value;
        setFormData({ ...formData, variants: updated });
    };
    
    const handleRemoveImage = (index) => setFormData({ 
        ...formData, 
        relatedImages: formData.relatedImages.filter((_, i) => i !== index) 
    });
    
    const handleAddVariant = () => setFormData({ 
        ...formData, 
        variants: [...formData.variants, { 
            size: SIZES[0], 
            color: COLORS[0], 
            sku: '', 
            stock: '', 
            image: null, 
            status: 'Active' 
        }] 
    });
    
    const handleRemoveVariant = (index) => setFormData({ 
        ...formData, 
        variants: formData.variants.filter((_, i) => i !== index) 
    });

    // Save product
    const saveProduct = async (productData, productId = null) => {
        const fd = new FormData();

        // 🔥 Các field TRÙNG với Django
        fd.append("name", productData.name);
        fd.append("category", productData.category);
        fd.append("old_price", Number(productData.basePrice));
        fd.append("current_price", productData.salePrice ? Number(productData.salePrice) : 0);
        fd.append("description", productData.description || "");
        fd.append("status", productData.status);
        fd.append("isNew", productData.isNew ? "true" : "false");
        fd.append("isFeatured", productData.isFeatured ? "true" : "false");

        // Main Image - nếu không upload mới thì gửi link cũ
        if (productData.mainImage?.file) {
            fd.append("mainImage", productData.mainImage.file);
        } else if (productData.mainImage?.url) {
            fd.append("mainImage_url", productData.mainImage.url);
        }

        // Related Images - gửi cả file mới và link cũ
        const existingRelatedImages = [];
        productData.relatedImages.forEach(imgObj => {
            if (imgObj.file) {
                fd.append("related_images", imgObj.file);
            } else if (imgObj.url) {
                existingRelatedImages.push(imgObj.url);
            }
        });
        if (existingRelatedImages.length > 0) {
            fd.append("existing_related_images", JSON.stringify(existingRelatedImages));
        }

        // 🔥 VARIANTS — convert thành JSON
        const variantsForBackend = productData.variants
            .filter(v => v.size && v.color && v.sku)
            .map((v, i) => ({
                size: v.size,
                color: v.color,
                sku: v.sku,
                stock: parseInt(v.stock) || 0,
                status: v.status,
                // Nếu không upload ảnh mới thì gửi link cũ
                image_url: v.image?.url || null
            }));

        fd.append("variants", JSON.stringify(variantsForBackend));

        // 🔥 Append ảnh variant mới
        variantsForBackend.forEach((v, i) => {
            const img = productData.variants[i].image;
            if (img?.file) fd.append(`variant_images_${i}`, img.file);
        });

        const url = productId
            ? `${API_BASE_URL}/update/${productId}/`
            : `${API_BASE_URL}/add/`;

        const method = productId ? "put" : "post";

        const res = await axios({
            method,
            url,
            data: fd,
            headers: { "Content-Type": "multipart/form-data" }
        });

        return res.data;
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await saveProduct(formData, isEditMode ? productData.id : null);
            handleSave(result);
            handleClose();
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
            alert("Có lỗi xảy ra khi lưu sản phẩm!");
        }
    };

    if (!show) return null;

    return (
        <div className="product-form-modal-overlay">
            <div className="product-form-modal-dialog">
                <div className="product-form-modal-content">
                    <div className="product-form-modal-header">
                        <h5 className="product-form-modal-title">
                            {isEditMode ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={handleClose}
                            style={{ position: 'absolute', right: '175px', top: '45px' }}
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="product-form-modal-body">
                            <div className="row">
                                {/* CỘT TRÁI */}
                                <div className="col-md-5 border-end pe-4">
                                    <h4 className="product-form-section-title">Thông Tin Cơ Bản</h4>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Tên Sản Phẩm *</label>
                                        <input 
                                            type="text" 
                                            className="form-control product-form-input" 
                                            id="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Nhập tên sản phẩm"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Danh Mục *</label>
                                        <select
                                            className="form-select product-form-select"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                category: Number(e.target.value) 
                                            })}
                                            required
                                        >
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-semibold">Giá Gốc *</label>
                                            <input 
                                                type="number" 
                                                className="form-control product-form-input" 
                                                id="basePrice" 
                                                value={formData.basePrice} 
                                                onChange={handleChange} 
                                                required 
                                                min="1"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-semibold">Giá Khuyến Mãi</label>
                                            <input 
                                                type="number" 
                                                className="form-control product-form-input" 
                                                id="salePrice" 
                                                value={formData.salePrice} 
                                                onChange={handleChange} 
                                                min="0" 
                                                placeholder="Để trống nếu không giảm giá"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Mô Tả</label>
                                        <textarea 
                                            className="form-control product-form-textarea" 
                                            id="description" 
                                            rows="4" 
                                            value={formData.description} 
                                            onChange={handleChange}
                                            placeholder="Mô tả chi tiết về sản phẩm..."
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Trạng thái</label>
                                        <select 
                                            className="form-select product-form-select" 
                                            value={formData.status} 
                                            disabled={!isEditMode} 
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Hidden">Hidden</option>
                                        </select>
                                    </div>

                                    <div className="d-flex gap-4">
                                        <div className="form-check">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                id="isNew" 
                                                checked={formData.isNew} 
                                                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                            />
                                            <label htmlFor="isNew" className="form-check-label">Sản phẩm mới</label>
                                        </div>

                                        <div className="form-check">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                id="isFeatured" 
                                                checked={formData.isFeatured} 
                                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                            />
                                            <label htmlFor="isFeatured" className="form-check-label">Nổi bật</label>
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT PHẢI */}
                                <div className="col-md-7 ps-4">
                                    <h4 className="product-form-section-title">Hình Ảnh</h4>
                                    
                                    <div className="product-form-image-upload">
                                        <label className="form-label fw-semibold">Ảnh Chính</label>
                                        <input 
                                            type="file" 
                                            className="form-control product-form-input" 
                                            accept="image/*" 
                                            onChange={handleMainImageChange} 
                                        />
                                        {formData.mainImage && (
                                            <img 
                                                src={formData.mainImage.url || URL.createObjectURL(formData.mainImage.file)} 
                                                className="product-form-img-preview mt-3" 
                                                alt="main preview" 
                                            />
                                        )}
                                    </div>

                                    <div className="product-form-image-upload">
                                        <label className="form-label fw-semibold">Ảnh Liên Quan</label>
                                        <input 
                                            type="file" 
                                            className="form-control product-form-input" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={handleRelatedImageChange} 
                                        />
                                        <div className="d-flex flex-wrap gap-2 mt-3">
                                            {formData.relatedImages.map((imgObj, index) => (
                                                <div key={index} className="position-relative">
                                                    <img 
                                                        src={imgObj.url || URL.createObjectURL(imgObj.file)} 
                                                        className="product-form-img-preview" 
                                                        alt={`related-${index}`}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-danger btn-sm position-absolute" 
                                                        style={{ top: '-8px', right: '-8px', padding: '2px 6px' }}
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* BIẾN THỂ */}
                            <h4 className="product-form-section-title">Biến Thể Sản Phẩm</h4>
                            <div className="product-form-variant-scroll">
                                {formData.variants.map((variant, index) => (
                                    <div key={index} className="product-form-variant-container">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 text-secondary fw-semibold">Biến thể #{index + 1}</h6>
                                            {formData.variants.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    className="xoa-btn" 
                                                    onClick={() => handleRemoveVariant(index)}
                                                >
                                                    <XCircle size={16} className="me-1" /> Xóa
                                                </button>
                                            )}
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-2">
                                                <label className="form-label small fw-semibold">Size</label>
                                                <select 
                                                    className="form-select form-select-sm product-form-select" 
                                                    required 
                                                    value={variant.size} 
                                                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                >
                                                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>

                                            <div className="col-md-2">
                                                <label className="form-label small fw-semibold">Màu</label>
                                                <select 
                                                    className="form-select form-select-sm product-form-select" 
                                                    required 
                                                    value={variant.color} 
                                                    onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                >
                                                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>

                                            <div className="col-md-2">
                                                <label className="form-label small fw-semibold">SKU</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control form-control-sm product-form-input" 
                                                    required 
                                                    value={variant.sku} 
                                                    onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} 
                                                    placeholder="VD: SP-001"
                                                />
                                            </div>

                                            <div className="col-md-2">
                                                <label className="form-label small fw-semibold">Tồn Kho</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control form-control-sm product-form-input" 
                                                    required 
                                                    min="0" 
                                                    value={variant.stock} 
                                                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} 
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label small fw-semibold">Ảnh Variant</label>
                                                <input 
                                                    type="file" 
                                                    className="form-control form-control-sm product-form-input" 
                                                    accept="image/*" 
                                                    onChange={(e) => handleVariantImageChange(index, e)} 
                                                />
                                                {variant.image && (
                                                    <img 
                                                        src={variant.image.url || URL.createObjectURL(variant.image.file)} 
                                                        className="product-form-variant-img-preview mt-2" 
                                                        alt={`variant-${index}`}
                                                    />
                                                )}
                                            </div>

                                            <div className="col-md-2">
                                                <label className="form-label small fw-semibold">Trạng thái</label>
                                                <select 
                                                    className="form-select form-select-sm product-form-select" 
                                                    disabled={!isEditMode} 
                                                    value={variant.status} 
                                                    onChange={(e) => handleVariantChange(index, "status", e.target.value)}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Locked">Locked</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                type="button" 
                                className="btn btn-outline-primary mt-3" 
                                onClick={handleAddVariant}
                            >
                                <PlusCircle size={18} className="me-2" /> Thêm Biến Thể
                            </button>
                        </div>

                        <div className="product-form-modal-footer d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                Đóng
                            </button>
                            <button type="submit" className="btn btn-success product-form-btn-primary">
                                {isEditMode ? 'Cập Nhật' : 'Lưu sản phẩm'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;