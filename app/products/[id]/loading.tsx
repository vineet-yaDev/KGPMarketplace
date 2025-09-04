'use client'

import MainLayout from '@/components/MainLayout'

export default function Loading() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10">
          {/* Back button skeleton */}
          <div className="mb-4">
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Image skeleton */}
            <div className="lg:col-span-7">
              <div className="glass-card rounded-lg overflow-hidden">
                <div className="aspect-video w-full bg-muted animate-pulse" />
                <div className="p-3 flex gap-2 overflow-x-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-20 h-14 bg-muted animate-pulse rounded flex-shrink-0" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Content skeleton */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-lg p-4 sm:p-6 space-y-4">
                <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex gap-3 pt-4">
                  <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Details skeleton */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-lg p-4 sm:p-6 space-y-3">
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div className="glass-card rounded-lg p-4 sm:p-6 space-y-3">
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Similar products skeleton */}
          <div className="mt-8">
            <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-lg overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
