import { useState, useCallback, useEffect } from 'react'
import { GlobalSearchResults } from '@/lib/searchService'
import { useDebounce } from './useDebounce'

interface UseGlobalSearchReturn {
  search: (query: string) => void
  results: GlobalSearchResults | null
  loading: boolean
  error: string | null
  searchQuery: string
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search query with 700ms delay
  const debouncedQuery = useDebounce(searchQuery, 700)

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults(null)
      setLoading(false)
      return
    }

    const performSearch = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=20`)
        
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`)
        }

        const data = await response.json()
        setResults(data)
      } catch (err) {
        console.error('Global search error:', err)
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults(null)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return {
    search,
    results,
    loading,
    error,
    searchQuery
  }
}