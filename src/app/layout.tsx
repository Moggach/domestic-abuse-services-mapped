import localFont from '@next/font/local';
import type { ReactNode } from 'react';
import React from 'react';

import { SITE_DOMAIN } from './constants/links';
import { SearchProvider } from './contexts/SearchContext';

interface Metadata {
  metadataBase: URL;
  title: string;
  description: string;
  icons: {
    icon: string;
  };
  openGraph: {
    title: string;
    description: string;
    images: {
      url: string;
      width: number;
      height: number;
      alt: string;
    }[];
    type: string;
  };
}

export const metadata: Metadata = {
  // Makes og:image an absolute URL; link previews need the full address.
  metadataBase: new URL(`https://${SITE_DOMAIN}`),
  title: 'Domestic abuse services mapping',
  description: 'A tool for mapping domestic abuse services across the UK.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Domestic abuse services mapping',
    description: 'A tool for mapping domestic abuse services across the UK.',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Domestic abuse services mapping',
      },
    ],
    type: 'website',
  },
};

const poppins = localFont({
  src: [
    {
      path: '../../public/fonts/Poppins-Regular.ttf',
      weight: '400',
    },
    {
      path: '../../public/fonts/Poppins-Bold.ttf',
      weight: '700',
    },
  ],
  variable: '--font-poppins',
});

const opensans = localFont({
  src: [
    {
      path: '../../public/fonts/OpenSans-Regular.ttf',
      weight: '400',
    },
  ],
  variable: '--font-opensans',
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <head>
        <script
          async
          defer
          src="https://scripts.withcabin.com/hello.js"
        ></script>
      </head>
      <SearchProvider>
        <body
          className={`${poppins.variable} ${opensans.variable} font-body h-screen`}
        >
          {' '}
          <div id="root" className="font-body">
            {children}
          </div>
        </body>
      </SearchProvider>
    </html>
  );
}
