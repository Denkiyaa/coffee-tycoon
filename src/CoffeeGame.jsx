// src/CoffeeGame.jsx
import React, { useState, useEffect } from 'react';
import Barista from './components/Barista';
import Customer from './components/Customer';
import Joystick from './components/Joystick';
import ProgressBar from './components/ProgressBar';
import CoffeeBean from './components/CoffeeBean';
import CoffeeCup from './components/CoffeeCup';
import Decoration from './components/Decoration';

import useJoystick from './hooks/useJoystick';
import useCustomers from './hooks/useCustomers';
import useBaristaActions from './hooks/useBaristaActions';

// Stil ve bölge ayarları
const containerStyle = {
  position: "relative",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#f5f5dc",
  overflow: "hidden",
  backgroundImage: "linear-gradient(to bottom, #f5f5dc, #e0d8c3)"
};

const counterHeight = 200;      // Tezgah yüksekliği
const doorHeight = 150;         // Kapı yüksekliği
const seatingTop = counterHeight;  // Oturma alanı, tezgahın altından başlar

// Tezgah bölge tanımları
const beanZone = { x: 20, y: 20, width: 100, height: 100 };
const machineZone = { x: 140, y: 20, width: 120, height: 120 };
const registerZone = { x: 300, y: 20, width: 100, height: 100 };

// Oturma alanındaki masalar
const tables = [
  { x: 100, y: seatingTop + 50 },
  { x: 300, y: seatingTop + 50 },
  { x: 500, y: seatingTop + 50 },
  { x: 200, y: seatingTop + 150 },
  { x: 400, y: seatingTop + 150 }
];

const doorSpawn = { x: window.innerWidth - 150, y: 100 };

const CoffeeGame = () => {
  // Barista, para ve işlem durumları
  const [baristaPos, setBaristaPos] = useState({ x: 200, y: counterHeight + 50 });
  const [carrying, setCarrying] = useState("none");       // "none", "bean", "cup"
  const [machineState, setMachineState] = useState("none"); // "none", "processing", "cup"
  const [money, setMoney] = useState(0);
  const [beanProgress, setBeanProgress] = useState(100);
  const [machineProgress, setMachineProgress] = useState(0);

  // Joystick hook kullanımı
  const {
    joystickActive,
    joystickStart,
    joystickOffset,
    velocity,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useJoystick(50, 3);

  // Barista pozisyonunun güncellenmesi (velocity ile)
  useEffect(() => {
    let animationFrameId;
    const updateBarista = () => {
      setBaristaPos(prev => ({
        x: prev.x + velocity.x,
        y: prev.y + velocity.y
      }));
      animationFrameId = requestAnimationFrame(updateBarista);
    };
    animationFrameId = requestAnimationFrame(updateBarista);
    return () => cancelAnimationFrame(animationFrameId);
  }, [velocity]);

  // Müşteriler hook’u (spawn ve güncelleme)
  const [customers, setCustomers] = useCustomers(doorSpawn, registerZone, tables);

  // Barista aksiyonlarını yöneten hook (bean alma, makine, sipariş teslimi)
  useBaristaActions({
    baristaPos,
    carrying,
    setCarrying,
    beanProgress,
    setBeanProgress,
    machineState,
    setMachineState,
    machineProgress,
    setMachineProgress,
    customers,
    setCustomers,
    setMoney,
    beanZone,
    machineZone,
    registerZone,
    doorSpawn
  });

  return (
    <div style={containerStyle}>
      {/* Dekorasyon: Kapı, duvar süsleri vb. */}
      <Decoration />

      {/* Tezgah Alanı */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: `${counterHeight}px`,
        background: "#d3a87c",
        borderBottom: "4px solid #8B4513",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)"
      }}>
        {/* Bean Station */}
        <div style={{
          position: "absolute",
          left: beanZone.x,
          top: beanZone.y,
          width: beanZone.width,
          height: beanZone.height,
          border: "2px solid #8B4513",
          background: beanProgress === 100 ? "#fff8e1" : "#777",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>Bean Station</div>
          {beanProgress === 100 && <CoffeeBean />}
          {beanProgress < 100 && (
            <div style={{ position: "absolute", right: 0, top: 0 }}>
              <ProgressBar progress={beanProgress} height={100} width={10} />
            </div>
          )}
        </div>
        {/* Kahve Makinesi */}
        <div style={{
          position: "absolute",
          left: machineZone.x,
          top: machineZone.y,
          width: machineZone.width,
          height: machineZone.height,
          border: "2px solid gray",
          background: "#e0f7fa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>Kahve Makinesi</div>
          {machineState === "processing" && <div>İşleniyor...</div>}
          {machineState === "cup" && <CoffeeCup />}
          {machineState === "processing" && (
            <div style={{ position: "absolute", right: 0, top: 0 }}>
              <ProgressBar progress={machineProgress} height={100} width={10} />
            </div>
          )}
        </div>
        {/* Kasa */}
        <div style={{
          position: "absolute",
          left: registerZone.x,
          top: registerZone.y,
          width: registerZone.width,
          height: registerZone.height,
          border: "2px solid blue",
          background: "#cceeff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>Kasa</div>
        </div>
      </div>

      {/* Oturma Alanı */}
      <div style={{
        position: "absolute",
        top: `${counterHeight}px`,
        left: 0,
        width: "100%",
        height: `calc(100vh - ${counterHeight + doorHeight}px)`,
        background: "#fafafa",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)"
      }}>
        {tables.map((table, index) => (
          <div key={index} style={{
            position: "absolute",
            left: table.x,
            top: table.y,
            width: "150px",
            height: "80px",
            background: "#fff",
            border: "2px solid #8B4513",
            borderRadius: "5px",
            textAlign: "center",
            lineHeight: "80px",
            boxShadow: "2px 2px 5px rgba(0,0,0,0.3)"
          }}>
            Masa
          </div>
        ))}
        <div style={{
          position: "absolute",
          left: "80px",
          top: `${counterHeight + 150}px`,
          width: "50px",
          height: "50px",
          background: "#ffe4b5",
          border: "2px solid #8B4513",
          borderRadius: "5px",
          textAlign: "center",
          lineHeight: "50px",
          boxShadow: "2px 2px 5px rgba(0,0,0,0.3)"
        }}>
          Sandalye
        </div>
        <div style={{
          position: "absolute",
          right: "80px",
          top: `${counterHeight + 150}px`,
          width: "50px",
          height: "50px",
          background: "#ffe4b5",
          border: "2px solid #8B4513",
          borderRadius: "5px",
          textAlign: "center",
          lineHeight: "50px",
          boxShadow: "2px 2px 5px rgba(0,0,0,0.3)"
        }}>
          Sandalye
        </div>
      </div>

      {/* Müşteriler */}
      {customers.map(c => (
        <div key={c.id} style={{ position: "absolute", left: c.x, top: c.y }}>
          <Customer order={c.order} served={c.served} />
        </div>
      ))}

      {/* Barista */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: baristaPos.x,
          top: baristaPos.y,
          cursor: "grab",
          userSelect: "none"
        }}
      >
        <Barista carrying={carrying} />
      </div>

      {/* Joystick Overlay */}
      {joystickActive && (
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            cursor: "grabbing"
          }}
        >
          <Joystick
            joystickStart={joystickStart}
            joystickOffset={joystickOffset}
            maxJoystickDistance={50}
          />
        </div>
      )}

      {/* Para Bilgisi */}
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        fontSize: "24px",
        fontWeight: "bold"
      }}>
        Para: ${money}
      </div>
    </div>
  );
};

export default CoffeeGame;
