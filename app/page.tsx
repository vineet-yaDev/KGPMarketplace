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

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import HeroCarousel from '@/components/home/HeroCarousel'
import CategoryIcons from '@/components/home/CategoryIcons'
import RecentProducts from '@/components/home/RecentProducts'
import RecentServices from '@/components/home/RecentServices'
import LiveDemands from '@/components/home/LiveDemands'
import QuickFilters from '@/components/home/QuickFilters'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { status } = useAuth()
  const router = useRouter()
  const [demands, setDemands] = useState([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch real demands data
  useEffect(() => {
    async function fetchDemands() {
      try {
        const res = await fetch('/api/demands?limit=10') // or your demands endpoint
        const json = await res.json()
        setDemands(json.demands || [])
      } catch (e) {
        console.error('Failed to fetch demands', e)
      }
    }
    fetchDemands()
  }, [])

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

  if (status === 'unauthenticated') return null

  return (
    <MainLayout>
      <div>
        <HeroCarousel />
        <CategoryIcons />
        <RecentProducts />
        <RecentServices />
        <LiveDemands demands={demands} />
        <QuickFilters />
      </div>
    </MainLayout>
  )
}
