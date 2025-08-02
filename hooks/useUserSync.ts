// hooks/useUserSync.ts
'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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

  return { isAuthenticated, user }
}
