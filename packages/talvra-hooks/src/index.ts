import { useEffect, useRef, useState } from 'react'

// useDebouncedValue: debounces a changing value
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// useEvent: stable event handler reference
export function useEvent<T extends (...args: any[]) => any>(handler: T) {
  const ref = useRef(handler)
  ref.current = handler
  return useRef((...args: Parameters<T>) => ref.current(...args)).current
}

// useIsMounted: tracks whether component is mounted
export function useIsMounted() {
  const ref = useRef(false)
  useEffect(() => {
    ref.current = true
    return () => {
      ref.current = false
    }
  }, [])
  return ref
}
