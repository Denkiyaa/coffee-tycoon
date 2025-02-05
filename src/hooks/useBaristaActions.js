// src/hooks/useBaristaActions.js
import { useEffect } from 'react';
import { rectIntersect } from '../utils/rectIntersect';

const useBaristaActions = ({
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
  doorSpawn,
}) => {
  useEffect(() => {
    const baristaBox = { x: baristaPos.x, y: baristaPos.y, width: 60, height: 60 };

    switch(carrying) {
      case 'none':
        // Bean Station: Barista, elinde hiçbir şey yokken beanZone’daysa ve çekirdek hazırsa
        if (rectIntersect(baristaBox, beanZone) && beanProgress === 100) {
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
          break;
        }
        // Eğer makineden bardak hazırsa, barista elinde yokken bardak al
        if (rectIntersect(baristaBox, machineZone) && machineState === "cup") {
          setCarrying("cup");
          setMachineState("none");
          console.log("Bardak alındı");
        }
        break;
      case 'bean':
        // Eğer barista bean taşıyorsa ve makine bölgesindeyse, makinede işleme başlat
        if (rectIntersect(baristaBox, machineZone) && machineState === "none") {
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
        }
        break;
      case 'cup':
        // Sipariş Teslimi: Eğer barista elinde cup varken, müşteri kasada ise siparişi teslim et
        if (customers.length > 0) {
          customers.forEach(cust => {
            if (!cust.served && rectIntersect(cust, registerZone)) {
              const dx = cust.x - baristaPos.x;
              const dy = cust.y - baristaPos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 50) {
                setCarrying("none");
                setCustomers(current =>
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
        break;
      default:
        break;
    }
  }, [
    baristaPos,
    carrying,
    beanProgress,
    machineState,
    machineProgress,
    customers,
    beanZone,
    machineZone,
    registerZone,
    doorSpawn,
    setCarrying,
    setBeanProgress,
    setMachineState,
    setMachineProgress,
    setCustomers,
    setMoney
  ]);
};

export default useBaristaActions;
