'use client'

import Link from 'next/link'
import { 
  Smartphone,
  BookOpen,
  Armchair,
  Home,
  Bike,
  Brush,
  Code,
  Handshake
} from 'lucide-react'
import { formatEnumName } from '@/lib/constants'
import type { ProductCategory, ServiceCategory } from '@/lib/types'

const selectedProductCategories: { category: ProductCategory; icon: typeof Smartphone }[] = [
  { category: 'CYCLE', icon: Bike },
  { category: 'ELECTRONICS', icon: Smartphone },
  { category: 'FURNITURE', icon: Armchair },
  { category: 'HOUSEHOLD', icon: Home },
  { category: 'BOOKS', icon: BookOpen }
]

const selectedServiceCategories: { category: ServiceCategory; icon: typeof Brush }[] = [
  { category: 'DESIGN', icon: Brush },
  { category: 'CODING', icon: Code },
  { category: 'FREELANCING', icon: Handshake }
]

export default function CategoryIcons() {
  return (
    <section className="px-4 pt-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-8 gap-4 w-full">
          {/* Product Categories */}
          {selectedProductCategories.map(({ category, icon: IconComponent }) => (
            <Link
              key={category}
              href={`/products?category=${category}`}
              className="group flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200 min-h-[100px]"
            >
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/20 group-hover:dark:bg-primary/30 transition-colors flex-shrink-0">
                <IconComponent size={20} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-primary transition-colors leading-tight">
                {formatEnumName(category)}
              </span>
            </Link>
          ))}

          {/* Service Categories */}
          {selectedServiceCategories.map(({ category, icon: IconComponent }) => (
            <Link
              key={category}
              href={`/services?category=${category}`}
              className="group flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border border-border hover:border-blue-400/40 dark:hover:border-blue-300/60 hover:shadow-sm transition-all duration-200 min-h-[100px]"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 group-hover:dark:bg-blue-800 transition-colors flex-shrink-0">
                <IconComponent size={20} className="text-blue-600 dark:text-blue-200 group-hover:text-blue-800 group-hover:dark:text-blue-100" />
              </div>
              <span className="text-xs font-medium text-center text-blue-700 dark:text-blue-200 group-hover:text-blue-800 group-hover:dark:text-blue-100 transition-colors leading-tight">
                {formatEnumName(category)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
