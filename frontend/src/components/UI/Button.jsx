import React from 'react';

function Button({ children, onClick, className = '', disabled = false, ...props }) {
  return (
    <button
      className={`button-gold ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;