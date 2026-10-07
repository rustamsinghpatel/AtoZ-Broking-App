import { useCallback, useEffect, useState } from 'react'

export default function useAsync(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }))
    let active = true
    fetcher()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch(() => active && setState({ data: null, loading: false, error: 'Something went wrong while loading data.' }))
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => run(), [run])
  return { ...state, reload: run }
}
