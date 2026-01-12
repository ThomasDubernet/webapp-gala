import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'

const API_URL = '/api/personnes/search'

/**
 * Hook de recherche de personnes côté serveur
 *
 * @param {Object} options
 * @param {string} options.searchQuery - Terme de recherche
 * @param {number} options.debounceDelay - Délai de debounce en ms (défaut: 300)
 * @param {number} options.minChars - Nombre minimum de caractères pour déclencher la recherche (défaut: 2)
 * @param {boolean} options.unassignedOnly - Si true, retourne uniquement les personnes sans table
 * @param {number} options.page - Numéro de page (défaut: 1)
 * @param {number} options.limit - Nombre d'éléments par page (défaut: 50)
 * @param {boolean} options.loadOnEmpty - Si true, charge tous les résultats quand la recherche est vide (défaut: false)
 *
 * @returns {Object}
 *   - results: Array de personnes avec le champ fullname ajouté
 *   - loading: boolean
 *   - error: Error ou null
 *   - total: Nombre total de résultats
 *   - pages: Nombre total de pages
 *   - currentPage: Page actuelle
 *   - hasSearched: Si une recherche a été effectuée
 *   - refresh: Fonction pour forcer le rechargement
 */
export const useSearchPersonnes = ({
  searchQuery = '',
  debounceDelay = 300,
  minChars = 2,
  unassignedOnly = false,
  page = 1,
  limit = 50,
  loadOnEmpty = false,
} = {}) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const debouncedQuery = useDebounce(searchQuery, debounceDelay)

  const fetchResults = useCallback(
    async (query) => {
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
        const enrichedResults = (data.items || []).map((p) => ({
          ...p,
          fullname: `${p.prenom || ''} ${p.nom || ''}`.trim(),
        }))

        setResults(enrichedResults)
        setTotal(data.total || 0)
        setPages(data.pages || 0)
        setHasSearched(true)
      } catch (err) {
        console.error('Erreur de recherche:', err)
        setError(err)
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
