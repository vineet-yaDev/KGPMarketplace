'use client'

import Link from 'next/link'
import { MapPin, Clock, Star, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Service {
  id: number
  title: string
  minPrice: number
  maxPrice?: number
  provider: { name: string }
  hall: string
  rating?: number
  experienceYears?: number
  description: string
  portfolioUrl?: string
  createdAt: Date
  serviceCategory: { name: string }
}

interface ServiceCardProps {
  service: Service
  compact?: boolean
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${diffInWeeks}w ago`
}

export default function ServiceCard({ service, compact = false }: ServiceCardProps) {
  return (
    <Link 
      href={`/service/${service.id}`}
      className={`block glass-card hover-lift transition-all duration-300 ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className={`font-semibold text-foreground line-clamp-2 flex-1 ${
            compact ? 'text-sm' : 'text-base'
          }`}>
            {service.title}
          </h3>
          
          {/* Portfolio Link */}
          {service.portfolioUrl && (
            <Badge variant="secondary" className="text-xs ml-2">
              <ExternalLink className="w-3 h-3 mr-1" />
              Portfolio
            </Badge>
          )}
        </div>

        {/* Price Range */}
        <div className="flex items-center space-x-2">
          {(!service.minPrice || service.minPrice===0) && (!service.maxPrice || service.maxPrice===0)
          ? (
          <Badge className="glass text-white bg-gradient-secondary">
            FREE
          </Badge>
          ):(
          <Badge className="glass text-white bg-gradient-secondary">
            {service.maxPrice 
              ? `₹${service.minPrice.toLocaleString()} - ₹${service.maxPrice.toLocaleString()}`
              : `From ₹${service.minPrice.toLocaleString()}`
            }
          </Badge>
          )
          }
        </div>

        {/* Category & Experience */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {service.serviceCategory.name}
          </Badge>
          {service.experienceYears && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {service.experienceYears}y exp
              </span>
            </div>
          )}
          {service.rating && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                ⭐ {service.rating}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className={`text-muted-foreground line-clamp-2 ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          {service.description}
        </p>

        {/* Location & Time */}
        <div className={`flex items-center justify-between text-muted-foreground ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{service.hall}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(service.createdAt)}</span>
          </div>
        </div>

        {/* Provider */}
        <div className="text-xs text-muted-foreground">
          by {service.provider.name}
        </div>
      </div>
    </Link>
  )
}