"use client"

import { useState, useCallback, useEffect } from "react"

export function getStorageItemWithMigration(
  key: string,
  legacyKey?: string
): string | null {
  if (typeof window === "undefined") return null
  let stored = localStorage.getItem(key)
  if (stored === null && legacyKey) {
    const legacyStored = localStorage.getItem(legacyKey)
    if (legacyStored !== null) {
      try {
        localStorage.setItem(key, legacyStored)
      } catch {
        // Ignore storage errors
      }
      stored = legacyStored
    }
  }
  return stored
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  legacyKey?: string
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue
    try {
      const stored = getStorageItemWithMigration(key, legacyKey)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(nextValue))
        } catch {
          // Ignore storage errors
        }
        return nextValue
      })
    },
    [key]
  )

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setState(JSON.parse(e.newValue))
        } catch {
          // Ignore parse errors
        }
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [key])

  return [state, setValue]
}
