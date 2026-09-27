import React from 'react';

import { SUBMIT_SERVICE_URL } from '../constants/links';

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
        <a className="underline" href={SUBMIT_SERVICE_URL}>
          Submit here
        </a>
      </p>
    </footer>
  );
};

export default Footer;
