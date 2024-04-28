import React from 'react';
import { BannerContainer } from '../styles/LayoutStyles';
import styled, { keyframes } from 'styled-components';

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

const AnimatedBannerContainer = styled(BannerContainer)`
 animation: ${slideInFromTop} 0.3s ease-out forwards;
`;

const Banner = ({ onClose }) => {
 const goToGoogle = () => {
    window.location.href = 'https://www.google.com';
 };

 return (
    <AnimatedBannerContainer>
      <p>If you are in an emergency, please call 999</p>
      <p>If you’re worried someone might be monitoring your devices, exit this website and visit from a device only you have access to. </p>
      <p>Learn more about <a href="https://refugetechsafety.org/">safe browsing, and keeping your technology safe.</a></p>
      <button onClick={goToGoogle}>Quick exit</button>
      <button onClick={onClose}>Close</button>
    </AnimatedBannerContainer>
 );
};

export default Banner;
