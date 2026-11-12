"use client"

import { createContext, useContext } from "react"
import type { DockPosition } from "@/types/canvas"
import type { DockOrientation } from "@/lib/dock-physics"

type TooltipSide = "top" | "bottom" | "left" | "right"

type DockContextValue = {
  snapEdge: DockPosition | null
  tooltipSide: TooltipSide
  orientation: DockOrientation
}

const DockContext = createContext<DockContextValue>({
  snapEdge: "bottom",
  tooltipSide: "top",
  orientation: "horizontal",
})

export function useDockContext() {
  return useContext(DockContext)
}

export function getTooltipSide(snapEdge: DockPosition | null): TooltipSide {
  switch (snapEdge) {
    case "bottom":
      return "top"
    case "top":
      return "bottom"
    case "left":
      return "right"
    case "right":
      return "left"
    default:
      return "top"
  }
}

export { DockContext }
