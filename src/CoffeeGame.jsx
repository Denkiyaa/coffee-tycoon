// src/CoffeeGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import Barista from './components/Barista';
import Customer from './components/Customer';
import Joystick from './components/Joystick';
import ProgressBar from './components/ProgressBar';
import CoffeeBean from './components/CoffeeBean';
import CoffeeCup from './components/CoffeeCup';
import Decoration from './components/Decoration';

// Yardımcı: Dikdörtgen çakışması kontrol fonksiyonu
const rectIntersect = (r1, r2) =>
  !(r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y);

const CoffeeGame = () => {
  // --- (Önceki kısımlar değişmedi: container, zoneler, state'ler vs.) ---

  const containerStyle = {
    position: "relative",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#f5f5dc",
    overflow: "hidden",
    backgroundImage: "linear-gradient(to bottom, #f5f5dc, #e0d8c3)"
  };
 

  // Bölge ayarları
  const counterHeight = 200;      // Tezgah alanı yüksekliği
  const doorHeight = 150;         // Kapı yüksekliği (Decoration bileşeninde)
  const seatingTop = counterHeight;  // Oturma alanı, tezgahın altından başlar

  // Tezgah alanı zoneleri (counter alanı içinde; sol üst köşe koordinatları)
  const beanZone = { x: 20, y: 20, width: 100, height: 100 };
  const machineZone = { x: 140, y: 20, width: 120, height: 120 };
  const registerZone = { x: 300, y: 20, width: 100, height: 100 };

  // Oturma alanında kullanılacak masalar (örnek)
  const tables = [
    { x: 100, y: seatingTop + 50 },
    { x: 300, y: seatingTop + 50 },
    { x: 500, y: seatingTop + 50 },
    { x: 200, y: seatingTop + 150 },
    { x: 400, y: seatingTop + 150 }
  ];

  const doorSpawnRef = useRef({ x: window.innerWidth - 150, y: 100 });
  const customerTargetRef = useRef({
    x: registerZone.x + registerZone.width / 2,
    y: registerZone.y + registerZone.height / 2,
  });

  // Barista, para, progress ve diğer state'ler
  const [baristaPos, setBaristaPos] = useState({ x: 200, y: counterHeight + 50 });
  const [carrying, setCarrying] = useState("none");       // "none", "bean", "cup"
  const [machineState, setMachineState] = useState("none"); // "none", "processing", "cup"
  const [money, setMoney] = useState(0);
  const [beanProgress, setBeanProgress] = useState(100);    // %100 = çekirdek hazır
  const [machineProgress, setMachineProgress] = useState(0);  // Makine işlemi progress
  const [customer, setCustomer] = useState([]); // Add this at the top with other state declarations

  // Joystick state
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickStart, setJoystickStart] = useState({ x: 0, y: 0 });
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
  const maxJoystickDistance = 50;
  const maxSpeed = 3;
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  // Müşteri state: { x, y, served, order, route, target, waiting }
  const doorSpawn = React.useMemo(() => ({ 
    x: window.innerWidth - 150, 
    y: 100 
  }), []);

  const customerTarget = React.useMemo(() => ({
    x: registerZone.x + registerZone.width / 2,
    y: registerZone.y + registerZone.height / 2
  }), [registerZone]);

  // --- Fonksiyonlar ---
  const handleBaristaMouseDown = (e) => {
    e.preventDefault();
    setJoystickActive(true);
    setJoystickStart({ x: e.clientX, y: e.clientY });
    setJoystickOffset({ x: 0, y: 0 });
  };

  const handleJoystickMouseMove = (e) => {
    if (!joystickActive) return;
    const offsetX = e.clientX - joystickStart.x;
    const offsetY = e.clientY - joystickStart.y;
    let distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
    let clampedX = offsetX, clampedY = offsetY;
    if (distance > maxJoystickDistance) {
      const ratio = maxJoystickDistance / distance;
      clampedX = offsetX * ratio;
      clampedY = offsetY * ratio;
    }
    setJoystickOffset({ x: clampedX, y: clampedY });
    setVelocity({
      x: (clampedX / maxJoystickDistance) * maxSpeed,
      y: (clampedY / maxJoystickDistance) * maxSpeed,
    });
  };

  const handleJoystickMouseUp = () => {
    setJoystickActive(false);
    setJoystickOffset({ x: 0, y: 0 });
    setVelocity({ x: 0, y: 0 });
  };

  // Barista hareketi
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
  

// Müşteri spawn efekti: Her 2000ms'de (2 saniyede) yeni bir müşteri ekle
useEffect(() => {
  const spawnInterval = setInterval(() => {
    const newCustomer = {
      id: Date.now(),
      x: doorSpawnRef.current.x,
      y: doorSpawnRef.current.y,
      served: false,
      order: "kahve",
      route: null,
      target: customerTargetRef.current,
      waiting: false
    };
    console.log("Yeni müşteri spawn oldu:", newCustomer);
    setCustomer(prev => [...prev, newCustomer]);
  }, 10000);
  return () => clearInterval(spawnInterval);
}, []); // boş dependency dizisi: efekt yalnızca mount edildiğinde kurulacak



// Müşteri güncelleme efekti: Tüm müşterileri, belirlenen hedeflerine doğru hareket ettir
useEffect(() => {
  let animationFrameId;
  const updateCustomers = () => {
    setCustomer(prev => {
      // Eğer prev undefined ise (defansif kullanım), boş dizi döndürün
      const current = prev || [];
      return current
        .map(customer => {
          let updated = { ...customer };
          if (updated.target) {
            const dx = updated.target.x - updated.x;
            const dy = updated.target.y - updated.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1) {
              // Müşteri hızı: 2 piksel/frame (isteğe bağlı ayarlanabilir)
              const step = 2;
              updated.x += (dx / dist) * step;
              updated.y += (dy / dist) * step;
            } else {
              // Hedefe ulaştıysa:
              if (updated.served && !updated.route) {
                // Eğer sipariş teslim edildiyse, rastgele rota belirle: "sit" veya "exit"
                const route = Math.random() < 0.5 ? "sit" : "exit";
                if (route === "sit") {
                  const table = tables[Math.floor(Math.random() * tables.length)];
                  updated.route = "sit";
                  // Masanın ortasına gitmek için hedef belirle
                  updated.target = { x: table.x + 75, y: table.y + 40 };
                } else {
                  updated.route = "exit";
                  updated.target = doorSpawn; // Kapı yönüne
                }
              }
              // Eğer müşteri "sit" rotasındaysa ve masada oturuyorsa, 5 saniye bekledikten sonra kapıya git
              if (updated.route === "sit" && !updated.waiting) {
                updated.waiting = true;
                setTimeout(() => {
                  setCustomer(currentCustomers =>
                    currentCustomers.map(c =>
                      c.id === updated.id ? { ...c, target: doorSpawn } : c
                    )
                  );
                }, 5000);
              }
            }
          }
          return updated;
        })
        .filter(c => {
          // Eğer müşteri "exit" rotasındaysa ve kapıya ulaştıysa, listeden çıkar
          if (c.route === "exit") {
            const dx = c.x - doorSpawn.x;
            const dy = c.y - doorSpawn.y;
            if (Math.sqrt(dx * dx + dy * dy) < 50) return false;
          }
          return true;
        });
    });
    animationFrameId = requestAnimationFrame(updateCustomers);
  };
  animationFrameId = requestAnimationFrame(updateCustomers);
  return () => cancelAnimationFrame(animationFrameId);
}, [tables, doorSpawn, customerTarget]);


// İşlem Zinciri: Bean alma, Makine İşlemesi, Sipariş Teslimi
useEffect(() => {
  const baristaBox = { x: baristaPos.x, y: baristaPos.y, width: 60, height: 60 };

  // Bean Station: Eğer barista beanZone ile çakışıyor, elinde hiçbir şey yoksa VE beanProgress %100 ise
  if (rectIntersect(baristaBox, beanZone) && carrying === "none" && beanProgress === 100) {
    setCarrying("bean");
    console.log("Çekirdek alındı");
    setBeanProgress(0);
    const duration = 7000;
    const interval = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      const prog = Math.min((elapsed / duration) * 100, 100);
      setBeanProgress(prog);
      if (prog >= 100) {
        clearInterval(timer);
      }
    }, interval);
  }

  // Kahve Makinesi: Eğer barista, elinde "bean" varken machineZone ile çakışırsa
  if (rectIntersect(baristaBox, machineZone)) {
    if (carrying === "bean" && machineState === "none") {
      setCarrying("none");
      setMachineState("processing");
      console.log("Makinede işleme başladı");
      setMachineProgress(0);
      const duration = 2000;
      const interval = 50;
      let elapsed = 0;
      const timer = setInterval(() => {
        elapsed += interval;
        const prog = Math.min((elapsed / duration) * 100, 100);
        setMachineProgress(prog);
        if (prog >= 100) {
          clearInterval(timer);
          setMachineState("cup");
          setMachineProgress(0);
          console.log("Bardak hazır");
        }
      }, interval);
    } else if (machineState === "cup" && carrying === "none") {
      setCarrying("cup");
      setMachineState("none");
      console.log("Bardak alındı");
    }
  }

      // Sipariş Teslimi: Eğer herhangi bir müşteri registerZone içerisine girmiş VE barista "cup" taşıyorsa
  if (customer.length > 0 && carrying === "cup") {
    customer.forEach(cust => {
      if (!cust.served && rectIntersect(cust, registerZone)) {
        const dx = cust.x - baristaPos.x;
        const dy = cust.y - baristaPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 50) {
          setCarrying("none");
          // Önemli: Müşteri teslim edildiğinde, route "exit" ve target kapı olarak atanır
          setCustomer(current =>
            current.map(item =>
              item.id === cust.id
                ? { ...item, served: true, route: "exit", target: doorSpawn }
                : item
            )
          );
          setMoney(prev => prev + 10);
          console.log("Sipariş teslim edildi, para kazanıldı!");
        }
      }
    });
  }
}, [baristaPos, carrying, machineState, customer, beanProgress, beanZone, machineZone, registerZone]);


  return (
    <div style={containerStyle}>
      {/* Dekorasyon (Kapı ve Duvar Süsleri) */}
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

      {/* Müşteri */}
      {customer.map(c => (
        <div key={c.id} style={{ position: "absolute", left: c.x, top: c.y }}>
          <Customer order={c.order} served={c.served} />
        </div>
      ))}

      {/* Barista */}
      <div
        onMouseDown={handleBaristaMouseDown}
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
          onMouseMove={handleJoystickMouseMove}
          onMouseUp={handleJoystickMouseUp}
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
            maxJoystickDistance={maxJoystickDistance}
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
