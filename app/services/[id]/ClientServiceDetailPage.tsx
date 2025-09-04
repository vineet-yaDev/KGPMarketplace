'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Calendar, ChevronLeft, ChevronRight, Clock, ExternalLink, Edit, Trash2, AlertTriangle, Maximize2, ZoomIn, ZoomOut, X, Package, MessageSquare } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Service, Product, ServiceDetailResponse } from '@/lib/types'
import { SERVICE_CATEGORY_TEXT_MAP } from '@/lib/constants'
import { useSession } from 'next-auth/react'

interface ClientServiceDetailPageProps {
  initialData?: ServiceDetailResponse
  serviceId?: string
}

export default function ClientServiceDetailPage({ 
  initialData, 
  serviceId 
}: ClientServiceDetailPageProps) {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [service, setService] = useState<Service | null>(initialData?.service || null)
  const [similarServices, setSimilarServices] = useState<Service[]>(initialData?.similarServices || [])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialData?.relatedProducts || [])
  const [loading, setLoading] = useState(!initialData?.service)
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Fullscreen photo viewer states
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)

  // Check if current user owns this service
  const isOwner = session?.user?.email === service?.owner?.email

  // Separate function to load similar content after main service loads
  const fetchSimilarContent = useCallback(async (category: string, excludeId: string) => {
    try {
      setLoadingSimilar(true)
      const [similarResponse, productsResponse] = await Promise.all([
        fetch(`/api/services?category=${category}&exclude=${excludeId}&limit=6`),
        fetch(`/api/products?limit=6`)
      ])
      
      if (similarResponse.ok) {
        const similarData = await similarResponse.json()
        setSimilarServices(similarData.services || [])
      }
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setRelatedProducts(productsData.products || [])
      }
    } catch (error) {
      console.error('Error fetching similar content:', error)
    } finally {
      setLoadingSimilar(false)
    }
  }, [])

  const fetchServiceDetails = useCallback(async () => {
    try {
      setLoading(true)
      const id = (serviceId ?? (params.id as string))
      const response = await fetch(`/api/services/${id}`, { cache: 'no-store' })
      const data: ServiceDetailResponse = await response.json()

      if (response.ok) {
        setService(data.service)
        setLoading(false) // Show service details immediately
        
        // Load similar content separately for faster perceived performance
        if (data.service.category) {
          fetchSimilarContent(data.service.category, id)
        }
      } else {
        console.error('Failed to fetch service:', data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching service:', error)
      setLoading(false)
    }
  }, [params.id, serviceId, fetchSimilarContent])

  // Handle initial data and progressive loading
  useEffect(() => {
    if (initialData?.service) {
      // We have server data - show service immediately
      setService(initialData.service)
      setLoading(false)
      
      // Load similar content separately for better performance
      if (initialData.service.category) {
        fetchSimilarContent(initialData.service.category, initialData.service.id)
      }
    } else {
      // No initial data - fetch everything
      const id = (serviceId ?? (params.id as string))
      if (id) fetchServiceDetails()
    }
  }, [initialData, fetchServiceDetails, fetchSimilarContent, params.id, serviceId])

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
        setZoom(1)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFullscreen])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const nextImage = useCallback(() => {
    if (service?.images && service.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === service.images.length - 1 ? 0 : prev + 1
      )
    }
  }, [service?.images])

  const prevImage = useCallback(() => {
    if (service?.images && service.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? service.images.length - 1 : prev - 1
      )
    }
  }, [service?.images])

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isFullscreen) return
      
      switch(e.key) {
        case 'Escape':
          setIsFullscreen(false)
          setZoom(1)
          break
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
        case '0':
          setZoom(1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen, nextImage, prevImage])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setZoom(1) // reset zoom when toggling
  }

  // Enhanced zoom functions
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))

  const handleDeleteService = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/services/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push(`/user/${session?.user?.id}`)
      } else {
        const data = await response.json()
        console.error('Failed to delete service:', data.error)
        alert('Failed to delete service. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Failed to delete service. Please try again.')
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
            <p className="text-muted-foreground">Loading service details...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!service) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Service not found</h2>
            <p className="text-muted-foreground mb-4">The service you&apos;re looking for doesn&apos;t exist.</p>
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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header with Owner Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="glass"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Owner Action Buttons */}
            {isOwner && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="glass border-white/20"
                  asChild
                >
                  <Link href={`/add?edit=${service.id}&type=service`}>
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
                        Delete Service
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{service.title}&rdquo;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteService}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Service
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {/* Main Service Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery - Left Side */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-xl glass-card bg-white/5">
                {service.images && service.images.length > 0 ? (
                  <>
                    <Image
                      src={service.images[selectedImageIndex]}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                      priority
                    />
                    {service.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 glass z-10"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 glass z-10"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Fullscreen toggle button bottom right */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-2 right-2 glass z-10"
                      onClick={toggleFullscreen}
                      title="View Fullscreen"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {service.images && service.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {service.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index 
                          ? 'border-primary' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image}
                          alt={`${service.title} ${index + 1}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Details - Right Side */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <Badge variant="secondary">{SERVICE_CATEGORY_TEXT_MAP[service.category]}</Badge>
                </div>
                <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
                
                {/* Price */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl font-bold text-primary">
                    {service.minPrice && service.maxPrice ? (
                      <span>{formatCurrency(service.minPrice)} - {formatCurrency(service.maxPrice)}</span>
                    ) : service.minPrice ? (
                      <span>From {formatCurrency(service.minPrice)}</span>
                    ) : (
                      <span>Price on request</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {service.description && (
                  <div className="glass-card p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-3">About This Service</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{service.description}</p>
                  </div>
                )}

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {service.experienceYears !== undefined && service.experienceYears !== null && (
                    <div className="glass-card p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-semibold flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.experienceYears}+ years
                      </p>
                    </div>
                  )}
                  {service.addressHall && (
                    <div className="glass-card p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {service.addressHall}
                      </p>
                    </div>
                  )}
                </div>

                {/* Portfolio Link Button */}
                {service.portfolioUrl && (
                  <div className="mb-6">
                    <Button
                      className="btn-gradient-primary w-full"
                      asChild
                    >
                      <a href={service.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Portfolio
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Service Provider Info */}
              <div className="glass-card p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Service Provider</h3>
                <div className="flex items-center space-x-4">
                  <Link href={`/user/${service.ownerId}`}>
                    <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <AvatarImage src={service.owner?.image || ''} alt={service.owner?.name || ''} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {service.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/user/${service.ownerId}`} className="hover:text-primary transition-colors">
                      <p className="font-semibold">{service.owner?.name || 'Unknown Provider'}</p>
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Offering since {formatDate(service.createdAt)}
                    </p>
                  </div>
                </div>
                
                {/* Contact Actions */}
                {!isOwner && (
                  <div className="flex space-x-3 mt-4">
                    {service.mobileNumber && (
                      <Button className="btn-gradient-primary flex-1" asChild>
                        <a 
                          href={`https://wa.me/+91${service.mobileNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="glass border-white/20 flex-1" asChild>
                      <Link href={`/user/${service.ownerId}`}>
                        <Package className="w-4 h-4 mr-2" />
                        View Listings
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fullscreen Photo Viewer Overlay */}
          {isFullscreen && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
              {/* Close button - Top Right */}
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleFullscreen}
                className="absolute top-6 right-6 text-white z-20 p-3"
              >
                <X className="w-8 h-8" />
              </Button>

              {/* Navigation Arrows */}
              {service.images && service.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white z-20 p-4"
                  >
                    <ChevronLeft className="w-10 h-10" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white z-20 p-4"
                  >
                    <ChevronRight className="w-10 h-10" />
                  </Button>
                </>
              )}

              {/* Main Image Container */}
              <div className="w-full h-full flex items-center justify-center p-20">
                <div 
                  className="relative w-full h-full flex items-center justify-center overflow-hidden"
                  style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
                >
                  <Image
                    src={service.images?.[selectedImageIndex] || ''}
                    alt={service.title}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    style={{ 
                      transform: `scale(${zoom})`, 
                      transition: 'transform 0.3s ease',
                    }}
                    draggable={false}
                  />
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
                {/* Zoom Controls */}
                <Button 
                  variant="ghost" 
                  onClick={zoomOut} 
                  disabled={zoom <= 0.5}
                  className="text-white p-2"
                >
                  <ZoomOut className="w-5 h-5" />
                </Button>
                
                <span className="text-white font-medium text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <Button 
                  variant="ghost" 
                  onClick={zoomIn} 
                  disabled={zoom >= 3}
                  className="text-white p-2"
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>

                {/* Image Counter */}
                {service.images && service.images.length > 1 && (
                  <>
                    <div className="w-px h-6 bg-white/30 mx-2"></div>
                    <span className="text-white/80 text-sm">
                      {selectedImageIndex + 1} / {service.images.length}
                    </span>
                  </>
                )}

                {/* Reset Zoom Button */}
                {zoom !== 1 && (
                  <>
                    <div className="w-px h-6 bg-white/30 mx-2"></div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setZoom(1)}
                      className="text-white text-sm px-3 py-1"
                    >
                      Reset
                    </Button>
                  </>
                )}
              </div>

              {/* Keyboard Hint */}
              <div className="absolute top-6 left-6 text-white/60 text-sm">
                Press ESC to close
              </div>
            </div>
          )}

          {/* Similar Services Section */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Similar Services</h2>
            {loadingSimilar ? (
              <div className="overflow-x-auto">
                <div className="flex space-x-3 sm:space-x-4 pb-4" style={{ width: 'max-content' }}>
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="flex-shrink-0 w-48 sm:w-64">
                      <Card className="glass-card h-full">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted animate-pulse"></div>
                        <CardContent className="p-3 sm:p-4">
                          <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="flex items-center justify-between">
                            <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                            <div className="h-6 bg-muted rounded animate-pulse w-12"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ) : similarServices.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex space-x-3 sm:space-x-4 pb-4" style={{ width: 'max-content' }}>
                  {similarServices.map((similarService: Service) => (
                    <Link 
                      key={similarService.id} 
                      href={`/services/${similarService.id}`}
                      className="group flex-shrink-0 w-48 sm:w-64"
                    >
                      <Card className="glass-card hover-lift h-full">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          {similarService.images && similarService.images.length > 0 ? (
                            <Image
                              src={similarService.images[0]}
                              alt={similarService.title}
                              fill
                              sizes="(max-width: 640px) 192px, 256px"
                              className="object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="text-sm sm:text-base font-semibold truncate mb-2 group-hover:text-primary transition-colors">
                            {similarService.title}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-primary font-bold text-xs sm:text-sm">
                              {similarService.minPrice && similarService.maxPrice ? (
                                <span>{formatCurrency(similarService.minPrice)} - {formatCurrency(similarService.maxPrice)}</span>
                              ) : similarService.minPrice ? (
                                <span>From {formatCurrency(similarService.minPrice)}</span>
                              ) : (
                                <span>Price on request</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              by {similarService.owner?.name || 'Unknown'}
                            </p>
                            {similarService.experienceYears !== undefined && similarService.experienceYears !== null && (
                              <Badge variant="outline" className="text-xs">
                                {similarService.experienceYears}+ years
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No similar services found.</p>
            )}
          </div>

          {/* Related Products Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Products</h2>
            {loadingSimilar ? (
              <div className="overflow-x-auto">
                <div className="flex space-x-3 sm:space-x-4 pb-4" style={{ width: 'max-content' }}>
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="flex-shrink-0 w-48 sm:w-64">
                      <Card className="glass-card h-full">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted animate-pulse"></div>
                        <CardContent className="p-3 sm:p-4">
                          <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="flex items-center justify-between">
                            <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                            <div className="h-6 bg-muted rounded animate-pulse w-12"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ) : relatedProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex space-x-3 sm:space-x-4 pb-4" style={{ width: 'max-content' }}>
                  {relatedProducts.map((product: Product) => (
                    <Link 
                      key={product.id} 
                      href={`/products/${product.id}`}
                      className="group flex-shrink-0 w-48 sm:w-64"
                    >
                      <Card className="glass-card hover-lift h-full">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              sizes="(max-width: 640px) 192px, 256px"
                              className="object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="text-sm sm:text-base font-semibold truncate mb-2 group-hover:text-primary transition-colors">
                            {product.title}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            {product.price && (
                              <span className="text-sm sm:text-base font-bold text-primary">
                                {formatCurrency(product.price)}
                              </span>
                            )}
                            {product.condition !== undefined && product.condition !== null && (
                              <Badge variant="outline" className="text-xs">
                                Condition: {product.condition}/5
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            by {product.owner?.name || 'Unknown'}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No related products found.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
