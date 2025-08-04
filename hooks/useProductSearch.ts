// hooks/useProductSearch.ts
'use client';

import { useState, useCallback } from 'react';
import { Product } from '@/lib/types';

interface ProductSearchFilters {
  category?: string;
  hall?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  productType?: string;
  status?: string;
}

export function useProductSearch() {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters?: ProductSearchFilters) => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: query.trim() });
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.hall) params.append('hall', filters.hall);
      if (filters?.productType) params.append('productType', filters.productType);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.condition) params.append('condition', filters.condition);
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

      const response = await fetch(`/api/products/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        return data.data;
      } else {
        setError(data.message || 'Search failed');
        return [];
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
