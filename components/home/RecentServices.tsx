'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Service } from '@/lib/types'
import { SERVICE_CATEGORY_TEXT_MAP, formatEnumName } from '@/lib/constants'

interface RecentServicesProps {
  className?: string
}

export default function RecentServices({ className = "" }: RecentServicesProps) {
  const [recentServices, setRecentServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentServices()
  }, [])

  const fetchRecentServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services?limit=8&sort=newest')
      const data = await response.json()
      
      if (response.ok) {
        setRecentServices(data.services || [])
      } else {
        console.error('Failed to fetch services:', data.error)
      }
    } catch (error) {
      console.error('Error fetching recent services:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <section className={`mb-12 px-4 py-8 max-w-7xl mx-auto ${className}`}>
        <div className="flex items-center justify-between mb-6 mx-2 ">
          <h2 className="text-2xl font-bold">Recent Services</h2>
          <Link href="/services" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </section>
    )
  }

  return (
    <section className={`mb-2 px-4 py-8 max-w-7xl mx-auto ${className}`}>
      {/* Header with View All text link */}
      <div className="flex items-center justify-between mb-2 mx-3">
        <h2 className="text-2xl font-bold">Recent Services</h2>
        <Link href="/services" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
          View All
        </Link>
      </div>
      
      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recentServices.map((service) => (
          <Link key={service.id} href={`/services/${service.id}`} className="group">
            <Card className="glass-card hover-lift overflow-hidden h-full">
              <div className="aspect-video relative overflow-hidden">
                {service.images && service.images.length > 0 ? (
                  <Image
                    src={service.images[0]}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-smooth"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
                
                {/* Category badge - top left */}
                <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 shadow-lg">
                  {SERVICE_CATEGORY_TEXT_MAP[service.category] || formatEnumName(service.category || 'OTHER')}
                </Badge>
                
                {/* Green tick for portfolio URL - bottom right */}
                {service.portfolioUrl && (
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                {/* Price Range */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-bold text-lg text-primary">
                      {service.minPrice && service.maxPrice ? (
                        `${formatCurrency(service.minPrice)} - ${formatCurrency(service.maxPrice)}`
                      ) : service.minPrice ? (
                        `From ${formatCurrency(service.minPrice)}`
                      ) : (
                        'Quote'
                      )}
                    </span>
                  </div>
                  {service.experienceYears !== undefined && service.experienceYears !== null && (
                    <Badge variant="secondary" className="text-xs">
                      {service.experienceYears}+ yrs
                    </Badge>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {service.description || 'No description available'}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Big Gradient View All Button - Separate div in center */}
      <div className="flex justify-center mt-8">
        <Link href="/services">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="mr-2">View All Services</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* No services message */}
      {recentServices.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No services available</p>
        </div>
      )}
    </section>
  )
}
