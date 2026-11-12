"use client"

import { useCallback, useState } from "react"
import type { CanvasItem, CanvasState, Position, SelectionMode, ImageCanvasItem, AsciiCanvasItem } from "@/types/canvas"
import { generateId } from "@/utils/id"

const INITIAL_STATE: CanvasState = {
  items: [],
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedItemIds: new Set(),
  focusStack: [],
}

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1

export function useCanvas() {
  const [state, setState] = useState<CanvasState>(INITIAL_STATE)

  const addItem = useCallback((item: Omit<CanvasItem, "id">) => {
    const newItem = { ...item, id: generateId() } as CanvasItem
    setState((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
      selectedItemIds: new Set([newItem.id]),
      focusStack: [...prev.focusStack, newItem.id],
    }))
    return newItem.id
  }, [])

  const addItems = useCallback((items: Omit<CanvasItem, "id">[]) => {
    const newItems = items.map((item) => ({ ...item, id: generateId() }) as CanvasItem)
    const newIds = newItems.map((item) => item.id)
    setState((prev) => ({
      ...prev,
      items: [...prev.items, ...newItems],
      selectedItemIds: new Set(newIds),
      focusStack: [...prev.focusStack, ...newIds],
    }))
    return newIds
  }, [])

  const removeItem = useCallback((id: string) => {
    setState((prev) => {
      const newStack = prev.focusStack.filter((fid) => fid !== id)
      const newSelectedIds = new Set(prev.selectedItemIds)
      newSelectedIds.delete(id)
      if (newSelectedIds.size === 0 && newStack.length > 0) {
        newSelectedIds.add(newStack[newStack.length - 1])
      }
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
        selectedItemIds: newSelectedIds,
        focusStack: newStack,
      }
    })
  }, [])

  const removeItems = useCallback((ids: string[]) => {
    setState((prev) => {
      const idsSet = new Set(ids)
      const newStack = prev.focusStack.filter((fid) => !idsSet.has(fid))
      const newSelectedIds = new Set(
        Array.from(prev.selectedItemIds).filter((id) => !idsSet.has(id))
      )
      if (newSelectedIds.size === 0 && newStack.length > 0) {
        newSelectedIds.add(newStack[newStack.length - 1])
      }
      return {
        ...prev,
        items: prev.items.filter((item) => !idsSet.has(item.id)),
        selectedItemIds: newSelectedIds,
        focusStack: newStack,
      }
    })
  }, [])

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<CanvasItem, "id" | "type">>) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }))
    },
    []
  )

  const updateItemsPositions = useCallback(
    (positionUpdates: Array<{ id: string; position: Position }>) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          const update = positionUpdates.find((u) => u.id === item.id)
          return update ? { ...item, position: update.position } : item
        }),
      }))
    },
    []
  )

  const selectItem = useCallback((id: string | null, mode: SelectionMode = "replace") => {
    setState((prev) => {
      if (!id) {
        return { ...prev, selectedItemIds: new Set() }
      }

      let newSelectedIds: Set<string>

      switch (mode) {
        case "replace":
          newSelectedIds = new Set([id])
          break
        case "toggle":
          newSelectedIds = new Set(prev.selectedItemIds)
          if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id)
          } else {
            newSelectedIds.add(id)
          }
          break
        case "add":
          newSelectedIds = new Set(prev.selectedItemIds)
          newSelectedIds.add(id)
          break
        default:
          newSelectedIds = new Set([id])
      }

      const newStack = [...prev.focusStack.filter((fid) => fid !== id), id]
      return { ...prev, selectedItemIds: newSelectedIds, focusStack: newStack }
    })
  }, [])

  const selectItems = useCallback((ids: string[], mode: SelectionMode = "replace") => {
    setState((prev) => {
      let newSelectedIds: Set<string>

      switch (mode) {
        case "replace":
          newSelectedIds = new Set(ids)
          break
        case "add":
          newSelectedIds = new Set([...prev.selectedItemIds, ...ids])
          break
        case "toggle":
          newSelectedIds = new Set(prev.selectedItemIds)
          ids.forEach((id) => {
            if (newSelectedIds.has(id)) {
              newSelectedIds.delete(id)
            } else {
              newSelectedIds.add(id)
            }
          })
          break
        default:
          newSelectedIds = new Set(ids)
      }

      const existingStack = prev.focusStack.filter((fid) => !ids.includes(fid))
      const newStack = [...existingStack, ...ids]
      return { ...prev, selectedItemIds: newSelectedIds, focusStack: newStack }
    })
  }, [])

  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedItemIds: new Set(prev.items.map((item) => item.id)),
    }))
  }, [])

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedItemIds: new Set() }))
  }, [])

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)),
    }))
  }, [])

  const zoomIn = useCallback(() => {
    setState((prev) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const newZoom = Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP)
      const scale = newZoom / prev.zoom
      return {
        ...prev,
        zoom: newZoom,
        pan: {
          x: centerX - (centerX - prev.pan.x) * scale,
          y: centerY - (centerY - prev.pan.y) * scale,
        },
      }
    })
  }, [])

  const zoomOut = useCallback(() => {
    setState((prev) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const newZoom = Math.max(MIN_ZOOM, prev.zoom - ZOOM_STEP)
      const scale = newZoom / prev.zoom
      return {
        ...prev,
        zoom: newZoom,
        pan: {
          x: centerX - (centerX - prev.pan.x) * scale,
          y: centerY - (centerY - prev.pan.y) * scale,
        },
      }
    })
  }, [])

  const resetZoom = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: 1 }))
  }, [])

  const setPan = useCallback((pan: Position) => {
    setState((prev) => ({ ...prev, pan }))
  }, [])

  const resetView = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }))
  }, [])

  const getSelectedItems = useCallback(() => {
    return state.items.filter((item) => state.selectedItemIds.has(item.id))
  }, [state.items, state.selectedItemIds])

  const getSelectedImageItems = useCallback(() => {
    return state.items.filter(
      (item): item is ImageCanvasItem =>
        item.type === "image" && state.selectedItemIds.has(item.id)
    )
  }, [state.items, state.selectedItemIds])

  const getSelectedAsciiItems = useCallback(() => {
    return state.items.filter(
      (item): item is AsciiCanvasItem =>
        item.type === "ascii" && state.selectedItemIds.has(item.id)
    )
  }, [state.items, state.selectedItemIds])

  const bringToFront = useCallback((id: string) => {
    setState((prev) => {
      const item = prev.items.find((i) => i.id === id)
      if (!item) return prev
      return { ...prev, items: [...prev.items.filter((i) => i.id !== id), item] }
    })
  }, [])

  const sendToBack = useCallback((id: string) => {
    setState((prev) => {
      const item = prev.items.find((i) => i.id === id)
      if (!item) return prev
      return { ...prev, items: [item, ...prev.items.filter((i) => i.id !== id)] }
    })
  }, [])

  const bringForward = useCallback((id: string) => {
    setState((prev) => {
      const idx = prev.items.findIndex((i) => i.id === id)
      if (idx === -1 || idx === prev.items.length - 1) return prev
      const items = [...prev.items]
      ;[items[idx], items[idx + 1]] = [items[idx + 1], items[idx]]
      return { ...prev, items }
    })
  }, [])

  const sendBackward = useCallback((id: string) => {
    setState((prev) => {
      const idx = prev.items.findIndex((i) => i.id === id)
      if (idx <= 0) return prev
      const items = [...prev.items]
      ;[items[idx - 1], items[idx]] = [items[idx], items[idx - 1]]
      return { ...prev, items }
    })
  }, [])

  const duplicateItem = useCallback((id: string) => {
    setState((prev) => {
      const item = prev.items.find((i) => i.id === id)
      if (!item) return prev
      const newItem = {
        ...item,
        id: generateId(),
        position: { x: item.position.x + 20, y: item.position.y + 20 },
      }
      return {
        ...prev,
        items: [...prev.items, newItem],
        selectedItemIds: new Set([newItem.id]),
        focusStack: [...prev.focusStack, newItem.id],
      }
    })
  }, [])

  const duplicateItems = useCallback((ids: string[]) => {
    setState((prev) => {
      const itemsToClone = prev.items.filter((item) => ids.includes(item.id))
      if (itemsToClone.length === 0) return prev

      const newItems = itemsToClone.map((item, index) => ({
        ...item,
        id: generateId(),
        position: {
          x: item.position.x + 20 + index * 5,
          y: item.position.y + 20 + index * 5,
        },
      }))

      const newIds = newItems.map((item) => item.id)
      return {
        ...prev,
        items: [...prev.items, ...newItems],
        selectedItemIds: new Set(newIds),
        focusStack: [...prev.focusStack, ...newIds],
      }
    })
  }, [])

  return {
    state,
    addItem,
    addItems,
    removeItem,
    removeItems,
    updateItem,
    updateItemsPositions,
    selectItem,
    selectItems,
    selectAll,
    clearSelection,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setPan,
    resetView,
    getSelectedItems,
    getSelectedImageItems,
    getSelectedAsciiItems,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    duplicateItem,
    duplicateItems,
  }
}

export type UseCanvasReturn = ReturnType<typeof useCanvas>
