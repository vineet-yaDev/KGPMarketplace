'use client'

import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockServices } from '@/data/mockData'

export default function RecentServices() {
  return (
    <section className="px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Services</h2>
          <Button asChild variant="ghost" className="hover:bg-white/10">
            <Link href="/services">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockServices.map((service) => (
            <Link key={service.id} href={`/service/${service.id}`} className="group">
              <Card className="glass-card hover-lift h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{service.title}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{service.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">
                        ₹{service.minPrice} - ₹{service.maxPrice}
                      </span>
                      <Badge variant="outline">{service.experienceYears}+ years exp</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>by {service.provider.name}</span>
                      <span>{service.hall}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-full justify-center">
                    {service.category}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
