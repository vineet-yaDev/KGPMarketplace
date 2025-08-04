// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/lib/search';

interface UniversalSearchFilters {
  category?: string;
  hall?: string;
  type?: 'product' | 'service' | 'demand';
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Return early if no query provided
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        products: [],
        services: [],
        demands: [],
        total: 0
      });
    }

    // Define a properly typed filters object
    const filters: UniversalSearchFilters = {};
    
    // Read all potential filters from the URL
    const category = searchParams.get('category');
    const hall = searchParams.get('hall');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const type = searchParams.get('type');

    if (category) filters.category = category;
    if (hall) filters.hall = hall;
    if (type && (type === 'product' || type === 'service' || type === 'demand')) {
      filters.type = type;
    }
    
    // Handle price range filter
    const min = minPrice ? parseFloat(minPrice) : NaN;
    const max = maxPrice ? parseFloat(maxPrice) : NaN;
    if (!isNaN(min) || !isNaN(max)) {
      filters.priceRange = { 
        min: isNaN(min) ? undefined : min, 
        max: isNaN(max) ? undefined : max 
      };
    }

    // Perform the universal search with the query and filters
    const results = await searchService.universalSearch(query, filters);
    
    return NextResponse.json(results);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { message: 'An internal error occurred during search.' },
      { status: 500 }
    );
  }
}
