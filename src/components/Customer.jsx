import React from 'react';

const Customer = ({ order, served }) => (
  <svg width="50" height="80" style={{ overflow: "visible" }}>
    {/* Baş */}
    <circle cx="25" cy="15" r="12" fill="#FFDAB9" />
    {/* Gövde */}
    <rect x="10" y="30" width="30" height="30" fill="#008000" />
    {/* Düşünce Balonu */}
    {!served && (
      <g>
        {/* Düşünce balonunu yukarı kaydırdık */}
        <ellipse cx="25" cy="-15" rx="25" ry="12" fill="white" stroke="black" strokeWidth="1" />
        <text x="25" y="-10" textAnchor="middle" fontSize="12" fill="black">
          {order}
        </text>
      </g>
    )}
  </svg>
);

export default Customer;
