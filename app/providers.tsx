'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from 'next-themes'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
