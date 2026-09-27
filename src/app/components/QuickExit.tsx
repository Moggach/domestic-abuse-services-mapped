import React, { useEffect } from 'react';

const EXIT_URL = 'https://www.bbc.com';

// replace() rather than assigning href so this site isn't left in the
// back-button history.
export const exitSite = (): void => {
  window.location.replace(EXIT_URL);
};

const QuickExit: React.FC = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      // Let Esc close an open dialog (e.g. the safety notice) first.
      if (document.querySelector('dialog[open]')) return;
      exitSite();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    // A real link so it still works before the page's JavaScript has
    // loaded; once it has, onClick uses replace() to avoid a history entry.
    <a
      href={EXIT_URL}
      rel="noreferrer"
      className="btn fixed bottom-0 left-0 w-full z-50 md:top-4 md:bottom-auto md:right-4 md:left-auto md:w-fit bg-red-700 hover:bg-red-800 border-0 text-white rounded-md shadow-md flex items-center justify-center p-2"
      onClick={(e) => {
        e.preventDefault();
        exitSite();
      }}
      aria-keyshortcuts="Escape"
    >
      <span>
        Safe exit
        <span className="hidden md:inline font-normal"> (Esc)</span>
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        className="ml-2"
        aria-hidden="true"
      >
        <path
          d="M14.0621 11.2496V8.99971H8.43724V6.75211H14.0621V4.49985L17.437 7.87474L14.0621 11.2496ZM12.9371 10.1247V14.6245H7.31228V17.9994L0.5625 14.6245V0H12.9371V5.62482H11.8121V1.12496H2.81243L7.31228 3.37489V13.4996H11.8121V10.1247H12.9371Z"
          fill="white"
        />
      </svg>
    </a>
  );
};

export default QuickExit;
