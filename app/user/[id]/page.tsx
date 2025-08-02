'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Briefcase, MessageSquare, Phone, Calendar, MapPin, Star, Clock } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Product, Service, Demand } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

interface UserWithListings {
  id: string
  name?: string | null
  email: string
  image?: string | null
  mobileNumber?: string | null
  createdAt: string
  updatedAt: string
  isBlocked: boolean
  products: Product[]
  services: Service[]
  demands: Demand[]
  _count: {
    products: number
    services: number
    demands: number
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const [user, setUser] = useState<UserWithListings | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')

  const isOwnProfile = session?.user?.email === user?.email

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
      } else {
        console.error('Failed to fetch user:', data.error)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchUserProfile()
    }
  }, [params.id, fetchUserProfile])

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

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">User not found</h2>
            <p className="text-muted-foreground mb-4">The user profile you&apos;re looking for doesn&apos;t exist.</p>
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
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6 glass hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* User Profile Header */}
          <Card className="glass-card mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.image || ''} alt={user.name || ''} />
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                    {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{user.name || 'KGP Student'}</h1>
                      <p className="text-muted-foreground mb-4">{user.email}</p>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        Member since {formatDate(user.createdAt)}
                      </div>
                    </div>
                    
                    {!isOwnProfile && user.mobileNumber && (
                      <Button className="btn-gradient-primary">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Seller
                      </Button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{user._count.products}</div>
                      <div className="text-sm text-muted-foreground">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{user._count.services}</div>
                      <div className="text-sm text-muted-foreground">Services</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{user._count.demands}</div>
                      <div className="text-sm text-muted-foreground">Demands</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings Tabs */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 glass mb-6">
                  <TabsTrigger value="products" className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Products ({user._count.products})</span>
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Services ({user._count.services})</span>
                  </TabsTrigger>
                  <TabsTrigger value="demands" className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Demands ({user._count.demands})</span>
                  </TabsTrigger>
                </TabsList>

                {/* Products Tab */}
                <TabsContent value="products" className="mt-6">
                  {user.products.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No products listed</h3>
                      <p className="text-muted-foreground">
                        {isOwnProfile ? "You haven&apos;t listed any products yet." : "This user hasn&apos;t listed any products."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {user.products.map((product: Product) => (
                        <Link key={product.id} href={`/products/${product.id}`} className="group">
                          <Card className="glass-card hover-lift overflow-hidden h-full">
                            <div className="aspect-video relative overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                  className="object-cover group-hover:scale-110 transition-smooth"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <span className="text-muted-foreground">No image</span>
                                </div>
                              )}
                              {product.originalPrice && product.price && (
                                <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold truncate mb-2 group-hover:text-primary transition-colors">
                                {product.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {product.description || 'No description available'}
                              </p>
                              <div className="flex items-center space-x-2 mb-2">
                                {product.price && (
                                  <span className="font-bold text-lg text-primary">
                                    {formatCurrency(product.price)}
                                  </span>
                                )}
                                {product.originalPrice && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatCurrency(product.originalPrice)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">Condition: {product.condition}/5</Badge>
                                {product.addressHall && (
                                  <span className="text-xs text-muted-foreground">{product.addressHall}</span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="mt-6">
                  {user.services.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No services offered</h3>
                      <p className="text-muted-foreground">
                        {isOwnProfile ? "You haven&apos;t offered any services yet." : "This user hasn&apos;t offered any services."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {user.services.map((service: Service) => (
                        <Link key={service.id} href={`/services/${service.id}`} className="group">
                          <Card className="glass-card hover-lift h-full overflow-hidden">
                            <div className="aspect-video relative overflow-hidden">
                              {service.images && service.images.length > 0 ? (
                                <Image
                                  src={service.images[0]}
                                  alt={service.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover group-hover:scale-110 transition-smooth"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <span className="text-muted-foreground">No Image</span>
                                </div>
                              )}
                              
                              <div className="absolute top-3 left-3">
                                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                                  {service.category}
                                </Badge>
                              </div>
                              
                              {service.experienceYears && (
                                <div className="absolute top-3 right-3">
                                  <Badge className="bg-primary/90">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {service.experienceYears}+ yrs
                                  </Badge>
                                </div>
                              )}
                            </div>

                            <CardContent className="p-5">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2 mb-3">
                                {service.title}
                              </h3>
                              
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {service.description || 'No description available'}
                              </p>
                              
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-primary font-bold text-lg">
                                    {service.minPrice && service.maxPrice ? (
                                      <span>{formatCurrency(service.minPrice)} - {formatCurrency(service.maxPrice)}</span>
                                    ) : service.minPrice ? (
                                      <span>From {formatCurrency(service.minPrice)}</span>
                                    ) : (
                                      <span className="text-sm">Price on request</span>
                                    )}
                                  </div>
                                </div>
                                
                                {service.addressHall && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {service.addressHall}
                                  </div>
                                )}
                              </div>
                              
                              {service.portfolioUrl && (
                                <div className="mt-4">
                                  <Badge variant="outline" className="w-full justify-center py-2">
                                    <Star className="w-3 h-3 mr-1" />
                                    Portfolio Available
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Demands Tab */}
                <TabsContent value="demands" className="mt-6">
                  {user.demands.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No demands posted</h3>
                      <p className="text-muted-foreground">
                        {isOwnProfile ? "You haven&apos;t posted any demands yet." : "This user hasn&apos;t posted any demands."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {user.demands.map((demand: Demand) => (
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
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(demand.createdAt)}
                                </div>
                                <div className="flex items-center text-primary hover:text-primary/80">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  View Details
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
