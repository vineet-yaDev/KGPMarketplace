'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockDemands } from '@/data/mockData'

export default function LiveDemands() {
  const [currentDemandIndex, setCurrentDemandIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDemandIndex((prev) => (prev + 1) % mockDemands.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Live Demands</h2>
          <Link href="/demand">
            <ArrowRight className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
        
        <Link href="/demand" className="block group">
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Recent Requests</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  {mockDemands.length} active
                </Badge>
              </div>
              
              <div className="space-y-3 h-24 overflow-hidden">
                {mockDemands.map((demand, index) => (
                  <div
                    key={demand.id}
                    className={`p-3 rounded-lg bg-muted/30 border transition-all duration-500 ${
                      index === currentDemandIndex 
                        ? 'opacity-100 transform translate-y-0 border-primary/30' 
                        : 'opacity-40 transform translate-y-2'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{demand.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {demand.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {demand.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center justify-center space-x-1">
                {mockDemands.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentDemandIndex ? 'bg-primary scale-125' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  )
}
