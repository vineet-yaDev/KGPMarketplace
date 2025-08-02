import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth-helpers'
import { getAllServices, createService } from '@/lib/db'

export async function GET() {
  try {
    const services = await getAllServices()
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
