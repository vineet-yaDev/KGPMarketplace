'use client'

import Link from 'next/link'
import { Filter, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
const quickFilters = [
  { label: 'Free', price: 0, color: 'bg-green-500'},
  { label: '<₹100', price: 100, color: 'bg-blue-500'},
  { label: '<₹500', price: 500, color: 'bg-purple-500'},
  { label: '<₹1000', price: 1000, color: 'bg-orange-500'},
]

export default function QuickFilters() {
  return (
    <section className="px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingDown className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Shop by Budget</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickFilters.map((filter) => (
            <Link
              key={filter.label}
              href={`/products?maxPrice=${filter.price}`}
              className="group"
            >
              <Card className="glass-card hover-lift">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className={`w-16 h-16 rounded-2xl ${filter.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth shadow-lg`}>
                    <Filter className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{filter.label}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
