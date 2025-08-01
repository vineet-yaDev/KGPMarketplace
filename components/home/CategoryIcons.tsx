'use client'

import Link from 'next/link'
import { 
  Smartphone, 
  BookOpen, 
  Shirt, 
  Dumbbell, 
  Armchair, 
  ChefHat, 
  PenTool, 
  Bike 
} from 'lucide-react'

const categories = [
  { id: 1, name: 'Electronics', icon: Smartphone, href: '/products?category=electronics' },
  { id: 2, name: 'Books', icon: BookOpen, href: '/products?category=books' },
  { id: 3, name: 'Clothing', icon: Shirt, href: '/products?category=clothing' },
  { id: 4, name: 'Sports', icon: Dumbbell, href: '/products?category=sports' },
  { id: 5, name: 'Furniture', icon: Armchair, href: '/products?category=furniture' },
  { id: 6, name: 'Kitchen', icon: ChefHat, href: '/products?category=kitchen' },
  { id: 7, name: 'Study', icon: PenTool, href: '/products?category=study' },
  { id: 8, name: 'Transport', icon: Bike, href: '/products?category=transport' },
]

export default function CategoryIcons() {
  return (
    <section className="px-4 pt-8">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-xl font-semibold mb-6">Browse Categories</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link
                key={category.id}
                href={category.href}
                className="group flex flex-col items-center space-y-3 p-4 rounded-xl glass-card hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-smooth">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-center text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
