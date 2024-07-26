export const metadata = {
  title: 'Domestic abuse services mapping',
  description: 'A tool for mapping domestic abuse services across the UK.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html data-theme="light" lang="en">
      <head>
      </head>
      <body className="bg-base-200">
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
