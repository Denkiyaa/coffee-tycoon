import React, { useState, useEffect } from 'react';
import Barista from './components/Barista';
import Customer from './components/Customer';
import Joystick from './components/Joystick';
import ProgressBar from './components/ProgressBar';
import CoffeeBean from './components/CoffeeBean';
import CoffeeCup from './components/CoffeeCup';

const CoffeeGame = () => {
  // Tüm ekranı kaplayan container
  const containerStyle = {
    position: "relative",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#f5f5dc",
    overflow: "hidden"
  };

  /* --- Sabit Bölge Koordinatları (Tezgah Üstü) --- */
  const beanZone = { x: 50, y: 50, width: 100, height: 100 };     // Bean Station
  const machineZone = { x: 170, y: 50, width: 120, height: 120 };  // Kahve Makinesi
  const registerZone = { x: 320, y: 50, width: 100, height: 100 }; // Kasa

  /* --- Oyuncu ve Makine Durumları --- */
  const [baristaPos, setBaristaPos] = useState({ x: 200, y: 300 });
  const [carrying, setCarrying] = useState("none");       // "none", "bean", "cup"
  const [machineState, setMachineState] = useState("none"); // "none", "processing", "cup"
  const [money, setMoney] = useState(0);

  /* --- Zamanlama (Progress) State'leri --- */
  const [beanProgress, setBeanProgress] = useState(100);    // BeanZone: %100 = hazır
  const [machineProgress, setMachineProgress] = useState(0);  // Makine işlemi progress

  /* --- Joystick Durumu --- */
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickStart, setJoystickStart] = useState({ x: 0, y: 0 });
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
  const maxJoystickDistance = 50; // piksel
  const maxSpeed = 3;             // piksel/frame (daha düşük hız, daha kontrollü hareket)
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  // Baristaya tıklanıldığında joystick aktif olsun
  const handleBaristaMouseDown = (e) => {
    e.preventDefault();
    setJoystickActive(true);
    setJoystickStart({ x: e.clientX, y: e.clientY });
    setJoystickOffset({ x: 0, y: 0 });
  };

  // Joystick overlay üzerinden mouse hareketlerini yakalıyoruz
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

  // Barista pozisyonunu velocity'ye göre sürekli güncelle
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

  /* --- Müşteri Mekaniği --- */
  const [customer, setCustomer] = useState(null);
  // Müşteri spawn konumu: Dükkan kapısının dışı (doorSpawn)
  const doorSpawn = { x: window.innerWidth - 150, y: 100 };  
  // Müşterinin hedefi: Kasa alanının ortası
  const customerTarget = { 
    x: registerZone.x + registerZone.width / 2, 
    y: registerZone.y + registerZone.height / 2 
  };

  // Müşteri spawn: Eğer müşteri yoksa doorSpawn'dan ortaya çıkar
  useEffect(() => {
    if (!customer) {
      const timer = setTimeout(() => {
        setCustomer({ ...doorSpawn, served: false, order: "kahve" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [customer]);

  // Müşteriyi yavaşça hedefe doğru hareket ettir (adım = 0.2 piksel/frame)
  useEffect(() => {
    let animationFrameId;
    const updateCustomer = () => {
      if (customer && !customer.served) {
        const dx = customerTarget.x - customer.x;
        const dy = customerTarget.y - customer.y;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);
        if (dist > 1) {
          const step = 0.2;
          setCustomer(prev => ({
            ...prev,
            x: prev.x + (dx / dist) * step,
            y: prev.y + (dy / dist) * step
          }));
        }
      }
      animationFrameId = requestAnimationFrame(updateCustomer);
    };
    animationFrameId = requestAnimationFrame(updateCustomer);
    return () => cancelAnimationFrame(animationFrameId);
  }, [customer, customerTarget]);

  // Dikdörtgen çakışması kontrol fonksiyonu
  const rectIntersect = (r1, r2) =>
    !(r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y);

  /* --- İşlem Zinciri --- */
  useEffect(() => {
    const baristaBox = { x: baristaPos.x, y: baristaPos.y, width: 60, height: 60 };

    // Bean Station: Eğer barista beanZone ile çakışıyor, elinde hiçbir şey yoksa VE beanProgress %100 ise
    if (rectIntersect(baristaBox, beanZone) && carrying === "none" && beanProgress === 100) {
      setCarrying("bean");
      console.log("Çekirdek alındı");
      // Bean alındıktan sonra beanProgress sıfırlansın ve 7000ms'de yeniden dolsun
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

    // Kahve Makinesi: Eğer barista, elinde "bean" varken makineZone ile çakışırsa
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

    // Sipariş Teslimi: Müşteri, registerZone içerisine girdiyse VE barista ile arası 50 pikselin altındaysa ve barista "cup" taşıyorsa
    if (customer && !customer.served && carrying === "cup") {
      const dx = customer.x - baristaPos.x;
      const dy = customer.y - baristaPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Eğer müşteri registerZone içindeyse (veya registerZone ile çakışıyorsa) VE barista ile arası 50 pikselin altındaysa
      if (dist < 50 && rectIntersect(customer, registerZone)) {
         setCarrying("none");
         setCustomer({ ...customer, served: true });
         setMoney(prev => prev + 10);
         console.log("Sipariş teslim edildi, para kazanıldı!");
         setTimeout(() => {
           setCustomer(null);
         }, 2000);
      }
    }
  }, [baristaPos, carrying, machineState, customer, beanProgress, beanZone, machineZone, registerZone]);

  return (
    <div style={containerStyle}>
      {/* Üst Kısım – Tezgah (Bean Station, Makine, Kasa) */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "40%",
        height: "250px",
        background: "#d3a87c",
        borderBottom: "4px solid #8B4513"
      }}>
        {/* Bean Station */}
        <div style={{
          position: "absolute",
          left: beanZone.x,
          top: beanZone.y,
          width: beanZone.width,
          height: beanZone.height,
          border: "2px solid #8B4513",
          background: "#fff8e1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
          <div style={{ fontWeight: "bold" }}>Bean Station</div>
          <CoffeeBean />
          {/* Bean Progress Bar */}
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
          <div style={{ fontWeight: "bold" }}>Kahve Makinesi</div>
          {machineState === "processing" && <div>İşleniyor...</div>}
          {machineState === "cup" && <CoffeeCup />}
          {/* Makine Progress Bar */}
          {machineState === "processing" && (
            <div style={{ position: "absolute", right: 0, top: 0 }}>
              <ProgressBar progress={machineProgress} height={100} width={10} />
            </div>
          )}
        </div>
        {/* Kasa Bölgesi */}
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
          <div style={{ fontWeight: "bold" }}>Kasa</div>
        </div>
      </div>
      {/* Müşteri: Ana container içinde mutlak konumlandırılmış */}
      {customer && (
        <div style={{ position: "absolute", left: customer.x, top: customer.y }}>
          <Customer order={customer.order} served={customer.served} />
        </div>
      )}
      {/* Alt Kısım – Dekoratif Masa ve Koltuklar */}
      <div style={{
        position: "absolute",
        top: "260px",
        left: "5%",
        width: "90%",
        height: "70%",
        background: "#fafafa"
      }}>
        <div style={{
          position: "absolute",
          top: "20px",
          left: "10%",
          width: "120px",
          height: "80px",
          border: "2px solid #8B4513",
          background: "#fff",
          textAlign: "center",
          lineHeight: "80px"
        }}>
          Masa
        </div>
        <div style={{
          position: "absolute",
          top: "20px",
          right: "10%",
          width: "120px",
          height: "80px",
          border: "2px solid #8B4513",
          background: "#fff",
          textAlign: "center",
          lineHeight: "80px"
        }}>
          Masa
        </div>
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "10%",
          width: "80px",
          height: "80px",
          border: "2px solid #8B4513",
          background: "#ffe4b5",
          textAlign: "center",
          lineHeight: "80px"
        }}>
          Koltuk
        </div>
        <div style={{
          position: "absolute",
          bottom: "20px",
          right: "10%",
          width: "80px",
          height: "80px",
          border: "2px solid #8B4513",
          background: "#ffe4b5",
          textAlign: "center",
          lineHeight: "80px"
        }}>
          Koltuk
        </div>
      </div>
      {/* Barista (Oyuncu) */}
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
