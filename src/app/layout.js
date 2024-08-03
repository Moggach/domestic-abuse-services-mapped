import Navbar from "./components/NavBar"

export const metadata = {
  title: 'Domestic abuse services mapping',
  description: 'A tool for mapping domestic abuse services across the UK.',
  icons: {
    icon: '/favicon.ico',
  },
}

import localFont from '@next/font/local'

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

export default function RootLayout({ children }) {
  return (
    <html data-theme="light" lang="en" className={`${poppins.variable} font-sans`}>
      <head>
      </head>
      <body className="bg-base-200">
        <Navbar />
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
