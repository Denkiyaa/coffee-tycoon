// src/components/Decoration.jsx
import React from 'react';

const Decoration = () => {
  // Kapı: Sağ tarafta, dikey olarak ortalanmış
  const doorStyle = {
    position: "absolute",
    top: "50%",
    right: "0",
    transform: "translateY(-50%)",
    width: "100px",
    height: "150px",
    background: "#a67c52",
    border: "4px solid #7e5a3d",
    borderRadius: "5px",
    textAlign: "center",
    lineHeight: "150px",
    fontWeight: "bold",
    fontSize: "20px",
    color: "#fff",
    zIndex: 2  // Kapı en üstte görünsün
  };

  // Örnek diğer dekoratif öğeler (örneğin, resimler)
  const pictureStyle = {
    position: "absolute",
    top: "10px",
    left: "10px",
    width: "80px",
    height: "60px",
    background: "#7e5a3d",
    border: "2px solid #5c3b27",
    borderRadius: "5px"
  };

  const pictureStyle2 = {
    position: "absolute",
    top: "10px",
    right: "120px", // Kapıdan uzakta
    width: "80px",
    height: "60px",
    background: "#7e5a3d",
    border: "2px solid #5c3b27",
    borderRadius: "5px"
  };

  return (
    <>
      <div style={doorStyle}>Kapı</div>
      <div style={pictureStyle}></div>
      <div style={pictureStyle2}></div>
    </>
  );
};

export default Decoration;
