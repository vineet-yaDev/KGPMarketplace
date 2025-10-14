import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for debounced values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 700ms)
 */
export function useDebounce<T>(value: T, delay: number = 700): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for debounced search functionality
 * @param searchFunction - The function to call when search is triggered
 * @param delay - Delay in milliseconds (default: 700ms)
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T> | T,
  delay: number = 700
) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<T | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, delay)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults(null)
      setSearchError(null)
      setIsSearching(false)
      return
    }

    const performSearch = async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      setIsSearching(true)
      setSearchError(null)

      try {
        const result = await searchFunction(debouncedQuery)
        setSearchResults(result)
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setSearchError(error.message)
        }
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedQuery, searchFunction])

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    searchError,
    debouncedQuery
  }
}