import { useEffect, useState } from 'react'

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
