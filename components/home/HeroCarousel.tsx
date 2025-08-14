'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const carouselSlides = [
  {
    id: 1,
    href: '/products',
    mobileSrc: '/Mobile_banners/3.png',
    desktopSrc: '/Banners/3.png',
    // optional: alt text per slide
    alt: 'Slide 1',
  },
  {
    id: 2,
    href: '/services',
    mobileSrc: '/Mobile_banners/2.png',
    desktopSrc: '/Banners/2.png',
    alt: 'Slide 2',
  },
  {
    id: 3,
    href: '/demand',
    mobileSrc: '/Mobile_banners/1.png',
    desktopSrc: '/Banners/1.png',
    alt: 'Slide 3',
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
        {/* Fixed height container; images will fill and cover */}
        <div className="relative glass-card overflow-hidden rounded-2xl h-64 md:h-80">
          {carouselSlides.map((slide, index) => (
            <Link
              key={slide.id}
              href={slide.href}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide
                  ? 'translate-x-0'
                  : index < currentSlide
                  ? '-translate-x-full'
                  : 'translate-x-full'
              }`}
            >
              {/* Wrapper for images to manage overlay/positioning if needed */}
              <div className="relative h-full w-full">
                {/* Mobile image (shown < md) */}
                <div className="absolute inset-0 block md:hidden">
                  <Image
                    src={slide.mobileSrc}
                    alt={slide.alt}
                    fill
                    priority={index === currentSlide}
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>

                {/* Desktop image (shown >= md) */}
                <div className="absolute inset-0 hidden md:block">
                  <Image
                    src={slide.desktopSrc}
                    alt={slide.alt}
                    fill
                    priority={index === currentSlide}
                    sizes="(min-width: 768px) 100vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </Link>
          ))}

          {/* Controls */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 glass z-10"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 glass z-10"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white scale-110' : 'bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Optional dark overlay for button contrast; remove if not needed */}
          <div className="pointer-events-none absolute inset-0 bg-black/0" />
        </div>
      </div>
    </section>
  )
}
