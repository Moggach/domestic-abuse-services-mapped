import React, { useState } from 'react';
import { BannerContainer } from '../styles/LayoutStyles';

const Banner = () => {
  const goToGoogle = () => {
    window.location.href = 'https://www.google.com';
  };

  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => setIsVisible(false);

  if (!isVisible) return null;

  return (
   <BannerContainer>
      <p>If you are in an emergency, please call 999</p>
        <p>If you’re worried someone might be monitoring your devices, exit this website and visit from a device only you have access to. </p>
        <p>Learn more about <a href="https://refugetechsafety.org/">safe browsing, and keeping your technology safe.</a></p>
        <button onClick={goToGoogle}>Quick exit</button>
      <button onClick={handleClose}>Close</button>
   </BannerContainer>
  );
};

export default Banner;