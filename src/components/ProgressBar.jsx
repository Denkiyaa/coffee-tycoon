import React from 'react';

const ProgressBar = ({ progress, height = 100, width = 20 }) => {
  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      border: '1px solid #000',
      background: '#ddd',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: `${progress}%`,
        background: 'green',
        transition: 'height 0.1s linear'
      }}></div>
    </div>
  );
};

export default ProgressBar;
