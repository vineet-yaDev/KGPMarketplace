import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth-helpers'
import { getAllDemands, createDemand } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const forSearch = searchParams.get('forSearch') // Flag to get all demands for search
    
    // If forSearch flag is set, return all demands for client-side filtering
    if (forSearch === 'true') {
      const { getAllDemandsForSearch } = await import('@/lib/db')
      const demands = await getAllDemandsForSearch()
      return NextResponse.json({ demands })
    }
    
    const demands = await getAllDemands()
    return NextResponse.json({ demands })
  } catch (error) {
    console.error('Error fetching demands:', error)
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

    const demandData = await request.json()
    console.log('Creating demand for user:', session.user.email)

    const demand = await createDemand({
      email: session.user.email!,
      ...demandData,
    })

    return NextResponse.json({ 
      success: true, 
      demand 
    })

  } catch (error) {
    console.error('Demand creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create demand',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    }, { status: 500 })
  }
}
