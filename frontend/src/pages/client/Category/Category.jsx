import ProductGrid from "../../../components/Product/ProductGrid";
import { useParams } from "react-router-dom";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";

const Category = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  // useEffect(() => {
  //   axios
  //     .get(`https://127.0.0.1:8000/product/category/${category}`)
  //     .then((res) => setProducts(res.data))
  //     .catch((err) => console.error(err));
  // }, [category]);

  console.log("Category param:", category);

  return (
    <div style={{ overflowX: 'hidden' }}>
      <Header />
      <div>
        <div style={{
          backgroundColor: '#e70463',
          color: 'white',
          padding: '60px 20px',
          textAlign: 'center',
          borderRadius: '8px'
        }}>
          <h1 style={{ margin: 0, fontSize: '34px' }}>
            {category.toUpperCase()}
          </h1>
        </div>
      </div>
      <ProductGrid />
      <Footer />
    </div>
  );
};

export default Category;