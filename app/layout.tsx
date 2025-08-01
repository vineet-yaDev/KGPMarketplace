import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'KGP Marketplace - Buy, Sell & Exchange at IIT Kharagpur',
  description: 'Exclusive marketplace for IIT Kharagpur students to buy, sell, and exchange products and services within campus.',
  keywords: 'IIT Kharagpur, marketplace, buy, sell, exchange, students, campus',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'Inter, sans-serif' }} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
