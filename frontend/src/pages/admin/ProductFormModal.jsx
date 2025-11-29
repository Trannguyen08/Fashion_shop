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
    }, []);

    useEffect(() => {
        console.log("useEffect triggered, isEditMode:", isEditMode);
        console.log("Raw productData:", productData);

        if (isEditMode && productData) {
            // relatedImages từ backend là link
            const relatedImages = (productData.product_imgs || []).map(img => ({
                file: null, // chưa chọn file mới
                url: img.PI_img   // link Cloudinary
            }));
            console.log("Mapped relatedImages:", relatedImages);

            // variants map
            const variants = (productData.variants || []).map(v => ({
                ...v,
                image: v.PV_img ? { file: null, url: v.PV_img } : null
            }));
            console.log("Mapped variants:", variants);

            const newFormData = {
                ...defaultProductState,
                ...productData,
                basePrice: String(productData.old_price || productData.basePrice),
                salePrice: productData.current_price ? String(productData.current_price) : "",
                category: productData.category?.id || productData.category,
                mainImage: productData.mainImage ? { file: null, url: productData.mainImage } : null,
                relatedImages,
                variants
            };

            console.log("Final formData to set:", newFormData);

            setFormData(newFormData);
        }
    }, [productData]);


    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
    const handleMainImageChange = (e) => setFormData({ ...formData, mainImage: { file: e.target.files[0], url: null } });
    const handleRelatedImageChange = (e) => setFormData({ 
        ...formData, 
        relatedImages: [...formData.relatedImages, ...Array.from(e.target.files).map(f => ({ file: f, url: null }))] 
    });
    const handleVariantImageChange = (index, e) => handleVariantChange(index, "image", { file: e.target.files[0], url: null });
    const handleVariantChange = (index, field, value) => {
        const updated = [...formData.variants];
        updated[index][field] = value;
        setFormData({ ...formData, variants: updated });
    };
    const handleRemoveImage = (index) => setFormData({ ...formData, relatedImages: formData.relatedImages.filter((_, i) => i !== index) });
    const handleAddVariant = () => setFormData({ ...formData, variants: [...formData.variants, { size: '', color: '', sku: '', stock: '', image: null, status: 'Active' }] });
    const handleRemoveVariant = (index) => setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });

    // Save product
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
        const result = await saveProduct(formData, isEditMode ? productData.id : null);
        handleSave(result);
    };

    if (!show) return null;

    return (
        <div className="modal d-block product-modal-bg" tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header text-white mh">
                        <h5 className="modal-title">{isEditMode ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body modal-body-scroll">
                            <div className="row">
                                <div className="col-md-5 border-end">
                                    <h4 className="mb-3 text-primary">Thông Tin Cơ Bản</h4>

                                    <div className="mb-3">
                                        <label className="form-label">Tên Sản Phẩm *</label>
                                        <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange} required />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Danh Mục *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) =>
                                                setFormData({ ...formData, category: Number(e.target.value)  })
                                            }
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label">Giá Gốc *</label>
                                            <input type="number" className="form-control" id="basePrice" value={formData.basePrice} onChange={handleChange} required min="1" />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label">Giá KM</label>
                                            <input type="number" className="form-control" id="salePrice" value={formData.salePrice} onChange={handleChange} min="0" />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Mô Tả</label>
                                        <textarea className="form-control" id="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Trạng thái</label>
                                        <select className="form-select" value={formData.status} disabled={!isEditMode} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="Active">Active</option>
                                            <option value="Hidden">Hidden</option>
                                        </select>
                                    </div>

                                    <div className="d-flex mb-3 gap-4">
                                        <div className="d-flex">
                                            <input type="checkbox" className="form-check-input me-2" id="isNew" checked={formData.isNew} onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })} style={{ transform: 'scale(1.2)' }} />
                                            <label htmlFor="isNew" className="mb-0">Sản phẩm mới</label>
                                        </div>

                                        <div className="d-flex">
                                            <input type="checkbox" className="form-check-input me-2" id="isFeatured" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} style={{ transform: 'scale(1.2)' }} />
                                            <label htmlFor="isFeatured" className="mb-0">Sản phẩm nổi bật</label>
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT PHẢI */}
                                <div className="col-md-7">
                                    <h4 className="mb-3 text-primary">Hình Ảnh</h4>
                                    <div className="mb-4 p-3 border rounded">
                                        <label className="form-label fw-bold">Ảnh Chính</label>
                                        <input type="file" className="form-control" accept="image/*" onChange={handleMainImageChange} />
                                        {formData.mainImage && (
                                            <img 
                                                src={formData.mainImage.url || URL.createObjectURL(formData.mainImage.file)} 
                                                className="img-preview mt-2" 
                                                alt="main preview" 
                                            />
                                        )}
                                    </div>

                                    <div className="mb-4 p-3 border rounded">
                                        <label className="form-label fw-bold">Ảnh Liên Quan</label>
                                        <input type="file" className="form-control" accept="image/*" multiple onChange={handleRelatedImageChange} />
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {formData.relatedImages.map((imgObj, index) => (
                                                <div key={index} className="position-relative">
                                                    <img src={imgObj.url || URL.createObjectURL(imgObj.file)} className="img-preview" />
                                                    <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0" onClick={() => handleRemoveImage(index)}>
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
                            <h4 className="mb-3 text-primary">Biến Thể Sản Phẩm</h4>
                            <div className="variant-scroll">
                                {formData.variants.map((variant, index) => (
                                    <div key={index} className="row g-2 mb-3 p-3 border rounded bg-light">
                                        <div className="col-12 d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="mb-0 text-secondary">Biến thể #{index + 1}</h6>
                                            {formData.variants.length > 1 && (
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveVariant(index)} style={{ maxWidth: '150px' }}>
                                                    <XCircle size={16} className="me-1" /> Xóa
                                                </button>
                                            )}
                                        </div>

                                        <div className="col-md-2">
                                            <label className="form-label small">Size</label>
                                            <select className="form-select form-select-sm" required value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)}>
                                                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>

                                        <div className="col-md-2">
                                            <label className="form-label small">Màu</label>
                                            <select className="form-select form-select-sm" required value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)}>
                                                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        <div className="col-md-2">
                                            <label className="form-label small">SKU</label>
                                            <input type="text" className="form-control form-control-sm" required value={variant.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} />
                                        </div>

                                        <div className="col-md-2">
                                            <label className="form-label small">Tồn Kho</label>
                                            <input type="number" className="form-control form-control-sm" required min="0" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label small">Ảnh Variant</label>
                                            <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => handleVariantImageChange(index, e)} />
                                            {variant.image && (
                                                <img src={variant.image.url || URL.createObjectURL(variant.image.file)} className="variant-img-preview mt-1" />
                                            )}
                                        </div>

                                        <div className="col-md-2">
                                            <label className="form-label small">Trạng thái</label>
                                            <select className="form-select form-select-sm" disabled={!isEditMode} value={variant.status} onChange={(e) => handleVariantChange(index, "status", e.target.value)}>
                                                <option value="Active">Active</option>
                                                <option value="Locked">Locked</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="btn btn-outline-primary mt-2" onClick={handleAddVariant}>
                                <PlusCircle size={18} className="me-1" /> Thêm Biến Thể
                            </button>

                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>Đóng</button>
                            <button type="submit" className="btn btn-success">{isEditMode ? 'Cập Nhật' : 'Lưu'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
