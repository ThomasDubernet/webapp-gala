import { useCallback, useEffect, useState } from 'react'

const apiUrl = '/api/'

/**
 * Hook pour debouncer une valeur
 * @param {any} value - La valeur à debouncer
 * @param {number} delay - Délai en ms (défaut: 300)
 * @returns {any} - La valeur debouncée
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

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

// eslint-disable-next-line import/prefer-default-export
export const useGetMany = (path) => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const load = useCallback(async () => {
    setLoading(true)
    const response = await fetch(apiUrl + path, {
      headers: {
        Accept: 'application/json',
      },
    })

    const responseData = await response.json()

    if (response.ok) {
      setItems(responseData)
    }

    setLoading(false)
  }, [path])

  return {
    loading,
    load,
    items,
  }
}
