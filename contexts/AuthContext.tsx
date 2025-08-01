'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  session: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  isAuthenticated: boolean
  user: Session['user'] | null
  userEmail: string | null
  userName: string | null
  userImage: string | null
  signOutUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Monitor for session errors and handle them
  useEffect(() => {
    if (status === 'unauthenticated' && window.location.pathname !== '/login') {
      const wasAuthenticated = localStorage.getItem('was-authenticated')
      if (wasAuthenticated) {
        console.log('Session expired, redirecting to login')
        localStorage.removeItem('was-authenticated')
        signOut({ callbackUrl: '/login' })
      }
    } else if (status === 'authenticated') {
      localStorage.setItem('was-authenticated', 'true')
    }
  }, [status, router])

  const signOutUser = () => {
    localStorage.removeItem('was-authenticated')
    signOut({ callbackUrl: '/login' })
  }

  const value = {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    user: session?.user || null,
    userEmail: session?.user?.email || null,
    userName: session?.user?.name || null,
    userImage: session?.user?.image || null,
    signOutUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
