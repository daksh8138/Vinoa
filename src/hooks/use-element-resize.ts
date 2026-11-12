"use client"

import { useState, useRef, useCallback } from "react"
import type { Position, Size } from "@/types/canvas"

export type ResizeHandle = "nw" | "ne" | "sw" | "se"

type UseElementResizeOptions = {
  size: Size
  position: Position
  onSizeChange: (size: Size) => void
  onPositionChange: (position: Position) => void
  onResizeEnd?: (size: Size, position: Position) => void
  onSelect?: (e: React.MouseEvent) => void
  minSize?: number
}

export function useElementResize({
  size,
  position,
  onSizeChange,
  onPositionChange,
  onResizeEnd,
  onSelect,
  minSize = 50,
}: UseElementResizeOptions) {
  const [isResizing, setIsResizing] = useState(false)
  const dragStart = useRef<Position>({ x: 0, y: 0 })
  const initialSize = useRef<Size>({ width: 0, height: 0 })
  const initialPos = useRef<Position>({ x: 0, y: 0 })
  const aspectRatio = useRef(1)
  const finalSize = useRef<Size>({ width: 0, height: 0 })
  const finalPos = useRef<Position>({ x: 0, y: 0 })

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.stopPropagation()
      e.preventDefault()
      onSelect?.(e)
      setIsResizing(true)
      dragStart.current = { x: e.clientX, y: e.clientY }
      initialSize.current = { width: size.width, height: size.height }
      initialPos.current = { x: position.x, y: position.y }
      aspectRatio.current = size.width / size.height
      finalSize.current = { width: size.width, height: size.height }
      finalPos.current = { x: position.x, y: position.y }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - dragStart.current.x
        const dy = moveEvent.clientY - dragStart.current.y
        const shiftHeld = moveEvent.shiftKey

        let newWidth = initialSize.current.width
        let newHeight = initialSize.current.height
        let newX = initialPos.current.x
        let newY = initialPos.current.y

        if (handle.includes("e")) {
          newWidth = Math.max(minSize, initialSize.current.width + dx)
        } else if (handle.includes("w")) {
          const widthDelta = Math.min(dx, initialSize.current.width - minSize)
          newWidth = initialSize.current.width - widthDelta
          newX = initialPos.current.x + widthDelta
        }

        if (handle.includes("s")) {
          newHeight = Math.max(minSize, initialSize.current.height + dy)
        } else if (handle.includes("n")) {
          const heightDelta = Math.min(dy, initialSize.current.height - minSize)
          newHeight = initialSize.current.height - heightDelta
          newY = initialPos.current.y + heightDelta
        }

        if (shiftHeld) {
          const currentAspect = newWidth / newHeight
          if (currentAspect > aspectRatio.current) {
            newWidth = newHeight * aspectRatio.current
            if (handle.includes("w")) {
              newX = initialPos.current.x + initialSize.current.width - newWidth
            }
          } else {
            newHeight = newWidth / aspectRatio.current
            if (handle.includes("n")) {
              newY = initialPos.current.y + initialSize.current.height - newHeight
            }
          }
        }

        finalSize.current = { width: newWidth, height: newHeight }
        finalPos.current = { x: newX, y: newY }
        onSizeChange({ width: newWidth, height: newHeight })
        onPositionChange({ x: newX, y: newY })
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
        onResizeEnd?.(finalSize.current, finalPos.current)
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [size, position, onSizeChange, onPositionChange, onResizeEnd, onSelect, minSize]
  )

  return {
    isResizing,
    handleResizeStart,
  }
}
