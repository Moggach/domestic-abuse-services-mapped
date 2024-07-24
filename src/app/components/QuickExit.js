import React from 'react';

const GoToGoogleButton = () => {
 const handleClick = () => {
    window.location.href = 'https://www.google.com';
 };

 return (
    <div onClick={handleClick}>
     Exit this site
    </div>
 );
};

export default GoToGoogleButton;