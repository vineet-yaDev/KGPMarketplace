'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, Briefcase, MessageSquare, Upload, X, Camera, AlertCircle, Info, FileText } from 'lucide-react'
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
import MainLayout from '@/components/MainLayout'

// Import from constants and types
import { 
  HALL_OPTIONS, 
  PRODUCT_CATEGORY_OPTIONS, 
  SERVICE_CATEGORY_OPTIONS,
  PRODUCT_TYPES,
  SEASONALITIES,
  CONDITION_OPTIONS,
  VALIDATION,
  DEFAULT_VALUES
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

// Extended Product Form Data with Invoice Image URL
interface ExtendedProductFormData extends ProductFormData {
  invoiceImageUrl: string;
}

// Custom Cloudinary options
const productImagesCloudinaryOptions = {
  maxFiles: VALIDATION.MAX_IMAGES_PER_LISTING,
  resourceType: "image" as const,
  clientAllowedFormats: [...VALIDATION.SUPPORTED_IMAGE_FORMATS] as string[],
  maxFileSize: VALIDATION.MAX_IMAGE_SIZE_BYTES,
  cropping: false,
  multiple: true,
  defaultSource: "local" as const,
};

const invoiceCloudinaryOptions = {
  maxFiles: 1,
  resourceType: "image" as const,
  clientAllowedFormats: [...VALIDATION.SUPPORTED_IMAGE_FORMATS] as string[],
  maxFileSize: VALIDATION.MAX_IMAGE_SIZE_BYTES,
  cropping: false,
  multiple: false,
  defaultSource: "local" as const,
};

const serviceImagesCloudinaryOptions = {
  maxFiles: VALIDATION.MAX_IMAGES_PER_LISTING,
  resourceType: "image" as const,
  clientAllowedFormats: [...VALIDATION.SUPPORTED_IMAGE_FORMATS] as string[],
  maxFileSize: VALIDATION.MAX_IMAGE_SIZE_BYTES,
  cropping: false,
  multiple: true,
  defaultSource: "local" as const,
};

export default function AddContent() {
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

  // Extended Product form state with invoice image
  const [productForm, setProductForm] = useState<ExtendedProductFormData>({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    productType: DEFAULT_VALUES.PRODUCT_TYPE,
    condition: DEFAULT_VALUES.CONDITION.toString(),
    ageInMonths: '',
    category: DEFAULT_VALUES.PRODUCT_CATEGORY,
    addressHall: 'RK' as KGPHalls,
    mobileNumber: '',
    ecommerceLink: '',
    seasonality: DEFAULT_VALUES.SEASONALITY,
    images: [],
    invoiceImageUrl: ''
  })

  // Service form state
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    title: '',
    description: '',
    minPrice: '',
    maxPrice: '',
    category: DEFAULT_VALUES.SERVICE_CATEGORY,
    addressHall: 'RK' as KGPHalls,
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
          const product = data.product
          setProductForm({
            title: product.title || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            originalPrice: product.originalPrice?.toString() || '',
            productType: product.productType || DEFAULT_VALUES.PRODUCT_TYPE,
            condition: product.condition?.toString() || DEFAULT_VALUES.CONDITION.toString(),
            ageInMonths: product.ageInMonths?.toString() || '',
            category: product.category || DEFAULT_VALUES.PRODUCT_CATEGORY,
            addressHall: product.addressHall || 'RK',
            mobileNumber: product.mobileNumber || '',
            ecommerceLink: product.ecommerceLink || '',
            seasonality: product.seasonality || DEFAULT_VALUES.SEASONALITY,
            images: product.images || [],
            invoiceImageUrl: product.invoiceImageUrl || ''
          })
        } else if (editType === 'service') {
          const service = data.service
          setServiceForm({
            title: service.title || '',
            description: service.description || '',
            minPrice: service.minPrice?.toString() || '',
            maxPrice: service.maxPrice?.toString() || '',
            category: service.category || DEFAULT_VALUES.SERVICE_CATEGORY,
            addressHall: service.addressHall || 'RK',
            mobileNumber: service.mobileNumber || '',
            experienceYears: service.experienceYears?.toString() || '',
            portfolioUrl: service.portfolioUrl || '',
            images: service.images || []
          })
        } else if (editType === 'demand') {
          const demand = data.demand
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

  // Image upload handlers for product images
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
    setUploadError('Failed to upload product image. Please try again.')
  }, [])

  // Invoice image upload handlers
  const handleInvoiceImageUpload = useCallback((result: CloudinaryResult) => {
    if (result.event === 'success' && result.info && typeof result.info === 'object') {
      const secureUrl = (result.info as { secure_url: string }).secure_url
      setProductForm(prev => ({
        ...prev,
        invoiceImageUrl: secureUrl
      }))
      setUploadError('')
    }
  }, [])

  const handleInvoiceImageUploadError = useCallback((error: CloudinaryError) => {
    console.error('Invoice upload error:', error)
    setUploadError('Failed to upload invoice image. Please try again.')
  }, [])

  // Service image upload handlers
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
    setUploadError('Failed to upload service image. Please try again.')
  }, [])

  // Remove image handlers
  const removeProductImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const removeInvoiceImage = () => {
    setProductForm(prev => ({
      ...prev,
      invoiceImageUrl: ''
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
    if (productForm.title.length < VALIDATION.MIN_TITLE_LENGTH) {
      newErrors.title = `Title must be at least ${VALIDATION.MIN_TITLE_LENGTH} characters`
    }
    if (productForm.title.length > VALIDATION.MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters`
    }
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
    if (serviceForm.title.length < VALIDATION.MIN_TITLE_LENGTH) {
      newErrors.title = `Title must be at least ${VALIDATION.MIN_TITLE_LENGTH} characters`
    }
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
    if (demandForm.title.length < VALIDATION.MIN_TITLE_LENGTH) {
      newErrors.title = `Title must be at least ${VALIDATION.MIN_TITLE_LENGTH} characters`
    }
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
          invoiceImageUrl: productForm.invoiceImageUrl || null,
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
        <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-10 max-w-6xl">
          {/* Enhanced Header - Responsive */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              {isEditing ? `Edit Your ${editType}` : 'Create Your Listing'}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl leading-relaxed px-2">
              {isEditing 
                ? `Update your ${editType} details with ease` 
                : 'Share what you have to offer or what you need with the KGP community'
              }
            </p>
          </div>

          {/* Error Alerts - Responsive */}
          {errors.submit && (
            <Alert className="mb-6 sm:mb-8 border-2 border-red-300 bg-red-50 dark:bg-red-950/20 shadow-lg rounded-xl mx-2 sm:mx-0">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <AlertDescription className="text-red-800 dark:text-red-200 font-medium text-sm sm:text-base">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}

          {uploadError && (
            <Alert className="mb-6 sm:mb-8 border-2 border-red-300 bg-red-50 dark:bg-red-950/20 shadow-lg rounded-xl mx-2 sm:mx-0">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <AlertDescription className="text-red-800 dark:text-red-200 font-medium text-sm sm:text-base">
                {uploadError}
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Main Form Card with Contained Tabs - Responsive */}
          <Card className="glass-card shadow-2xl border-2 border-white/20 mx-1 sm:mx-0">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Tab Container - Properly Contained and Responsive */}
              <div className="w-full bg-slate-800/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-slate-600 rounded-2xl p-3 sm:p-4 mb-6 sm:mb-10 shadow-2xl">
                <Tabs 
                  value={activeTab} 
                  onValueChange={isEditing ? undefined : (value) => setActiveTab(value as 'product' | 'service' | 'demand')} 
                  className="w-full"
                >
                  {/* Fixed Tab List with Proper Containment - Responsive */}
                  <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1 sm:gap-2 h-auto p-0">
                    <TabsTrigger 
                      value="product" 
                      className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 lg:space-x-3 py-3 sm:py-4 px-2 sm:px-4 lg:px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all duration-300 font-semibold text-xs sm:text-sm lg:text-base border border-slate-600 data-[state=active]:border-primary"
                      disabled={isEditing ? editType !== 'product' : false}
                    >
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                      <span className="text-xs sm:text-sm lg:text-base leading-tight">
                        {isEditing && editType === 'product' ? 'Edit Product' : 'Sell Product'}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="service" 
                      className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 lg:space-x-3 py-3 sm:py-4 px-2 sm:px-4 lg:px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all duration-300 font-semibold text-xs sm:text-sm lg:text-base border border-slate-600 data-[state=active]:border-primary"
                      disabled={isEditing ? editType !== 'service' : false}
                    >
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                      <span className="text-xs sm:text-sm lg:text-base leading-tight">
                        {isEditing && editType === 'service' ? 'Edit Service' : 'Offer Service'}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="demand" 
                      className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 lg:space-x-3 py-3 sm:py-4 px-2 sm:px-4 lg:px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all duration-300 font-semibold text-xs sm:text-sm lg:text-base border border-slate-600 data-[state=active]:border-primary"
                      disabled={isEditing ? editType !== 'demand' : false}
                    >
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                      <span className="text-xs sm:text-sm lg:text-base leading-tight">
                        {isEditing && editType === 'demand' ? 'Edit Demand' : 'Post Demand'}
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Product Form - Responsive */}
                  <TabsContent value="product" className="mt-6 sm:mt-8">
                    <form onSubmit={handleProductSubmit} className="space-y-6 sm:space-y-8 lg:space-y-10">
                      {/* Basic Information - Responsive */}
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl lg:text-2xl font-bold">
                            <Info className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0" />
                            <span>Basic Information</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 sm:space-y-8 pt-2">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-title" className="text-sm sm:text-base font-semibold">Product Title *</Label>
                              <Input
                                id="product-title"
                                placeholder="e.g. iPhone 13 Pro Max 256GB"
                                value={productForm.title}
                                onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                                className={`glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base ${errors.title ? 'border-red-500' : 'focus:border-primary'} transition-colors`}
                                maxLength={VALIDATION.MAX_TITLE_LENGTH}
                              />
                              {errors.title && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.title}</p>}
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-category" className="text-sm sm:text-base font-semibold">Category *</Label>
                              <Select 
                                value={productForm.category} 
                                onValueChange={(value) => setProductForm({...productForm, category: value as ProductCategory})}
                              >
                                <SelectTrigger className={`glass border-2 border-white/30 h-10 sm:h-12 ${errors.category ? 'border-red-500' : 'focus:border-primary'}`}>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="glass border-2 border-white/30">
                                  {PRODUCT_CATEGORY_OPTIONS.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value} className="hover:bg-primary/10">{cat.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.category && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.category}</p>}
                            </div>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="product-description" className="text-sm sm:text-base font-semibold">Description</Label>
                            <Textarea
                              id="product-description"
                              placeholder="Describe your product in detail, including features, condition, and any other relevant information..."
                              value={productForm.description}
                              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                              className="glass border-2 border-white/30 focus:border-primary transition-colors text-sm sm:text-base"
                              rows={5}
                              maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pricing & Condition - Responsive */}
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Pricing & Condition</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 sm:space-y-8 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-price" className="text-sm sm:text-base font-semibold">Selling Price (₹) *</Label>
                              <Input
                                id="product-price"
                                type="number"
                                placeholder="e.g. 50000"
                                value={productForm.price}
                                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                className={`glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base ${errors.price ? 'border-red-500' : 'focus:border-primary'} transition-colors`}
                                min="0"
                              />
                              {errors.price && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.price}</p>}
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-original-price" className="text-sm sm:text-base font-semibold">Original Price (₹)</Label>
                              <Input
                                id="product-original-price"
                                type="number"
                                placeholder="e.g. 70000"
                                value={productForm.originalPrice}
                                onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                                className="glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base focus:border-primary transition-colors"
                                min="0"
                              />
                              <p className="text-xs sm:text-sm text-muted-foreground">Optional: Helps buyers see the value</p>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-type" className="text-sm sm:text-base font-semibold">Product Type</Label>
                              <Select 
                                value={productForm.productType} 
                                onValueChange={(value) => setProductForm({...productForm, productType: value as ProductType})}
                              >
                                <SelectTrigger className="glass border-2 border-white/30 h-10 sm:h-12 focus:border-primary">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass border-2 border-white/30">
                                  {PRODUCT_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value} className="hover:bg-primary/10">{type.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-condition" className="text-sm sm:text-base font-semibold">Condition (1-5)</Label>
                              <Select 
                                value={productForm.condition} 
                                onValueChange={(value) => setProductForm({...productForm, condition: value})}
                              >
                                <SelectTrigger className="glass border-2 border-white/30 h-10 sm:h-12 focus:border-primary">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass border-2 border-white/30">
                                  {CONDITION_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value.toString()} className="hover:bg-primary/10">{option.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-age" className="text-sm sm:text-base font-semibold">Age (Months)</Label>
                              <Input
                                id="product-age"
                                type="number"
                                placeholder="e.g. 12"
                                value={productForm.ageInMonths}
                                onChange={(e) => setProductForm({...productForm, ageInMonths: e.target.value})}
                                className="glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base focus:border-primary transition-colors"
                                min="0"
                              />
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-seasonality" className="text-sm sm:text-base font-semibold">Seasonality</Label>
                              <Select 
                                value={productForm.seasonality} 
                                onValueChange={(value) => setProductForm({...productForm, seasonality: value as ProductSeasonality})}
                              >
                                <SelectTrigger className="glass border-2 border-white/30 h-10 sm:h-12 focus:border-primary">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass border-2 border-white/30">
                                  {SEASONALITIES.map(season => (
                                    <SelectItem key={season.value} value={season.value} className="hover:bg-primary/10">{season.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Product Images - Responsive */}
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl lg:text-2xl font-bold">
                            <Camera className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0" />
                            <span>Product Images</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 pt-2">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {productForm.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <Image
                                  src={image}
                                  alt={`Product ${index + 1}`}
                                  width={200}
                                  height={150}
                                  className="w-full h-28 sm:h-32 lg:h-36 object-cover rounded-xl border-2 border-white/20 shadow-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg p-1 sm:p-2"
                                  onClick={() => removeProductImage(index)}
                                >
                                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            ))}
                            
                            {productForm.images.length < VALIDATION.MAX_IMAGES_PER_LISTING && (
                              <CldUploadWidget
                                uploadPreset="Marketplace"
                                onSuccess={handleProductImageUpload}
                                onError={handleProductImageUploadError}
                                options={productImagesCloudinaryOptions}
                              >
                                {({ open }) => {
                                  if (!cloudName) {
                                    return (
                                      <div className="h-28 sm:h-32 lg:h-36 border-3 border-dashed border-red-300 rounded-xl flex flex-col items-center justify-center">
                                        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-red-500" />
                                        <span className="text-xs sm:text-sm text-red-500">Config Error</span>
                                      </div>
                                    )
                                  }
                                  
                                  return (
                                    <div
                                      onClick={() => open()}
                                      className="h-28 sm:h-32 lg:h-36 border-3 border-dashed border-white/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-lg"
                                    >
                                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-muted-foreground" />
                                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">Add Image</span>
                                    </div>
                                  )
                                }}
                              </CldUploadWidget>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Upload up to {VALIDATION.MAX_IMAGES_PER_LISTING} images (JPG, PNG, GIF, WebP). Max 10MB per image. First image will be the main display image.
                          </p>
                        </CardContent>
                      </Card>

                      {/* Invoice Image - Responsive */}
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl lg:text-2xl font-bold">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0" />
                            <span>Invoice Image (Optional)</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {productForm.invoiceImageUrl && (
                              <div className="relative group">
                                <Image
                                  src={productForm.invoiceImageUrl}
                                  alt="Invoice"
                                  width={200}
                                  height={150}
                                  className="w-full h-28 sm:h-32 lg:h-36 object-cover rounded-xl border-2 border-white/20 shadow-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg p-1 sm:p-2"
                                  onClick={removeInvoiceImage}
                                >
                                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            )}
                            
                            {!productForm.invoiceImageUrl && (
                              <CldUploadWidget
                                uploadPreset="Marketplace"
                                onSuccess={handleInvoiceImageUpload}
                                onError={handleInvoiceImageUploadError}
                                options={invoiceCloudinaryOptions}
                              >
                                {({ open }) => {
                                  if (!cloudName) {
                                    return (
                                      <div className="h-28 sm:h-32 lg:h-36 border-3 border-dashed border-red-300 rounded-xl flex flex-col items-center justify-center">
                                        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-red-500" />
                                        <span className="text-xs sm:text-sm text-red-500">Config Error</span>
                                      </div>
                                    )
                                  }
                                  
                                  return (
                                    <div
                                      onClick={() => open()}
                                      className="h-28 sm:h-32 lg:h-36 border-3 border-dashed border-white/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-lg"
                                    >
                                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-muted-foreground" />
                                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">Upload Invoice</span>
                                    </div>
                                  )
                                }}
                              </CldUploadWidget>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Upload your purchase invoice for authenticity verification. Only one image allowed (JPG, PNG, GIF, WebP). Max 10MB.
                          </p>
                        </CardContent>
                      </Card>

                      {/* Contact & Location - Responsive */}
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Contact & Location</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 sm:space-y-8 pt-2">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-hall" className="text-sm sm:text-base font-semibold">Hall *</Label>
                              <Select 
                                value={productForm.addressHall} 
                                onValueChange={(value) => setProductForm({...productForm, addressHall: value as KGPHalls})}
                              >
                                <SelectTrigger className={`glass border-2 border-white/30 h-10 sm:h-12 ${errors.addressHall ? 'border-red-500' : 'focus:border-primary'}`}>
                                  <SelectValue placeholder="Select your hall" />
                                </SelectTrigger>
                                <SelectContent className="glass border-2 border-white/30">
                                  {HALL_OPTIONS.map(hall => (
                                    <SelectItem key={hall.value} value={hall.value} className="hover:bg-primary/10">{hall.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.addressHall && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.addressHall}</p>}
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="product-mobile" className="text-sm sm:text-base font-semibold">Mobile Number *</Label>
                              <Input
                                id="product-mobile"
                                placeholder="e.g. 9876543210"
                                value={productForm.mobileNumber}
                                onChange={(e) => setProductForm({...productForm, mobileNumber: e.target.value})}
                                className={`glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base ${errors.mobileNumber ? 'border-red-500' : 'focus:border-primary'} transition-colors`}
                                pattern="[0-9]{10}"
                                maxLength={10}
                              />
                              {errors.mobileNumber && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.mobileNumber}</p>}
                            </div>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="product-ecommerce" className="text-sm sm:text-base font-semibold">E-commerce Link</Label>
                            <Input
                              id="product-ecommerce"
                              placeholder="e.g. https://amazon.in/product-link"
                              value={productForm.ecommerceLink}
                              onChange={(e) => setProductForm({...productForm, ecommerceLink: e.target.value})}
                              className="glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base focus:border-primary transition-colors"
                              type="url"
                            />
                            <p className="text-xs sm:text-sm text-muted-foreground">Optional: Link to original product page for reference</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white py-3 sm:py-4 text-lg sm:text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting 
                          ? (isEditing ? 'Updating Product...' : 'Creating Product...') 
                          : (isEditing ? 'Update Product' : 'Create Product Listing')
                        }
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Service Form - Responsive */}
                  <TabsContent value="service" className="mt-6 sm:mt-8">
                    <form onSubmit={handleServiceSubmit} className="space-y-6 sm:space-y-8 lg:space-y-10">
                      {/* Basic Information - Responsive */}
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl lg:text-2xl font-bold">
                            <Info className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0" />
                            <span>Service Information</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 sm:space-y-8 pt-2">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="service-title" className="text-sm sm:text-base font-semibold">Service Title *</Label>
                              <Input
                                id="service-title"
                                placeholder="e.g. Python Programming Tutoring"
                                value={serviceForm.title}
                                onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
                                className={`glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base ${errors.title ? 'border-red-500' : 'focus:border-primary'} transition-colors`}
                                maxLength={VALIDATION.MAX_TITLE_LENGTH}
                              />
                              {errors.title && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.title}</p>}
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="service-category" className="text-sm sm:text-base font-semibold">Category *</Label>
                              <Select 
                                value={serviceForm.category} 
                                onValueChange={(value) => setServiceForm({...serviceForm, category: value as ServiceCategory})}
                              >
                                <SelectTrigger className={`glass border-2 border-white/30 h-10 sm:h-12 ${errors.category ? 'border-red-500' : 'focus:border-primary'}`}>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="glass border-2 border-white/30">
                                  {SERVICE_CATEGORY_OPTIONS.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value} className="hover:bg-primary/10">{cat.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.category && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.category}</p>}
                            </div>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="service-description" className="text-sm sm:text-base font-semibold">Service Description</Label>
                            <Textarea
                              id="service-description"
                              placeholder="Describe your service, experience, what you offer, and any other relevant details..."
                              value={serviceForm.description}
                              onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                              className="glass border-2 border-white/30 focus:border-primary transition-colors text-sm sm:text-base"
                              rows={5}
                              maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pricing & Experience - Responsive */}
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Pricing & Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 sm:space-y-8 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="service-min-price" className="text-sm sm:text-base font-semibold">Minimum Price (₹) *</Label>
                              <Input
                                id="service-min-price"
                                type="number"
                                placeholder="e.g. 500"
                                value={serviceForm.minPrice}
                                onChange={(e) => setServiceForm({...serviceForm, minPrice: e.target.value})}
                                className={`glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base ${errors.minPrice ? 'border-red-500' : 'focus:border-primary'} transition-colors`}
                                min="0"
                              />
                              {errors.minPrice && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.minPrice}</p>}
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="service-max-price" className="text-sm sm:text-base font-semibold">Maximum Price (₹)</Label>
                              <Input
                                id="service-max-price"
                                type="number"
                                placeholder="e.g. 2000"
                                value={serviceForm.maxPrice}
                                onChange={(e) => setServiceForm({...serviceForm, maxPrice: e.target.value})}
                                className="glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base focus:border-primary transition-colors"
                                min="0"
                              />
                              <p className="text-xs sm:text-sm text-muted-foreground">Optional</p>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="service-experience" className="text-sm sm:text-base font-semibold">Experience (Years)</Label>
                              <Input
                                id="service-experience"
                                type="number"
                                step="0.5"
                                placeholder="e.g. 2.5"
                                value={serviceForm.experienceYears}
                                onChange={(e) => setServiceForm({...serviceForm, experienceYears: e.target.value})}
                                className="glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base focus:border-primary transition-colors"
                                min="0"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Service Images - Responsive */}
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl lg:text-2xl font-bold">
                            <Camera className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0" />
                            <span>Service Images</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 pt-2">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {serviceForm.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <Image
                                  src={image}
                                  alt={`Service ${index + 1}`}
                                  width={200}
                                  height={150}
                                  className="w-full h-28 sm:h-32 lg:h-36 object-cover rounded-xl border-2 border-white/20 shadow-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg p-1 sm:p-2"
                                  onClick={() => removeServiceImage(index)}
                                >
                                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            ))}
                            
                            {serviceForm.images.length < VALIDATION.MAX_IMAGES_PER_LISTING && (
                              <CldUploadWidget
                                uploadPreset="Marketplace"
                                onSuccess={handleServiceImageUpload}
                                onError={handleServiceImageUploadError}
                                options={serviceImagesCloudinaryOptions}
                              >
                                {({ open }) => {
                                  if (!cloudName) {
                                    return (
                                      <div className="h-28 sm:h-32 lg:h-36 border-3 border-dashed border-red-300 rounded-xl flex flex-col items-center justify-center">
                                        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-red-500" />
                                        <span className="text-xs sm:text-sm text-red-500">Config Error</span>
                                      </div>
                                    )
                                  }
                                  
                                  return (
                                    <div
                                      onClick={() => open()}
                                      className="h-28 sm:h-32 lg:h-36 border-3 border-dashed border-white/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-lg"
                                    >
                                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-muted-foreground" />
                                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">Add Image</span>
                                    </div>
                                  )
                                }}
                              </CldUploadWidget>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Upload images of your work, certificates, or anything that showcases your service.
                          </p>
                        </CardContent>
                      </Card>

                      {/* Contact & Portfolio - Responsive */}
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Contact & Portfolio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 sm:space-y-8 pt-2">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="service-hall" className="text-sm sm:text-base font-semibold">Hall</Label>
                              <Select 
                                value={serviceForm.addressHall} 
                                onValueChange={(value) => setServiceForm({...serviceForm, addressHall: value as KGPHalls})}
                              >
                                <SelectTrigger className="glass border-2 border-white/30 h-10 sm:h-12 focus:border-primary">
                                  <SelectValue placeholder="Select your hall (optional)" />
                                </SelectTrigger>
                                <SelectContent className="glass border-2 border-white/30">
                                  {HALL_OPTIONS.map(hall => (
                                    <SelectItem key={hall.value} value={hall.value} className="hover:bg-primary/10">{hall.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="service-mobile" className="text-sm sm:text-base font-semibold">Mobile Number</Label>
                              <Input
                                id="service-mobile"
                                placeholder="e.g. 9876543210"
                                value={serviceForm.mobileNumber}
                                onChange={(e) => setServiceForm({...serviceForm, mobileNumber: e.target.value})}
                                className={`glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base ${errors.mobileNumber ? 'border-red-500' : 'focus:border-primary'} transition-colors`}
                                pattern="[0-9]{10}"
                                maxLength={10}
                              />
                              {errors.mobileNumber && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.mobileNumber}</p>}
                            </div>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="service-portfolio" className="text-sm sm:text-base font-semibold">Portfolio URL</Label>
                            <Input
                              id="service-portfolio"
                              placeholder="e.g. https://github.com/username or https://portfolio.com"
                              value={serviceForm.portfolioUrl}
                              onChange={(e) => setServiceForm({...serviceForm, portfolioUrl: e.target.value})}
                              className="glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base focus:border-primary transition-colors"
                              type="url"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white py-3 sm:py-4 text-lg sm:text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting 
                          ? (isEditing ? 'Updating Service...' : 'Creating Service...') 
                          : (isEditing ? 'Update Service' : 'Create Service Listing')
                        }
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Demand Form - Responsive */}
                  <TabsContent value="demand" className="mt-6 sm:mt-8">
                    <form onSubmit={handleDemandSubmit} className="space-y-6 sm:space-y-8 lg:space-y-10">
                      <Card className="glass-card border-2 border-white/30 shadow-xl">
                        <CardHeader className="pb-4 sm:pb-6">
                          <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl lg:text-2xl font-bold">
                            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0" />
                            <span>What are you looking for?</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 sm:space-y-8 pt-2">
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="demand-title" className="text-sm sm:text-base font-semibold">Title *</Label>
                            <Input
                              id="demand-title"
                              placeholder="e.g. Looking for MacBook Pro 2020 or newer"
                              value={demandForm.title}
                              onChange={(e) => setDemandForm({...demandForm, title: e.target.value})}
                              className={`glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base ${errors.title ? 'border-red-500' : 'focus:border-primary'} transition-colors`}
                              maxLength={VALIDATION.MAX_TITLE_LENGTH}
                            />
                            {errors.title && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.title}</p>}
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="demand-description" className="text-sm sm:text-base font-semibold">Description</Label>
                            <Textarea
                              id="demand-description"
                              placeholder="Describe what you're looking for in detail, including specifications, budget range, condition preferences, etc..."
                              value={demandForm.description}
                              onChange={(e) => setDemandForm({...demandForm, description: e.target.value})}
                              className="glass border-2 border-white/30 focus:border-primary transition-colors text-sm sm:text-base"
                              rows={5}
                              maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
                            />
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="demand-product-category" className="text-sm sm:text-base font-semibold">Product Category</Label>
                              <Select 
                                value={demandForm.productCategory} 
                                onValueChange={(value) => setDemandForm({...demandForm, productCategory: value as ProductCategory})}
                              >
                                <SelectTrigger className="glass border-2 border-white/30 h-10 sm:h-12 focus:border-primary">
                                  <SelectValue placeholder="Select if looking for a product" />
                                </SelectTrigger>
                                <SelectContent className="glass border-2 border-white/30">
                                  {PRODUCT_CATEGORY_OPTIONS.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value} className="hover:bg-primary/10">{cat.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="demand-service-category" className="text-sm sm:text-base font-semibold">Service Category</Label>
                              <Select 
                                value={demandForm.serviceCategory} 
                                onValueChange={(value) => setDemandForm({...demandForm, serviceCategory: value as ServiceCategory})}
                              >
                                <SelectTrigger className="glass border-2 border-white/30 h-10 sm:h-12 focus:border-primary">
                                  <SelectValue placeholder="Select if looking for a service" />
                                </SelectTrigger>
                                <SelectContent className="glass border-2 border-white/30">
                                  {SERVICE_CATEGORY_OPTIONS.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value} className="hover:bg-primary/10">{cat.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {errors.category && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.category}</p>}

                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="demand-mobile" className="text-sm sm:text-base font-semibold">Mobile Number *</Label>
                            <Input
                              id="demand-mobile"
                              placeholder="e.g. 9876543210"
                              value={demandForm.mobileNumber}
                              onChange={(e) => setDemandForm({...demandForm, mobileNumber: e.target.value})}
                              className={`glass border-2 border-white/30 h-10 sm:h-12 text-sm sm:text-base ${errors.mobileNumber ? 'border-red-500' : 'focus:border-primary'} transition-colors`}
                              pattern="[0-9]{10}"
                              maxLength={10}
                            />
                            {errors.mobileNumber && <p className="text-red-500 text-xs sm:text-sm font-medium">{errors.mobileNumber}</p>}
                          </div>

                          <Alert className="border-2 border-blue-200 bg-blue-50/10 dark:bg-blue-950/20 rounded-xl">
                            <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                            <AlertDescription className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
                              Select at least one category to help others understand what you are looking for.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white py-3 sm:py-4 text-lg sm:text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300" 
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
