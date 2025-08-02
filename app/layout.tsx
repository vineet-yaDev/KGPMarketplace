import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { Analytics } from '@vercel/analytics/react'
// Initialize Inter font using Next.js font optimization
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}