export const metadata = {
  title: 'Domestic abuse services mapping',
  description: 'A tool for mapping domestic abuse services across the UK.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
