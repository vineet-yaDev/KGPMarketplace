'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image' // Add this import
import {
  Package,
  Smartphone,
  BookOpen,
  Shirt,
  Dumbbell,
  Armchair,
  ChefHat,
  PenTool,
  Bike,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'

const productCategoryIcons: Record<string, React.ReactNode> = {
  ELECTRONICS: <Smartphone size={48} />,
  BOOKS: <BookOpen size={48} />,
  CLOTHING: <Shirt size={48} />,
  SPORTS: <Dumbbell size={48} />,
  FURNITURE: <Armchair size={48} />,
  FOOD: <ChefHat size={48} />,
  STATIONERY: <PenTool size={48} />,
  VEHICLES: <Bike size={48} />,
  OTHER: <AlertCircle size={48} />,
}

export default function RecentProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?featured=true&limit=8')
        const data = await res.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <section className="px-4 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Link href="/products" className="text-sm text-primary underline">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No featured products available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
              aria-label={`View details for ${product.title}`}
            >
              <Card className="glass-card hover-lift shadow-lg transition-shadow overflow-hidden">
                {product.images.length > 0 ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover rounded-t-md"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-full h-48 bg-gray-100 rounded-t-md text-gray-400">
                    {productCategoryIcons[product.category?.toUpperCase() || 'OTHER'] || (
                      <Package size={48} />
                    )}
                  </div>
                )}
                <CardContent>
                  <h3 className="text-lg font-semibold line-clamp-2">{product.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-primary font-bold text-lg">
                      ₹{product.price?.toLocaleString() || 'N/A'}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between mt-3">
                    <Badge variant="secondary" className="text-xs">
                      Condition: {product.condition}/5
                    </Badge>
                    <span className="text-xs text-muted-foreground">{product.addressHall || '-'}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                    by {product.owner?.name || 'Unknown'}
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