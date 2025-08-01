'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, MoreVertical, Star } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'

export default function MyServicesPage() {
  const { userEmail } = useAuth()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userEmail) {
      fetchMyServices()
    }
  }, [userEmail])

  const fetchMyServices = async () => {
    try {
      const response = await fetch('/api/user/services')
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await fetch(`/api/services/${serviceId}`, { method: 'DELETE' })
        setServices(services.filter((s: any) => s.id !== serviceId))
      } catch (error) {
        console.error('Error deleting service:', error)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your services...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Services</h1>
              <p className="text-muted-foreground">Manage your offered services</p>
            </div>
            <Button asChild className="btn-gradient-primary">
              <Link href="/sell">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Link>
            </Button>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-muted-foreground mb-4">Start offering your skills to the community</p>
              <Button asChild className="btn-gradient-primary">
                <Link href="/sell">Add Your First Service</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any) => (
                <Card key={service.id} className="glass-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">{service.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="glass hover:bg-white/20">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass">
                          <DropdownMenuItem asChild>
                            <Link href={`/services/${service.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">
                          ₹{service.minPrice} - ₹{service.maxPrice || service.minPrice}
                        </span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm">4.5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {service.serviceCategory?.name || 'General'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {service.experienceYears}+ years exp
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
