'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, Briefcase, MessageSquare, Upload, X, Camera, AlertCircle, Info } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSession } from 'next-auth/react'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'

// Import from your lib files
import { 
  HALL_OPTIONS, 
  PRODUCT_CATEGORY_OPTIONS, 
  SERVICE_CATEGORY_OPTIONS,
  PRODUCT_TYPES,
  SEASONALITIES,
  CONDITION_OPTIONS,
  VALIDATION
} from '@/lib/constants'
import type {
  ProductFormData,
  ServiceFormData,
  DemandFormData,
  KGPHalls,
  ProductCategory,
  ServiceCategory,
  ProductType,
  ProductSeasonality,
  CloudinaryResult,
  CloudinaryError,
} from '@/lib/types'

interface EditProduct {
  title: string;
  description?: string | null;
  price?: number | null;
  originalPrice?: number | null;
  productType: ProductType;
  condition: number;
  ageInMonths?: number | null;
  category: ProductCategory;
  addressHall?: KGPHalls | null;
  mobileNumber?: string | null;
  ecommerceLink?: string | null;
  seasonality: ProductSeasonality;
  images: string[];
}

interface EditService {
  title: string;
  description?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  category: ServiceCategory;
  addressHall?: KGPHalls | null;
  mobileNumber?: string | null;
  experienceYears?: number | null;
  portfolioUrl?: string | null;
  images: string[];
}

interface EditDemand {
  title: string;
  description?: string | null;
  productCategory?: ProductCategory | null;
  serviceCategory?: ServiceCategory | null;
  mobileNumber?: string | null;
}

// Custom Cloudinary options (not using readonly for compatibility)
const cloudinaryOptions = {
  maxFiles: VALIDATION.MAX_IMAGES_PER_LISTING,
  resourceType: "image" as const,
  clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
  maxFileSize: VALIDATION.MAX_IMAGE_SIZE_BYTES,
  cropping: false,
  multiple: true,
  defaultSource: "local" as const,
}

export default function SellContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  // Get edit parameters
  const editId = searchParams.get('edit')
  const editType = searchParams.get('type') as 'product' | 'service' | 'demand' | null
  const isEditing = Boolean(editId && editType)

  const [activeTab, setActiveTab] = useState<'product' | 'service' | 'demand'>(editType || 'product')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadError, setUploadError] = useState<string>('')

  // Product form state
  const [productForm, setProductForm] = useState<ProductFormData>({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    productType: 'USED',
    condition: '3',
    ageInMonths: '',
    category: '' as ProductCategory,
    addressHall: '' as KGPHalls,
    mobileNumber: '',
    ecommerceLink: '',
    seasonality: 'NONE',
    images: []
  })

  // Service form state
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    title: '',
    description: '',
    minPrice: '',
    maxPrice: '',
    category: '' as ServiceCategory,
    addressHall: '' as KGPHalls,
    mobileNumber: '',
    experienceYears: '',
    portfolioUrl: '',
    images: []
  })

  // Demand form state
  const [demandForm, setDemandForm] = useState<DemandFormData>({
    title: '',
    description: '',
    productCategory: '',
    serviceCategory: '',
    mobileNumber: ''
  })

  const loadEditData = useCallback(async () => {
    if (!editId || !editType) return

    try {
      const response = await fetch(`/api/${editType}s/${editId}`)
      const data = await response.json()

      if (response.ok) {
        if (editType === 'product') {
          const product: EditProduct = data.product
          setProductForm({
            title: product.title || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            originalPrice: product.originalPrice?.toString() || '',
            productType: product.productType || 'USED',
            condition: product.condition?.toString() || '3',
            ageInMonths: product.ageInMonths?.toString() || '',
            category: product.category || 'OTHER',
            addressHall: product.addressHall || 'RK',
            mobileNumber: product.mobileNumber || '',
            ecommerceLink: product.ecommerceLink || '',
            seasonality: product.seasonality || 'NONE',
            images: product.images || []
          })
        } else if (editType === 'service') {
          const service: EditService = data.service
          setServiceForm({
            title: service.title || '',
            description: service.description || '',
            minPrice: service.minPrice?.toString() || '',
            maxPrice: service.maxPrice?.toString() || '',
            category: service.category || 'OTHER',
            addressHall: service.addressHall || 'RK',
            mobileNumber: service.mobileNumber || '',
            experienceYears: service.experienceYears?.toString() || '',
            portfolioUrl: service.portfolioUrl || '',
            images: service.images || []
          })
        } else if (editType === 'demand') {
          const demand: EditDemand = data.demand
          setDemandForm({
            title: demand.title || '',
            description: demand.description || '',
            productCategory: demand.productCategory || '',
            serviceCategory: demand.serviceCategory || '',
            mobileNumber: demand.mobileNumber || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading edit data:', error)
    }
  }, [editId, editType])

  useEffect(() => {
    if (isEditing) {
      loadEditData()
    }
  }, [isEditing, loadEditData])

  // Image upload handlers
  const handleProductImageUpload = useCallback((result: CloudinaryResult) => {
    if (result.event === 'success' && result.info && typeof result.info === 'object') {
      const secureUrl = (result.info as { secure_url: string }).secure_url
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, secureUrl]
      }))
      setUploadError('')
    }
  }, [])

  const handleProductImageUploadError = useCallback((error: CloudinaryError) => {
    console.error('Upload error:', error)
    setUploadError('Failed to upload image. Please try again.')
  }, [])

  const handleServiceImageUpload = useCallback((result: CloudinaryResult) => {
    if (result.event === 'success' && result.info && typeof result.info === 'object') {
      const secureUrl = (result.info as { secure_url: string }).secure_url
      setServiceForm(prev => ({
        ...prev,
        images: [...prev.images, secureUrl]
      }))
      setUploadError('')
    }
  }, [])

  const handleServiceImageUploadError = useCallback((error: CloudinaryError) => {
    console.error('Upload error:', error)
    setUploadError('Failed to upload image. Please try again.')
  }, [])

  const removeProductImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const removeServiceImage = (index: number) => {
    setServiceForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Validation functions
  const validateProductForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!productForm.title.trim()) newErrors.title = 'Title is required'
    if (!productForm.category) newErrors.category = 'Category is required'
    if (!productForm.price || parseFloat(productForm.price) <= 0) newErrors.price = 'Valid price is required'
    if (!productForm.addressHall) newErrors.addressHall = 'Hall is required'
    if (!productForm.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required'
    if (productForm.mobileNumber && !VALIDATION.MOBILE_NUMBER_REGEX.test(productForm.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateServiceForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!serviceForm.title.trim()) newErrors.title = 'Service title is required'
    if (!serviceForm.category) newErrors.category = 'Category is required'
    if (!serviceForm.minPrice || parseFloat(serviceForm.minPrice) <= 0) newErrors.minPrice = 'Minimum price is required'
    if (!serviceForm.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required'
    if (serviceForm.mobileNumber && !VALIDATION.MOBILE_NUMBER_REGEX.test(serviceForm.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateDemandForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!demandForm.title.trim()) newErrors.title = 'Title is required'
    if (!demandForm.productCategory && !demandForm.serviceCategory) {
      newErrors.category = 'Please select at least one category'
    }
    if (!demandForm.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required'
    if (demandForm.mobileNumber && !VALIDATION.MOBILE_NUMBER_REGEX.test(demandForm.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form submission handlers
  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session?.user?.email) return

    if (!validateProductForm()) return

    setIsSubmitting(true)
    try {
      const url = isEditing ? `/api/products/${editId}` : '/api/products'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productForm.title,
          description: productForm.description || null,
          price: parseFloat(productForm.price),
          originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
          productType: productForm.productType,
          condition: parseInt(productForm.condition),
          ageInMonths: productForm.ageInMonths ? parseFloat(productForm.ageInMonths) : null,
          category: productForm.category,
          addressHall: productForm.addressHall,
          mobileNumber: productForm.mobileNumber,
          ecommerceLink: productForm.ecommerceLink || null,
          seasonality: productForm.seasonality,
          images: productForm.images
        })
      })

      if (response.ok) {
        if (isEditing) {
          router.push(`/products/${editId}`)
        } else {
          router.push('/products')
        }
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || `Failed to ${isEditing ? 'update' : 'create'} product` })
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} product:`, error)
      setErrors({ submit: `An error occurred while ${isEditing ? 'updating' : 'creating'} the product` })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session?.user?.email) return

    if (!validateServiceForm()) return

    setIsSubmitting(true)
    try {
      const url = isEditing ? `/api/services/${editId}` : '/api/services'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: serviceForm.title,
          description: serviceForm.description || null,
          minPrice: parseFloat(serviceForm.minPrice),
          maxPrice: serviceForm.maxPrice ? parseFloat(serviceForm.maxPrice) : null,
          category: serviceForm.category,
          addressHall: serviceForm.addressHall || null,
          mobileNumber: serviceForm.mobileNumber || null,
          experienceYears: serviceForm.experienceYears ? parseFloat(serviceForm.experienceYears) : null,
          portfolioUrl: serviceForm.portfolioUrl || null,
          images: serviceForm.images
        })
      })

      if (response.ok) {
        if (isEditing) {
          router.push(`/services/${editId}`)
        } else {
          router.push('/services')
        }
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || `Failed to ${isEditing ? 'update' : 'create'} service` })
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} service:`, error)
      setErrors({ submit: `An error occurred while ${isEditing ? 'updating' : 'creating'} the service` })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemandSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session?.user?.email) return

    if (!validateDemandForm()) return

    setIsSubmitting(true)
    try {
      const url = isEditing ? `/api/demands/${editId}` : '/api/demands'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: demandForm.title,
          description: demandForm.description || null,
          productCategory: demandForm.productCategory || null,
          serviceCategory: demandForm.serviceCategory || null,
          mobileNumber: demandForm.mobileNumber || null
        })
      })

      if (response.ok) {
        if (isEditing) {
          router.push(`/demand/${editId}`)
        } else {
          router.push('/demand')
        }
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || `Failed to ${isEditing ? 'update' : 'create'} demand` })
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} demand:`, error)
      setErrors({ submit: `An error occurred while ${isEditing ? 'updating' : 'creating'} the demand` })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cloud name validation
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set')
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {isEditing ? `Edit Your ${editType}` : 'Create Your Listing'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isEditing 
                ? `Update your ${editType} details` 
                : 'Share what you have to offer or what you need with the KGP community'
              }
            </p>
          </div>

          {/* Error Alert */}
          {errors.submit && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Error Alert */}
          {uploadError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {uploadError}
              </AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <Tabs 
                value={activeTab} 
                onValueChange={isEditing ? undefined : (value) => setActiveTab(value as 'product' | 'service' | 'demand')} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 glass mb-8">
                  <TabsTrigger 
                    value="product" 
                    className="flex items-center space-x-2 py-3"
                    disabled={isEditing ? editType !== 'product' : false}
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium">
                      {isEditing && editType === 'product' ? 'Edit Product' : 'Sell Product'}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="service" 
                    className="flex items-center space-x-2 py-3"
                    disabled={isEditing ? editType !== 'service' : false}
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium">
                      {isEditing && editType === 'service' ? 'Edit Service' : 'Offer Service'}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="demand" 
                    className="flex items-center space-x-2 py-3"
                    disabled={isEditing ? editType !== 'demand' : false}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">
                      {isEditing && editType === 'demand' ? 'Edit Demand' : 'Post Demand'}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Product Form */}
                <TabsContent value="product" className="mt-6">
                  <form onSubmit={handleProductSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Info className="w-5 h-5" />
                          <span>Basic Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="product-title">Product Title *</Label>
                            <Input
                              id="product-title"
                              placeholder="e.g. iPhone 13 Pro Max 256GB"
                              value={productForm.title}
                              onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                              className={`glass border-white/20 ${errors.title ? 'border-red-500' : ''}`}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product-category">Category *</Label>
                            <Select 
                              value={productForm.category} 
                              onValueChange={(value) => setProductForm({...productForm, category: value as ProductCategory})}
                            >
                              <SelectTrigger className={`glass border-white/20 ${errors.category ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="glass">
                                {PRODUCT_CATEGORY_OPTIONS.map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="product-description">Description</Label>
                          <Textarea
                            id="product-description"
                            placeholder="Describe your product in detail, including features, condition, and any other relevant information..."
                            value={productForm.description}
                            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                            className="glass border-white/20"
                            rows={5}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pricing & Condition */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Pricing & Condition</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="product-price">Selling Price (₹) *</Label>
                            <Input
                              id="product-price"
                              type="number"
                              placeholder="e.g. 50000"
                              value={productForm.price}
                              onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                              className={`glass border-white/20 ${errors.price ? 'border-red-500' : ''}`}
                            />
                            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product-original-price">Original Price (₹)</Label>
                            <Input
                              id="product-original-price"
                              type="number"
                              placeholder="e.g. 70000"
                              value={productForm.originalPrice}
                              onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                              className="glass border-white/20"
                            />
                            <p className="text-xs text-muted-foreground">Optional: Helps buyers see the value</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product-type">Product Type</Label>
                            <Select 
                              value={productForm.productType} 
                              onValueChange={(value) => setProductForm({...productForm, productType: value as ProductType})}
                            >
                              <SelectTrigger className="glass border-white/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass">
                                {PRODUCT_TYPES.map(type => (
                                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="product-condition">Condition (1-5)</Label>
                            <Select 
                              value={productForm.condition} 
                              onValueChange={(value) => setProductForm({...productForm, condition: value})}
                            >
                              <SelectTrigger className="glass border-white/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass">
                                {CONDITION_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product-age">Age (Months)</Label>
                            <Input
                              id="product-age"
                              type="number"
                              placeholder="e.g. 12"
                              value={productForm.ageInMonths}
                              onChange={(e) => setProductForm({...productForm, ageInMonths: e.target.value})}
                              className="glass border-white/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product-seasonality">Seasonality</Label>
                            <Select 
                              value={productForm.seasonality} 
                              onValueChange={(value) => setProductForm({...productForm, seasonality: value as ProductSeasonality})}
                            >
                              <SelectTrigger className="glass border-white/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass">
                                {SEASONALITIES.map(season => (
                                  <SelectItem key={season.value} value={season.value}>{season.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Images */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Camera className="w-5 h-5" />
                          <span>Product Images</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {productForm.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <Image
                                src={image}
                                alt={`Product ${index + 1}`}
                                width={200}
                                height={128}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeProductImage(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <CldUploadWidget
                            uploadPreset="Marketplace"
                            onSuccess={handleProductImageUpload}
                            onError={handleProductImageUploadError}
                            options={cloudinaryOptions}
                          >
                            {({ open }) => {
                              if (!cloudName) {
                                return (
                                  <div className="h-32 border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center">
                                    <AlertCircle className="w-6 h-6 mb-2 text-red-500" />
                                    <span className="text-sm text-red-500">Config Error</span>
                                  </div>
                                )
                              }
                              
                              return (
                                <div
                                  onClick={() => open()}
                                  className="h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                                >
                                  <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Add Image</span>
                                </div>
                              )
                            }}
                          </CldUploadWidget>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload up to 5 images (JPG, PNG, GIF, WebP). Max 10MB per image. First image will be the main display image.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Contact & Location */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Contact & Location</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="product-hall">Hall *</Label>
                            <Select 
                              value={productForm.addressHall} 
                              onValueChange={(value) => setProductForm({...productForm, addressHall: value as KGPHalls})}
                            >
                              <SelectTrigger className={`glass border-white/20 ${errors.addressHall ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select your hall" />
                              </SelectTrigger>
                              <SelectContent className="glass">
                                {HALL_OPTIONS.map(hall => (
                                  <SelectItem key={hall.value} value={hall.value}>{hall.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.addressHall && <p className="text-red-500 text-sm">{errors.addressHall}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product-mobile">Mobile Number *</Label>
                            <Input
                              id="product-mobile"
                              placeholder="e.g. 9876543210"
                              value={productForm.mobileNumber}
                              onChange={(e) => setProductForm({...productForm, mobileNumber: e.target.value})}
                              className={`glass border-white/20 ${errors.mobileNumber ? 'border-red-500' : ''}`}
                            />
                            {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="product-ecommerce">E-commerce Link</Label>
                          <Input
                            id="product-ecommerce"
                            placeholder="e.g. https://amazon.in/product-link"
                            value={productForm.ecommerceLink}
                            onChange={(e) => setProductForm({...productForm, ecommerceLink: e.target.value})}
                            className="glass border-white/20"
                          />
                          <p className="text-xs text-muted-foreground">Optional: Link to original product page for reference</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Button 
                      type="submit" 
                      className="w-full btn-gradient-primary py-3 text-lg font-semibold" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting 
                        ? (isEditing ? 'Updating Product...' : 'Creating Product...') 
                        : (isEditing ? 'Update Product' : 'Create Product Listing')
                      }
                    </Button>
                  </form>
                </TabsContent>

                {/* Service Form */}
                <TabsContent value="service" className="mt-6">
                  <form onSubmit={handleServiceSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Info className="w-5 h-5" />
                          <span>Service Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="service-title">Service Title *</Label>
                            <Input
                              id="service-title"
                              placeholder="e.g. Python Programming Tutoring"
                              value={serviceForm.title}
                              onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
                              className={`glass border-white/20 ${errors.title ? 'border-red-500' : ''}`}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="service-category">Category *</Label>
                            <Select 
                              value={serviceForm.category} 
                              onValueChange={(value) => setServiceForm({...serviceForm, category: value as ServiceCategory})}
                            >
                              <SelectTrigger className={`glass border-white/20 ${errors.category ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="glass">
                                {SERVICE_CATEGORY_OPTIONS.map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="service-description">Service Description</Label>
                          <Textarea
                            id="service-description"
                            placeholder="Describe your service, experience, what you offer, and any other relevant details..."
                            value={serviceForm.description}
                            onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                            className="glass border-white/20"
                            rows={5}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pricing & Experience */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Pricing & Experience</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="service-min-price">Minimum Price (₹) *</Label>
                            <Input
                              id="service-min-price"
                              type="number"
                              placeholder="e.g. 500"
                              value={serviceForm.minPrice}
                              onChange={(e) => setServiceForm({...serviceForm, minPrice: e.target.value})}
                              className={`glass border-white/20 ${errors.minPrice ? 'border-red-500' : ''}`}
                            />
                            {errors.minPrice && <p className="text-red-500 text-sm">{errors.minPrice}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="service-max-price">Maximum Price (₹)</Label>
                            <Input
                              id="service-max-price"
                              type="number"
                              placeholder="e.g. 2000"
                              value={serviceForm.maxPrice}
                              onChange={(e) => setServiceForm({...serviceForm, maxPrice: e.target.value})}
                              className="glass border-white/20"
                            />
                            <p className="text-xs text-muted-foreground">Optional: Leave blank for &quot;Price on request&quot;</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="service-experience">Experience (Years)</Label>
                            <Input
                              id="service-experience"
                              type="number"
                              step="0.5"
                              placeholder="e.g. 2.5"
                              value={serviceForm.experienceYears}
                              onChange={(e) => setServiceForm({...serviceForm, experienceYears: e.target.value})}
                              className="glass border-white/20"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Service Images */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Camera className="w-5 h-5" />
                          <span>Service Images</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {serviceForm.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <Image
                                src={image}
                                alt={`Service ${index + 1}`}
                                width={200}
                                height={128}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeServiceImage(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <CldUploadWidget
                            uploadPreset="Marketplace"
                            onSuccess={handleServiceImageUpload}
                            onError={handleServiceImageUploadError}
                            options={cloudinaryOptions}
                          >
                            {({ open }) => {
                              if (!cloudName) {
                                return (
                                  <div className="h-32 border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center">
                                    <AlertCircle className="w-6 h-6 mb-2 text-red-500" />
                                    <span className="text-sm text-red-500">Config Error</span>
                                  </div>
                                )
                              }
                              
                              return (
                                <div
                                  onClick={() => open()}
                                  className="h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                                >
                                  <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Add Image</span>
                                </div>
                              )
                            }}
                          </CldUploadWidget>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload images of your work, certificates, or anything that showcases your service.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Contact & Portfolio */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Contact & Portfolio</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="service-hall">Hall</Label>
                            <Select 
                              value={serviceForm.addressHall} 
                              onValueChange={(value) => setServiceForm({...serviceForm, addressHall: value as KGPHalls})}
                            >
                              <SelectTrigger className="glass border-white/20">
                                <SelectValue placeholder="Select your hall (optional)" />
                              </SelectTrigger>
                              <SelectContent className="glass">
                                {HALL_OPTIONS.map(hall => (
                                  <SelectItem key={hall.value} value={hall.value}>{hall.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="service-mobile">Mobile Number</Label>
                            <Input
                              id="service-mobile"
                              placeholder="e.g. 9876543210"
                              value={serviceForm.mobileNumber}
                              onChange={(e) => setServiceForm({...serviceForm, mobileNumber: e.target.value})}
                              className={`glass border-white/20 ${errors.mobileNumber ? 'border-red-500' : ''}`}
                            />
                            {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="service-portfolio">Portfolio URL</Label>
                          <Input
                            id="service-portfolio"
                            placeholder="e.g. https://github.com/username or https://portfolio.com"
                            value={serviceForm.portfolioUrl}
                            onChange={(e) => setServiceForm({...serviceForm, portfolioUrl: e.target.value})}
                            className="glass border-white/20"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Button 
                      type="submit" 
                      className="w-full btn-gradient-primary py-3 text-lg font-semibold" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting 
                        ? (isEditing ? 'Updating Service...' : 'Creating Service...') 
                        : (isEditing ? 'Update Service' : 'Create Service Listing')
                      }
                    </Button>
                  </form>
                </TabsContent>

                {/* Demand Form */}
                <TabsContent value="demand" className="mt-6">
                  <form onSubmit={handleDemandSubmit} className="space-y-8">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <MessageSquare className="w-5 h-5" />
                          <span>What are you looking for?</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="demand-title">Title *</Label>
                          <Input
                            id="demand-title"
                            placeholder="e.g. Looking for MacBook Pro 2020 or newer"
                            value={demandForm.title}
                            onChange={(e) => setDemandForm({...demandForm, title: e.target.value})}
                            className={`glass border-white/20 ${errors.title ? 'border-red-500' : ''}`}
                          />
                          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="demand-description">Description</Label>
                          <Textarea
                            id="demand-description"
                            placeholder="Describe what you're looking for in detail, including specifications, budget range, condition preferences, etc..."
                            value={demandForm.description}
                            onChange={(e) => setDemandForm({...demandForm, description: e.target.value})}
                            className="glass border-white/20"
                            rows={5}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="demand-product-category">Product Category</Label>
                            <Select 
                              value={demandForm.productCategory} 
                              onValueChange={(value) => setDemandForm({...demandForm, productCategory: value as ProductCategory})}
                            >
                              <SelectTrigger className="glass border-white/20">
                                <SelectValue placeholder="Select if looking for a product" />
                              </SelectTrigger>
                              <SelectContent className="glass">
                                {PRODUCT_CATEGORY_OPTIONS.map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="demand-service-category">Service Category</Label>
                            <Select 
                              value={demandForm.serviceCategory} 
                              onValueChange={(value) => setDemandForm({...demandForm, serviceCategory: value as ServiceCategory})}
                            >
                              <SelectTrigger className="glass border-white/20">
                                <SelectValue placeholder="Select if looking for a service" />
                              </SelectTrigger>
                              <SelectContent className="glass">
                                {SERVICE_CATEGORY_OPTIONS.map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}

                        <div className="space-y-2">
                          <Label htmlFor="demand-mobile">Mobile Number *</Label>
                          <Input
                            id="demand-mobile"
                            placeholder="e.g. 9876543210"
                            value={demandForm.mobileNumber}
                            onChange={(e) => setDemandForm({...demandForm, mobileNumber: e.target.value})}
                            className={`glass border-white/20 ${errors.mobileNumber ? 'border-red-500' : ''}`}
                          />
                          {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}
                        </div>

                        <Alert className="border-blue-200 bg-blue-50">
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-blue-800">
                            Select at least one category to help others understand what you are looking for.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>

                    <Button 
                      type="submit" 
                      className="w-full btn-gradient-primary py-3 text-lg font-semibold" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting 
                        ? (isEditing ? 'Updating Demand...' : 'Creating Demand...') 
                        : (isEditing ? 'Update Demand' : 'Post Your Demand')
                      }
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}