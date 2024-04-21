import React from 'react';
import { QuickExit } from '../styles/LayoutStyles';

const GoToGoogleButton = () => {
 const handleClick = () => {
    window.location.href = 'https://www.google.com';
 };

 return (
    <QuickExit onClick={handleClick}>
     Exit this site
    </QuickExit>
 );
};

export default GoToGoogleButton;