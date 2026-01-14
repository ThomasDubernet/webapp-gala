import { useCallback, useState } from 'react'

const apiUrl = '/api/'

/**
 * Hook pour récupérer une collection depuis l'API
 * @param path - Chemin de l'API (sans le préfixe /api/)
 * @returns { loading, load, items }
 */
export const useGetMany = <T>(path: string) => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<T[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(apiUrl + path, {
        headers: {
          Accept: 'application/json',
        },
      })

      const responseData = await response.json()

      if (response.ok) {
        setItems(responseData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [path])

  return {
    loading,
    load,
    items,
  }
}
