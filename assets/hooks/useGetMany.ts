import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

const apiUrl = '/api/'

/**
 * Hook pour récupérer une collection depuis l'API
 * Utilise TanStack Query pour la gestion du cache et l'invalidation automatique
 * @param path - Chemin de l'API (sans le préfixe /api/)
 * @returns { loading, load, items }
 */
export const useGetMany = <T>(path: string) => {
  // Track si load() a été appelé au moins une fois
  const [hasLoaded, setHasLoaded] = useState(false)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [path],
    queryFn: async () => {
      const response = await fetch(apiUrl + path, {
        headers: {
          Accept: 'application/json',
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      return responseData as T[]
    },
    // Activer la query seulement après le premier appel à load()
    enabled: hasLoaded,
    // Refetch automatiquement quand le cache est invalidé
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  // La fonction load active la query et déclenche le fetch
  const load = useCallback(async () => {
    if (!hasLoaded) {
      setHasLoaded(true)
    } else {
      await refetch()
    }
  }, [hasLoaded, refetch])

  return {
    loading: isLoading || isFetching,
    load,
    items: data ?? [],
  }
}
