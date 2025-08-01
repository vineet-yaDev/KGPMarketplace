'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const carouselSlides = [
  {
    id: 1,
    title: 'Welcome to KGP Marketplace',
    subtitle: 'Your campus community for buying, selling, and exchanging',
    gradient: 'from-blue-600 to-purple-600',
    href: '/products',
  },
  {
    id: 2,
    title: 'Find Expert Services',
    subtitle: 'Connect with talented students for tutoring, repairs, and more',
    gradient: 'from-green-600 to-teal-600',
    href: '/services',
  },
  {
    id: 3,
    title: 'Post Your Requirements',
    subtitle: 'Looking for something specific? Let the community help you find it',
    gradient: 'from-orange-600 to-red-600',
    href: '/demand',
  },
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
  }

  return (
    <section className="px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <div className="relative glass-card overflow-hidden rounded-2xl h-64 md:h-80">
          {carouselSlides.map((slide, index) => (
            <Link
              key={slide.id}
              href={slide.href}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide ? 'translate-x-0' : 
                index < currentSlide ? '-translate-x-full' : 'translate-x-full'
              }`}
            >
              <div className={`relative h-full bg-gradient-to-br ${slide.gradient}`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative h-full flex flex-col justify-center items-center text-center text-white p-8">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-lg md:text-xl opacity-90 max-w-2xl">{slide.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 glass"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 glass"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white scale-110' : 'bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
