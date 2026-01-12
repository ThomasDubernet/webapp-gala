import { useCallback, useEffect, useState } from 'react'
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

/**
 * Hook de recherche de personnes côté serveur
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
  const [results, setResults] = useState<PersonneWithFullname[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const debouncedQuery = useDebounce(searchQuery, debounceDelay)

  const fetchResults = useCallback(
    async (query: string) => {
      setLoading(true)
      setError(null)

      try {
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

        const data = await response.json()

        // Ajouter le champ fullname à chaque personne
        const enrichedResults: PersonneWithFullname[] = (data.items || []).map((p: Personne) => ({
          ...p,
          fullname: `${p.prenom || ''} ${p.nom || ''}`.trim(),
        }))

        setResults(enrichedResults)
        setTotal(data.total || 0)
        setPages(data.pages || 0)
        setHasSearched(true)
      } catch (err) {
        console.error('Erreur de recherche:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setResults([])
        setTotal(0)
        setPages(0)
      } finally {
        setLoading(false)
      }
    },
    [unassignedOnly, page, limit],
  )

  useEffect(() => {
    // Si la recherche est vide
    if (!debouncedQuery || debouncedQuery.length < minChars) {
      if (loadOnEmpty) {
        // Charger tous les résultats si loadOnEmpty est activé
        fetchResults('')
      } else {
        // Sinon, réinitialiser les résultats
        setResults([])
        setTotal(0)
        setPages(0)
        setHasSearched(false)
      }
      return
    }

    // Recherche avec le terme debounced
    fetchResults(debouncedQuery)
  }, [debouncedQuery, minChars, loadOnEmpty, fetchResults, refreshTrigger])

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  return {
    results,
    loading,
    error,
    total,
    pages,
    currentPage: page,
    hasSearched,
    refresh,
  }
}
