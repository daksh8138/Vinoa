"use client"

import { useCallback, useRef } from "react"
import type { Size } from "@/types/canvas"

export type ImageHistoryEntry = {
  src: string
  size: Size
}

type ImageHistory = {
  past: ImageHistoryEntry[]
  present: ImageHistoryEntry
  future: ImageHistoryEntry[]
}

export function useImageHistory() {
  const histories = useRef<Map<string, ImageHistory>>(new Map())

  const initHistory = useCallback((id: string, entry: ImageHistoryEntry) => {
    if (!histories.current.has(id)) {
      histories.current.set(id, {
        past: [],
        present: entry,
        future: [],
      })
    }
  }, [])

  const pushState = useCallback((id: string, entry: ImageHistoryEntry) => {
    const history = histories.current.get(id)
    if (!history) {
      initHistory(id, entry)
      return
    }

    histories.current.set(id, {
      past: [...history.past, history.present],
      present: entry,
      future: [],
    })
  }, [initHistory])

  const undo = useCallback((id: string): ImageHistoryEntry | null => {
    const history = histories.current.get(id)
    if (!history || history.past.length === 0) return null

    const previous = history.past[history.past.length - 1]
    histories.current.set(id, {
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future],
    })

    return previous
  }, [])

  const redo = useCallback((id: string): ImageHistoryEntry | null => {
    const history = histories.current.get(id)
    if (!history || history.future.length === 0) return null

    const next = history.future[0]
    histories.current.set(id, {
      past: [...history.past, history.present],
      present: next,
      future: history.future.slice(1),
    })

    return next
  }, [])

  const canUndo = useCallback((id: string): boolean => {
    const history = histories.current.get(id)
    return !!history && history.past.length > 0
  }, [])

  const canRedo = useCallback((id: string): boolean => {
    const history = histories.current.get(id)
    return !!history && history.future.length > 0
  }, [])

  const removeHistory = useCallback((id: string) => {
    histories.current.delete(id)
  }, [])

  return {
    initHistory,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    removeHistory,
  }
}
