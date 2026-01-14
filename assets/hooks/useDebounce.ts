import { useEffect, useState } from 'react'

/**
 * Hook pour debouncer une valeur
 * @param value - La valeur à debouncer
 * @param delay - Délai en ms (défaut: 300)
 * @returns La valeur debouncée
 */
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

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
