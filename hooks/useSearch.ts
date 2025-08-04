// src/hooks/useSearch.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
// Import the result types from your types file for type safety
import { Product, Service, Demand } from '@/lib/types'

// This interface defines the shape of the data we expect from our API
export interface SearchResults {
  products: Product[]
  services: Service[]
  demands: Demand[]
  total: number
}

export function useSearch(debounceDelay: number = 300) {
  const [query, setQuery] = useState<string>('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Don't search if the query is too short
    if (query.trim().length < 2) {
      setResults(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const { signal } = controller

    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data: SearchResults = await response.json()
        setResults(data)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search fetch error:', err)
          setError('Failed to fetch search results.')
        }
      } finally {
        setLoading(false)
      }
    }

    // Set up the debounce timer
    const debounceId = setTimeout(() => {
      fetchResults()
    }, debounceDelay)

    // Cleanup function to cancel the timer and the API request if the user types again
    return () => {
      clearTimeout(debounceId)
      controller.abort()
    }
  }, [query, debounceDelay])

  // This is the function we'll call from our component to start a search
  const search = useCallback((newQuery: string) => {
    setQuery(newQuery)
  }, [])

  return { search, results, loading, error }
}
