import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServiceById, getAllServices } from '@/lib/db'
import { ServiceDetailResponse } from '@/lib/types'
import ClientServiceDetailPage from './ClientServiceDetailPage'

type Props = {
  params: Promise<{ id: string }>;
}

// Optimized data loading function
async function loadServiceDataOptimized(id: string): Promise<ServiceDetailResponse> {
  try {
    const service = await getServiceById(id)
    
    if (!service) {
      throw new Error('Service not found')
    }

    // Return only essential data for immediate rendering
    // Similar services and products will be loaded client-side for better performance
    // Cast to align with client-facing types (owner included via Prisma include)
    return {
      service: service as unknown as ServiceDetailResponse['service'],
      similarServices: [], // Will be loaded progressively
      relatedProducts: []   // Will be loaded progressively
    }
  } catch (error) {
    console.error('Error loading service data:', error)
    throw error
  }
}

// Static generation for popular services
export async function generateStaticParams() {
  try {
    const services = await getAllServices(20) // Get top 20 recent services
    return services.map((service) => ({
      id: service.id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Dynamic metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const service = await getServiceById(resolvedParams.id)
    
    if (!service) {
      return {
        title: 'Service Not Found',
      }
    }

    const description = service.description 
      ? service.description.slice(0, 160) + (service.description.length > 160 ? '...' : '')
      : `${service.title} - Professional service in ${service.category}`

    return {
      title: `${service.title} | KGP Marketplace`,
      description,
      openGraph: {
        title: service.title,
        description,
        images: service.images?.[0] ? [service.images[0]] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Service | KGP Marketplace',
    }
  }
}

export default async function Page({ params }: Props) {
  try {
    const resolvedParams = await params;
    const serviceData = await loadServiceDataOptimized(resolvedParams.id)
    
    return <ClientServiceDetailPage initialData={serviceData} serviceId={resolvedParams.id} />
  } catch (error) {
    console.error('Error in ServiceDetailPage:', error)
    notFound()
  }
}

// Aggressive caching for production performance
export const revalidate = 300 // 5 minutes