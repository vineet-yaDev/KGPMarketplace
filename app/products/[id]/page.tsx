'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, CheckCircle, AlertTriangle, Package, Maximize2, ZoomIn, ZoomOut, X, ExternalLink, FileText, Clock, MessageSquareCode } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Product, Service, ProductDetailResponse } from '@/lib/types'
import { CONDITION_TEXT_MAP, PRODUCT_TYPE_TEXT_MAP, SEASONALITY_TEXT_MAP } from '@/lib/constants'
import { useSession } from 'next-auth/react'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [relatedServices, setRelatedServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMarkingSold, setIsMarkingSold] = useState(false)
  
  // Fullscreen photo viewer states
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showInvoice, setShowInvoice] = useState(false)
  const invoiceModalRef = useRef<HTMLDivElement>(null)

  // Check if current user owns this product
  const isOwner = session?.user?.email === product?.owner?.email

  // Close invoice modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (invoiceModalRef.current && !invoiceModalRef.current.contains(event.target as Node)) {
        setShowInvoice(false)
      }
    }

    if (showInvoice) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [showInvoice])

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${params.id}`)
      const data: ProductDetailResponse = await response.json()

      if (response.ok) {
        setProduct(data.product)
        setSimilarProducts(data.similarProducts || [])
        setRelatedServices(data.relatedServices || [])
      } else {
        console.error('Failed to fetch product:', data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchProductDetails()
    }
  }, [params.id, fetchProductDetails])

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
          setZoom(1)
        } else if (showInvoice) {
          setShowInvoice(false)
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFullscreen, showInvoice])

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

  const getConditionText = (condition: number): string => {
    return CONDITION_TEXT_MAP[condition] || 'Unknown'
  }

  const getProductTypeText = (type: string): string => {
    return PRODUCT_TYPE_TEXT_MAP[type as keyof typeof PRODUCT_TYPE_TEXT_MAP] || type
  }

  const getSeasonalityText = (seasonality: string): string => {
    return SEASONALITY_TEXT_MAP[seasonality as keyof typeof SEASONALITY_TEXT_MAP] || seasonality
  }

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      )
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setZoom(1) // reset zoom when toggling
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5))

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push(`/user/${session?.user?.id}`)
      } else {
        const data = await response.json()
        console.error('Failed to delete product:', data.error)
        alert('Failed to delete product. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMarkSold = async () => {
    try {
      setIsMarkingSold(true)
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SOLD' })
      })

      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
        alert('Product marked as sold!')
      } else {
        const data = await response.json()
        console.error('Failed to mark as sold:', data.error)
        alert('Failed to mark as sold. Please try again.')
      }
    } catch (error) {
      console.error('Error marking as sold:', error)
      alert('Failed to mark as sold. Please try again.')
    } finally {
      setIsMarkingSold(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Product not found</h2>
            <p className="text-muted-foreground mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
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
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
          {/* Header with Owner Actions - Responsive */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="glass flex-shrink-0"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Products</span>
              <span className="sm:hidden">Back</span>
            </Button>

            {/* Owner Action Buttons - Responsive */}
{isOwner && (
  <div className="flex items-center gap-1 sm:gap-2">
    {product.status === 'LISTED' && (
      <Button
        onClick={handleMarkSold}
        disabled={isMarkingSold}
        className="btn-gradient-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
        size="sm"
      >
        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden xs:inline">
          {isMarkingSold ? 'Marking...' : 'Mark as Sold'}
        </span>
        <span className="xs:hidden">
          {isMarkingSold ? '...' : 'Mark Sold'}
        </span>
      </Button>
    )}
    
    <Button
      variant="outline"
      className="glass border-white/20 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
      size="sm"
      asChild
    >
      <Link href={`/add?edit=${product.id}&type=product`}>
        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden xs:inline">Edit</span>
        <span className="xs:hidden">Edit</span>
      </Link>
    </Button>

    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={isDeleting}
          className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          size="sm"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </span>
          <span className="xs:hidden">
            {isDeleting ? '...' : 'Del'}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="glass-card mx-2 sm:mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{product.title}&rdquo;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Product
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
)}

          </div>

          {/* Product Status Badge */}
          {product.status !== 'LISTED' && (
            <div className="mb-4 sm:mb-6">
              <Badge 
                className={`text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2 ${
                  product.status === 'SOLD' ? 'bg-red-500' : 'bg-orange-500'
                }`}
              >
                {product.status}
              </Badge>
            </div>
          )}

          {/* Main Product Section - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
            {/* Image Gallery - Left Side */}
            <div className="space-y-3 sm:space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-xl glass-card bg-white/5">
                {product.images && product.images.length > 0 ? (
                  <>
                    <Image
                      src={product.images[selectedImageIndex]}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                      priority
                    />
                    {product.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevImage}
                          className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 glass z-10 p-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={nextImage}
                          className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 glass z-10 p-2"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Fullscreen toggle button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 glass z-10 p-2"
                      onClick={toggleFullscreen}
                      title="View Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image available</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images - Responsive */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index 
                          ? 'border-primary' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 48px, 64px"
                          className="object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details - Right Side */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                  <Badge variant="outline" className="text-xs">{getProductTypeText(product.productType)}</Badge>
                  {product.seasonality !== 'NONE' && (
                    <Badge variant="outline" className="text-xs">{getSeasonalityText(product.seasonality)}</Badge>
                  )}
                  {product.originalPrice && product.price && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">{product.title}</h1>
                
                {/* Price - Responsive */}
                <div className="flex items-center space-x-3 mb-4">
                  {product.price && (
                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-lg sm:text-xl text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description - Responsive */}
              {product.description && (
                <div className="glass-card p-4 sm:p-6 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Description</h3>
                  <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              {/* Key Details Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="glass-card p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground">Condition</p>
                  <p className="text-sm sm:text-base font-semibold">{getConditionText(product.condition)} ({product.condition}/5)</p>
                </div>
                {product.addressHall && (
                  <div className="glass-card p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground">Location</p>
                    <p className="text-sm sm:text-base font-semibold flex items-center">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {product.addressHall}
                    </p>
                  </div>
                )}
                {product.ageInMonths !== undefined && product.ageInMonths !== null && (
                  <div className="glass-card p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground">Age</p>
                    <p className="text-sm sm:text-base font-semibold flex items-center">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {product.ageInMonths} months
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons - Responsive */}
              <div className="space-y-3">
                {/* E-commerce Link Button */}
                {product.ecommerceLink && (
                  <Button
                    className="btn-gradient-primary w-full text-sm sm:text-base"
                    asChild
                  >
                    <a href={product.ecommerceLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on E-commerce Site
                    </a>
                  </Button>
                )}

                {/* Invoice Link Button */}
                {product.invoiceImageUrl && (
                  <Button
                    variant="outline"
                    className="w-full glass border-white/20 text-sm sm:text-base"
                    onClick={() => setShowInvoice(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Invoice/Receipt
                  </Button>
                )}
              </div>

              {/* Seller Info - Responsive */}
              <div className="glass-card p-4 sm:p-6 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Seller Information</h3>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Link href={`/user/${product.ownerId}`}>
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <AvatarImage src={product.owner?.image || ''} alt={product.owner?.name || ''} />
                      <AvatarFallback className="bg-gradient-primary text-white text-sm sm:text-base">
                        {product.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/user/${product.ownerId}`} className="hover:text-primary transition-colors">
                      <p className="text-sm sm:text-base font-semibold truncate">{product.owner?.name || 'Unknown Seller'}</p>
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Listed on {formatDate(product.createdAt)}
                    </p>
                  </div>
                </div>
                
                {/* Contact Actions - Responsive */}
                {!isOwner && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                    {product.mobileNumber && (
                      <Button className="btn-gradient-primary flex-1 text-sm" asChild>
                        <a 
                          href={`https://wa.me/+91${product.mobileNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageSquareCode className="w-4 h-4 mr-2" />
                          WhatsApp Seller
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="glass border-white/20 flex-1 text-sm" asChild>
                      <Link href={`/user/${product.ownerId}`}>
                        <Package className="w-4 h-4 mr-2" />
                        View Listings
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Modal */}
          {showInvoice && product.invoiceImageUrl && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div 
                ref={invoiceModalRef}
                className="bg-background glass-card rounded-xl max-w-4xl max-h-[90vh] overflow-auto"
              >
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Invoice/Receipt
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInvoice(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="relative max-w-full">
                    <Image
                      src={product.invoiceImageUrl}
                      alt="Invoice/Receipt"
                      width={800}
                      height={600}
                      className="object-contain rounded border glass w-full h-auto"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <Button asChild>
                      <a 
                        href={product.invoiceImageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen Photo Viewer Overlay - Responsive */}
          {isFullscreen && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
              {/* Close button - Top Right */}
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleFullscreen}
                className="absolute top-2 right-2 sm:top-6 sm:right-6 text-white z-20 p-2 sm:p-3"
              >
                <X className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>

              {/* Navigation Arrows - Responsive */}
{product.images && product.images.length > 1 && (
  <>
    <Button
      variant="ghost"
      size="lg"
      onClick={prevImage}
      className="absolute left-2 sm:left-6 top-1/2 transform -translate-y-1/2 text-black border border-black bg-white shadow-lg z-20 p-2 sm:p-4"
    >
      <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
    </Button>
    <Button
      variant="ghost"
      size="lg"
      onClick={nextImage}
      className="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 text-black border border-black bg-white shadow-lg z-20 p-2 sm:p-4"
    >
      <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
    </Button>
  </>
)}


              {/* Main Image Container */}
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-20">
                <div 
                  className="relative w-full h-full flex items-center justify-center overflow-hidden"
                  style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
                >
                  <Image
                    src={product.images?.[selectedImageIndex] || ''}
                    alt={product.title}
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

              {/* Bottom Controls - Responsive */}
              <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 sm:space-x-6 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 sm:px-6 sm:py-3">
                {/* Zoom Controls */}
                <Button 
                  variant="ghost" 
                  onClick={zoomOut} 
                  disabled={zoom <= 0.5}
                  className="text-white p-1 sm:p-2"
                >
                  <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                
                <span className="text-white font-medium text-xs sm:text-sm min-w-[40px] sm:min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <Button 
                  variant="ghost" 
                  onClick={zoomIn} 
                  disabled={zoom >= 3}
                  className="text-white p-1 sm:p-2"
                >
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                {/* Image Counter */}
                {product.images && product.images.length > 1 && (
                  <>
                    <div className="w-px h-4 sm:h-6 bg-white/30 mx-1 sm:mx-2"></div>
                    <span className="text-white/80 text-xs sm:text-sm">
                      {selectedImageIndex + 1} / {product.images.length}
                    </span>
                  </>
                )}

                {/* Reset Zoom Button */}
                {zoom !== 1 && (
                  <>
                    <div className="w-px h-4 sm:h-6 bg-white/30 mx-1 sm:mx-2"></div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setZoom(1)}
                      className="text-white text-xs sm:text-sm px-2 py-1 sm:px-3"
                    >
                      Reset
                    </Button>
                  </>
                )}
              </div>

              {/* Keyboard Hint */}
              <div className="absolute top-2 left-2 sm:top-6 sm:left-6 text-white/60 text-xs sm:text-sm">
                Press ESC to close
              </div>
            </div>
          )}

          {/* Similar Products Section - Responsive */}
          {similarProducts.length > 0 && (
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Similar Products</h2>
              <div className="overflow-x-auto">
                <div className="flex space-x-3 sm:space-x-4 pb-4" style={{ width: 'max-content' }}>
                  {similarProducts.map((similarProduct: Product) => (
                    <Link 
                      key={similarProduct.id} 
                      href={`/products/${similarProduct.id}`}
                      className="group flex-shrink-0 w-48 sm:w-64"
                    >
                      <Card className="glass-card hover-lift h-full">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          {similarProduct.images && similarProduct.images.length > 0 ? (
                            <Image
                              src={similarProduct.images[0]}
                              alt={similarProduct.title}
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
                            {similarProduct.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            {similarProduct.price && (
                              <span className="text-sm sm:text-base font-bold text-primary">
                                {formatCurrency(similarProduct.price)}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getConditionText(similarProduct.condition)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Services Section - Responsive */}
          {relatedServices.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Services</h2>
              <div className="overflow-x-auto">
                <div className="flex space-x-3 sm:space-x-4 pb-4" style={{ width: 'max-content' }}>
                  {relatedServices.map((service: Service) => (
                    <Link 
                      key={service.id} 
                      href={`/services/${service.id}`}
                      className="group flex-shrink-0 w-48 sm:w-64"
                    >
                      <Card className="glass-card hover-lift h-full">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          {service.images && service.images.length > 0 ? (
                            <Image
                              src={service.images[0]}
                              alt={service.title}
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
                            {service.title}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-primary font-bold text-xs sm:text-sm">
                              {service.minPrice && service.maxPrice ? (
                                <span>{formatCurrency(service.minPrice)} - {formatCurrency(service.maxPrice)}</span>
                              ) : service.minPrice ? (
                                <span>From {formatCurrency(service.minPrice)}</span>
                              ) : (
                                <span>Price on request</span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {service.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
