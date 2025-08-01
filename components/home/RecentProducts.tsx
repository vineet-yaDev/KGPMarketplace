'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockProducts } from '@/data/mockData'

export default function RecentProducts() {
  const recentProducts = mockProducts.slice(0, 4) // Show first 4 products

  return (
    <section className="px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Products</h2>
          <Button asChild variant="ghost" className="hover:bg-white/10">
            <Link href="/products">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <Card className="glass-card hover-lift overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate mb-2">{product.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Condition: {product.condition}/5</Badge>
                    <span className="text-xs text-muted-foreground">{product.hall}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">by {product.seller.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
