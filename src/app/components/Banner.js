import React, { useState } from 'react';



const Banner = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(true);

  const closeBanner = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose(); 
    }, 300); 
  };

  const goToGoogle = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div>
      <p>If you are in an emergency, please call 999</p>
      <p>If you’re worried someone might be monitoring your devices, exit this website and visit from a device only you have access to. </p>
      <p>Learn more about <a href="https://refugetechsafety.org/">safe browsing, and keeping your technology safe.</a></p>
      <button onClick={goToGoogle}>Quick exit</button>
      <button onClick={closeBanner}>Close</button>
    </div>
  );
};

export default Banner;
