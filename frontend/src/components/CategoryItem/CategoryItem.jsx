import React from 'react';
import './CategoryItem.css';
import { Link } from 'react-router-dom';

const CategoryItem = ({ image, title, onView, link }) => {
  return (
    <div className="category-item" role="group" aria-label={`Category: ${title}`}>
      <div className="category-image" style={{ backgroundImage: `url(${image})` }} aria-hidden="true" />

      <div className="category-body">
        <h3 className="category-title">{title}</h3>
        <Link to={link}>
          <button className="category-button" onClick={onView} type="button">
            View products
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CategoryItem;

