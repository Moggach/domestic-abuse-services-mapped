import Navbar from "./components/NavBar"
import localFont from '@next/font/local'


export const metadata = {
  title: 'Domestic abuse services mapping',
  description: 'A tool for mapping domestic abuse services across the UK.',
  icons: {
    icon: '/favicon.ico',
  },
}


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
})

const opensans = localFont({
  src: [
    {
      path: '../../public/fonts/OpenSans-Regular.ttf',
      weight: '400'
    },
    
  ],
  variable: '--font-opensans'
})

export default function RootLayout({ children }) {
  return (
    <html data-theme="light" lang="en" className={`${poppins.variable} ${opensans.variable}`}>
      <head>
      </head>
      <body className="bg-base-200 font-body h-screen">
        <Navbar />
        <div id="root" className="font-body">
          {children}
        </div>
      </body>
    </html>
  )
}