'use client'

export function useUserSync() {
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      // Sync user to our database in the background
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('User synced to database')
        }
      })
      .catch(err => console.log('User sync failed (non-critical):', err))
    }
  }, [isAuthenticated, user])
}


import MainLayout from '@/components/MainLayout'
import CategoryIcons from '@/components/home/CategoryIcons'
import HeroCarousel from '@/components/home/HeroCarousel'
import RecentProducts from '@/components/home/RecentProducts'
import RecentServices from '@/components/home/RecentServices'
import LiveDemands from '@/components/home/LiveDemands'
import QuickFilters from '@/components/home/QuickFilters'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { status } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Don't render content if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-0">
        <HeroCarousel />
        <CategoryIcons />
        <RecentProducts />
        <RecentServices />
        <LiveDemands />
        <QuickFilters />
      </div>
    </MainLayout>
  )
}
