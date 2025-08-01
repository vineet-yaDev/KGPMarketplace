'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'

export default function MyProductsPage() {
  const { userEmail } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userEmail) {
      fetchMyProducts()
    }
  }, [userEmail])

  const fetchMyProducts = async () => {
    try {
      const response = await fetch('/api/user/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`/api/products/${productId}`, { method: 'DELETE' })
        setProducts(products.filter((p: any) => p.id !== productId))
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your products...</p>
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
              <h1 className="text-3xl font-bold mb-2">My Products</h1>
              <p className="text-muted-foreground">Manage your listed products</p>
            </div>
            <Button asChild className="btn-gradient-primary">
              <Link href="/sell">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">Start selling by adding your first product</p>
              <Button asChild className="btn-gradient-primary">
                <Link href="/sell">Add Your First Product</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <Card key={product.id} className="glass-card hover-lift overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="glass hover:bg-white/20">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass">
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate mb-2">{product.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold text-lg text-primary">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Condition: {product.condition}/5</Badge>
                      <Badge 
                        variant={product.status === 'LISTED' ? 'default' : 'outline'}
                      >
                        {product.status}
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
