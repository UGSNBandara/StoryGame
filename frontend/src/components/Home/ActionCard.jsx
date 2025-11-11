import React from 'react';

function ActionCard({ title, description, buttonText, onClick }) {
  return (
    <div className="parchment">
      <h3 className="font-display mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
      <button className="button-gold mt-4 w-full" onClick={onClick}>{buttonText}</button>
    </div>
  );
}

export default ActionCard;