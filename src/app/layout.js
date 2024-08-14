import Navbar from "./components/NavBar";
import localFont from '@next/font/local';

export const metadata = {
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
      weight: '400'
    },
    {
      path: '../../public/fonts/Poppins-Bold.ttf',
      weight: '700'
    }
  ],
  variable: '--font-poppins'
});

const opensans = localFont({
  src: [
    {
      path: '../../public/fonts/OpenSans-Regular.ttf',
      weight: '400'
    },
  ],
  variable: '--font-opensans'
});

export default function RootLayout({ children }) {
  return (
    <html data-theme="light" lang="en" className={`${poppins.variable} ${opensans.variable} bg-base-200`}>
      <head>
        {/* Open Graph meta tags */}
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content={metadata.openGraph.images[0].width} />
        <meta property="og:image:height" content={metadata.openGraph.images[0].height} />
        <meta property="og:image:alt" content={metadata.openGraph.images[0].alt} />
        <meta property="og:type" content={metadata.openGraph.type} />
      </head>
      <body className="font-body h-screen">
        <Navbar />
        <div id="root" className="font-body">
          {children}
        </div>
      </body>
    </html>
  );
}
