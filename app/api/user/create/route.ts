// app/api/user/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createOrUpdateUser, getUserByEmail } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const body = await request.json()
    const { email, name, image, mobileNumber } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate IIT KGP email
    const allowedDomains = ['iitkgp.ac.in', 'kgpian.iitkgp.ac.in', 'gmail.com']
    const isValidDomain = allowedDomains.some(domain => email.endsWith(`@${domain}`))
    
    if (!isValidDomain) {
      return NextResponse.json({ error: 'Only IIT KGP emails are allowed' }, { status: 400 })
    }

    // Create or update user using the existing function
    const user = await createOrUpdateUser({
      email,
      name: name || null,
      image: image || null,
      mobileNumber: mobileNumber || null
    })

    return NextResponse.json({ 
      success: true, 
      user,
      message: 'User created/updated successfully' 
    })

  } catch (error) {
    console.error('Error in user creation API:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error fetching user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
