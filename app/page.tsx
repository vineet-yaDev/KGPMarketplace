'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import HeroCarousel from '@/components/home/HeroCarousel'
import CategoryIcons from '@/components/home/CategoryIcons'
import RecentProducts from '@/components/home/RecentProducts'
import RecentServices from '@/components/home/RecentServices'
import LiveDemands from '@/components/home/LiveDemands'
import QuickFilters from '@/components/home/QuickFilters'
import { useAuth } from '@/contexts/AuthContext'
import { useUserSync } from '@/hooks/useUserSync'

export default function HomePage() {
  const { status } = useAuth()
  const [demands, setDemands] = useState([])

  // Only sync user data if authenticated
  useUserSync()

  // Fetch real demands data (available to all users)
  useEffect(() => {
    async function fetchDemands() {
      try {
        const res = await fetch('/api/demands?limit=10')
        const json = await res.json()
        setDemands(json.demands || [])
      } catch (e) {
        console.error('Failed to fetch demands', e)
      }
    }
    fetchDemands()
  }, [])

  // Show loading only while checking authentication status
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

  // Show homepage for both authenticated and unauthenticated users
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
