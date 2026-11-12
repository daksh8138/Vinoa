"use client"

import { useState, useRef, useCallback } from "react"
import type { Position } from "@/types/canvas"

type UseDragPositionOptions = {
  position: Position
  onPositionChange: (position: Position) => void
  onSelect?: (e: React.MouseEvent) => void
  disabled?: boolean
}

export function useDragPosition({
  position,
  onPositionChange,
  onSelect,
  disabled = false,
}: UseDragPositionOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<Position>({ x: 0, y: 0 })
  const initialPos = useRef<Position>({ x: 0, y: 0 })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      e.stopPropagation()
      onSelect?.(e)
      setIsDragging(true)
      dragStart.current = { x: e.clientX, y: e.clientY }
      initialPos.current = { x: position.x, y: position.y }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - dragStart.current.x
        const dy = moveEvent.clientY - dragStart.current.y
        onPositionChange({
          x: initialPos.current.x + dx,
          y: initialPos.current.y + dy,
        })
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [position, onPositionChange, onSelect, disabled]
  )

  return {
    isDragging,
    dragHandlers: { onMouseDown: handleMouseDown },
  }
}
