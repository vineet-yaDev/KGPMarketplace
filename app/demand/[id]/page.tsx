'use client'

import { useState, useEffect, useCallback } from 'react'  // Added useCallback
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Phone, Edit, Trash2, AlertTriangle, User } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Demand } from '@/lib/types'
import { useSession } from 'next-auth/react'

export default function DemandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [demand, setDemand] = useState<Demand | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if current user owns this demand
  const isOwner = session?.user?.email === demand?.owner?.email

  // Make fetchDemandDetails a useCallback function
  const fetchDemandDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/demands/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setDemand(data.demand)
      } else {
        console.error('Failed to fetch demand:', data)
      }
    } catch (error) {
      console.error('Error fetching demand:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id]) // Include params.id in the dependency array

  useEffect(() => {
    if (params.id) {
      fetchDemandDetails()
    }
  }, [params.id, fetchDemandDetails]) // Add fetchDemandDetails to dependency array

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/demands/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push(`/user/${session?.user?.id}`)
      } else {
        const data = await response.json()
        console.error('Failed to delete demand:', data.error)
        alert('Failed to delete demand. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting demand:', error)
      alert('Failed to delete demand. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading demand details...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!demand) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Demand not found</h2>
            <p className="text-muted-foreground mb-4">The demand you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header with Owner Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="glass hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Demands
            </Button>

            {/* Owner Action Buttons */}
            {isOwner && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="glass border-white/20"
                  asChild
                >
                  <Link href={`/add?edit=${demand.id}&type=demand`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                        Delete Demand
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{demand.title}&rdquo;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Demand
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {/* Main Content - Full Width */}
          <div className="space-y-8">
            {/* Title and Badges - Full Width */}
            <div className="glass-card p-8 rounded-xl">
              <div className="flex items-center flex-wrap gap-2 mb-4">
                {demand.productCategory && (
                  <Badge variant="secondary">{demand.productCategory}</Badge>
                )}
                {demand.serviceCategory && (
                  <Badge variant="secondary">{demand.serviceCategory}</Badge>
                )}
                <Badge className="bg-orange-500 text-white">DEMAND</Badge>
              </div>

              <h1 className="text-4xl font-bold mb-0">{demand.title}</h1>
            </div>

            {/* Description - Full Width */}
            {demand.description && (
              <div className="glass-card p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
                  {demand.description}
                </p>
              </div>
            )}

            {/* User Info and Details - Side by Side Below Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Posted by Card */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Posted by</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <Link href={`/user/${demand.ownerId}`}>
                    <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <AvatarImage src={demand.owner?.image || ''} alt={demand.owner?.name || ''} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {demand.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/user/${demand.ownerId}`} className="hover:text-primary transition-colors">
                      <p className="font-semibold">{demand.owner?.name || 'Unknown User'}</p>
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted on {formatDate(demand.createdAt)}
                    </p>
                  </div>
                </div>
                
                {/* Contact Actions */}
                {!isOwner && (
                  <div className="space-y-3">
                    {demand.mobileNumber && (
                      <Button className="btn-gradient-primary w-full" asChild>
                        <a href={`tel:${demand.mobileNumber}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="glass border-white/20 w-full" asChild>
                      <Link href={`/user/${demand.ownerId}`}>
                        <User className="w-4 h-4 mr-2" />
                        View Listings
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Demand Details Card */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Demand Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">
                      {demand.productCategory ? 'Product' : demand.serviceCategory ? 'Service' : 'General'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted:</span>
                    <span className="font-medium">{formatDate(demand.createdAt)}</span>
                  </div>
                  {demand.mobileNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">Available</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}