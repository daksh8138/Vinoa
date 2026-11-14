"use client"

import { useCallback, useRef, useEffect, useMemo, useState } from "react"
import { GripVertical } from "lucide-react"
import type { DockPosition } from "@/types/canvas"
import { cn } from "@/lib/utils"
import { useDockPosition } from "@/hooks/use-dock-position"
import { DockContext, getTooltipSide } from "./dock-context"

type DockProps = {
  children: React.ReactNode
  initialPosition?: DockPosition
}

export function Dock({ children, initialPosition = "bottom" }: DockProps) {
  const {
    position,
    snapEdge,
    edgeOffset,
    orientation,
    isDragging,
    pendingSnap,
    setDockBounds,
    startDrag,
    updateDrag,
    endDrag,
    resetPosition,
    toggleOrientation,
  } = useDockPosition(initialPosition)

  const containerRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const grabOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  // Rendered (border-box) size of the dock, used to size the snap preview.
  const [dockSize, setDockSize] = useState({ width: 200, height: 40 })

  useEffect(() => {
    const el = dockRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDockBounds({ width, height })
      setDockSize({ width: el.offsetWidth, height: el.offsetHeight })
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [setDockBounds])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === "\\" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleOrientation()
      }

      if (e.key === "0" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        resetPosition()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleOrientation, resetPosition])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      grabOffset.current = {
        x: e.clientX - (rect.left + rect.width / 2),
        y: e.clientY - (rect.top + rect.height / 2),
      }

      startDrag()

      const handleMouseMove = (moveEvent: MouseEvent) => {
        updateDrag(
          moveEvent.clientX - grabOffset.current.x,
          moveEvent.clientY - grabOffset.current.y
        )
      }

      const handleMouseUp = () => {
        endDrag()
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [startDrag, updateDrag, endDrag]
  )

  const isHorizontal = orientation === "horizontal"
  const isCentered = isDragging && pendingSnap?.isCentered

  const contextValue = useMemo(
    () => ({
      snapEdge,
      tooltipSide: getTooltipSide(snapEdge),
      orientation,
    }),
    [snapEdge, orientation]
  )

  const getPositionStyle = (): React.CSSProperties => {
    if (!snapEdge) {
      return {
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }
    }

    switch (snapEdge) {
      case "bottom":
        return {
          bottom: 16,
          left: `${edgeOffset * 100}%`,
          transform: "translateX(-50%)",
        }
      case "top":
        return {
          top: 16,
          left: `${edgeOffset * 100}%`,
          transform: "translateX(-50%)",
        }
      case "left":
        return {
          left: 16,
          top: `${edgeOffset * 100}%`,
          transform: "translateY(-50%)",
        }
      case "right":
        return {
          right: 16,
          top: `${edgeOffset * 100}%`,
          transform: "translateY(-50%)",
        }
    }
  }

  const getSnapPreviewStyle = (): React.CSSProperties | null => {
    if (!isDragging || !pendingSnap) return null

    switch (pendingSnap.edge) {
      case "bottom":
        return {
          position: "fixed",
          bottom: 16,
          left: `${pendingSnap.edgeOffset * 100}%`,
          transform: "translateX(-50%)",
        }
      case "top":
        return {
          position: "fixed",
          top: 16,
          left: `${pendingSnap.edgeOffset * 100}%`,
          transform: "translateX(-50%)",
        }
      case "left":
        return {
          position: "fixed",
          left: 16,
          top: `${pendingSnap.edgeOffset * 100}%`,
          transform: "translateY(-50%)",
        }
      case "right":
        return {
          position: "fixed",
          right: 16,
          top: `${pendingSnap.edgeOffset * 100}%`,
          transform: "translateY(-50%)",
        }
    }
  }

  const snapPreviewStyle = getSnapPreviewStyle()

  return (
    <>
      {snapPreviewStyle && pendingSnap && (
        <div
          className={cn(
            "pointer-events-none z-40 rounded-lg bg-muted/60",
            pendingSnap.isCentered && "border border-muted-foreground/50"
          )}
          style={{
            ...snapPreviewStyle,
            width:
              pendingSnap.orientation === orientation
                ? dockSize.width
                : dockSize.height,
            height:
              pendingSnap.orientation === orientation
                ? dockSize.height
                : dockSize.width,
          }}
        />
      )}
      <div
        ref={containerRef}
        className="fixed z-50"
        style={getPositionStyle()}
      >
        <div
          ref={dockRef}
          className={cn(
            "flex items-center gap-1 rounded-lg border bg-card/95 p-1.5 shadow-lg backdrop-blur-sm transition-all",
            isHorizontal ? "flex-row" : "flex-col",
            isDragging && "opacity-90",
            isCentered && "border-muted-foreground"
          )}
        >
          <div
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            className={cn(
              "flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isHorizontal ? "h-8" : "w-8"
            )}
          >
            <GripVertical
              className={cn("h-4 w-4", !isHorizontal && "rotate-90")}
            />
          </div>
          <DockContext.Provider value={contextValue}>
            {children}
          </DockContext.Provider>
        </div>
      </div>
    </>
  )
}
