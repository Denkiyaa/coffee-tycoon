// src/CoffeeGame.jsx
import React, { useState, useEffect } from 'react';
import Barista from './components/Barista';
import Customer from './components/Customer';
import Joystick from './components/Joystick';
import ProgressBar from './components/ProgressBar';
import CoffeeBean from './components/CoffeeBean';
import CoffeeCup from './components/CoffeeCup';
import Decoration from './components/Decoration';
import MilkIcon from './components/MilkIcon';

import useJoystick from './hooks/useJoystick';
import useCustomers from './hooks/useCustomers';
import useBaristaActions from './hooks/useBaristaActions';

// Genel stil
const containerStyle = {
  position: "relative",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#f5f5dc",
  overflow: "hidden",
  backgroundImage: "linear-gradient(to bottom, #f5f5dc, #e0f7c3)"
};

const CoffeeGame = () => {
  // --- Sabit Değerler ---
  const counterHeight = 250;      // Birleşik tezgah yüksekliği
  const doorHeight = 150;         // Kapı yüksekliği
  const seatingTop = counterHeight; // Oturma alanı, tezgahın hemen altı

  // Oturma alanı için masalar (örnek)
  const tables = [
    { x: 100, y: seatingTop + 50 },
    { x: 300, y: seatingTop + 50 },
    { x: 500, y: seatingTop + 50 },
    { x: 200, y: seatingTop + 150 },
    { x: 400, y: seatingTop + 150 }
  ];

  const doorSpawn = { x: window.innerWidth - 150, y: 100 };

  // Zone Tanımlamaları (Unified Counter)
  const beanZone = { x: 20, y: 20, width: 100, height: 100, zIndex: 5 };
  const milkZone = { x: 140, y: 20, width: 100, height: 100, zIndex: 5 };
  const machineZone = { x: 260, y: 20, width: 120, height: 120, zIndex: 5 };
  const mixingZone = { x: 400, y: 20, width: 120, height: 120, zIndex: 5 };
  const registerZone = { x: 540, y: 20, width: 100, height: 100, zIndex: 5 };

  // --- State Tanımlamaları ---
  const [carrying, setCarrying] = useState("none");
  const [baristaPos, setBaristaPos] = useState({ x: 200, y: seatingTop + 50 });
  const [machineState, setMachineState] = useState("none"); // "none", "processing", "cup"
  const [money, setMoney] = useState(0);
  const [beanProgress, setBeanProgress] = useState(100);
  const [machineProgress, setMachineProgress] = useState(0);
  const [milkProgress, setMilkProgress] = useState(100);
  const [inventory, setInventory] = useState({ coffee: 0, milk: 0 });

  // --- Joystick Hook ---
  const {
    joystickActive,
    joystickStart,
    joystickOffset,
    velocity,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useJoystick(50, 3);

  // --- Barista Hareketi ---
  useEffect(() => {
    let animationFrameId;
    const updateBarista = () => {
      setBaristaPos(prev => ({
        x: prev.x + velocity.x,
        y: prev.y + velocity.y,
      }));
      animationFrameId = requestAnimationFrame(updateBarista);
    };
    animationFrameId = requestAnimationFrame(updateBarista);
    return () => cancelAnimationFrame(animationFrameId);
  }, [velocity]);

  // --- Müşteriler Hook ---
  const [customers, setCustomers] = useCustomers(doorSpawn, registerZone, tables);

  // --- Barista Aksiyonlarını Yöneten Hook ---
  useBaristaActions({
    baristaPos,
    carrying,
    setCarrying,
    beanProgress,
    setBeanProgress,
    milkProgress,
    setMilkProgress,
    machineState,
    setMachineState,
    machineProgress,
    setMachineProgress,
    customers,
    setCustomers,
    setMoney,
    beanZone,
    milkZone,
    machineZone,
    mixingZone,
    registerZone,
    doorSpawn,
    inventory,
    setInventory,
  });

  // --- Trash Can İşlemi ---
  const handleTrash = () => {
    setInventory({ coffee: 0, milk: 0 });
    if (carrying === "milk" || carrying === "cup") {
      setCarrying("none");
    }
    console.log("Trash: Inventory cleared");
  };

  // Ortak zone stil fonksiyonu
  const getZoneStyle = (zone, additional = {}) => ({
    position: "absolute",
    left: zone.x,
    top: zone.y,
    width: zone.width,
    height: zone.height,
    zIndex: zone.zIndex,
    ...additional,
  });

  // --- Alt Bileşenler ---

  // Bean Station
  const BeanStation = () => (
    <div style={getZoneStyle(beanZone, {
      border: "2px solid #8B4513",
      background: beanProgress === 100 ? "#fff8e1" : "#777",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    })}>
      <div style={{ fontWeight: "bold", fontSize: 14 }}>Bean</div>
      {beanProgress === 100 ? <CoffeeBean /> : (
        <div style={{ position: "absolute", right: 0, top: 0 }}>
          <ProgressBar progress={beanProgress} height={beanZone.height} width={10} />
        </div>
      )}
    </div>
  );

  // Milk Station
  const MilkStation = () => (
    <div style={getZoneStyle(milkZone, {
      border: "2px solid #8B4513",
      background: milkProgress === 100 ? "#fff8e1" : "#777",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    })}>
      <div style={{ fontWeight: "bold", fontSize: 14 }}>Milk</div>
      {milkProgress === 100 ? <MilkIcon /> : (
        <div style={{ position: "absolute", right: 0, top: 0 }}>
          <ProgressBar progress={milkProgress} height={milkZone.height} width={10} />
        </div>
      )}
    </div>
  );

  // Coffee Machine
  const CoffeeMachineComponent = () => {
    const content = {
      processing: (
        <>
          <div style={{ fontWeight: "bold", fontSize: 14 }}>Machine</div>
          <div>Processing...</div>
          <div style={{ position: "absolute", right: 0, top: 0 }}>
            <ProgressBar progress={machineProgress} height={machineZone.height} width={10} />
          </div>
        </>
      ),
      cup: (
        <>
          <div style={{ fontWeight: "bold", fontSize: 14 }}>Machine</div>
          <CoffeeCup />
        </>
      )
    }[machineState] || <div style={{ fontWeight: "bold", fontSize: 14 }}>Machine</div>;

    return (
      <div style={getZoneStyle(machineZone, {
        border: "2px solid gray",
        background: "#e0f7fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      })}>
        {content}
      </div>
    );
  };

  // Mixing Area
  const MixingAreaComponent = () => (
    <div style={getZoneStyle(mixingZone, {
      border: "2px solid purple",
      background: "#e0e0ff",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    })}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "1px solid #333",
        background: inventory.coffee ? "#fff" : "#ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px"
      }}>
        {inventory.coffee ? "Coffee" : ""}
      </div>
      <div style={{
        width: "40px",
        height: "40px",
        border: "1px solid #333",
        background: inventory.milk ? "#fff" : "#ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px"
      }}>
        {inventory.milk ? "Milk" : ""}
      </div>
    </div>
  );

  // Register Station
  const RegisterStation = () => (
    <div style={getZoneStyle(registerZone, {
      border: "2px solid blue",
      background: "#cceeff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    })}>
      <div style={{ fontWeight: "bold", fontSize: 14 }}>Register</div>
    </div>
  );

  // Trash Can (Mixing Area'nın yanında)
  const TrashCan = () => (
    <div style={{
      position: "absolute",
      left: mixingZone.x + mixingZone.width + 10,
      top: mixingZone.y,
      width: "40px",
      height: "40px",
      backgroundColor: "#444",
      color: "#fff",
      borderRadius: "5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      cursor: "pointer",
      zIndex: 6
    }} onClick={handleTrash}>
      Trash
    </div>
  );

  // Unified Counter (Birleşik Tezgah)
  const UnifiedCounter = () => (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: `${counterHeight}px`,
      background: "#d3a87c",
      borderBottom: "4px solid #8B4513",
      boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)",
      zIndex: 10
    }}>
      <BeanStation />
      <MilkStation />
      <CoffeeMachineComponent />
      <MixingAreaComponent />
      <RegisterStation />
      <TrashCan />
    </div>
  );

  // Seating Area (Oturma Alanı)
  const SeatingArea = () => (
    <div style={{
      position: "absolute",
      top: `${counterHeight}px`,
      left: 0,
      width: "100%",
      height: `calc(100vh - ${counterHeight + doorHeight}px)`,
      background: "#fafafa",
      boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
      zIndex: 5
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
  );

  // Müşteriler Katmanı
  const CustomersLayer = () => (
    <>
      {customers.map(c => (
        <div key={c.id} style={{
          position: "absolute",
          left: c.x,
          top: c.y,
          zIndex: c.route === "sit" ? 700 : 900
        }}>
          <Customer order={c.order} served={c.served} />
        </div>
      ))}
    </>
  );

  // Barista Katmanı
  const BaristaLayer = () => (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: baristaPos.x,
        top: baristaPos.y,
        cursor: "grab",
        userSelect: "none",
        zIndex: 1000
      }}>
      <Barista carrying={carrying} inventory={inventory} />
    </div>
  );

  // Joystick Overlay
  const JoystickOverlay = () => (
    joystickActive ? (
      <div
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          cursor: "grabbing",
          zIndex: 1100
        }}>
        <Joystick
          joystickStart={joystickStart}
          joystickOffset={joystickOffset}
          maxJoystickDistance={50}
        />
      </div>
    ) : null
  );

  // Para Bilgisi
  const MoneyDisplay = () => (
    <div style={{
      position: "absolute",
      top: "10px",
      right: "10px",
      fontSize: "24px",
      fontWeight: "bold",
      zIndex: 1100
    }}>
      Para: ${money}
    </div>
  );

  // --- Render ---
  return (
    <div style={containerStyle}>
      <Decoration />
      <UnifiedCounter />
      <SeatingArea />
      <CustomersLayer />
      <BaristaLayer />
      <JoystickOverlay />
      <MoneyDisplay />
    </div>
  );
};

export default CoffeeGame;
