// app/products/[id]/page.tsx
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import ClientProductDetailPage from './ClientProductDetailPage'
import type { ProductDetailResponse } from '@/lib/types'

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

async function fetchProduct(origin: string, id: string): Promise<ProductDetailResponse | null> {
  try {
    const res = await fetch(`${origin}/api/products/${id}`, {
      // Use revalidate if your product data is cacheable:
      // next: { revalidate: 60 },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const origin = await getOriginFromHeaders()
  const data = await fetchProduct(origin, resolvedParams.id)
  const product = data?.product

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
    : `${origin}/default-og.png` // ensure this file exists in /public

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

export default function Page() {
  // UI remains a client component; it can fetch on the client as before.
  return <ClientProductDetailPage />
}