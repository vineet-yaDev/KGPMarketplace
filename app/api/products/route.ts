import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth-helpers'
import { getAllProducts, createProduct, getAllProductsForSearch, getSimilarProducts } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const sort = searchParams.get('sort')
    const category = searchParams.get('category')
    const exclude = searchParams.get('exclude')
    const offset = searchParams.get('offset')
    const cursor = searchParams.get('cursor')
    const forSearch = searchParams.get('forSearch') // Flag to get all products for search
    
    // Parse numbers
    const limitNumber = limit ? parseInt(limit, 10) : undefined
    const offsetNumber = offset ? parseInt(offset, 10) : undefined
    
    // If category filter is requested, use getSimilarProducts for optimized query
    if (category && exclude) {
      const products = await getSimilarProducts(category, exclude, limitNumber || 6)
      return NextResponse.json({ products })
    }
    
    // If forSearch flag is set, return all products for client-side filtering
    if (forSearch === 'true') {
      const products = await getAllProductsForSearch()
      return NextResponse.json({ products })
    }
    
    // Use paginated getAllProducts for infinite scroll
    const result = await getAllProducts(limitNumber, sort, offsetNumber, cursor || undefined)
    return NextResponse.json(result)
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
