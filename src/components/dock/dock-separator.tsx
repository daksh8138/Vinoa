"use client"

import { cn } from "@/lib/utils"
import { useDockContext } from "./dock-context"

export function DockSeparator() {
  const { orientation } = useDockContext()
  const isHorizontal = orientation === "horizontal"

  return (
    <div
      className={cn(
        "bg-muted-foreground/25",
        isHorizontal ? "mx-1 h-6 w-px" : "my-1 h-px w-6"
      )}
    />
  )
}
