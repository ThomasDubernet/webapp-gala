import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useDebounce } from './useDebounce'
import type { Personne } from '../types/api'

const API_URL = '/api/personnes/search'

export interface PersonneWithFullname extends Personne {
  fullname: string
}

interface UseSearchPersonnesOptions {
  searchQuery?: string
  debounceDelay?: number
  minChars?: number
  unassignedOnly?: boolean
  page?: number
  limit?: number
  loadOnEmpty?: boolean
}

interface UseSearchPersonnesResult {
  results: PersonneWithFullname[]
  loading: boolean
  error: Error | null
  total: number
  pages: number
  currentPage: number
  hasSearched: boolean
  refresh: () => void
}

interface SearchResponse {
  items: Personne[]
  total: number
  pages: number
}

async function fetchPersonnes(
  query: string,
  unassignedOnly: boolean,
  page: number,
  limit: number
): Promise<SearchResponse> {
  const params = new URLSearchParams()

  if (query) {
    params.append('q', query)
  }

  if (unassignedOnly) {
    params.append('unassigned', 'true')
  }

  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const response = await fetch(`${API_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`)
  }

  return response.json()
}

/**
 * Hook de recherche de personnes côté serveur avec TanStack Query
 */
export const useSearchPersonnes = ({
  searchQuery = '',
  debounceDelay = 300,
  minChars = 2,
  unassignedOnly = false,
  page = 1,
  limit = 50,
  loadOnEmpty = false,
}: UseSearchPersonnesOptions = {}): UseSearchPersonnesResult => {
  const queryClient = useQueryClient()
  const debouncedQuery = useDebounce(searchQuery, debounceDelay)

  // Determine if we should fetch
  const shouldFetch = loadOnEmpty || (debouncedQuery.length >= minChars)

  const queryKey = ['personnes', 'search', debouncedQuery, unassignedOnly, page, limit] as const

  const { data, isLoading, error, isFetched } = useQuery({
    queryKey,
    queryFn: () => fetchPersonnes(debouncedQuery, unassignedOnly, page, limit),
    enabled: shouldFetch,
  })

  // Enrich results with fullname
  const results = useMemo<PersonneWithFullname[]>(() => {
    if (!data?.items) return []
    return data.items.map((p) => ({
      ...p,
      fullname: `${p.prenom || ''} ${p.nom || ''}`.trim(),
    }))
  }, [data?.items])

  const refresh = useCallback(() => {
    // Invalidate all personnes queries to force refetch
    queryClient.invalidateQueries({ queryKey: ['personnes'] })
  }, [queryClient])

  return {
    results: shouldFetch ? results : [],
    loading: isLoading,
    error: error as Error | null,
    total: data?.total || 0,
    pages: data?.pages || 0,
    currentPage: page,
    hasSearched: shouldFetch && isFetched,
    refresh,
  }
}
