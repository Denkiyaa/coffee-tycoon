// src/hooks/useCustomers.js
import { useState, useEffect, useRef } from 'react';

const useCustomers = (doorSpawn, registerZone, tables) => {
  const [customers, setCustomers] = useState([]);
  const doorSpawnRef = useRef(doorSpawn);
  const customerTargetRef = useRef({
    x: registerZone.x + registerZone.width / 2,
    y: registerZone.y + registerZone.height / 2,
  });

  // Belirli aralıklarla müşteri oluşturma (örnekte 10 saniyede bir)
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
      setCustomers(prev => [...prev, newCustomer]);
    }, 10000);
    return () => clearInterval(spawnInterval);
  }, []);

  // Müşterilerin hedeflerine doğru hareket ettirilmesi ve rotalarının güncellenmesi
  useEffect(() => {
    let animationFrameId;
    const updateCustomers = () => {
      setCustomers(prev => {
        const current = prev || [];
        return current
          .map(customer => {
            let updated = { ...customer };
            if (updated.target) {
              const dx = updated.target.x - updated.x;
              const dy = updated.target.y - updated.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 1) {
                // Müşteri hızı: 2 piksel/frame
                const step = 2;
                updated.x += (dx / dist) * step;
                updated.y += (dy / dist) * step;
              } else {
                // Hedefe ulaşınca:
                if (updated.served && !updated.route) {
                  // Sipariş teslim edildiyse: rastgele "sit" veya "exit" rotası belirle
                  const route = Math.random() < 0.5 ? "sit" : "exit";
                  if (route === "sit") {
                    const table = tables[Math.floor(Math.random() * tables.length)];
                    updated.route = "sit";
                    // Masanın ortasına gitmek için hedef belirle
                    updated.target = { x: table.x + 75, y: table.y + 40 };
                  } else {
                    updated.route = "exit";
                    updated.target = doorSpawn;
                  }
                }
                // "Sit" rotasında masada bekleyip 5 saniye sonra kapıya yönelme
                if (updated.route === "sit" && !updated.waiting) {
                  updated.waiting = true;
                  setTimeout(() => {
                    setCustomers(currentCustomers =>
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
            // "Exit" rotasındaki müşteri kapıya ulaştıysa listeden çıkar
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
  }, [tables, doorSpawn, registerZone]);

  return [customers, setCustomers];
};

export default useCustomers;
