'use client';

import '../styles/globals.css';
import QuickExit from '../components/QuickExit';

const ClearBrowser: React.FC = () => {
  return (
    <>
      <main className="p-4">
        <h1 className="font-headings text-3xl mb-4">How to clear this site from your browser history</h1>
      </main>
      <QuickExit />
    </>
  );
};

export default ClearBrowser;
