import { NextRequest, NextResponse } from 'next/server'
import { getProductById, getAllProductsLegacy, getAllServices } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params
    const productId = id

    // Fetch the main product
    const product = await getProductById(productId)
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch similar products (same category, excluding current product)
    const allProducts = await getAllProductsLegacy()
    const similarProducts = allProducts
      .filter(p => p.id !== productId && p.category === product.category)
      .slice(0, 8) // Limit to 8 similar products

    // Fetch recent services for recommendations
    const allServices = await getAllServices()
    const recentServices = allServices.slice(0, 8) // Get 8 recent services

    return NextResponse.json({
      product,
      similarProducts,
      relatedServices: recentServices
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 })
    }

    const {id} = await params
    const productId = id
    const updateData = await request.json()

    // Check if product exists and user owns it - fetch with owner relation
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        owner: {
          select: { id: true, email: true, name: true, image: true }
        }
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (existingProduct.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized to edit this product' }, { status: 403 })
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: updateData.title,
        description: updateData.description || null,
        price: updateData.price ? parseFloat(updateData.price) : null,
        originalPrice: updateData.originalPrice ? parseFloat(updateData.originalPrice) : null,
        productType: updateData.productType,
        condition: updateData.condition ? parseInt(updateData.condition) : 3,
        ageInMonths: updateData.ageInMonths ? parseFloat(updateData.ageInMonths) : null,
        category: updateData.category,
        addressHall: updateData.addressHall,
        mobileNumber: updateData.mobileNumber,
        ecommerceLink: updateData.ecommerceLink || null,
        seasonality: updateData.seasonality,
        images: updateData.images || [],
        status: updateData.status || existingProduct.status
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct 
    })

  } catch (error) {
    console.error('Product update error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 })
    }

    const {id} = await params
    const productId = id

    // Check if product exists and user owns it - fetch with owner relation
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        owner: {
          select: { id: true, email: true, name: true, image: true }
        }
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (existingProduct.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized to delete this product' }, { status: 403 })
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    })

  } catch (error) {
    console.error('Product deletion error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}