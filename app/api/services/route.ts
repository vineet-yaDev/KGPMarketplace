import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth-helpers'
import { getAllServices, createService } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const sort = searchParams.get('sort')
  const category = searchParams.get('category')
  const exclude = searchParams.get('exclude')
    
    // Parse limit to number only if it exists and is valid, otherwise undefined
    const limitNumber = limitParam ? parseInt(limitParam, 10) : undefined
    
    // Validate that limit is a positive number if provided
    const validLimit = limitNumber && limitNumber > 0 ? limitNumber : undefined
    
    // If category filter is requested, use optimized query
    if (category && exclude) {
      const { getSimilarServices } = await import('@/lib/db')
      const services = await getSimilarServices(category, exclude, validLimit || 6)
      return NextResponse.json({ services })
    }

    // Pass parameters to getAllServices function for general queries
    const services = await getAllServices(validLimit, sort)
    return NextResponse.json({ services })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { valid, error, session } = await validateSession()
    
    if (!valid || !session) {
      return NextResponse.json({ 
        error: error || 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 })
    }

    const serviceData = await request.json()
    console.log('Creating service for user:', session.user.email)

    const service = await createService({
      email: session.user.email!,
      ...serviceData,
    })

    return NextResponse.json({ 
      success: true, 
      service 
    })

  } catch (error) {
    console.error('Service creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create service',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    }, { status: 500 })
  }
}
