'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'

interface RecentProductsProps {
  className?: string
}

export default function RecentProducts({ className = "" }: RecentProductsProps) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentProducts()
  }, [])

  const fetchRecentProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?limit=8&sort=newest')
      const data = await response.json()
      
      if (response.ok) {
        setRecentProducts(data.products || [])
      } else {
        console.error('Failed to fetch products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching recent products:', error)
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
        <div className="flex items-center justify-between mb-6 mx-2 mr-2">
          <h2 className="text-2xl font-bold">Recent Products</h2>
          <Link href="/products" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </section>
    )
  }

  return (
    <section className={`mb-6 px-4 py-2 max-w-7xl mx-auto ${className}`}>
      {/* Header with View All text link */}
      <div className="flex items-center justify-between my-8 mx-3">
        <h2 className="text-2xl font-bold">Recent Products</h2>
        <Link href="/products" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
          View All
        </Link>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recentProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="group">
            <Card className="glass-card hover-lift overflow-hidden h-full">
              <div className="aspect-video relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-smooth"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
                
                {/* Discount badge - top left */}
                {product.originalPrice && product.price && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 shadow-lg">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
                
                {/* Green tick for invoice URL - bottom right */}
                {product.invoiceImageUrl && (
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                
                {/* Price and Condition */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline space-x-2">
                    {product.price && (
                      <span className="font-bold text-lg text-primary">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.condition && (
                    <Badge variant="secondary" className="text-xs">
                      {product.condition}/5
                    </Badge>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {product.description || 'No description available'}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Big Gradient View All Button - Separate div in center */}
      <div className="flex justify-center mt-8">
        <Link href="/products">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="mr-2">View All Products</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* No products message */}
      {recentProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products available</p>
        </div>
      )}
    </section>
  )
}
