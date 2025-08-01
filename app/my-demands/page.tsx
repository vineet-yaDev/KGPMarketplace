'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, MoreVertical, MessageSquare, Calendar } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'

export default function MyDemandsPage() {
  const { userEmail } = useAuth()
  const [demands, setDemands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userEmail) {
      fetchMyDemands()
    }
  }, [userEmail])

  const fetchMyDemands = async () => {
    try {
      const response = await fetch('/api/user/demands')
      const data = await response.json()
      setDemands(data.demands || [])
    } catch (error) {
      console.error('Error fetching demands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (demandId: string) => {
    if (confirm('Are you sure you want to delete this demand?')) {
      try {
        await fetch(`/api/demands/${demandId}`, { method: 'DELETE' })
        setDemands(demands.filter((d: any) => d.id !== demandId))
      } catch (error) {
        console.error('Error deleting demand:', error)
      }
    }
  }

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your demands...</p>
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
              <h1 className="text-3xl font-bold mb-2">My Demands</h1>
              <p className="text-muted-foreground">Manage your posted demands</p>
            </div>
            <Button asChild className="btn-gradient-primary">
              <Link href="/sell">
                <Plus className="w-4 h-4 mr-2" />
                Add Demand
              </Link>
            </Button>
          </div>

          {demands.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No demands yet</h3>
              <p className="text-muted-foreground mb-4">Let others know what you're looking for</p>
              <Button asChild className="btn-gradient-primary">
                <Link href="/sell">Post Your First Demand</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {demands.map((demand: any) => (
                <Card key={demand.id} className="glass-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{demand.title}</h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {demand.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="secondary">
                          {demand.category?.name || demand.serviceCategory?.name || 'General'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="glass hover:bg-white/20">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass">
                            <DropdownMenuItem asChild>
                              <Link href={`/demand/${demand.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(demand.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Posted {formatDate(demand.createdAt)}
                      </div>
                      <Badge variant="outline">
                        {demand.demandType}
                      </Badge>
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
