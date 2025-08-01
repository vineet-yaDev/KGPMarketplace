import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function validateSession() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return { 
        valid: false, 
        error: "No valid session", 
        session: null 
      }
    }
    
    return { 
      valid: true, 
      error: null, 
      session 
    }
  } catch (err) {
    console.error('Session validation error:', err)
    return { 
      valid: false, 
      error: "Session validation error", 
      session: null 
    }
  }
}

export async function requireAuth() {
  const { valid, error, session } = await validateSession()
  
  if (!valid || !session) {
    throw new Error(error || 'Authentication required')
  }
  
  return session
}
