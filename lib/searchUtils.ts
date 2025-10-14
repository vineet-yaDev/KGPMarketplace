/**
 * Search utility functions for space-insensitive matching
 */

/**
 * Normalize text by removing spaces and converting to lowercase for space-insensitive matching
 */
export function normalizeForSpaceInsensitiveMatch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '')
}

/**
 * Check if text contains query with space-insensitive matching
 * Returns true if either regular includes or space-insensitive includes matches
 */
export function spaceInsensitiveIncludes(text: string, query: string): boolean {
  if (!text || !query) return false
  
  const normalizedText = normalizeForSpaceInsensitiveMatch(text)
  const normalizedQuery = normalizeForSpaceInsensitiveMatch(query)
  
  // Check both regular matching and space-insensitive matching
  return text.toLowerCase().includes(query.toLowerCase()) || 
         normalizedText.includes(normalizedQuery)
}

/**
 * Check if text or description matches query using space-insensitive search
 * This is the main function to use in product/service filtering
 */
export function matchesSearchQuery(
  title: string, 
  description: string | null | undefined, 
  query: string
): boolean {
  if (!query) return true
  
  const titleMatches = spaceInsensitiveIncludes(title, query)
  const descMatches = description ? spaceInsensitiveIncludes(description, query) : false
  
  return titleMatches || descMatches
}