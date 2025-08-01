'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Use your actual enums from the schema
const productCategories = [
  'All Categories',
  'ELECTRONICS',
  'BOOKS', 
  'CLOTHING',
  'FURNITURE',
  'SPORTS',
  'VEHICLES',
  'FOOD',
  'STATIONERY',
  'OTHER'
]

const halls = [
  'All Halls',
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

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedHall, setSelectedHall] = useState('All Halls')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.products || [])
      } else {
        console.error('Failed to fetch products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory
    const matchesHall = selectedHall === 'All Halls' || product.addressHall === selectedHall
    
    return matchesSearch && matchesCategory && matchesHall
  })

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0)
      case 'price-high':
        return (b.price || 0) - (a.price || 0)
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      default:
        return 0
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
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
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">Find amazing products from your fellow students</p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass border-white/20"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="glass border-white/20"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {/* View Mode */}
              <div className="flex rounded-lg glass border border-white/20 p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {productCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedHall} onValueChange={setSelectedHall}>
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue placeholder="Hall" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {halls.map(hall => (
                      <SelectItem key={hall} value={hall}>{hall}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCategory('All Categories')
                    setSelectedHall('All Halls')
                    setSearchQuery('')
                    setSortBy('newest')
                  }}
                  className="glass border-white/20"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Products Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product: any) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  <Card className="glass-card hover-lift overflow-hidden h-full">
                    <div className="aspect-video relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                      {product.originalPrice && product.price && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate mb-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description || 'No description available'}
                      </p>
                      <div className="flex items-center space-x-2 mb-2">
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
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Condition: {product.condition}/5</Badge>
                        {product.addressHall && (
                          <span className="text-xs text-muted-foreground">{product.addressHall}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {product.owner?.name || 'Unknown'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product: any) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  <Card className="glass-card hover-lift">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-32 h-24 relative overflow-hidden rounded-lg flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{product.title}</h3>
                            {product.originalPrice && product.price && (
                              <Badge className="bg-red-500 text-white">
                                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {product.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {product.price && (
                                <span className="font-bold text-xl text-primary">
                                  {formatCurrency(product.price)}
                                </span>
                              )}
                              {product.originalPrice && (
                                <span className="text-muted-foreground line-through">
                                  {formatCurrency(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge variant="secondary">Condition: {product.condition}/5</Badge>
                              {product.addressHall && (
                                <span className="text-sm text-muted-foreground">{product.addressHall}</span>
                              )}
                              <span className="text-sm text-muted-foreground">
                                by {product.owner?.name || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* No Results */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
