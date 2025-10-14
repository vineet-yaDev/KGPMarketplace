/**
 * Centralized Search Service
 * 
 * This service provides unified search functionality across all content types.
 * It can be easily extended to change search logic (fuzzy search, exact match, etc.)
 */

export interface SearchableItem {
  id: string
  title: string
  description?: string
  [key: string]: unknown
}

export interface SearchResult<T = SearchableItem> {
  item: T
  score: number
  matchType: 'title' | 'description' | 'both'
}

export interface GlobalSearchResults {
  products: SearchResult[]
  services: SearchResult[]
  demands: SearchResult[]
  total: number
  query: string
  suggestions?: string[]
}

/**
 * Search configuration options
 */
export interface SearchOptions {
  caseSensitive?: boolean
  exactMatch?: boolean
  matchWholeWords?: boolean
  minScore?: number
  maxResults?: number
}

/**
 * Default search options
 */
const DEFAULT_OPTIONS: SearchOptions = {
  caseSensitive: false,
  exactMatch: false,
  matchWholeWords: false,
  minScore: 0,
  maxResults: 50
}

/**
 * Normalize text by removing spaces and converting to lowercase for space-insensitive matching
 */
function normalizeForSpaceInsensitiveMatch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '')
}

/**
 * Check if text contains query with space-insensitive matching
 */
function spaceInsensitiveIncludes(text: string, query: string): boolean {
  const normalizedText = normalizeForSpaceInsensitiveMatch(text)
  const normalizedQuery = normalizeForSpaceInsensitiveMatch(query)
  return normalizedText.includes(normalizedQuery)
}

/**
 * Calculate search score based on match quality
 */
function calculateScore(item: SearchableItem, query: string): number {
  const normalizedQuery = query.toLowerCase()
  const title = item.title.toLowerCase()
  const description = item.description?.toLowerCase() || ''
  
  let score = 0
  
  // Title matches have higher priority - use both regular and space-insensitive matching
  const titleHasMatch = title.includes(normalizedQuery) || spaceInsensitiveIncludes(title, normalizedQuery)
  if (titleHasMatch) {
    // Exact title match gets highest score
    if (title === normalizedQuery || normalizeForSpaceInsensitiveMatch(title) === normalizeForSpaceInsensitiveMatch(normalizedQuery)) {
      score += 100
    }
    // Title starts with query gets high score
    else if (title.startsWith(normalizedQuery) || normalizeForSpaceInsensitiveMatch(title).startsWith(normalizeForSpaceInsensitiveMatch(normalizedQuery))) {
      score += 80
    }
    // Title contains query gets medium score
    else {
      score += 60
    }
  }
  
  // Description matches have lower priority - use both regular and space-insensitive matching
  const descriptionHasMatch = description.includes(normalizedQuery) || spaceInsensitiveIncludes(description, normalizedQuery)
  if (descriptionHasMatch) {
    score += 30
  }
  
  // Bonus for shorter matches (more relevant)
  const titleLength = title.length
  const queryLength = normalizedQuery.length
  if (titleLength > 0) {
    const lengthBonus = Math.max(0, 20 - (titleLength - queryLength))
    score += lengthBonus
  }
  
  return score
}

/**
 * Search within a single array of items
 */
function searchInArray<T extends SearchableItem>(
  items: T[], 
  query: string, 
  options: SearchOptions = {}
): SearchResult<T>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const normalizedQuery = opts.caseSensitive ? query : query.toLowerCase()
  
  if (!query.trim()) return []
  
  const results: SearchResult<T>[] = []
  
  for (const item of items) {
    const title = opts.caseSensitive ? item.title : item.title.toLowerCase()
    const description = opts.caseSensitive ? (item.description || '') : (item.description?.toLowerCase() || '')
    
    let hasMatch = false
    let matchType: 'title' | 'description' | 'both' = 'title'
    
    // Check title match (both regular and space-insensitive)
    const titleMatch = opts.exactMatch 
      ? (title === normalizedQuery || normalizeForSpaceInsensitiveMatch(title) === normalizeForSpaceInsensitiveMatch(normalizedQuery))
      : (title.includes(normalizedQuery) || spaceInsensitiveIncludes(title, normalizedQuery))
    
    // Check description match (both regular and space-insensitive)
    const descMatch = opts.exactMatch
      ? (description === normalizedQuery || normalizeForSpaceInsensitiveMatch(description) === normalizeForSpaceInsensitiveMatch(normalizedQuery))
      : (description.includes(normalizedQuery) || spaceInsensitiveIncludes(description, normalizedQuery))
    
    if (titleMatch && descMatch) {
      hasMatch = true
      matchType = 'both'
    } else if (titleMatch) {
      hasMatch = true
      matchType = 'title'
    } else if (descMatch) {
      hasMatch = true
      matchType = 'description'
    }
    
    if (hasMatch) {
      const score = calculateScore(item, normalizedQuery)
      
      if (score >= (opts.minScore || 0)) {
        results.push({
          item,
          score,
          matchType
        })
      }
    }
  }
  
  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score)
  
  // Apply max results limit
  return opts.maxResults ? results.slice(0, opts.maxResults) : results
}

/**
 * Global search across all content types
 */
export function performGlobalSearch(
  data: {
    products: SearchableItem[]
    services: SearchableItem[]
    demands: SearchableItem[]
  },
  query: string,
  options: SearchOptions = {}
): GlobalSearchResults {
  
  if (!query.trim()) {
    return {
      products: [],
      services: [],
      demands: [],
      total: 0,
      query
    }
  }
  
  const products = searchInArray(data.products, query, options)
  const services = searchInArray(data.services, query, options)
  const demands = searchInArray(data.demands, query, options)
  
  return {
    products,
    services,
    demands,
    total: products.length + services.length + demands.length,
    query
  }
}

/**
 * Search suggestions based on partial matches
 */
export function generateSearchSuggestions(
  data: {
    products: SearchableItem[]
    services: SearchableItem[]
    demands: SearchableItem[]
  },
  query: string,
  maxSuggestions: number = 5
): string[] {
  
  if (!query.trim() || query.length < 2) return []
  
  const suggestions = new Set<string>()
  const normalizedQuery = query.toLowerCase()
  
  // Collect all items
  const allItems = [...data.products, ...data.services, ...data.demands]
  
  for (const item of allItems) {
    const title = item.title.toLowerCase()
    
    // Add titles that start with the query (both regular and space-insensitive)
    const normalizedTitle = normalizeForSpaceInsensitiveMatch(title)
    const normalizedQueryForSuggestion = normalizeForSpaceInsensitiveMatch(normalizedQuery)
    
    if ((title.startsWith(normalizedQuery) && title !== normalizedQuery) ||
        (normalizedTitle.startsWith(normalizedQueryForSuggestion) && normalizedTitle !== normalizedQueryForSuggestion)) {
      suggestions.add(item.title)
    }
    
    // Add words from titles that start with query
    const words = title.split(' ')
    for (const word of words) {
      const normalizedWord = normalizeForSpaceInsensitiveMatch(word)
      if ((word.startsWith(normalizedQuery) && word !== normalizedQuery && word.length > 2) ||
          (normalizedWord.startsWith(normalizedQueryForSuggestion) && normalizedWord !== normalizedQueryForSuggestion && word.length > 2)) {
        suggestions.add(word)
      }
    }
  }
  
  return Array.from(suggestions).slice(0, maxSuggestions)
}

/**
 * Filter search results by category or type
 */
export function filterSearchResults<T extends SearchableItem>(
  results: SearchResult<T>[],
  filters: { [key: string]: unknown }
): SearchResult<T>[] {
  return results.filter(result => {
    for (const [key, value] of Object.entries(filters)) {
      if (value && result.item[key] !== value) {
        return false
      }
    }
    return true
  })
}