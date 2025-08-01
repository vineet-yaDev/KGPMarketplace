// app/login/page.tsx
'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check for error in URL params
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'OAuthAccountNotLinked':
          setError('Account linking issue. Please try signing in again.')
          break
        case 'AccessDenied':
          setError('Access denied. Only IIT Kharagpur email addresses are allowed.')
          break
        default:
          setError('An error occurred during sign in. Please try again.')
      }
    }

    // Check if user is already logged in
    getSession().then((session) => {
      if (session) {
        router.push('/')
      }
    })
  }, [router, searchParams])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false 
      })
      
      if (result?.error) {
        setError('Sign in failed. Please try again.')
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            KGP Marketplace
          </span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground mb-8">
          Sign in with your IIT Kharagpur email to continue
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full btn-gradient-primary text-lg py-3"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          ) : null}
          Continue with Google
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          Supports @iitkgp.ac.in and @kgpian.iitkgp.ac.in email addresses
        </p>
      </div>
    </div>
  )
}
