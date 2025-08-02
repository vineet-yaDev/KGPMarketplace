import { NextRequest, NextResponse } from 'next/server'
import { getServiceById, getAllServices, getAllProducts } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const serviceId = id

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Fetch the main service
    const service = await getServiceById(serviceId)
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Fetch similar services (same category, excluding current service)
    const allServices = await getAllServices()
    const similarServices = allServices
      .filter(s => s.id !== serviceId && s.category === service.category)
      .slice(0, 8) // Limit to 8 similar services

    // Fetch recent products for recommendations
    const allProducts = await getAllProducts()
    const recentProducts = allProducts.slice(0, 8) // Get 8 recent products

    return NextResponse.json({
      service,
      similarServices,
      relatedProducts: recentProducts
    })
  } catch (error) {
    console.error('Error fetching service:', error)
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

    const { id } = await params
    const serviceId = id
    const updateData = await request.json()

    // Check if service exists and user owns it - fetch with owner relation
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        owner: {
          select: { id: true, email: true, name: true, image: true }
        }
      }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (existingService.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized to edit this service' }, { status: 403 })
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title: updateData.title,
        description: updateData.description || null,
        minPrice: updateData.minPrice ? parseFloat(updateData.minPrice) : null,
        maxPrice: updateData.maxPrice ? parseFloat(updateData.maxPrice) : null,
        category: updateData.category,
        addressHall: updateData.addressHall || null,
        mobileNumber: updateData.mobileNumber || null,
        experienceYears: updateData.experienceYears ? parseFloat(updateData.experienceYears) : null,
        portfolioUrl: updateData.portfolioUrl || null,
        images: updateData.images || []
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      service: updatedService 
    })

  } catch (error) {
    console.error('Service update error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      error: 'Failed to update service',
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

    const { id } = await params
    const serviceId = id

    // Check if service exists and user owns it - fetch with owner relation
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        owner: {
          select: { id: true, email: true, name: true, image: true }
        }
      }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (existingService.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized to delete this service' }, { status: 403 })
    }

    // Delete service
    await prisma.service.delete({
      where: { id: serviceId }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Service deleted successfully' 
    })

  } catch (error) {
    console.error('Service deletion error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      error: 'Failed to delete service',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
