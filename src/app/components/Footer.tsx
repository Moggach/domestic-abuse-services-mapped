import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-4 pb-[55px] md:pb-4">
      <p>
        Made with ❤️ by{' '}
        <a className="underline" href="https://github.com/Moggach">
          Moggach
        </a>
      </p>
      <p>
        Service isn&apos;t listed?{' '}
        <a className="underline" href="https://tally.so/r/NplpjN">
          Submit here
        </a>
      </p>
    </footer>
  );
};

export default Footer;
