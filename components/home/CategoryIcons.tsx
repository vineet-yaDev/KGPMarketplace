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
    // Remove side padding from the section so the overlay can be flush to screen edge
    <section className="pt-6 relative">
      {/* Content wrapper with horizontal padding */}
      <div className="px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="relative overflow-x-auto">
            <div className="flex space-x-3 pr-8 md:grid md:grid-cols-8 md:gap-4">
              {/* Product Categories */}
              {selectedProductCategories.map(({ category, icon: IconComponent }) => (
                <Link
                  key={category}
                  href={`/products?category=${category}`}
                  className="group flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 p-2 sm:p-4 rounded-lg border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200 min-w-[70px] sm:min-w-[100px] min-h-[70px] sm:min-h-[100px] shrink-0 md:min-w-0"
                >
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/20 group-hover:dark:bg-primary/30 transition-colors flex-shrink-0">
                    <IconComponent size={16} className="text-primary" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-center text-muted-foreground group-hover:text-primary transition-colors leading-tight">
                    {formatEnumName(category)}
                  </span>
                </Link>
              ))}

              {/* Service Categories */}
              {selectedServiceCategories.map(({ category, icon: IconComponent }) => (
                <Link
                  key={category}
                  href={`/services?category=${category}`}
                  className="group flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 p-2 sm:p-4 rounded-lg border border-border hover:border-teal-400/40 dark:hover:border-teal-300/60 hover:shadow-sm transition-all duration-200 min-w-[70px] sm:min-w-[100px] min-h-[70px] sm:min-h-[100px] shrink-0 md:min-w-0"
                >
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center group-hover:bg-teal-200 group-hover:dark:bg-teal-800 transition-colors flex-shrink-0">
                    <IconComponent size={16} className="text-teal-600 dark:text-teal-200 group-hover:text-teal-800 group-hover:dark:text-teal-100" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-center text-teal-700 dark:text-teal-200 group-hover:text-teal-800 group-hover:dark:text-teal-100 transition-colors leading-tight">
                    {formatEnumName(category)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Fade overlay fixed to the screen's right edge */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white dark:from-black to-transparent md:hidden rounded-l-full"></div>
    </section>
  )
}