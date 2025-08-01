// app/api/user/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createOrUpdateUser, getUserByEmail } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, name, image } = await request.json()
    
    console.log('Testing user creation/update for:', email)
    
    // Test user creation/update
    const user = await createOrUpdateUser({
      email,
      name,
      image
    })
    
    console.log('User created/updated successfully:', user)
    
    // Verify user exists
    const foundUser = await getUserByEmail(email)
    console.log('User found in database:', foundUser)
    
    return NextResponse.json({ 
      success: true, 
      user,
      message: 'User created/updated successfully'
    })
  } catch (error) {
    console.error('Error in user check route:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
