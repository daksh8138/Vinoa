"use client"

import { useState, useRef, useCallback } from "react"
import type { Position, CanvasItem } from "@/types/canvas"

type UseMultiDragOptions = {
  items: CanvasItem[]
  selectedItemIds: Set<string>
  onUpdateItemsPositions: (updates: Array<{ id: string; position: Position }>) => void
  onSelectItem: (id: string, shiftKey: boolean) => void
}

export function useMultiDrag({
  items,
  selectedItemIds,
  onUpdateItemsPositions,
  onSelectItem,
}: UseMultiDragOptions) {
  const [isMultiDragging, setIsMultiDragging] = useState(false)
  const dragStart = useRef<Position>({ x: 0, y: 0 })
  const initialPositions = useRef<Map<string, Position>>(new Map())

  const startMultiDrag = useCallback(
    (e: React.MouseEvent, draggedItemId: string): boolean => {
      if (selectedItemIds.size <= 1 || !selectedItemIds.has(draggedItemId)) {
        return false
      }

      e.stopPropagation()
      setIsMultiDragging(true)
      dragStart.current = { x: e.clientX, y: e.clientY }

      initialPositions.current = new Map()
      items.forEach((item) => {
        if (selectedItemIds.has(item.id)) {
          initialPositions.current.set(item.id, { ...item.position })
        }
      })

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - dragStart.current.x
        const dy = moveEvent.clientY - dragStart.current.y

        const updates: Array<{ id: string; position: Position }> = []
        initialPositions.current.forEach((initialPos, id) => {
          updates.push({
            id,
            position: {
              x: initialPos.x + dx,
              y: initialPos.y + dy,
            },
          })
        })

        onUpdateItemsPositions(updates)
      }

      const handleMouseUp = () => {
        setIsMultiDragging(false)
        initialPositions.current.clear()
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)

      return true
    },
    [items, selectedItemIds, onUpdateItemsPositions]
  )

  return {
    isMultiDragging,
    startMultiDrag,
  }
}
