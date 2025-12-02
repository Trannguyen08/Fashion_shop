import ProductGrid from "../../components/Product/ProductGrid";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { formatCategoryName } from "../../utils/categoryUtils";
import "./Category.css";

const Category = () => {
  const { category } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy search query từ URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q");

  // Xác định title và endpoint dựa trên path
  const getPageInfo = () => {
    const path = location.pathname;

    if (path === "/search") {
      return {
        title: `KẾT QUẢ TÌM KIẾM: "${searchQuery}"`,
        subtitle: `Tìm thấy sản phẩm với từ khóa "${searchQuery}"`,
        type: "search",
        endpoint: `http://127.0.0.1:8000/product/search/?q=${encodeURIComponent(searchQuery)}`
      };
    } else if (path.startsWith("/category/")) {
      return {
        title: formatCategoryName(category),
        subtitle: `Khám phá bộ sưu tập ${formatCategoryName(category)}`,
        type: "category",
        endpoint: `http://127.0.0.1:8000/category/${category}/`
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
          setProducts(res.data.products);
          console.log("Products fetched:", res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy sản phẩm:", err);
          setLoading(false);
        });
    }
    console.log("Category page info:", pageInfo);
  }, [pageInfo.endpoint, category, searchQuery]);

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
            <p>
              {pageInfo.type === "search" 
                ? `Không tìm thấy sản phẩm nào với từ khóa "${searchQuery}"`
                : "Không tìm thấy sản phẩm"
              }
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Category;