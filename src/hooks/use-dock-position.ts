"use client"

import { useCallback, useState, useEffect, useRef } from "react"
import type { DockPosition, Position } from "@/types/canvas"
import { dockPhysics, type DockBounds, type DockOrientation, type SnapResult } from "@/lib/dock-physics"
import { getStorageItemWithMigration } from "@/hooks/use-local-storage"

const STORAGE_KEY = "vinoa-dock-position"
const LEGACY_STORAGE_KEY = "charify-dock-position"

type PendingSnap = {
  edge: DockPosition
  edgeOffset: number
  orientation: DockOrientation
  isCentered: boolean
}

type DockState = {
  position: Position
  snapEdge: DockPosition | null
  edgeOffset: number
  orientation: DockOrientation
  isDragging: boolean
  pendingSnap: PendingSnap | null
}

type StoredDockState = {
  position: Position
  snapEdge: DockPosition | null
  edgeOffset: number
  orientation: DockOrientation
}

function getDefaultState(initialPosition: DockPosition): DockState {
  return {
    position: { x: 0, y: 0 },
    snapEdge: initialPosition,
    edgeOffset: 0.5,
    orientation: dockPhysics.getOrientation(initialPosition),
    isDragging: false,
    pendingSnap: null,
  }
}

function loadFromStorage(): Partial<StoredDockState> | null {
  if (typeof window === "undefined") return null
  try {
    const stored = getStorageItemWithMigration(STORAGE_KEY, LEGACY_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore
  }
  return null
}

function saveToStorage(state: StoredDockState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore
  }
}

export function useDockPosition(initialPosition: DockPosition = "bottom") {
  const [state, setState] = useState<DockState>(() => getDefaultState(initialPosition))
  const dockBoundsRef = useRef<DockBounds>({ width: 200, height: 40 })

  useEffect(() => {
    const stored = loadFromStorage()
    if (stored) {
      setState((prev) => ({
        ...prev,
        ...stored,
      }))
    }
  }, [])

  useEffect(() => {
    if (!state.isDragging) {
      saveToStorage({
        position: state.position,
        snapEdge: state.snapEdge,
        edgeOffset: state.edgeOffset,
        orientation: state.orientation,
      })
    }
  }, [state.position, state.snapEdge, state.edgeOffset, state.orientation, state.isDragging])

  const setDockBounds = useCallback((bounds: DockBounds) => {
    dockBoundsRef.current = bounds
  }, [])

  const getSnappedPosition = useCallback((): Position => {
    if (!state.snapEdge) return state.position

    const { width, height } = dockBoundsRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight

    switch (state.snapEdge) {
      case "bottom":
        return { x: state.edgeOffset * vw, y: vh - 16 - height / 2 }
      case "top":
        return { x: state.edgeOffset * vw, y: 16 + height / 2 }
      case "left":
        return { x: 16 + width / 2, y: state.edgeOffset * vh }
      case "right":
        return { x: vw - 16 - width / 2, y: state.edgeOffset * vh }
    }
  }, [state.snapEdge, state.edgeOffset, state.position])

  const startDrag = useCallback(() => {
    const currentPos = getSnappedPosition()
    setState((prev) => ({
      ...prev,
      position: currentPos,
      isDragging: true,
      snapEdge: null,
      pendingSnap: null,
    }))
  }, [getSnappedPosition])

  const updateDrag = useCallback((x: number, y: number) => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    const snapResult = dockPhysics.calculateSnap(
      { x, y },
      dockBoundsRef.current,
      viewport
    )

    setState((prev) => ({
      ...prev,
      position: { x, y },
      pendingSnap: snapResult
        ? {
            edge: snapResult.edge,
            edgeOffset: snapResult.edgeOffset,
            orientation: snapResult.orientation,
            isCentered: snapResult.isCentered,
          }
        : null,
    }))
  }, [])

  const endDrag = useCallback(() => {
    setState((prev) => {
      if (prev.pendingSnap) {
        return {
          ...prev,
          isDragging: false,
          snapEdge: prev.pendingSnap.edge,
          edgeOffset: prev.pendingSnap.edgeOffset,
          orientation: prev.pendingSnap.orientation,
          pendingSnap: null,
        }
      }
      return { ...prev, isDragging: false, pendingSnap: null }
    })
  }, [])

  const resetPosition = useCallback(() => {
    setState(getDefaultState(initialPosition))
    localStorage.removeItem(STORAGE_KEY)
  }, [initialPosition])

  const toggleOrientation = useCallback(() => {
    setState((prev) => {
      const newOrientation: DockOrientation =
        prev.orientation === "horizontal" ? "vertical" : "horizontal"
      const newEdge: DockPosition =
        newOrientation === "horizontal" ? "bottom" : "right"
      return {
        ...prev,
        orientation: newOrientation,
        snapEdge: newEdge,
        edgeOffset: 0.5,
      }
    })
  }, [])

  return {
    position: state.position,
    snapEdge: state.snapEdge,
    edgeOffset: state.edgeOffset,
    orientation: state.orientation,
    isDragging: state.isDragging,
    pendingSnap: state.pendingSnap,
    setDockBounds,
    startDrag,
    updateDrag,
    endDrag,
    resetPosition,
    toggleOrientation,
  }
}
