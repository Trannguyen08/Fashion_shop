// CategoryItem.jsx
// Usage: import CategoryItem from './CategoryItem';
// <CategoryItem image="/path/to.jpg" title="Sneakers" onView={() => console.log('view')} />

import React from 'react';
import './CategoryItem.css';

const CategoryItem = ({ image, title, onView }) => {
  return (
    <div className="category-item" role="group" aria-label={`Category: ${title}`}>
      <div className="category-image" style={{ backgroundImage: `url(${image})` }} aria-hidden="true" />

      <div className="category-body">
        <h3 className="category-title">{title}</h3>
        <button className="category-button" onClick={onView} type="button">
          View products
        </button>
      </div>
    </div>
  );
};

export default CategoryItem;

