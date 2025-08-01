'use client'

import Link from 'next/link'
import { MapPin, Clock, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: number
  title: string
  price: number
  originalPrice?: number
  condition: number
  hall: string
  image: string
  productType: string
  seller: { name: string }
  createdAt: Date
}

interface ProductCardProps {
  product: Product
  compact?: boolean
}

const getConditionStars = (condition: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-3 h-3 ${
        i < condition ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
      }`}
    />
  ))
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

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const isDiscounted = product.originalPrice && product.originalPrice > product.price

  return (
    <Link 
      href={`/product/${product.id}`}
      className={`block glass-card hover-lift transition-all duration-300 shadow-sm hover:shadow-md ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      {/* Image */}
      <div className={`relative ${compact ? 'h-40' : 'h-56'} bg-muted rounded-lg overflow-hidden mb-3`}>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        
        {/* Price Badge */}
        <div className="absolute top-2 left-2">
          {product.price === 0 ? (
            <Badge className="bg-success text-white">Free</Badge>
          ) : (
            <Badge className="glass text-white bg-black/50">
              ₹{product.price.toLocaleString()}
            </Badge>
          )}
        </div>

        {/* Product Type Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            {product.productType}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className={`font-semibold text-foreground line-clamp-2 ${
          compact ? 'text-sm' : 'text-base'
        }`}>
          {product.title}
        </h3>

        {/* Original Price & Discount */}
        {isDiscounted && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.originalPrice?.toLocaleString()}
            </span>
            <Badge variant="destructive" className="text-xs">
              {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
            </Badge>
          </div>
        )}

        {/* Condition Stars */}
        {product.productType === 'USED' && (
          <div className="flex items-center gap-1">
            {getConditionStars(product.condition)}
            <span className="text-xs text-muted-foreground ml-1">
              Condition
            </span>
          </div>
        )}

        {/* Location & Time */}
        <div className={`flex items-center justify-between text-muted-foreground ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{product.hall}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(product.createdAt)}</span>
          </div>
        </div>

        {/* Seller */}
        <div className="text-xs text-muted-foreground">
          by {product.seller.name}
        </div>
      </div>
    </Link>
  )
}