import React from 'react';

const QuickExit: React.FC = () => {
  const handleClick = (): void => {
    window.location.href = 'https://www.bbc.com';
  };

  return (
    <button
      className="btn fixed bottom-0 left-0 w-full z-50 md:top-1/2 md:bottom-auto md:right-4 md:left-auto md:w-fit md:transform md:-translate-y-1/2 btn-accent text-white rounded-md shadow-md flex items-center justify-center p-2"
      onClick={handleClick}
    >
      Safe exit
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        className="ml-2"
      >
        <path
          d="M14.0621 11.2496V8.99971H8.43724V6.75211H14.0621V4.49985L17.437 7.87474L14.0621 11.2496ZM12.9371 10.1247V14.6245H7.31228V17.9994L0.5625 14.6245V0H12.9371V5.62482H11.8121V1.12496H2.81243L7.31228 3.37489V13.4996H11.8121V10.1247H12.9371Z"
          fill="white"
        />
      </svg>
    </button>
  );
};

export default QuickExit;
