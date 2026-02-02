import { useState, useEffect } from 'react'
import { fetchYearlyData, fetchDailyData, fetchLatestPrice } from '../lib/api'

export function useYearlyData(year: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchYearlyData(year)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [year])

  return { data, loading, error }
}

export function useDailyData(date: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchDailyData(date), fetchLatestPrice(date)])
      .then(([daily, latest]) => setData({ daily, latest }))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [date])

  return { data, loading, error }
}
