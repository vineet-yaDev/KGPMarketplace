'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MessageSquare, Plus, Filter, X } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Demand} from '@/lib/types'  // Import the Demand type
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES } from '@/lib/constants'  // Import the categories constants

export default function DemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([])  // Use Demand type here
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchDemands()
  }, [])

  const fetchDemands = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/demands')
      const data = await response.json()
      
      if (response.ok) {
        setDemands(data.demands || [])
      } else {
        console.error('Failed to fetch demands:', data.error)
      }
    } catch (error) {
      console.error('Error fetching demands:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDemands = demands.filter((demand: Demand) => {  // Use Demand type here
    const matchesSearch = demand.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (demand.description && demand.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const demandCategory = demand.productCategory || demand.serviceCategory
    const matchesCategory = selectedCategory === 'All Categories' || demandCategory === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedDemands = [...filteredDemands].sort((a: Demand, b: Demand) => {  // Use Demand type here
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      default:
        return 0
    }
  })

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const clearFilters = () => {
    setSelectedCategory('All Categories')
    setSearchQuery('')
    setSortBy('newest')
    setShowFilters(false)
  }

  const hasActiveFilters = selectedCategory !== 'All Categories' || searchQuery || sortBy !== 'newest'

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading demands...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header with Add Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Student Demands
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover what your fellow students are looking for
              </p>
            </div>
            
            {/* Big Add Demand Button */}
            <Button 
              size="lg" 
              className="btn-gradient-primary text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link href="/add?type=demand">
                <Plus className="w-6 h-6 mr-2" />
                Post a Demand
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="glass-card rounded-xl shadow-lg mb-8">
            <div className="p-6">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search for products, services, or anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 text-lg glass border-white/20 rounded-lg focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-3 rounded-lg transition-all ${
                    showFilters 
                      ? 'btn-gradient-primary' 
                      : 'glass border-white/20 hover:bg-white/10'
                  }`}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-2 bg-orange-500 text-white text-xs">
                      {[selectedCategory !== 'All Categories', searchQuery, sortBy !== 'newest'].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="glass border-white/20 rounded-lg">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="glass-card rounded-lg border-white/20">
                      <SelectItem key="All Categories" value="All Categories" className="hover:bg-white/10">
                        All Categories
                      </SelectItem>
                      {[...PRODUCT_CATEGORIES, ...SERVICE_CATEGORIES].map(category => (
                        <SelectItem key={category} value={category} className="hover:bg-white/10">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="glass border-white/20 rounded-lg">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="glass-card rounded-lg border-white/20">
                      <SelectItem value="newest" className="hover:bg-white/10">Newest First</SelectItem>
                      <SelectItem value="oldest" className="hover:bg-white/10">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="md:col-span-2 flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="glass border-white/20 hover:bg-white/10 flex-1 rounded-lg"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground">
                <span className="font-semibold text-white">{sortedDemands.length}</span> demand{sortedDemands.length !== 1 ? 's' : ''} found
              </p>
              {hasActiveFilters && (
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Filtered
                </Badge>
              )}
            </div>
          </div>

          {/* Demands Grid */}
          <div className="grid grid-cols-1 gap-6">
            {sortedDemands.map((demand: Demand) => (  // Use Demand type here
              <Link key={demand.id} href={`/demand/${demand.id}`} className="group">
                <Card className="glass-card hover-lift transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 border-white/10 rounded-xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            {demand.productCategory && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                Product: {demand.productCategory}
                              </Badge>
                            )}
                            {demand.serviceCategory && (
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                Service: {demand.serviceCategory}
                              </Badge>
                            )}
                            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                              DEMAND
                            </Badge>
                          </div>
                          
                          <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            {demand.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-base leading-relaxed line-clamp-3">
                            {demand.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={demand.owner?.image || ''} alt={demand.owner?.name || ''} />
                              <AvatarFallback className="bg-gradient-primary text-white text-sm">
                                {demand.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {demand.owner?.name || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(demand.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Button 
                            size="sm" 
                            className="btn-gradient-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Respond
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {sortedDemands.length === 0 && (
            <div className="text-center py-16">
              <div className="glass-card p-12 rounded-2xl max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No demands found</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  {hasActiveFilters 
                    ? "Try adjusting your search criteria or clear the filters" 
                    : "Be the first to post a demand and let others know what you're looking for!"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="glass border-white/20"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button className="btn-gradient-primary" asChild>
                    <Link href="/add?type=demand">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Demand
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}