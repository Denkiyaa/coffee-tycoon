// src/components/Barista.jsx
import React from 'react';
import CoffeeBean from './CoffeeBean';
import CoffeeCup from './CoffeeCup';

const Barista = ({ carrying, inventory }) => {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      {/* Baş */}
      <circle cx="30" cy="20" r="15" fill="#FFDAB9" />
      {/* Gövde */}
      <rect x="15" y="35" width="30" height="20" fill="#0000FF" />
      {/* Taşıdığı nesne */}
      {carrying === "bean" && (
        <g transform="translate(40,5)">
          <CoffeeBean />
        </g>
      )}
      {carrying === "milk" && (
        <g transform="translate(40,5)">
          <rect width="30" height="30" fill="#fff" stroke="#ccc" strokeWidth="2" />
        </g>
      )}
      {carrying === "cup" && (
        <g transform="translate(40,5)">
          <CoffeeCup />
        </g>
      )}
      {carrying === "latte" && (
        <g transform="translate(40,5)">
          <CoffeeCup />
          <rect x="5" y="5" width="30" height="10" fill="#F5DEB3" opacity="0.7" />
        </g>
      )}
      {/* Envanter overlay (örneğin "C" ve "M" harfleri) */}
      <text x="30" y="58" fontSize="10" fill="#000" textAnchor="middle">
        {inventory.coffee ? "C" : ""}{inventory.milk ? "M" : ""}
      </text>
    </svg>
  );
};

export default Barista;
