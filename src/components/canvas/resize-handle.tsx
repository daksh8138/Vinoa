import { cn } from "@/lib/utils"
import type { ResizeHandle as ResizeHandleType } from "@/hooks/use-element-resize"

type ResizeHandleProps = {
  position: ResizeHandleType
  onMouseDown: (e: React.MouseEvent) => void
}

export function ResizeHandle({ position, onMouseDown }: ResizeHandleProps) {
  return (
    <div
      className={cn(
        "absolute h-2.5 w-2.5 rounded-sm border-2 border-foreground bg-background",
        position.includes("n") ? "-top-1.5" : "-bottom-1.5",
        position.includes("w") ? "-left-1.5" : "-right-1.5",
        position === "nw" || position === "se"
          ? "cursor-nwse-resize"
          : "cursor-nesw-resize"
      )}
      onMouseDown={onMouseDown}
    />
  )
}
