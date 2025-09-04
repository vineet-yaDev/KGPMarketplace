// app/products/[id]/page.tsx
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import ClientProductDetailPage from './ClientProductDetailPage'
import { getProductById, getSimilarProducts, getAllServices, getAllProducts } from '@/lib/db'
import type { ProductDetailResponse, Product as TProduct, Service as TService } from '@/lib/types'

type Props = {
  params: Promise<{ id: string }>
}

async function getOriginFromHeaders(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  // Fallback if host is missing (local dev)
  const origin = host ? `${proto}://${host}` : 'http://localhost:3000'
  return origin
}

function toISO(d: string | Date | undefined | null): string {
  if (!d) return new Date(0).toISOString()
  if (d instanceof Date) return d.toISOString()
  const t = typeof d === 'string' ? Date.parse(d) : NaN
  return isNaN(t) ? new Date().toISOString() : new Date(t).toISOString()
}

type OwnerPartial = {
  id?: string
  name?: string | null
  email?: string
  image?: string | null
  mobileNumber?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  isBlocked?: boolean
} | null

type ProductLike = {
  id: string
  title: string
  description?: string | null
  price?: number | null
  originalPrice?: number | null
  productType: TProduct['productType']
  status: TProduct['status']
  condition: number
  ageInMonths?: number | null
  addressHall?: TProduct['addressHall'] | null
  mobileNumber?: string | null
  ecommerceLink?: string | null
  invoiceImageUrl?: string | null
  seasonality: TProduct['seasonality']
  category: TProduct['category']
  images?: string[]
  createdAt?: Date | string
  updatedAt?: Date | string
  ownerId: string
  owner?: OwnerPartial
}

type ServiceLike = {
  id: string
  title: string
  description?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  addressHall?: TService['addressHall'] | null
  portfolioUrl?: string | null
  experienceYears?: number | null
  mobileNumber?: string | null
  category: TService['category']
  images?: string[]
  createdAt?: Date | string
  updatedAt?: Date | string
  ownerId: string
  owner?: OwnerPartial
}

function serializeProduct(p: ProductLike): TProduct {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? null,
    price: p.price ?? null,
    originalPrice: p.originalPrice ?? null,
    productType: p.productType,
    status: p.status,
    condition: p.condition,
    ageInMonths: p.ageInMonths ?? null,
    addressHall: p.addressHall ?? null,
    mobileNumber: p.mobileNumber ?? null,
    ecommerceLink: p.ecommerceLink ?? null,
    invoiceImageUrl: p.invoiceImageUrl ?? null,
    seasonality: p.seasonality,
    category: p.category,
    images: p.images ?? [],
    createdAt: toISO(p.createdAt),
    updatedAt: toISO(p.updatedAt),
    ownerId: p.ownerId,
    owner: {
      id: p.owner?.id ?? '',
      name: p.owner?.name ?? null,
      email: p.owner?.email ?? '',
      image: p.owner?.image ?? null,
      mobileNumber: p.owner?.mobileNumber ?? null,
      createdAt: toISO(p.owner?.createdAt ?? p.createdAt),
      updatedAt: toISO(p.owner?.updatedAt ?? p.updatedAt),
  isBlocked: p.owner?.isBlocked ?? false,
    },
  }
}

function serializeService(s: ServiceLike): TService {
  return {
    id: s.id,
    title: s.title,
    description: s.description ?? null,
    minPrice: s.minPrice ?? null,
    maxPrice: s.maxPrice ?? null,
    addressHall: s.addressHall ?? null,
    portfolioUrl: s.portfolioUrl ?? null,
    experienceYears: s.experienceYears ?? null,
    mobileNumber: s.mobileNumber ?? null,
    category: s.category,
    images: s.images ?? [],
    createdAt: toISO(s.createdAt),
    updatedAt: toISO(s.updatedAt),
    ownerId: s.ownerId,
    owner: {
      id: s.owner?.id ?? '',
      name: s.owner?.name ?? null,
      email: s.owner?.email ?? '',
      image: s.owner?.image ?? null,
      mobileNumber: s.owner?.mobileNumber ?? null,
      createdAt: toISO(s.owner?.createdAt ?? s.createdAt),
      updatedAt: toISO(s.owner?.updatedAt ?? s.updatedAt),
    isBlocked: s.owner?.isBlocked ?? false,
    },
  }
}

// Ultra-fast loading - show product details immediately, defer similar content
async function loadProductDataOptimized(id: string): Promise<ProductDetailResponse | null> {
  const product = await getProductById(id)
  if (!product) return null

  // Return immediately with just the product, load similar content separately
  return {
    product: serializeProduct(product),
    similarProducts: [], // Load these async on client
    relatedServices: [], // Load these async on client
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const origin = await getOriginFromHeaders()
  const product = await getProductById(resolvedParams.id)

  const priceText =
    product?.price === 0
      ? 'FREE'
      : product?.price
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)
        : 'Price on request'

  const title = product
    ? `${product.title} - KGP Marketplace`
    : 'Product - KGP Marketplace'

  const description = product
    ? `${product.description || product.title} - ${priceText} on KGP Marketplace`
    : 'Find great deals on KGP Marketplace'

  // First product image as preview (absolute URL)
  const rawImage = product?.images?.[0]
  const imageUrl = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `${origin}${rawImage}`)
    : `${origin}/fullicon.png` // fallback to existing public asset

  const url = `${origin}/products/${resolvedParams.id}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'KGP Marketplace',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product?.title ?? 'Product image',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@kgpmarketplace',
    },
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params
  // Server-fetch via DB to avoid internal HTTP roundtrip
  const data = await loadProductDataOptimized(resolvedParams.id)

  return (
    <ClientProductDetailPage
      initialData={data ?? undefined}
      productId={resolvedParams.id}
    />
  )
}

// Aggressive caching for production - cache for 5 minutes
export const revalidate = 300

// Pre-render popular products for instant loading
export async function generateStaticParams() {
  try {
    // Only pre-render top 20 most recent products to avoid build timeouts
    const products = await getAllProducts(20, 'newest') as unknown as ProductLike[]
    return products.map((p) => ({ id: p.id }))
  } catch {
    // Fail gracefully - no static params is better than build failure
    return []
  }
}