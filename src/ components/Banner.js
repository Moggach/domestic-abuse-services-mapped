import React, { useState } from 'react';
import { BannerContainer } from '../styles/LayoutStyles';
import styled, { keyframes, css } from 'styled-components';

const slideInFromTop = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOutToTop = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

const AnimatedBannerContainer = styled(BannerContainer)`
  ${({ isOpen }) => isOpen ? css`animation: ${slideInFromTop} 0.3s ease-out forwards;` : css`animation: ${slideOutToTop} 0.3s ease-out forwards;`}
`;

const Banner = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(true);

  const closeBanner = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose(); // After animation completes, trigger onClose
    }, 300); // 300ms is the duration of the animation
  };

  const goToGoogle = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <AnimatedBannerContainer isOpen={isOpen}>
      <p>If you are in an emergency, please call 999</p>
      <p>If you’re worried someone might be monitoring your devices, exit this website and visit from a device only you have access to. </p>
      <p>Learn more about <a href="https://refugetechsafety.org/">safe browsing, and keeping your technology safe.</a></p>
      <button onClick={goToGoogle}>Quick exit</button>
      <button onClick={closeBanner}>Close</button>
    </AnimatedBannerContainer>
  );
};

export default Banner;
