import { useCallback, useState } from 'react'

const apiUrl = '/api/'

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
