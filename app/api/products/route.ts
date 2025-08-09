import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth-helpers'
import { getAllProducts, createProduct } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const sort = searchParams.get('sort')
    
    // Parse limit to number, default to undefined if not provided
    const limitNumber = limit ? parseInt(limit, 10) : undefined
    
    // Pass parameters to getAllProducts function
    const products = await getAllProducts(limitNumber, sort)
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
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

    const productData = await request.json()
    console.log('Creating product for user:', session.user.email)

    const product = await createProduct({
      email: session.user.email!,
      ...productData,
    })

    return NextResponse.json({ 
      success: true, 
      product 
    })

  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    }, { status: 500 })
  }
}
