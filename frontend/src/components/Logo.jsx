// components/Logo.jsx
import React from 'react';

const Logo = ({ size = 24, className = '' }) => {
  return (
    <div className={`logo ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="url(#logoGradient)"
        />
        <path
          d="M8 12L10.5 14.5L16 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id="logoGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#6a11cb" />
            <stop offset="100%" stopColor="#2575fc" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;