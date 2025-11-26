import ProductGrid from "../../components/Product/ProductGrid";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import React, { useState, useEffect } from "react";
import "./Category.css";

const Category = () => {
  const { category } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Xác định title và endpoint dựa trên path
  const getPageInfo = () => {
    const path = location.pathname;

    if (path.startsWith("/category/")) {
      return {
        title: category ? category.toUpperCase() : "SHOP",
        subtitle: "Khám phá bộ sưu tập của chúng tôi",
        type: "category",
        endpoint: `http://127.0.0.1:8000/product/category/${category}`
      };
    } else if (path === "/best-seller") {
      return {
        title: "BEST SELLER",
        subtitle: "Những sản phẩm bán chạy nhất",
        type: "best-seller",
        endpoint: "http://127.0.0.1:8000/product/best-seller/"
      };
    } else if (path === "/new-arrival") {
      return {
        title: "NEW ARRIVAL",
        subtitle: "Những sản phẩm mới nhất",
        type: "new-arrival",
        endpoint: "http://127.0.0.1:8000/product/new-arrival/"
      };
    } else if (path === "/shop") {
      return {
        title: "ALL PRODUCTS",
        subtitle: "Tất cả sản phẩm",
        type: "shop",
        endpoint: "http://127.0.0.1:8000/product/all-product/"
      };
    }

    return {
      title: "SHOP",
      subtitle: "Khám phá sản phẩm",
      type: "default",
      endpoint: null
    };
  };

  const pageInfo = getPageInfo();

  // Fetch products
  useEffect(() => {
    if (pageInfo.endpoint) {
      setLoading(true);
      axios
        .get(pageInfo.endpoint)
        .then((res) => {
          setProducts(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy sản phẩm:", err);
          setLoading(false);
        });
    }
  }, [pageInfo.endpoint, category]);

  return (
    <div className="shop-category-page">

      {/* Banner */}
      <div className="shop-category-banner">
        <div className="shop-category-banner-content">
          <h1 className="shop-category-banner-title">{pageInfo.title}</h1>
          <p className="shop-category-banner-subtitle">{pageInfo.subtitle}</p>
        </div>
      </div>

      {/* Products */}
      <div className="shop-category-container">
        {loading ? (
          <div className="shop-category-loading">
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="shop-category-empty">
            <p>Không tìm thấy sản phẩm</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Category;