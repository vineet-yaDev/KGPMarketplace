// app/api/products/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/lib/search';

interface ProductSearchFilters {
  category?: string;
  hall?: string;
  productType?: string;
  status?: string;
  condition?: {
    min: number;
    max: number;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  type: 'product';
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

    const filters: ProductSearchFilters = {
      type: 'product'
    };
    
    const category = searchParams.get('category');
    const hall = searchParams.get('hall');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const productType = searchParams.get('productType');
    const status = searchParams.get('status');
    
    if (category && category.trim() !== '') {
      filters.category = category.toUpperCase();
    }
    
    if (hall && hall.trim() !== '') {
      filters.hall = hall.toUpperCase();
    }
    
    if (productType && productType.trim() !== '') {
      filters.productType = productType.toUpperCase();
    }

    if (status && status.trim() !== '') {
      filters.status = status.toUpperCase();
    }

    if (condition && condition.trim() !== '') {
      const conditionValue = parseInt(condition);
      if (!isNaN(conditionValue)) {
        filters.condition = {
          min: conditionValue,
          max: 5
        };
      }
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
    
    const results = await searchService.searchProducts(query, filters, 100);
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      query: query.trim(),
      appliedFilters: filters
    });

  } catch (error) {
    console.error('Product search API error:', error);
    return NextResponse.json(
      { success: false, message: 'Search failed' },
      { status: 500 }
    );
  }
}
