'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image' // Add this import
import {
  Briefcase,
  BookOpen,
  Camera,
  Code,
  Brush,
  Truck,
  PenTool,
  User,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Service } from '@/lib/types'

const serviceCategoryIcons: Record<string, React.ReactNode> = {
  TUTORING: <BookOpen size={48} />,
  REPAIR: <Briefcase size={48} />,
  DELIVERY: <Truck size={48} />,
  CLEANING: <Brush size={48} />,
  PHOTOGRAPHY: <Camera size={48} />,
  CODING: <Code size={48} />,
  DESIGN: <PenTool size={48} />,
  CONSULTING: <User size={48} />,
  OTHER: <AlertCircle size={48} />,
}

export default function RecentServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services?featured=true&limit=8')
        const data = await res.json()
        setServices(data.services || [])
      } catch (error) {
        console.error('Failed to fetch services:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  return (
    <section className="px-4 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Services</h2>
        <Link href="/services" className="text-sm text-primary underline">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No featured services available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="group"
              aria-label={`View details for service ${service.title}`}
            >
              <Card className="glass-card hover-lift shadow-lg transition-shadow h-full flex flex-col">
                {service.images.length > 0 ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={service.images[0]}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover rounded-t-md"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-full h-48 bg-gray-100 rounded-t-md text-gray-400">
                    {serviceCategoryIcons[service.category?.toUpperCase() || 'OTHER'] || <Briefcase size={48} />}
                  </div>
                )}

                <CardContent className="flex flex-col flex-1">
                  <h3 className="text-lg font-semibold line-clamp-2">{service.title}</h3>
                  <div className="text-primary font-bold mt-1">
                    {service.minPrice && service.maxPrice
                      ? `₹${service.minPrice.toLocaleString()} - ₹${service.maxPrice.toLocaleString()}`
                      : service.minPrice
                      ? `From ₹${service.minPrice.toLocaleString()}`
                      : 'Price on request'}
                  </div>
                  <Badge className="mt-2 text-xs">
                    {service.experienceYears ? `${service.experienceYears}+ yrs experience` : 'Experience N/A'}
                  </Badge>
                  <p className="mt-auto text-xs text-muted-foreground line-clamp-1">
                    by {service.owner?.name || 'Unknown'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}