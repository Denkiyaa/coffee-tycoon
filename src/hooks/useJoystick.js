// src/hooks/useJoystick.js
import { useState } from 'react';

const useJoystick = (maxJoystickDistance = 50, maxSpeed = 3) => {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickStart, setJoystickStart] = useState({ x: 0, y: 0 });
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    e.preventDefault();
    setJoystickActive(true);
    setJoystickStart({ x: e.clientX, y: e.clientY });
    setJoystickOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e) => {
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

  const handleMouseUp = () => {
    setJoystickActive(false);
    setJoystickOffset({ x: 0, y: 0 });
    setVelocity({ x: 0, y: 0 });
  };

  return {
    joystickActive,
    joystickStart,
    joystickOffset,
    velocity,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};

export default useJoystick;
