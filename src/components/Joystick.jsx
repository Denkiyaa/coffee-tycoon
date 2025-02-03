import React from 'react';

const Joystick = ({ joystickStart, joystickOffset, maxJoystickDistance }) => (
  <div
    style={{
      position: "absolute",
      left: joystickStart.x - maxJoystickDistance,
      top: joystickStart.y - maxJoystickDistance,
      width: maxJoystickDistance * 2,
      height: maxJoystickDistance * 2,
      border: "2px solid rgba(0,0,0,0.3)",
      borderRadius: "50%",
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: maxJoystickDistance + joystickOffset.x - 15,
        top: maxJoystickDistance + joystickOffset.y - 15,
        width: 30,
        height: 30,
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: "50%",
        pointerEvents: "none",
      }}
    ></div>
  </div>
);

export default Joystick;
