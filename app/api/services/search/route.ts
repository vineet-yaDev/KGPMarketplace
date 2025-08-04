// app/api/services/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/lib/search';

interface ServiceSearchFilters {
  category?: string;
  hall?: string;
  experience?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  type: 'service';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No query provided'
      });
    }

    const filters: ServiceSearchFilters = {
      type: 'service'
    };
    
    const category = searchParams.get('category');
    const hall = searchParams.get('hall');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const experience = searchParams.get('experience');
    
    if (category && category.trim() !== '') {
      filters.category = category.toUpperCase();
    }
    
    if (hall && hall.trim() !== '') {
      filters.hall = hall.toUpperCase();
    }
    
    if (experience && experience.trim() !== '') {
      filters.experience = experience;
    }
    
    // Handle price range
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      filters.priceRange = {
        min: !isNaN(min!) ? min : undefined,
        max: !isNaN(max!) ? max : undefined
      };
    }
    
    const results = await searchService.searchServices(query, filters, 100);
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      query: query.trim(),
      appliedFilters: filters
    });

  } catch (error) {
    console.error('Service search API error:', error);
    return NextResponse.json(
      { success: false, message: 'Search failed' },
      { status: 500 }
    );
  }
}
