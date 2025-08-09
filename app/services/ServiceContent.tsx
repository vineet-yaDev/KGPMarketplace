'use client'

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Grid, List, X, Filter, Check } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Service } from '@/lib/types';
import type { ServiceCategory, KGPHalls } from '@/lib/types';
import {
  SERVICE_CATEGORIES,
  HALLS,
  EXPERIENCE_RANGES,
  SERVICE_CATEGORY_TEXT_MAP,
  formatEnumName
} from '@/lib/constants';
// Import the fuzzy search hook for services (similar to products)
import { useServiceSearch } from '@/hooks/useServiceSearch';

interface FilterDropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly (string | { value: string | number; label: string })[];
  placeholder: string;
  isMobile?: boolean;
}

interface FilterState {
  category: string;
  hall: string;
  experience: string;
  minPrice: number;
  maxPrice: number;
  search: string;
  sort: string;
}

export default function ServicesContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedHall, setSelectedHall] = useState('');
  const [selectedExperienceRange, setSelectedExperienceRange] = useState('');
  const [minPrice, setMinPrice] = useState([0]);
  const [maxPrice, setMaxPrice] = useState([50000]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [useFuzzySearch, setUseFuzzySearch] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const filterModalRef = useRef<HTMLDivElement>(null);

  // Use fuzzy search hook for services
  const { results: fuzzyResults, 
    // loading: fuzzyLoading, 
    // error: fuzzyError, 
    search } = useServiceSearch();

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const hall = searchParams.get('hall');
    const experience = searchParams.get('experience');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const searchParam = searchParams.get('search');
    const sort = searchParams.get('sort');

    if (category && SERVICE_CATEGORIES.includes(category.toUpperCase() as ServiceCategory)) {
      setSelectedCategory(category.toUpperCase());
    }
    if (hall && HALLS.includes(hall.toUpperCase() as KGPHalls)) {
      setSelectedHall(hall.toUpperCase());
    }
    if (experience && EXPERIENCE_RANGES.some(r => r.value === experience)) {
      setSelectedExperienceRange(experience);
    }
    if (minPriceParam && !isNaN(Number(minPriceParam))) {
      setMinPrice([Number(minPriceParam)]);
    }
    if (maxPriceParam && !isNaN(Number(maxPriceParam))) {
      setMaxPrice([Number(maxPriceParam)]);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
      setUseFuzzySearch(true);
    }
    if (sort) {
      setSortBy(sort);
    }
  }, [searchParams]);

  // Fetch services from API on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      const data = await response.json();
      if (response.ok) {
        setServices(data.services || []);
      } else {
        console.error('Failed to fetch services:', data.error);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fuzzy search when query changes and fuzzy search is enabled
  useEffect(() => {
    if (useFuzzySearch && searchQuery.trim()) {
      const filters = {
        category: selectedCategory || undefined,
        hall: selectedHall || undefined,
        experience: selectedExperienceRange || undefined,
        minPrice: minPrice[0] > 0 ? minPrice[0] : undefined,
        maxPrice: maxPrice[0] < 50000 ? maxPrice[0] : undefined
      };
      search(searchQuery, filters);
    }
  }, [searchQuery, selectedCategory, selectedHall, selectedExperienceRange, minPrice, maxPrice, useFuzzySearch, search]);

  // If search field becomes empty, reset fuzzy search mode
  useEffect(() => {
    if (!searchQuery.trim()) {
      setUseFuzzySearch(false);
    }
  }, [searchQuery]);

  // Update URL when filters change (desktop)
  const updateURL = (filters: FilterState) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category.toLowerCase());
    if (filters.hall) params.set('hall', filters.hall.toLowerCase());
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.minPrice && filters.minPrice !== 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice && filters.maxPrice !== 50000) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);

    const queryString = params.toString();
    const newURL = queryString ? `/services?${queryString}` : '/services';
    router.push(newURL, { scroll: false });
  };

  const handleFilterChange = (filterType: string, value: string | number, isMobile: boolean = false) => {
    const filters: FilterState = {
      category: selectedCategory,
      hall: selectedHall,
      experience: selectedExperienceRange,
      minPrice: minPrice[0],
      maxPrice: maxPrice[0],
      search: searchQuery,
      sort: sortBy
    };

    const filterValue = value === "all" ? "" : value as string;

    switch (filterType) {
      case 'category':
        setSelectedCategory(filterValue);
        filters.category = filterValue;
        break;
      case 'hall':
        setSelectedHall(filterValue);
        filters.hall = filterValue;
        break;
      case 'experience':
        setSelectedExperienceRange(filterValue);
        filters.experience = filterValue;
        break;
      case 'minPrice':
        setMinPrice([value as number]);
        filters.minPrice = value as number;
        break;
      case 'maxPrice':
        setMaxPrice([value as number]);
        filters.maxPrice = value as number;
        break;
      case 'search':
        setSearchQuery(value as string);
        filters.search = value as string;
        break;
      case 'sort':
        setSortBy(value as string);
        filters.sort = value as string;
        break;
    }

    // Update URL (with a delay for mobile)
    if (isMobile) {
      setTimeout(() => {
        updateURL(filters);
      }, 50);
    } else {
      updateURL(filters);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedHall('');
    setSelectedExperienceRange('');
    setMinPrice([0]);
    setMaxPrice([50000]);
    setSearchQuery('');
    setSortBy('newest');
    router.push('/services');
  };

  // For fuzzy search, if active use fuzzyResults; otherwise filter locally.
  const filteredServices = useFuzzySearch
    ? fuzzyResults
    : services.filter((service: Service) => {
        const matchesSearch = !searchQuery ||
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = !selectedCategory || service.category === selectedCategory;
        const matchesHall = !selectedHall || service.addressHall === selectedHall;
        let matchesExperience = true;
        if (selectedExperienceRange) {
          const expRange = EXPERIENCE_RANGES.find(r => r.value === selectedExperienceRange);
          if (expRange && service.experienceYears != null) {
            const exp = service.experienceYears || 0;
            matchesExperience = exp >= expRange.min && exp <= expRange.max;
          } else {
            matchesExperience = false;
          }
        }
        const serviceMinPrice = service.minPrice || 0;
        const serviceMaxPrice = service.maxPrice || serviceMinPrice || 0;
        const matchesPrice = serviceMinPrice >= minPrice[0] && serviceMaxPrice <= maxPrice[0];

        return matchesSearch && matchesCategory && matchesHall && matchesExperience && matchesPrice;
      });

  const sortedServices = [...filteredServices].sort((a: Service, b: Service) => {
    switch (sortBy) {
      case 'price-low':
        return (a.minPrice || 0) - (b.minPrice || 0);
      case 'price-high':
        return (b.minPrice || 0) - (a.minPrice || 0);
      case 'experience-high':
        return (b.experienceYears || 0) - (a.experienceYears || 0);
      case 'experience-low':
        return (a.experienceYears || 0) - (b.experienceYears || 0);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const hasActiveFilters = selectedCategory || selectedHall || selectedExperienceRange ||
    minPrice[0] > 0 || maxPrice[0] < 50000 || searchQuery;

  // Mobile modal click-outside handler already defined in useEffect above

  const FilterDropdown = ({ label, value, onValueChange, options, placeholder }: FilterDropdownProps) => (
    <div className="mb-4" onClick={(e) => e.stopPropagation()}>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <Select value={value || "all"} onValueChange={(val) => onValueChange(val)}>
        <SelectTrigger className="glass border-white/20">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="glass" data-radix-select-content sideOffset={5}>
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
  );

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
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Services</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Find skilled services from talented students</p>
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

                <FilterDropdown
                  label="Category"
                  value={selectedCategory}
                  onValueChange={(value: string) => handleFilterChange('category', value)}
                  options={SERVICE_CATEGORIES}
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
                  label="Experience"
                  value={selectedExperienceRange}
                  onValueChange={(value: string) => handleFilterChange('experience', value)}
                  options={EXPERIENCE_RANGES}
                  placeholder="Select experience"
                />

                <Separator className="my-6" />

                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">
                    Min Price: {formatCurrency(minPrice[0])}
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={minPrice}
                      onValueChange={(value) => handleFilterChange('minPrice', value[0])}
                      max={5000}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>₹0</span>
                      <span>₹5,000</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">
                    Max Price: {formatCurrency(maxPrice[0])}
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={maxPrice}
                      onValueChange={(value) => handleFilterChange('maxPrice', value[0])}
                      max={50000}
                      min={1000}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>₹1,000</span>
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10 glass border-white/20"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
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
                      <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort', value)}>
                        <SelectTrigger className="w-full sm:w-48 glass border-white/20">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="experience-high">Experience: High to Low</SelectItem>
                          <SelectItem value="experience-low">Experience: Low to High</SelectItem>
                        </SelectContent>
                      </Select>

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

                  {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                      {selectedCategory && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {SERVICE_CATEGORY_TEXT_MAP[selectedCategory as keyof typeof SERVICE_CATEGORY_TEXT_MAP] || formatEnumName(selectedCategory)}
                          <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleFilterChange('category', '')} />
                        </Badge>
                      )}
                      {selectedHall && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {selectedHall}
                          <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleFilterChange('hall', '')} />
                        </Badge>
                      )}
                      {selectedExperienceRange && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {EXPERIENCE_RANGES.find(r => r.value === selectedExperienceRange)?.label}
                          <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleFilterChange('experience', '')} />
                        </Badge>
                      )}
                      {minPrice[0] > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Min: {formatCurrency(minPrice[0])}
                          <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleFilterChange('minPrice', 0)} />
                        </Badge>
                      )}
                      {maxPrice[0] < 50000 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Max: {formatCurrency(maxPrice[0])}
                          <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleFilterChange('maxPrice', 50000)} />
                        </Badge>
                      )}
                      {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          &ldquo;{searchQuery}&rdquo;
                          <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleFilterChange('search', '')} />
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4 sm:mb-6 px-1">
                <p className="text-muted-foreground text-sm">
                  {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedServices.map((service: Service) => (
                    <Link key={service.id} href={`/services/${service.id}`} className="group">
                      <Card className="glass-card hover-lift overflow-hidden h-full">
                        <div className="aspect-video relative overflow-hidden">
                          {service.images && service.images.length > 0 ? (
                            <Image
                              src={service.images[0]}
                              alt={service.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">No image</span>
                            </div>
                          )}
                          {/* Show FREE badge if minPrice is 0, otherwise show category badge */}
                          {service.minPrice === 0 ? (
                            <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                              FREE
                            </Badge>
                          ) : null}
                          <Badge className="absolute top-2 left-2 bg-primary text-white text-xs">
                            {SERVICE_CATEGORY_TEXT_MAP[service.category] || formatEnumName(service.category || 'OTHER')}
                          </Badge>
                          {service.portfolioUrl && (
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="font-semibold truncate mb-2 text-sm sm:text-base">{service.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                            {service.description || 'No description available'}
                          </p>
                          <div className="flex items-center space-x-2 mb-2 flex-wrap">
                            <span className={`font-bold text-base sm:text-lg ${service.minPrice === 0 ? 'text-green-600' : 'text-primary'}`}>
                              {service.minPrice === 0 ? (
                                'FREE'
                              ) : service.minPrice && service.maxPrice ? (
                                `${formatCurrency(service.minPrice)} - ${formatCurrency(service.maxPrice)}`
                              ) : service.minPrice ? (
                                `From ${formatCurrency(service.minPrice)}`
                              ) : (
                                'Price on request'
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : viewMode === 'compact' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {sortedServices.map((service: Service) => (
                    <Link key={service.id} href={`/services/${service.id}`} className="group">
                      <Card className="glass-card hover-lift overflow-hidden h-full">
                        <div className="aspect-square relative overflow-hidden">
                          {service.images && service.images.length > 0 ? (
                            <Image
                              src={service.images[0]}
                              alt={service.title}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                              className="object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">No image</span>
                            </div>
                          )}
                          {/* Show FREE badge if minPrice is 0 */}
                          {service.minPrice === 0 && (
                            <Badge className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5">
                              FREE
                            </Badge>
                          )}
                          <Badge className="absolute top-1 left-1 bg-primary text-white text-xs px-1 py-0.5">
                            {SERVICE_CATEGORY_TEXT_MAP[service.category]?.split(' ')[0] ||
                              formatEnumName(service.category || 'OTHER')}
                          </Badge>
                          {service.portfolioUrl && (
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                              <Check className="w-2 h-2" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-2">
                          <h3 className="font-semibold text-xs line-clamp-2 mb-1 leading-tight">{service.title}</h3>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold text-sm ${service.minPrice === 0 ? 'text-green-600' : 'text-primary'}`}>
                              {service.minPrice === 0 ? (
                                'FREE'
                              ) : service.minPrice && service.maxPrice ? (
                                `${formatCurrency(service.minPrice)} - ${formatCurrency(service.maxPrice)}`
                              ) : service.minPrice ? (
                                `From ${formatCurrency(service.minPrice)}`
                              ) : (
                                'Price on request'
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {sortedServices.map((service: Service) => (
                    <Link key={service.id} href={`/services/${service.id}`} className="group">
                      <Card className="glass-card hover-lift overflow-hidden mb-2">
                        <CardContent className="p-3 sm:p-6">
                          <div className="flex gap-3 sm:gap-4">
                            <div className="w-28 h-32 sm:w-32 sm:h-24 md:w-40 md:h-32 relative overflow-hidden rounded-lg flex-shrink-0">
                              {service.images && service.images.length > 0 ? (
                                <Image
                                  src={service.images[0]}
                                  alt={service.title}
                                  fill
                                  sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
                                  className="object-cover group-hover:scale-110 transition-smooth"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">No image</span>
                                </div>
                              )}
                              {service.portfolioUrl && (
                                <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1">
                                  <Check className="w-2 h-2 sm:w-3 sm:h-3" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex justify-between items-start mb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-1 mb-1">
                                    {service.title}
                                  </h3>
                                </div>
                                {/* Show FREE badge if minPrice is 0 */}
                                {service.minPrice === 0 && (
                                  <Badge className="bg-green-500 text-white text-xs px-2 py-1 flex-shrink-0 whitespace-nowrap">
                                    FREE
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                                {service.description || 'No description available'}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                                <div className="flex items-baseline space-x-2 flex-wrap">
                                  <span className={`font-bold text-base sm:text-lg md:text-xl ${service.minPrice === 0 ? 'text-green-600' : 'text-primary'}`}>
                                    {service.minPrice === 0 ? (
                                      'FREE'
                                    ) : service.minPrice && service.maxPrice ? (
                                      `${formatCurrency(service.minPrice)} - ${formatCurrency(service.maxPrice)}`
                                    ) : service.minPrice ? (
                                      `From ${formatCurrency(service.minPrice)}`
                                    ) : (
                                      'Price on request'
                                    )}
                                  </span>
                                </div>
                                <Badge className="bg-primary text-white text-xs px-2 py-1 flex-shrink-0 whitespace-nowrap flex items-center justify-center">
                                  {SERVICE_CATEGORY_TEXT_MAP[service.category] || formatEnumName(service.category || 'OTHER')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}


              {sortedServices.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No services found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
            <div 
              ref={filterModalRef}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-background glass-card p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <FilterDropdown
                  label="Category"
                  value={selectedCategory}
                  onValueChange={(value: string) => handleFilterChange('category', value, true)}
                  options={SERVICE_CATEGORIES}
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
                  label="Experience"
                  value={selectedExperienceRange}
                  onValueChange={(value: string) => handleFilterChange('experience', value, true)}
                  options={EXPERIENCE_RANGES}
                  placeholder="Select experience"
                  isMobile={true}
                />
                <Separator className="my-6" />
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">
                    Min Price: {formatCurrency(minPrice[0])}
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={minPrice}
                      onValueChange={(value) => handleFilterChange('minPrice', value[0], true)}
                      max={5000}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>₹0</span>
                      <span>₹5,000</span>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">
                    Max Price: {formatCurrency(maxPrice[0])}
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={maxPrice}
                      onValueChange={(value) => handleFilterChange('maxPrice', value[0], true)}
                      max={50000}
                      min={1000}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>₹1,000</span>
                      <span>₹50,000</span>
                    </div>
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
  );
}