'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Star, MapPin, Clock, X, Filter, Sliders } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Service, ServiceCategory, KGPHalls, ServicesResponse } from '@/lib/types'

const serviceCategories: (ServiceCategory | 'All')[] = [
  'All',
  'TUTORING',
  'REPAIR',
  'DELIVERY',
  'CLEANING',
  'PHOTOGRAPHY',
  'CODING',
  'DESIGN',
  'CONSULTING',
  'OTHER'
]

const halls: (KGPHalls | 'All')[] = [
  'All',
  'RK',
  'RP',
  'MS',
  'LLR',
  'MMM',
  'LBS',
  'AZAD',
  'PATEL',
  'NEHRU',
  'SNIG',
  'SNVH',
  'MT'
]

const priceRanges = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 - ₹2,500', min: 1000, max: 2500 },
  { label: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
  { label: 'Above ₹5,000', min: 5000, max: Infinity }
]

const experienceRanges = [
  { label: 'Any Experience', min: 0, max: Infinity },
  { label: 'Less than 1 year', min: 0, max: 1 },
  { label: '1-3 years', min: 1, max: 3 },
  { label: '3-5 years', min: 3, max: 5 },
  { label: '5+ years', min: 5, max: Infinity }
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All')
  const [selectedHall, setSelectedHall] = useState<KGPHalls | 'All'>('All')
  const [selectedPriceRange, setSelectedPriceRange] = useState(0)
  const [selectedExperienceRange, setSelectedExperienceRange] = useState(0)
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services')
      const data: ServicesResponse = await response.json()
      
      if (response.ok) {
        setServices(data.services || [])
      } else {
        console.error('Failed to fetch services:', data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter((service: Service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    const matchesHall = selectedHall === 'All' || service.addressHall === selectedHall
    
    // Price filter
    const priceRange = priceRanges[selectedPriceRange]
    const price = service.minPrice || 0
    const matchesPrice = price >= priceRange.min && price <= priceRange.max

    // Experience filter
    const expRange = experienceRanges[selectedExperienceRange]
    const experience = service.experienceYears || 0
    const matchesExperience = experience >= expRange.min && experience <= expRange.max
    
    return matchesSearch && matchesCategory && matchesHall && matchesPrice && matchesExperience
  })

  const sortedServices = [...filteredServices].sort((a: Service, b: Service) => {
    switch (sortBy) {
      case 'price-low':
        return (a.minPrice || 0) - (b.minPrice || 0)
      case 'price-high':
        return (b.minPrice || 0) - (a.minPrice || 0)
      case 'experience':
        return (b.experienceYears || 0) - (a.experienceYears || 0)
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const clearFilters = () => {
    setSelectedCategory('All')
    setSelectedHall('All')
    setSelectedPriceRange(0)
    setSelectedExperienceRange(0)
    setSearchQuery('')
    setSortBy('newest')
  }

  const FilterPanel = () => (
    <div className="glass-card p-6 sticky top-24 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass border-white/20"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Category</Label>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ServiceCategory | 'All')}>
          <SelectTrigger className="glass border-white/20">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="glass">
            {serviceCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'All' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hall Filter */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Hall</Label>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedHall(value as KGPHalls | 'All')}>
          <SelectTrigger className="glass border-white/20">
            <SelectValue placeholder="All Halls" />
          </SelectTrigger>
          <SelectContent className="glass">
            {halls.map(hall => (
              <SelectItem key={hall} value={hall}>
                {hall === 'All' ? 'All Halls' : hall}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Price Range</Label>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label key={index} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={selectedPriceRange === index}
                onChange={() => setSelectedPriceRange(index)}
                className="text-primary"
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Filter */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Experience</Label>
        <div className="space-y-2">
          {experienceRanges.map((range, index) => (
            <label key={index} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="experienceRange"
                checked={selectedExperienceRange === index}
                onChange={() => setSelectedExperienceRange(index)}
                className="text-primary"
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort Filter */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Sort By</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="glass border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Services</h1>
            <p className="text-muted-foreground text-lg">Find skilled services from talented students</p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between glass-card p-4 rounded-lg">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="glass border-white/20"
              >
                <Sliders className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="glass border-white/20 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Filters Collapsible */}
            {showFilters && (
              <div className="mt-4">
                <FilterPanel />
              </div>
            )}
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-1/5">
              <FilterPanel />
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:w-4/5">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''} found
                </p>
                <div className="hidden lg:block">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="glass border-white/20 w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="experience">Most Experienced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Services Grid */}
              {sortedServices.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No services found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
                  <Button onClick={clearFilters} className="mt-4">
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedServices.map((service: Service) => (
                    <Link key={service.id} href={`/services/${service.id}`} className="group">
                      <Card className="glass-card hover-lift h-full overflow-hidden">
                        {/* Service Image */}
                        <div className="aspect-video relative overflow-hidden">
                          {service.images && service.images.length > 0 ? (
                            <img
                              src={service.images[0]}
                              alt={service.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">No Image</span>
                            </div>
                          )}
                          
                          {/* Overlay Badges */}
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-white/90 text-gray-800">
                              {service.category}
                            </Badge>
                          </div>
                          
                          {service.experienceYears && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-primary/90">
                                <Clock className="w-3 h-3 mr-1" />
                                {service.experienceYears}+ yrs
                              </Badge>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2 flex-1">
                              {service.title}
                            </h3>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {service.description || 'No description available'}
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-primary font-bold text-lg">
                                {service.minPrice && service.maxPrice ? (
                                  <span>{formatCurrency(service.minPrice)} - {formatCurrency(service.maxPrice)}</span>
                                ) : service.minPrice ? (
                                  <span>From {formatCurrency(service.minPrice)}</span>
                                ) : (
                                  <span className="text-sm">Price on request</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>by {service.owner?.name || 'Unknown'}</span>
                              {service.addressHall && (
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {service.addressHall}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {service.portfolioUrl && (
                            <div className="mt-4">
                              <Badge variant="outline" className="w-full justify-center py-2">
                                <Star className="w-3 h-3 mr-1" />
                                Portfolio Available
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
