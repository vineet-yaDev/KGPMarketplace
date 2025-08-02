'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Calendar, Phone, ChevronLeft, ChevronRight, Edit, Trash2, CheckCircle, AlertTriangle, Package, Maximize2, ZoomIn, ZoomOut, X, ExternalLink, FileText, Clock } from 'lucide-react'
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

  // Check if current user owns this product
  const isOwner = session?.user?.email === product?.owner?.email

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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header with Owner Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="glass hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>

            {/* Owner Action Buttons */}
            {isOwner && (
              <div className="flex items-center space-x-2">
                {product.status === 'LISTED' && (
                  <Button
                    onClick={handleMarkSold}
                    disabled={isMarkingSold}
                    className="btn-gradient-primary"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isMarkingSold ? 'Marking...' : 'Mark as Sold'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="glass border-white/20"
                  asChild
                >
                  <Link href={`/add?edit=${product.id}&type=product`}>
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
            <div className="mb-6">
              <Badge 
                className={`text-lg px-4 py-2 ${
                  product.status === 'SOLD' ? 'bg-red-500' : 'bg-orange-500'
                }`}
              >
                {product.status}
              </Badge>
            </div>
          )}

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery - Left Side */}
            <div className="space-y-4">
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
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 glass hover:bg-white/20 z-10"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 glass hover:bg-white/20 z-10"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Fullscreen toggle button bottom right */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-2 right-2 glass hover:bg-white/20 z-10"
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
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image: string, index: number) => (
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
                          alt={`${product.title} ${index + 1}`}
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

            {/* Product Details - Right Side */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <Badge variant="outline">{getProductTypeText(product.productType)}</Badge>
                  {product.seasonality !== 'NONE' && (
                    <Badge variant="outline">{getSeasonalityText(product.seasonality)}</Badge>
                  )}
                  {product.originalPrice && product.price && (
                    <Badge className="bg-red-500 text-white">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
                
                {/* Price */}
                <div className="flex items-center space-x-3 mb-4">
                  {product.price && (
                    <span className="text-3xl font-bold text-primary">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>

              {/* Description */}
              {product.description && (
                <div className="glass-card p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-semibold">{getConditionText(product.condition)} ({product.condition}/5)</p>
                  </div>
                  {product.addressHall && (
                    <div className="glass-card p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {product.addressHall}
                      </p>
                    </div>
                  )}
                  {product.ageInMonths !== undefined && product.ageInMonths !== null && (
                    <div className="glass-card p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-semibold flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {product.ageInMonths} months
                      </p>
                    </div>
                  )}
                </div>

                {/* E-commerce Link Button */}
                {product.ecommerceLink && (
                  <div className="mb-6">
                    <Button
                      className="btn-gradient-primary w-full"
                      asChild
                    >
                      <a href={product.ecommerceLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on E-commerce Site
                      </a>
                    </Button>
                  </div>
                )}
              </div>
              {/* Invoice Image */}
              {product.invoiceImageUrl && (
                <div className="glass-card p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Invoice/Receipt
                  </h3>
                  <div className="relative max-w-full max-h-60">
                    <Image
                      src={product.invoiceImageUrl}
                      alt="Invoice"
                      width={400}
                      height={240}
                      className="object-contain rounded border glass"
                    />
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="glass-card p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
                <div className="flex items-center space-x-4">
                  <Link href={`/user/${product.ownerId}`}>
                    <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <AvatarImage src={product.owner?.image || ''} alt={product.owner?.name || ''} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {product.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/user/${product.ownerId}`} className="hover:text-primary transition-colors">
                      <p className="font-semibold">{product.owner?.name || 'Unknown Seller'}</p>
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Listed on {formatDate(product.createdAt)}
                    </p>
                  </div>
                </div>
                
                {/* Contact Actions */}
                {!isOwner && (
                  <div className="flex space-x-3 mt-4">
                    {product.mobileNumber && (
                      <Button className="btn-gradient-primary flex-1" asChild>
                        <a href={`tel:${product.mobileNumber}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call Seller
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="glass border-white/20 flex-1" asChild>
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

{/* Fullscreen Photo Viewer Overlay - Improved */}
{isFullscreen && (
  <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
    {/* Close button - Top Right */}
    <Button
      variant="ghost"
      size="lg"
      onClick={toggleFullscreen}
      className="absolute top-6 right-6 text-white hover:bg-white/20 z-20 p-3"
    >
      <X className="w-8 h-8" />
    </Button>

    {/* Left Navigation Arrow */}
    {product.images && product.images.length > 1 && (
      <Button
        variant="ghost"
        size="lg"
        onClick={prevImage}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-20 p-4"
      >
        <ChevronLeft className="w-10 h-10" />
      </Button>
    )}

    {/* Right Navigation Arrow */}
    {product.images && product.images.length > 1 && (
      <Button
        variant="ghost"
        size="lg"
        onClick={nextImage}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-20 p-4"
      >
        <ChevronRight className="w-10 h-10" />
      </Button>
    )}

    {/* Main Image Container */}
    <div className="w-full h-full flex items-center justify-center p-20">
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

    {/* Bottom Controls */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
      {/* Zoom Controls */}
      <Button 
        variant="ghost" 
        onClick={zoomOut} 
        disabled={zoom <= 0.5}
        className="text-white hover:bg-white/20 p-2"
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
        className="text-white hover:bg-white/20 p-2"
      >
        <ZoomIn className="w-5 h-5" />
      </Button>

      {/* Image Counter */}
      {product.images && product.images.length > 1 && (
        <>
          <div className="w-px h-6 bg-white/30 mx-2"></div>
          <span className="text-white/80 text-sm">
            {selectedImageIndex + 1} / {product.images.length}
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
            className="text-white hover:bg-white/20 text-sm px-3 py-1"
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


          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4" style={{ width: 'max-content' }}>
                  {similarProducts.map((similarProduct: Product) => (
                    <Link 
                      key={similarProduct.id} 
                      href={`/products/${similarProduct.id}`}
                      className="group flex-shrink-0 w-64"
                    >
                      <Card className="glass-card hover-lift h-full">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          {similarProduct.images && similarProduct.images.length > 0 ? (
                            <Image
                              src={similarProduct.images[0]}
                              alt={similarProduct.title}
                              fill
                              sizes="256px"
                              className="object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold truncate mb-2 group-hover:text-primary transition-colors">
                            {similarProduct.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            {similarProduct.price && (
                              <span className="font-bold text-primary">
                                {formatCurrency(similarProduct.price)}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getConditionText(similarProduct.condition)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            by {similarProduct.owner?.name || 'Unknown'}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Services Section */}
          {relatedServices.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Related Services</h2>
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4" style={{ width: 'max-content' }}>
                  {relatedServices.map((service: Service) => (
                    <Link 
                      key={service.id} 
                      href={`/services/${service.id}`}
                      className="group flex-shrink-0 w-64"
                    >
                      <Card className="glass-card hover-lift h-full">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          {service.images && service.images.length > 0 ? (
                            <Image
                              src={service.images[0]}
                              alt={service.title}
                              fill
                              sizes="256px"
                              className="object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold truncate mb-2 group-hover:text-primary transition-colors">
                            {service.title}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-primary font-bold text-sm">
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
                          <p className="text-xs text-muted-foreground">
                            by {service.owner?.name || 'Unknown'}
                          </p>
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