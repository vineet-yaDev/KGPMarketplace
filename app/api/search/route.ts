import { NextResponse } from 'next/server'
import { performGlobalSearch, SearchOptions } from '@/lib/searchService'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const maxResults = parseInt(searchParams.get('limit') || '20')
    
    if (!query.trim() || query.length < 2) {
      return NextResponse.json({
        products: [],
        services: [],
        demands: [],
        total: 0,
        query
      })
    }

    // Fetch all data from database
    const [products, services, demands] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          category: true,
          addressHall: true,
          images: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.service.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          minPrice: true,
          maxPrice: true,
          category: true,
          addressHall: true,
          images: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.demand.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          productCategory: true,
          serviceCategory: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    // Search options
    const searchOptions: SearchOptions = {
      caseSensitive: false,
      exactMatch: false,
      maxResults: maxResults
    }

    // Prepare data for search
    const searchData = {
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description || undefined,
        price: p.price,
        category: p.category,
        addressHall: p.addressHall,
        images: p.images,
        createdAt: p.createdAt
      })),
      services: services.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description || undefined,
        minPrice: s.minPrice,
        maxPrice: s.maxPrice,
        category: s.category,
        addressHall: s.addressHall,
        images: s.images,
        createdAt: s.createdAt
      })),
      demands: demands.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description || undefined,
        productCategory: d.productCategory,
        serviceCategory: d.serviceCategory,
        createdAt: d.createdAt
      }))
    }

    // Perform global search
    const searchResults = performGlobalSearch(searchData, query, searchOptions)

    // Add suggestions if no results found
    if (searchResults.total === 0) {
      const { generateSearchSuggestions } = await import('@/lib/searchService')
      searchResults.suggestions = generateSearchSuggestions(searchData, query, 3)
    }

    return NextResponse.json(searchResults)

  } catch (error) {
    console.error('Global search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}