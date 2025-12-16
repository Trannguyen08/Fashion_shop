import React from "react";
import "./LoadingSpinner.css";

export default function LoadingSpinner({ size = 60, border = 5, show = true }) {
    if (!show) return null;
    
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div
                    className="loading-spinner"
                    style={{
                        width: size,
                        height: size,
                        borderWidth: border
                    }}
                ></div>
                <p className="loading-text">Đang tải...</p>
            </div>
        </div>
    );
}