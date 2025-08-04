// hooks/useDemandSearch.ts
'use client';

import { useState, useCallback } from 'react';
import { Demand } from '@/lib/types';

interface DemandSearchFilters {
  category?: string;
  hall?: string;
}

export function useDemandSearch() {
  const [results, setResults] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters?: DemandSearchFilters) => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: query.trim() });
      
      if (filters?.category && filters.category !== 'All Categories') {
        params.append('category', filters.category);
      }
      if (filters?.hall) params.append('hall', filters.hall);

      const response = await fetch(`/api/demands/search?${params}`);
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
      console.error('Demand search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}