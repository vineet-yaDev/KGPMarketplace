'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Grid, List, X, Filter, Check, Loader2 } from 'lucide-react'
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
// Local search implementation
import { 
  PRODUCT_CATEGORIES,
  HALLS,
  PRODUCT_TYPES,
  PRODUCT_STATUSES,
  SEASONALITIES,
  CONDITION_OPTIONS,
  PRODUCT_TYPE_TEXT_MAP,
  SEASONALITY_TEXT_MAP,
  formatEnumName
} from '@/lib/constants'
import { matchesSearchQuery } from '@/lib/searchUtils'

// Condition Bar Component
const ConditionBar = ({ condition }: { condition: number }) => {
  const getConditionColor = (cond: number) => {
    if (cond >= 5) return 'bg-green-500' // Excellent
    if (cond >= 4) return 'bg-lime-400' // Very Good
    if (cond >= 3) return 'bg-yellow-400' // Good
    if (cond >= 2) return 'bg-orange-400' // Fair
    return 'bg-red-500' // Poor
  }

  const percentage = (condition / 5) * 100

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getConditionColor(condition)} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{condition}/5</span>
    </div>
  )
}

// Type for FilterDropdown props
interface FilterDropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly (string | { value: string | number; label: string })[];
  placeholder: string;
  isMobile?: boolean;
}

export default function ProductsContent() {
  // Infinite scroll state
  const [products, setProducts] = useState<Product[]>([])
  const [allProductsForSearch, setAllProductsForSearch] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 700) // Debounced with 700ms delay
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedHall, setSelectedHall] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedSeasonality, setSelectedSeasonality] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [selectedDiscount, setSelectedDiscount] = useState('')
  const [maxPrice, setMaxPrice] = useState([1000000])
  const debouncedMaxPrice = useDebounce(maxPrice[0], 700) // Debounced with 700ms delay
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Refs
  const searchParams = useSearchParams()
  const router = useRouter()
  const filterModalRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Local search - filter products by title and description
  console.log('Products page - Search query:', searchQuery)

  // Close mobile filter when clicking outside - but not when clicking on select items
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Don't close if clicking on select content or trigger
      if (target && (
        (target as Element).closest('[data-radix-select-content]') ||
        (target as Element).closest('[data-radix-select-trigger]') ||
        (target as Element).closest('[data-radix-select-item]')
      )) {
        return
      }
      
      if (filterModalRef.current && !filterModalRef.current.contains(target)) {
        setShowMobileFilters(false)
      }
    }

    if (showMobileFilters) {
      // Add a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
        document.body.style.overflow = 'unset'
      }
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMobileFilters])

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category')
    const hall = searchParams.get('hall')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const seasonality = searchParams.get('seasonality')
    const condition = searchParams.get('condition')
    const discount = searchParams.get('discount')
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
    if (discount && ['20', '30', '40', '50', '60', '70'].includes(discount)) {
      setSelectedDiscount(discount)
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
  const updateURL = useCallback((filters: FilterState & { discount?: string }) => {  // Extended to include discount
    const params = new URLSearchParams()
    
    if (filters.category) params.set('category', filters.category.toLowerCase())
    if (filters.hall) params.set('hall', filters.hall.toLowerCase())
    if (filters.type) params.set('type', filters.type.toLowerCase())
    if (filters.status) params.set('status', filters.status.toLowerCase())
    if (filters.seasonality) params.set('seasonality', filters.seasonality.toLowerCase())
    if (filters.condition) params.set('condition', filters.condition)
    if (filters.discount) params.set('discount', filters.discount)  // New: Add discount to URL
    if (filters.maxPrice && filters.maxPrice !== 1000000) params.set('maxPrice', filters.maxPrice.toString())
    if (filters.search) params.set('search', filters.search)
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort)

    const queryString = params.toString()
    const newURL = queryString ? `/products?${queryString}` : '/products'
    
    router.push(newURL, { scroll: false })
  }, [router])

  // Initial data load and all products for search
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Load first 50 products for display immediately
      const initialResponse = await fetch('/api/products?limit=50')
      const initialData = await initialResponse.json()
      
      if (initialResponse.ok && initialData.products) {
        setProducts(initialData.products)
        setHasMore(initialData.hasMore)
        setNextCursor(initialData.nextCursor)
        setCurrentOffset(50)
        setLoading(false) // Show products immediately
        
        // Load all products for search/filter in background
        fetch('/api/products?forSearch=true')
          .then(response => response.json())
          .then(data => {
            if (data.products) {
              setAllProductsForSearch(data.products)
            }
          })
          .catch(error => {
            console.error('Error loading products for search:', error)
          })
      } else {
        setLoading(false)
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error)
      setLoading(false)
    }
  }

  // Load more products for infinite scroll
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    try {
      setLoadingMore(true)
      
      // Use cursor-based pagination if available, otherwise use offset
      const params = new URLSearchParams({
        limit: '30',
        sort: sortBy
      })
      
      if (nextCursor) {
        params.set('cursor', nextCursor)
      } else {
        params.set('offset', currentOffset.toString())
      }
      
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      
      if (response.ok && data.products) {
        setProducts(prev => [...prev, ...data.products])
        setHasMore(data.hasMore)
        setNextCursor(data.nextCursor)
        setCurrentOffset(prev => prev + data.products.length)
      }
      
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, nextCursor, currentOffset, sortBy])

  // Check if any filters are active
  const hasActiveFilters = selectedCategory || selectedHall || selectedType || 
                          selectedStatus || selectedSeasonality || selectedCondition || 
                          selectedDiscount || maxPrice[0] < 1000000 || debouncedSearchQuery

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const target = entries[0]
          // Only load more if no filters are active and we have more data
          if (target.isIntersecting && hasMore && !loadingMore && !hasActiveFilters) {
            loadMoreProducts()
          }
        },
        { threshold: 0.1 }
      )
      
      observerRef.current.observe(loadMoreRef.current)
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loadingMore, loadMoreProducts, hasActiveFilters])

  const handleFilterChange = useCallback((filterType: string, value: string | number, isMobile: boolean = false) => {
    const filterValue = value === "all" ? "" : value as string

    // Create filters object based on current state and the new value
    const getUpdatedFilters = () => {
      const filters = {
        category: selectedCategory,
        hall: selectedHall,
        type: selectedType,
        status: selectedStatus,
        seasonality: selectedSeasonality,
        condition: selectedCondition,
        discount: selectedDiscount,
        maxPrice: maxPrice[0],
        search: searchQuery,
        sort: sortBy
      }

      // Apply the specific filter change
      switch (filterType) {
        case 'category':
          filters.category = filterValue
          break
        case 'hall':
          filters.hall = filterValue
          break
        case 'type':
          filters.type = filterValue
          break
        case 'status':
          filters.status = filterValue
          break
        case 'seasonality':
          filters.seasonality = filterValue
          break
        case 'condition':
          filters.condition = filterValue
          break
        case 'discount':
          filters.discount = filterValue
          break
        case 'maxPrice':
          filters.maxPrice = value as number
          break
        case 'search':
          filters.search = value as string
          break
        case 'sort':
          filters.sort = value as string
          break
      }
      return filters
    }

    // Update state
    switch (filterType) {
      case 'category':
        setSelectedCategory(filterValue)
        break
      case 'hall':
        setSelectedHall(filterValue)
        break
      case 'type':
        setSelectedType(filterValue)
        break
      case 'status':
        setSelectedStatus(filterValue)
        break
      case 'seasonality':
        setSelectedSeasonality(filterValue)
        break
      case 'condition':
        setSelectedCondition(filterValue)
        break
      case 'discount':
        setSelectedDiscount(filterValue)
        break
      case 'maxPrice':
        setMaxPrice([value as number])
        // URL update for price is handled in separate effect
        return
      case 'search':
        setSearchQuery(value as string)
        // URL update for search is handled in separate effect
        return
      case 'sort':
        setSortBy(value as string)
        break
    }

    // Update URL with the updated filters
    const updatedFilters = getUpdatedFilters()
    
    if (isMobile) {
      // Small delay to allow the select to close properly first
      setTimeout(() => {
        updateURL(updatedFilters)
      }, 50)
    } else {
      updateURL(updatedFilters)
    }
  }, [selectedCategory, selectedHall, selectedType, selectedStatus, selectedSeasonality, selectedCondition, selectedDiscount, maxPrice, sortBy, searchQuery, updateURL])

  // Local search - no API calls needed

  // Update URL when filters change
  useEffect(() => {
    const filters = {
      category: selectedCategory,
      hall: selectedHall,
      type: selectedType,
      status: selectedStatus,
      seasonality: selectedSeasonality,
      condition: selectedCondition,
      discount: selectedDiscount,
      maxPrice: debouncedMaxPrice,
      search: debouncedSearchQuery,
      sort: sortBy
    }
    updateURL(filters)
  }, [debouncedSearchQuery, debouncedMaxPrice, selectedCategory, selectedHall, selectedType, selectedStatus, selectedSeasonality, selectedCondition, selectedDiscount, sortBy, updateURL])

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedHall('')
    setSelectedType('')
    setSelectedStatus('')
    setSelectedSeasonality('')
    setSelectedCondition('')
    setSelectedDiscount('')  // New: Clear discount filter
    setMaxPrice([1000000])
  setSearchQuery('')
    setSortBy('newest')
    router.push('/products')
  }

  // Use all products for filtering when filters are active, otherwise use paginated products
  const productsToFilter = hasActiveFilters ? allProductsForSearch : products

  // Local search - filter products by title and description
  const filteredProducts = useMemo(() => {
    return productsToFilter.filter((product: Product) => {
      // Search in title and description using space-insensitive matching
      const matchesSearch = matchesSearchQuery(product.title, product.description, debouncedSearchQuery);
      
      // Apply other filters
      const matchesCategory = !selectedCategory || product.category === selectedCategory
      const matchesHall = !selectedHall || product.addressHall === selectedHall
      const matchesType = !selectedType || product.productType === selectedType
      const matchesStatus = !selectedStatus || product.status === selectedStatus
      const matchesSeasonality = !selectedSeasonality || product.seasonality === selectedSeasonality
      const matchesCondition = !selectedCondition || product.condition === parseInt(selectedCondition)
      const matchesPrice = !product.price || product.price <= debouncedMaxPrice
      
      // Calculate discount and apply filter
      const getDiscount = (p: Product) => {
        if (!p.price || p.price === 0) return 100;
        if (p.originalPrice && p.price) {
          return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        }
        return 0;
      };
      
      const matchesDiscount = !selectedDiscount || getDiscount(product) > parseInt(selectedDiscount);
      
      return matchesSearch && matchesCategory && matchesHall && matchesType && 
             matchesStatus && matchesSeasonality && matchesCondition && matchesPrice && matchesDiscount;
    })
  }, [productsToFilter, debouncedSearchQuery, selectedCategory, selectedHall, selectedType, 
      selectedStatus, selectedSeasonality, selectedCondition, selectedDiscount, debouncedMaxPrice])

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

  const FilterDropdown = ({ label, value, onValueChange, options, placeholder}: FilterDropdownProps) => (
    <div className="mb-4">
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <Select 
        value={value || "all"} 
        onValueChange={(val) => onValueChange(val)}
      >
        <SelectTrigger className="glass border-white/20">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="glass" data-radix-select-content>
          <SelectItem value="all" data-radix-select-item>All {label}</SelectItem>
          {options.map((option) => (
            <SelectItem 
              key={typeof option === 'string' ? option : option.value} 
              value={typeof option === 'string' ? option : option.value.toString()}
              data-radix-select-item
            >
              {typeof option === 'string' ? formatEnumName(option) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Find amazing products from your fellow students</p>
          </div>

          <div className="flex gap-4 lg:gap-8">
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
                  label="Halls"
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
                  label="Conditions"
                  value={selectedCondition}
                  onValueChange={(value: string) => handleFilterChange('condition', value)}
                  options={CONDITION_OPTIONS}
                  placeholder="Select condition"
                />

                {/* Seasonality Filter */}
                <FilterDropdown
                  label="Tags"
                  value={selectedSeasonality}
                  onValueChange={(value: string) => handleFilterChange('seasonality', value)}
                  options={SEASONALITIES}
                  placeholder="Select seasonality"
                />

                {/* New: Discount Filter */}
                <FilterDropdown
                  label="Discount"
                  value={selectedDiscount}
                  onValueChange={(value: string) => handleFilterChange('discount', value)}
                  options={[
                    { value: '20', label: '> 20%' },
                    { value: '30', label: '> 30%' },
                    { value: '40', label: '> 40%' },
                    { value: '50', label: '> 50%' },
                    { value: '60', label: '> 60%' },
                    { value: '70', label: '> 70%' },
                  ]}
                  placeholder="Select discount"
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
              <div className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                      }}
                      className="pl-10 glass border-white/20"
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    {/* Mobile Filter Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMobileFilters(true)}
                      className="lg:hidden glass border-white/20 w-full sm:w-auto"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      {/* Sort */}
                      <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort', value)}>
                        <SelectTrigger className="w-full sm:w-48 glass border-white/20">
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

                      {/* View Mode - Updated with 3 options */}
                      <div className="flex rounded-lg glass border border-white/20 p-1 w-fit mx-auto sm:mx-0">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="px-2 sm:px-3"
                          title="Grid View"
                        >
                            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                            <div className="bg-current rounded-sm"></div>
                            <div className="bg-current rounded-sm"></div>
                            <div className="bg-current rounded-sm"></div>
                            <div className="bg-current rounded-sm"></div>
                          </div>
                        </Button>
                        <Button
                          variant={viewMode === 'compact' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('compact')}
                          className="px-2 sm:px-3"
                          title="Compact Grid"
                        >
                          <Grid className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="px-2 sm:px-3"
                          title="List View"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Active Filters */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
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
                      {selectedDiscount && (  // New: Add badge for discount filter
                        <Badge variant="secondary" className="flex items-center gap-1">
                         {selectedDiscount}%
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('discount', '')}
                          />
                        </Badge>
                      )}
                      {maxPrice[0] < 1000000 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Max: {formatCurrency(maxPrice[0])}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange('maxPrice', 1000000)}
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
              </div>

              {/* Results Count */}
              <div className="mb-4 sm:mb-6 px-1">
                <p className="text-muted-foreground text-sm">
                  {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Products Grid/List/Compact */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedProducts.map((product: Product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group"
                      prefetch={true}
                      onMouseEnter={() => { /* Next.js prefetch attribute will handle preloading */ }}
                      onTouchStart={() => { /* trigger prefetch early on touch */ }}
                    >
                      <Card className="glass-card hover-lift overflow-hidden h-full">
                        <div className="aspect-video relative overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">No image</span>
                            </div>
                          )}
                          {/* Show FREE badge if price is 0, otherwise show discount badge */}
                          {product.price === 0 || !product.price ? (
                            <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                              FREE
                            </Badge>
                          ) : (
                            product.originalPrice && product.price && (
                              <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                              </Badge>
                            )
                          )}
                          {/* <Badge className="absolute top-2 left-2 bg-primary text-white text-xs">
                            {PRODUCT_TYPE_TEXT_MAP[product.productType] || formatEnumName(product.productType || 'USED')}
                          </Badge> */}
                          {/* Green tick for invoice URL */}
                          {product.invoiceImageUrl && (
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="font-semibold truncate mb-2 text-sm sm:text-base">{product.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                            {product.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between space-x-2 mb-2 flex-wrap">
<div className="flex items-center space-x-2">
    {/* Show FREE if price is 0, otherwise show regular price */}
    {product.price === 0 || !product.price ? (
      <span className="font-bold text-base sm:text-lg text-green-600">
        FREE
      </span>
    ) : (
      product.price && (
        <span className="font-bold text-base sm:text-lg text-primary">
          {formatCurrency(product.price)}
        </span>
      )
    )}
    {/* Strike through original price if it exists and current price is 0 (FREE) */}
    {product.originalPrice && (
      <span className="text-xs sm:text-sm text-muted-foreground line-through">
        {formatCurrency(product.originalPrice)}
      </span>
    )}
  </div>
  
  <div className="flex items-center justify-end flex-wrap gap-2">
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Condition:</span>
      <ConditionBar condition={product.condition || 0} />
    </div>
    {/* {product.addressHall && (
      <span className="text-xs text-muted-foreground">{product.addressHall}</span>
    )} */}
  </div>
</div>

                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : viewMode === 'compact' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {sortedProducts.map((product: Product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group"
                      prefetch={true}
                      onMouseEnter={() => {}}
                      onTouchStart={() => {}}
                    >
                      <Card className="glass-card hover-lift overflow-hidden h-full">
                        <div className="aspect-square relative overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                              className="object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">No image</span>
                            </div>
                          )}
                          {/* Show FREE badge if price is 0, otherwise show discount badge */}
                          {product.price === 0 || !product.price ? (
                            <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                              FREE
                            </Badge>
                          ) : (
                            product.originalPrice && product.price && (
                              <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                              </Badge>
                            )
                          )}
                          {/* <Badge className="absolute top-1 left-1 bg-primary text-white text-xs px-1 py-0.5">
                            {PRODUCT_TYPE_TEXT_MAP[product.productType]?.split(' ')[0] || formatEnumName(product.productType || 'USED')}
                          </Badge> */}
                          {/* Green tick for invoice URL */}
                          {product.invoiceImageUrl && (
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                              <Check className="w-2 h-2" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-2">
                          <h3 className="font-semibold text-xs line-clamp-2 mb-1 leading-tight">{product.title}</h3>
                          <div className="flex items-center justify-between gap-2">
                            {/* Left side - Price */}
                            <div className="flex items-baseline space-x-1">
                              {product.price === 0 || !product.price ? (
                                <span className="font-bold text-sm text-green-600">
                                  FREE
                                </span>
                              ) : (
                                product.price && (
                                  <span className="font-bold text-sm text-primary">
                                    {formatCurrency(product.price)}
                                  </span>
                                )
                              )}
                              {product.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            {/* Right side - Condition */}
                            <ConditionBar condition={product.condition || 0} />
                          </div>
                          {/* {product.addressHall && (
                            <p className="text-xs text-muted-foreground truncate">{product.addressHall}</p>
                          )} */}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {sortedProducts.map((product: Product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group"
                      prefetch={true}
                      onMouseEnter={() => {}}
                      onTouchStart={() => {}}
                    >
                      <Card className="glass-card hover-lift overflow-hidden mb-2">
                        <CardContent className="p-3 sm:p-6">
                          <div className="flex gap-3 sm:gap-4">
                            {/* Larger Image Container */}
                            <div className="w-24 h-24 sm:w-32 sm:h-24 md:w-40 md:h-32 relative overflow-hidden rounded-lg flex-shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.title}
                                  fill
                                  sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
                                  className="object-cover group-hover:scale-110 transition-smooth"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">No image</span>
                                </div>
                              )}
                              
                              {/* Product Type Badge on Image */}
                              {/* <Badge className="absolute top-1 left-1 bg-primary text-white text-xs px-1 py-0.5">
                                {PRODUCT_TYPE_TEXT_MAP[product.productType] || formatEnumName(product.productType || 'USED')}
                              </Badge> */}
                              
                              {/* Status Badge on Image */}
                              {/* <Badge className="absolute top-1 right-1 bg-secondary text-xs px-1 py-0.5">
                                {formatEnumName(product.status || 'LISTED')}
                              </Badge> */}
                              
                              {/* Green tick for invoice URL */}
                              {product.invoiceImageUrl && (
                                <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1">
                                  <Check className="w-2 h-2 sm:w-3 sm:h-3" />
                                </div>
                              )}
                            </div>
                            
                            {/* Content Area */}
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex justify-between items-start mb-2 gap-2">
                                {/* Left side - Title */}
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-1 mb-1">
                                    {product.title}
                                  </h3>
                                </div>
                                
                                {/* Right side - Discount Badge */}
                                {product.price === 0 ? (
                                  <Badge className="bg-green-500 text-white text-xs px-2 py-1 flex-shrink-0 whitespace-nowrap">
                                    FREE
                                  </Badge>
                                ) : (
                                  product.originalPrice && product.price && (
                                    <Badge className="bg-red-500 text-white text-xs px-2 py-1 flex-shrink-0 whitespace-nowrap">
                                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                    </Badge>
                                  )
                                )}
                              </div>
                              
                              {/* Description */}
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                                {product.description || 'No description available'}
                              </p>
                              
{/* Bottom Row - Price and Details */}
<div className="flex flex-wrap items-center space-x-2 justify-between gap-2">
  {/* Left side - Price */}
  <div className="flex items-baseline space-x-2 flex-wrap">
    {/* Show FREE if price is 0, otherwise show regular price */}
    {product.price === 0 || !product.price ? (
      <span className="font-bold text-base sm:text-lg text-green-600">
        FREE
      </span>
    ) : (
      product.price && (
        <span className="font-bold text-base sm:text-lg text-primary">
          {formatCurrency(product.price)}
        </span>
      )
    )}
    {/* Strike through original price if it exists and current price is 0 (FREE) */}
    {product.originalPrice && (
      <span className="text-xs sm:text-sm text-muted-foreground line-through">
        {formatCurrency(product.originalPrice)}
      </span>
    )}
  </div>
  
  {/* Right side - Condition Bar */}
  <div className="flex justify-end sm:justify-center items-center gap-1.5">
    <span className="text-xs text-muted-foreground">Condition:</span>
    <ConditionBar condition={product.condition || 0} />
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

              {/* Infinite Scroll Trigger - Always show when there are products */}
              {sortedProducts.length > 0 && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {loadingMore ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading more products...</span>
                    </div>
                  ) : hasMore && !hasActiveFilters ? (
                    <>
                      {/* Invisible trigger for infinite scroll */}
                      <div className="h-4"></div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {hasActiveFilters ? 
                        `${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''} found` :
                        `All ${sortedProducts.length} products loaded`
                      }
                    </p>
                  )}
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
            <div 
              ref={filterModalRef}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-background glass-card p-6 overflow-y-auto"
            >
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
                onValueChange={(value: string) => handleFilterChange('category', value, true)}
                options={PRODUCT_CATEGORIES}
                placeholder="Select category"
                isMobile={true}
              />

              <FilterDropdown
                label="Hall"
                value={selectedHall}
                onValueChange={(value: string) => handleFilterChange('hall', value, true)}
                options={HALLS}
                placeholder="Select hall"
                isMobile={true}
              />

              <FilterDropdown
                label="Product Type"
                value={selectedType}
                onValueChange={(value: string) => handleFilterChange('type', value, true)}
                options={PRODUCT_TYPES}
                placeholder="Select type"
                isMobile={true}
              />

              <FilterDropdown
                label="Status"
                value={selectedStatus}
                onValueChange={(value: string) => handleFilterChange('status', value, true)}
                options={PRODUCT_STATUSES}
                placeholder="Select status"  
                isMobile={true}
              />

              <FilterDropdown
                label="Condition"
                value={selectedCondition}
                onValueChange={(value: string) => handleFilterChange('condition', value, true)}
                options={CONDITION_OPTIONS}
                placeholder="Select condition"
                isMobile={true}
              />

              <FilterDropdown
                label="Tags"
                value={selectedSeasonality}
                onValueChange={(value: string) => handleFilterChange('seasonality', value, true)}
                options={SEASONALITIES}
                placeholder="Select seasonality"
                isMobile={true}
              />

              {/* New: Discount Filter for Mobile */}
              <FilterDropdown
                label="Discount"
                value={selectedDiscount}
                onValueChange={(value: string) => handleFilterChange('discount', value, true)}
                options={[
                  { value: '20', label: '> 20%' },
                  { value: '30', label: '> 30%' },
                  { value: '40', label: '> 40%' },
                  { value: '50', label: '> 50%' },
                  { value: '60', label: '> 60%' },
                  { value: '70', label: '> 70%' },
                ]}
                placeholder="Select discount"
                isMobile={true}
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
                    onValueChange={(value) => handleFilterChange('maxPrice', value[0], true)}
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
  )
}