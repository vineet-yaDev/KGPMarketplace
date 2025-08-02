'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Grid, List, X, Filter } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { FilterState, Product, ProductCategory, KGPHalls } from '@/lib/types'
import { 
  PRODUCT_CATEGORIES,
  HALLS,
  PRODUCT_TYPES,
  PRODUCT_STATUSES,
  SEASONALITIES,
  CONDITION_OPTIONS,
  PRODUCT_TYPE_TEXT_MAP,
  SEASONALITY_TEXT_MAP
} from '@/lib/constants'

// Helper function to format enum names
const formatEnumName = (value: string) => {
  return value.charAt(0) + value.slice(1).toLowerCase().replace('_', ' ')
}

// Type for FilterDropdown props
interface FilterDropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly (string | { value: string | number; label: string })[];
  placeholder: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedHall, setSelectedHall] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedSeasonality, setSelectedSeasonality] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [maxPrice, setMaxPrice] = useState([10000])
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const searchParams = useSearchParams()  // This is the suspenseful part
  const router = useRouter()

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category')
    const hall = searchParams.get('hall')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const seasonality = searchParams.get('seasonality')
    const condition = searchParams.get('condition')
    const price = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')

    if (category && PRODUCT_CATEGORIES.includes(category.toUpperCase() as ProductCategory)) {
      setSelectedCategory(category.toUpperCase())
    }
    if (hall && HALLS.includes(hall.toUpperCase() as KGPHalls)) {
      setSelectedHall(hall.toUpperCase())
    }
    if (type && PRODUCT_TYPES.some(t => t.value === type.toUpperCase())) {
      setSelectedType(type.toUpperCase())
    }
    if (status && PRODUCT_STATUSES.some(s => s.value === status.toUpperCase())) {
      setSelectedStatus(status.toUpperCase())
    }
    if (seasonality && SEASONALITIES.some(s => s.value === seasonality.toUpperCase())) {
      setSelectedSeasonality(seasonality.toUpperCase())
    }
    if (condition && ['1', '2', '3', '4', '5'].includes(condition)) {
      setSelectedCondition(condition)
    }
    if (price && !isNaN(Number(price))) {
      setMaxPrice([Number(price)])
    }
    if (search) {
      setSearchQuery(search)
    }
    if (sort) {
      setSortBy(sort)
    }
  }, [searchParams])

  // Update URL when filters change
  const updateURL = (filters: FilterState) => {
    const params = new URLSearchParams()
    
    if (filters.category) params.set('category', filters.category.toLowerCase())
    if (filters.hall) params.set('hall', filters.hall.toLowerCase())
    if (filters.type) params.set('type', filters.type.toLowerCase())
    if (filters.status) params.set('status', filters.status.toLowerCase())
    if (filters.seasonality) params.set('seasonality', filters.seasonality.toLowerCase())
    if (filters.condition) params.set('condition', filters.condition)
    if (filters.maxPrice && filters.maxPrice !== 10000) params.set('maxPrice', filters.maxPrice.toString())
    if (filters.search) params.set('search', filters.search)
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort)

    const queryString = params.toString()
    const newURL = queryString ? `/products?${queryString}` : '/products'
    
    router.push(newURL, { scroll: false })
  }

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

  const handleFilterChange = (filterType: string, value: string | number) => {
    const filters = {
      category: selectedCategory,
      hall: selectedHall,
      type: selectedType,
      status: selectedStatus,
      seasonality: selectedSeasonality,
      condition: selectedCondition,
      maxPrice: maxPrice[0],
      search: searchQuery,
      sort: sortBy
    }

    const filterValue = value === "all" ? "" : value as string

    switch (filterType) {
      case 'category':
        setSelectedCategory(filterValue)
        filters.category = filterValue
        break
      case 'hall':
        setSelectedHall(filterValue)
        filters.hall = filterValue
        break
      case 'type':
        setSelectedType(filterValue)
        filters.type = filterValue
        break
      case 'status':
        setSelectedStatus(filterValue)
        filters.status = filterValue
        break
      case 'seasonality':
        setSelectedSeasonality(filterValue)
        filters.seasonality = filterValue
        break
      case 'condition':
        setSelectedCondition(filterValue)
        filters.condition = filterValue
        break
      case 'maxPrice':
        setMaxPrice([value as number])
        filters.maxPrice = value as number
        break
      case 'search':
        setSearchQuery(value as string)
        filters.search = value as string
        break
      case 'sort':
        setSortBy(value as string)
        filters.sort = value as string
        break
    }

    updateURL(filters)
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedHall('')
    setSelectedType('')
    setSelectedStatus('')
    setSelectedSeasonality('')
    setSelectedCondition('')
    setMaxPrice([10000])
    setSearchQuery('')
    setSortBy('newest')
    router.push('/products')
  }

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesHall = !selectedHall || product.addressHall === selectedHall
    const matchesType = !selectedType || product.productType === selectedType
    const matchesStatus = !selectedStatus || product.status === selectedStatus
    const matchesSeasonality = !selectedSeasonality || product.seasonality === selectedSeasonality
    const matchesCondition = !selectedCondition || product.condition === parseInt(selectedCondition)
    const matchesPrice = !product.price || product.price <= maxPrice[0]
    
    return matchesSearch && matchesCategory && matchesHall && matchesType && 
           matchesStatus && matchesSeasonality && matchesCondition && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0)
      case 'price-high':
        return (b.price || 0) - (a.price || 0)
      case 'condition-high':
        return (b.condition || 0) - (a.condition || 0)
      case 'condition-low':
        return (a.condition || 0) - (b.condition || 0)
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

  const hasActiveFilters = selectedCategory || selectedHall || selectedType || 
                          selectedStatus || selectedSeasonality || selectedCondition || 
                          maxPrice[0] < 10000 || searchQuery

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

  const FilterDropdown = ({ label, value, onValueChange, options, placeholder }: FilterDropdownProps) => (
    <div className="mb-4">
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <Select value={value || "all"} onValueChange={onValueChange}>
        <SelectTrigger className="glass border-white/20">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="glass">
          <SelectItem value="all">All {label}</SelectItem>
          {options.map((option) => (
            <SelectItem key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value.toString()}>
              {typeof option === 'string' ? formatEnumName(option) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-surface flex items-center justify-center">Loading products and filters...</div>}>
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Products</h1>
              <p className="text-muted-foreground">Find amazing products from your fellow students</p>
            </div>

            <div className="flex gap-8">
              {/* Left Sidebar - Filters */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="glass-card p-6 sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-primary hover:text-primary/80"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <FilterDropdown
                    label="Category"
                    value={selectedCategory}
                    onValueChange={(value: string) => handleFilterChange('category', value)}
                    options={PRODUCT_CATEGORIES}
                    placeholder="Select category"
                  />

                  {/* Hall Filter */}
                  <FilterDropdown
                    label="Hall"
                    value={selectedHall}
                    onValueChange={(value: string) => handleFilterChange('hall', value)}
                    options={HALLS}
                    placeholder="Select hall"
                  />

                  {/* Product Type Filter */}
                  <FilterDropdown
                    label="Product Type"
                    value={selectedType}
                    onValueChange={(value: string) => handleFilterChange('type', value)}
                    options={PRODUCT_TYPES}
                    placeholder="Select type"
                  />

                  {/* Status Filter */}
                  <FilterDropdown
                    label="Status"
                    value={selectedStatus}
                    onValueChange={(value: string) => handleFilterChange('status', value)}
                    options={PRODUCT_STATUSES}
                    placeholder="Select status"
                  />

                  {/* Condition Filter */}
                  <FilterDropdown
                    label="Condition"
                    value={selectedCondition}
                    onValueChange={(value: string) => handleFilterChange('condition', value)}
                    options={CONDITION_OPTIONS}
                    placeholder="Select condition"
                  />

                  {/* Seasonality Filter */}
                  <FilterDropdown
                    label="Seasonality"
                    value={selectedSeasonality}
                    onValueChange={(value: string) => handleFilterChange('seasonality', value)}
                    options={SEASONALITIES}
                    placeholder="Select seasonality"
                  />

                  <Separator className="my-6" />

                  {/* Price Range Slider */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">
                      Max Price: {formatCurrency(maxPrice[0])}
                    </Label>
                    <div className="px-2">
                      <Slider
                        value={maxPrice}
                        onValueChange={(value) => handleFilterChange('maxPrice', value[0])}
                        max={50000}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>₹100</span>
                        <span>₹50,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Top Bar - Search and Controls */}
                <div className="glass-card p-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Left side - Search */}
                    <div className="flex-1 max-w-md relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 glass border-white/20"
                      />
                    </div>

                    {/* Right side - Sort and View */}
                    <div className="flex items-center gap-3">
                      {/* Mobile Filter Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMobileFilters(true)}
                        className="lg:hidden glass border-white/20"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>

                      {/* Sort */}
                      <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort', value)}>
                        <SelectTrigger className="w-48 glass border-white/20">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="condition-high">Condition: High to Low</SelectItem>
                          <SelectItem value="condition-low">Condition: Low to High</SelectItem>
                        </SelectContent>
                      </Select>

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
                  </div>

                  {/* Active Filters */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                      {selectedCategory && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {formatEnumName(selectedCategory)}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('category', '')}
                          />
                        </Badge>
                      )}
                      {selectedHall && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {selectedHall}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('hall', '')}
                          />
                        </Badge>
                      )}
                      {selectedType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {PRODUCT_TYPE_TEXT_MAP[selectedType as keyof typeof PRODUCT_TYPE_TEXT_MAP] || formatEnumName(selectedType)}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('type', '')}
                          />
                        </Badge>
                      )}
                      {selectedStatus && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {formatEnumName(selectedStatus)}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('status', '')}
                          />
                        </Badge>
                      )}
                      {selectedCondition && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Condition: {selectedCondition}/5
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('condition', '')}
                          />
                        </Badge>
                      )}
                      {selectedSeasonality && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {SEASONALITY_TEXT_MAP[selectedSeasonality as keyof typeof SEASONALITY_TEXT_MAP] || formatEnumName(selectedSeasonality)}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('seasonality', '')}
                          />
                        </Badge>
                      )}
                      {maxPrice[0] < 10000 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Max: {formatCurrency(maxPrice[0])}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('maxPrice', 10000)}
                          />
                        </Badge>
                      )}
                      {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          &ldquo;{searchQuery}&rdquo;
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('search', '')}
                          />
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                {/* Products Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map((product: Product) => (
                      <Link key={product.id} href={`/products/${product.id}`} className="group">
                        <Card className="glass-card hover-lift overflow-hidden h-full">
                          <div className="aspect-video relative overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-smooth"
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
                            <Badge className="absolute top-2 left-2 bg-primary text-white">
                              {PRODUCT_TYPE_TEXT_MAP[product.productType] || formatEnumName(product.productType || 'USED')}
                            </Badge>
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
                    {sortedProducts.map((product: Product) => (
                      <Link key={product.id} href={`/products/${product.id}`} className="group">
                        <Card className="glass-card hover-lift">
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              <div className="w-32 h-24 relative overflow-hidden rounded-lg flex-shrink-0">
                                {product.images && product.images.length > 0 ? (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.title}
                                    fill
                                    sizes="128px"
                                    className="object-cover group-hover:scale-110 transition-smooth"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">No image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg">{product.title}</h3>
                                    <div className="flex gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {PRODUCT_TYPE_TEXT_MAP[product.productType] || formatEnumName(product.productType || 'USED')}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {formatEnumName(product.status || 'LISTED')}
                                      </Badge>
                                    </div>
                                  </div>
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
          </div>

          {/* Mobile Filter Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="fixed right-0 top-0 h-full w-80 bg-background glass-card p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile filter content - same filters as desktop */}
                <FilterDropdown
                  label="Category"
                  value={selectedCategory}
                  onValueChange={(value: string) => handleFilterChange('category', value)}
                  options={PRODUCT_CATEGORIES}
                  placeholder="Select category"
                />

                <FilterDropdown
                  label="Hall"
                  value={selectedHall}
                  onValueChange={(value: string) => handleFilterChange('hall', value)}
                  options={HALLS}
                  placeholder="Select hall"
                />

                <FilterDropdown
                  label="Product Type"
                  value={selectedType}
                  onValueChange={(value: string) => handleFilterChange('type', value)}
                  options={PRODUCT_TYPES}
                  placeholder="Select type"
                />

                <FilterDropdown
                  label="Status"
                  value={selectedStatus}
                  onValueChange={(value: string) => handleFilterChange('status', value)}
                  options={PRODUCT_STATUSES}
                  placeholder="Select status"
                />

                <FilterDropdown
                  label="Condition"
                  value={selectedCondition}
                  onValueChange={(value: string) => handleFilterChange('condition', value)}
                  options={CONDITION_OPTIONS}
                  placeholder="Select condition"
                />

                {/* Price Range Slider */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">
                    Max Price: {formatCurrency(maxPrice[0])}
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={maxPrice}
                      onValueChange={(value) => handleFilterChange('maxPrice', value[0])}
                      max={50000}
                      min={100}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>₹100</span>
                      <span>₹50,000</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    Clear All
                  </Button>
                  <Button onClick={() => setShowMobileFilters(false)} className="flex-1">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </Suspense>
  )
}