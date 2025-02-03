import React from 'react';
import CoffeeBean from './CoffeeBean';
import CoffeeCup from './CoffeeCup';

const Barista = ({ carrying }) => (
  <svg width="60" height="60">
    {/* Baş */}
    <circle cx="30" cy="20" r="15" fill="#FFDAB9" />
    {/* Gövde */}
    <rect x="15" y="35" width="30" height="20" fill="#0000FF" />
    {/* Taşıdığı nesne */}
    {carrying === "bean" && (
      <g transform="translate(0,0)"> 
        <CoffeeBean />
      </g>
    )}
    {carrying === "cup" && (
      <g transform="translate(0,0)">
        <CoffeeCup />
      </g>
    )}
  </svg>
);

export default Barista;
