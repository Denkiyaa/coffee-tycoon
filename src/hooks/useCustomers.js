// src/hooks/useCustomers.js
import { useState, useEffect, useRef } from 'react';

const useCustomers = (doorSpawn, registerZone, tables) => {
  const [customers, setCustomers] = useState([]);
  const doorSpawnRef = useRef(doorSpawn);
  const customerTargetRef = useRef({
    x: registerZone.x + registerZone.width / 2,
    y: registerZone.y + registerZone.height / 2,
  });
  const safeDistance = 50; // Müşteriler arası minimum mesafe

  // Müşteri oluşturma: Her 10 saniyede bir yeni müşteri spawn oluyor.
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const newCustomer = {
        id: Date.now(),
        x: doorSpawnRef.current.x,
        y: doorSpawnRef.current.y,
        served: false,
        // Sipariş rastgele: %50 "kahve", %50 "latte"
        order: Math.random() < 0.5 ? "kahve" : "latte",
        route: null,
        target: customerTargetRef.current,
        waiting: false,
        width: 40,
        height: 40,
      };
      console.log("Yeni müşteri spawn oldu:", newCustomer);
      setCustomers(prev => [...prev, newCustomer]);
    }, 10000);
    return () => clearInterval(spawnInterval);
  }, []);

  // Müşterilerin hareketi ve exit kontrolü
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
                const step = 2;
                // Potansiyel yeni konum
                const newX = updated.x + (dx / dist) * step;
                const newY = updated.y + (dy / dist) * step;
                let colliding = false;
                // Çarpışma kontrolünü yalnızca gelen (route === null) müşteriler için uygula.
                if (!updated.route) {
                  colliding = current.some(other => {
                    if (other.id === updated.id) return false;
                    // Yalnızca diğer gelen müşterilerle (route === null) kontrol yap:
                    if (other.route) return false;
                    const otherDist = Math.sqrt(
                      (updated.target.x - other.x) ** 2 +
                      (updated.target.y - other.y) ** 2
                    );
                    // Hedefe daha yakın (öne geçmiş) bir müşteri varsa:
                    if (otherDist < dist) {
                      const dBetween = Math.sqrt((other.x - newX) ** 2 + (other.y - newY) ** 2);
                      if (dBetween < safeDistance) return true;
                    }
                    return false;
                  });
                }
                if (!colliding) {
                  updated.x = newX;
                  updated.y = newY;
                }
              } else {
                // Hedefe ulaştığında:
                if (updated.served && !updated.route) {
                  // Sipariş teslim edildiyse, rastgele "sit" veya "exit" rotası belirle
                  const route = Math.random() < 0.5 ? "sit" : "exit";
                  if (route === "sit") {
                    const table = tables[Math.floor(Math.random() * tables.length)];
                    updated.route = "sit";
                    updated.target = { x: table.x + 75, y: table.y + 40 };
                  } else {
                    updated.route = "exit";
                    updated.target = doorSpawn;
                  }
                }
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
            // Exit rotasındaki müşteri, doorSpawn’a yakınsa listeden çıkar.
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
