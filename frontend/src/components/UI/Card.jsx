import React from 'react';

function Card({ children, className = '' }) {
  return (
    <div className={`parchment ${className}`}>
      {children}
    </div>
  );
}

export default Card;