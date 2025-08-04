// hooks/useServiceSearch.ts
'use client';

import { useState, useCallback } from 'react';
import { Service } from '@/lib/types';

interface ServiceSearchFilters {
  category?: string;
  hall?: string;
  minPrice?: number;
  maxPrice?: number;
  experience?: string;
}

export function useServiceSearch() {
  const [results, setResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters?: ServiceSearchFilters) => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: query.trim() });
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.hall) params.append('hall', filters.hall);
      if (filters?.experience) params.append('experience', filters.experience);
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

      const response = await fetch(`/api/services/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
        return data.data || [];
      } else {
        setError(data.message || 'Search failed');
        setResults([]);
        return [];
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Search error:', err);
      setResults([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}