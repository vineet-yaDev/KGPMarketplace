// app/api/demands/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/lib/search';

interface DemandSearchFilters {
  category?: string;
  hall?: string;
  type: 'demand';
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

    const filters: DemandSearchFilters = {
      type: 'demand'
    };
    
    const category = searchParams.get('category');
    const hall = searchParams.get('hall');
    
    if (category && category.trim() !== '' && category !== 'All Categories') {
      filters.category = category.toUpperCase();
    }
    
    if (hall && hall.trim() !== '') {
      filters.hall = hall.toUpperCase();
    }
    
    const results = await searchService.searchDemands(query, filters, 100);
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      query: query.trim(),
      appliedFilters: filters
    });

  } catch (error) {
    console.error('Demand search API error:', error);
    return NextResponse.json(
      { success: false, message: 'Search failed' },
      { status: 500 }
    );
  }
}
