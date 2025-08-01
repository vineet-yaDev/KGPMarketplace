'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Phone, Mail, MessageSquare } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Demand, DemandDetailResponse } from '@/lib/types'

export default function DemandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [demand, setDemand] = useState<Demand | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchDemandDetails()
    }
  }, [params.id])

  const fetchDemandDetails = async () => {
    try {
      setLoading(true)
      // Add actual API call when demand detail endpoint is created
      // For now, we'll simulate loading
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching demand:', error)
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading demand details...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6 glass hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Demands
          </Button>

          {/* Demand Detail Card */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="secondary">ELECTRONICS</Badge>
                    <Badge variant="outline">URGENT</Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Looking for MacBook Pro 2020 or newer</h1>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Hi! I'm looking for a MacBook Pro 2020 or newer model for my final year project work. 
                    Preferably 16-inch with good battery life. Budget is flexible for the right machine. 
                    Must be in good working condition.
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold mb-4">Posted by</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      VY
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">Vineet Yadav</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted on January 30, 2025
                    </p>
                  </div>
                </div>
                
                {/* Contact Actions */}
                <div className="flex space-x-3 mt-6">
                  <Button className="btn-gradient-primary flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" className="glass border-white/20 flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" className="glass border-white/20 flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Respond to Demand
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
