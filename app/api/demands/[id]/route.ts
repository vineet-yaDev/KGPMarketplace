import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth-helpers'
import { getDemandById, updateDemand, deleteDemand } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const demand = await getDemandById(id)
    
    if (!demand) {
      return NextResponse.json({ error: 'Demand not found' }, { status: 404 })
    }

    return NextResponse.json({ demand })
  } catch (error) {
    console.error('Error fetching demand:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
{ params }: { params: Promise<{ id: string }> }
) {
  try {
    const { valid, error, session } = await validateSession()
    
    if (!valid || !session) {
      return NextResponse.json({ 
        error: error || 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 })
    }

    const { id } = await params
    const demand = await getDemandById(id)
    
    if (!demand) {
      return NextResponse.json({ error: 'Demand not found' }, { status: 404 })
    }

    // Check if user owns this demand
    if (demand.owner?.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData = await request.json()
    const updatedDemand = await updateDemand(id, updateData)

    return NextResponse.json({ 
      success: true, 
      demand: updatedDemand 
    })

  } catch (error) {
    console.error('Demand update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update demand'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { valid, error, session } = await validateSession()
    
    if (!valid || !session) {
      return NextResponse.json({ 
        error: error || 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 })
    }

    const { id } = await params
    const demand = await getDemandById(id)
    
    if (!demand) {
      return NextResponse.json({ error: 'Demand not found' }, { status: 404 })
    }

    // Check if user owns this demand
    if (demand.owner?.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await deleteDemand(id)

    return NextResponse.json({ 
      success: true, 
      message: 'Demand deleted successfully' 
    })

  } catch (error) {
    console.error('Demand deletion error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete demand'
    }, { status: 500 })
  }
}
