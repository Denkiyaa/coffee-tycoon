// src/hooks/useBaristaActions.js
import { useEffect } from 'react';
import { rectIntersect } from '../utils/rectIntersect';

const useBaristaActions = ({
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
  milkZone,       // Milk Station
  machineZone,
  mixingZone,     // Mixing Area
  registerZone,
  doorSpawn,
  inventory,
  setInventory,
}) => {
  useEffect(() => {
    const baristaBox = { x: baristaPos.x, y: baristaPos.y, width: 60, height: 60 };

    if (carrying === "none") {
      // Bean Station: Çekirdek hazırsa "bean" al.
      if (rectIntersect(baristaBox, beanZone) && beanProgress === 100) {
        setCarrying("bean");
        console.log("Picked up bean");
        setBeanProgress(0);
        const duration = 7000, interval = 50;
        let elapsed = 0;
        const timer = setInterval(() => {
          elapsed += interval;
          const prog = Math.min((elapsed / duration) * 100, 100);
          setBeanProgress(prog);
          if (prog >= 100) clearInterval(timer);
        }, interval);
      }
      // Milk Station: Süt hazırsa "milk" al.
      else if (rectIntersect(baristaBox, milkZone) && milkProgress === 100) {
        setCarrying("milk");
        console.log("Picked up milk");
        setMilkProgress(0);
        const duration = 7000, interval = 50;
        let elapsed = 0;
        const timer = setInterval(() => {
          elapsed += interval;
          const prog = Math.min((elapsed / duration) * 100, 100);
          setMilkProgress(prog);
          if (prog >= 100) clearInterval(timer);
        }, interval);
      }
      // Coffee Machine: Hazır "cup" varsa al.
      else if (rectIntersect(baristaBox, machineZone) && machineState === "cup") {
        setCarrying("cup");
        setMachineState("none");
        console.log("Picked up coffee cup");
      }
    } else if (carrying === "bean") {
      // "bean" taşıyorsa, Coffee Machine'e girince işleme başlat.
      if (rectIntersect(baristaBox, machineZone) && machineState === "none") {
        setCarrying("none");
        setMachineState("processing");
        console.log("Processing bean into coffee cup");
        setMachineProgress(0);
        const duration = 2000, interval = 50;
        let elapsed = 0;
        const timer = setInterval(() => {
          elapsed += interval;
          const prog = Math.min((elapsed / duration) * 100, 100);
          setMachineProgress(prog);
          if (prog >= 100) {
            clearInterval(timer);
            setMachineState("cup");
            setMachineProgress(0);
            console.log("Coffee cup ready");
          }
        }, interval);
      }
    } else if (carrying === "cup" || carrying === "milk") {
      // Eğer barista "cup" veya "milk" taşıyorsa ve Mixing Area'ya girerse, ilgili ürünü envantere aktar.
      if (rectIntersect(baristaBox, mixingZone)) {
        if (carrying === "cup" && inventory.coffee === 0) {
          setInventory(prev => ({ ...prev, coffee: 1 }));
          console.log("Stored coffee in inventory");
          setCarrying("none");
        }
        if (carrying === "milk" && inventory.milk === 0) {
          setInventory(prev => ({ ...prev, milk: 1 }));
          console.log("Stored milk in inventory");
          setCarrying("none");
        }
      } else {
        // Teslimat: Eğer Register Zone'da ve müşteri siparişi "kahve" ise teslim et.
        if (customers.length > 0) {
          customers.forEach(cust => {
            if (!cust.served && rectIntersect(cust, registerZone) && cust.order === "kahve") {
              const dx = cust.x - baristaPos.x;
              const dy = cust.y - baristaPos.y;
              if (Math.sqrt(dx * dx + dy * dy) < 50) {
                setCarrying("none");
                setCustomers(current =>
                  current.map(item =>
                    item.id === cust.id
                      ? { ...item, served: true, route: "exit", target: doorSpawn }
                      : item
                  )
                );
                setMoney(prev => prev + 10);
                console.log("Delivered coffee order, earned money!");
              }
            }
          });
        }
      }
    } else if (carrying === "latte") {
      // Teslimat: Eğer Register Zone'da ve sipariş "latte" ise teslim et.
      if (customers.length > 0) {
        customers.forEach(cust => {
          if (!cust.served && rectIntersect(cust, registerZone) && cust.order === "latte") {
            const dx = cust.x - baristaPos.x;
            const dy = cust.y - baristaPos.y;
            if (Math.sqrt(dx * dx + dy * dy) < 50) {
              setCarrying("none");
              setCustomers(current =>
                current.map(item =>
                  item.id === cust.id
                    ? { ...item, served: true, route: "exit", target: doorSpawn }
                    : item
                )
              );
              setMoney(prev => prev + 10);
              console.log("Delivered latte order, earned money!");
            }
          }
        });
      }
    }
  }, [
    baristaPos,
    carrying,
    beanProgress,
    milkProgress,
    machineState,
    machineProgress,
    customers,
    beanZone,
    milkZone,
    machineZone,
    mixingZone,
    registerZone,
    doorSpawn,
    setCarrying,
    setBeanProgress,
    setMilkProgress,
    setMachineState,
    setMachineProgress,
    setCustomers,
    setMoney,
    inventory,
    setInventory,
  ]);

  // Ayrı effect: Eğer barista Mixing Area'da ve inventory'de hem coffee hem milk varsa, latte üret.
  useEffect(() => {
    const baristaBox = { x: baristaPos.x, y: baristaPos.y, width: 60, height: 60 };
    if (rectIntersect(baristaBox, mixingZone)) {
      if (inventory.coffee === 1 && inventory.milk === 1 && carrying === "none") {
        console.log("Mixing inventory to produce latte");
        setTimeout(() => {
          setInventory({ coffee: 0, milk: 0 });
          setCarrying("latte");
          console.log("Latte produced from inventory");
        }, 1000);
      }
    }
  }, [baristaPos, inventory, carrying, mixingZone, setInventory, setCarrying]);

};

export default useBaristaActions;
