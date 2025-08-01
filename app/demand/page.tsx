'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MessageSquare, Calendar, User, SlidersHorizontal } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const categories = [
  'All Categories',
  // Product categories
  'ELECTRONICS',
  'BOOKS', 
  'CLOTHING',
  'FURNITURE',
  'SPORTS',
  'VEHICLES',
  'FOOD',
  'STATIONERY',
  // Service categories
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

export default function DemandsPage() {
  const [demands, setDemands] = useState([])
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

  const filteredDemands = demands.filter((demand: any) => {
    const matchesSearch = demand.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (demand.description && demand.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const demandCategory = demand.productCategory || demand.serviceCategory
    const matchesCategory = selectedCategory === 'All Categories' || demandCategory === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedDemands = [...filteredDemands].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      default:
        return 0
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Demands</h1>
            <p className="text-muted-foreground">See what your fellow students are looking for</p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search demands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass border-white/20"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="glass border-white/20"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
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
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCategory('All Categories')
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
              {sortedDemands.length} demand{sortedDemands.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Demands List */}
          <div className="space-y-4">
            {sortedDemands.map((demand: any) => (
              <Link key={demand.id} href={`/demand/${demand.id}`} className="group">
                <Card className="glass-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {demand.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {demand.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {demand.productCategory && (
                          <Badge variant="secondary">
                            Product: {demand.productCategory}
                          </Badge>
                        )}
                        {demand.serviceCategory && (
                          <Badge variant="outline">
                            Service: {demand.serviceCategory}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {demand.owner?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(demand.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center text-primary hover:text-primary/80">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Respond
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {sortedDemands.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No demands found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
