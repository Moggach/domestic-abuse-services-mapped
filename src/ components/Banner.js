import React, { useState } from 'react';

const Banner = () => {
  const goToGoogle = () => {
    window.location.href = 'https://www.google.com';
  };

  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => setIsVisible(false);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      backgroundColor: 'lightblue',
      padding: '20px',
      textAlign: 'center',
      zIndex: 1000,
    }}>
      <p>If you are in an emergency, please call 999</p>
        <p>If you’re worried someone might be monitoring your devices, exit this website and visit from a device only you have access to. </p>
        <p>Learn more about safe browsing, and keeping your technology safe.</p>
        <button onClick={goToGoogle} style={{
        padding: '10px 20px',
        backgroundColor: 'navy',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}>Quick exit</button>
      <button onClick={handleClose}>Close</button>
    </div>
  );
};

export default Banner;