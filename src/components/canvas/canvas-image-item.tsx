"use client"

import {
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  Copy,
  ArrowUpToLine,
  ArrowDownToLine,
  Trash2,
} from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ResizeHandle } from "@/components/canvas/resize-handle"
import { useDragPosition } from "@/hooks/use-drag-position"
import { useElementResize, type ResizeHandle as ResizeHandleType } from "@/hooks/use-element-resize"
import type { ImageCanvasItem, Position, Size } from "@/types/canvas"
import { cn } from "@/lib/utils"

const RESIZE_HANDLES: ResizeHandleType[] = ["nw", "ne", "sw", "se"]

type CanvasImageItemProps = {
  item: ImageCanvasItem
  isSelected: boolean
  isPreviewSelected?: boolean
  onSelect: (shiftKey: boolean) => void
  onPositionChange: (position: Position) => void
  onSizeChange: (size: Size) => void
  onResizeEnd?: (size: Size, position: Position) => void
  onMultiDragStart?: (e: React.MouseEvent) => boolean
  onFlipHorizontal?: () => void
  onFlipVertical?: () => void
  onGenerateAscii?: () => void
  onDuplicate?: () => void
  onBringToFront?: () => void
  onSendToBack?: () => void
  onDelete?: () => void
}

export function CanvasImageItem({
  item,
  isSelected,
  isPreviewSelected,
  onSelect,
  onPositionChange,
  onSizeChange,
  onResizeEnd,
  onMultiDragStart,
  onFlipHorizontal,
  onFlipVertical,
  onGenerateAscii,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onDelete,
}: CanvasImageItemProps) {
  const { isResizing, handleResizeStart } = useElementResize({
    size: item.size,
    position: item.position,
    onSizeChange,
    onPositionChange,
    onResizeEnd,
    onSelect: (e) => onSelect(e.shiftKey),
  })

  const { isDragging, dragHandlers } = useDragPosition({
    position: item.position,
    onPositionChange,
    onSelect: (e) => onSelect(e.shiftKey),
    disabled: isResizing,
  })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onMultiDragStart?.(e)) return
    dragHandlers.onMouseDown(e)
  }

  const flipTransform = [
    item.flipH && "scaleX(-1)",
    item.flipV && "scaleY(-1)",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "absolute cursor-move select-none",
            isSelected && "ring-2 ring-primary",
            !isSelected && isPreviewSelected && "ring-2 ring-primary/50 ring-dashed",
            (isDragging || isResizing) && "opacity-90"
          )}
          style={{
            left: item.position.x,
            top: item.position.y,
            width: item.size.width,
            height: item.size.height,
          }}
          onMouseDown={handleMouseDown}
        >
          <img
            src={item.src}
            alt={item.name}
            className="w-full h-full pointer-events-none"
            style={{ transform: flipTransform || undefined }}
            draggable={false}
          />
          {isSelected && (
            <>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                {item.name}
              </div>
              {RESIZE_HANDLES.map((handle) => (
                <ResizeHandle
                  key={handle}
                  position={handle}
                  onMouseDown={(e) => handleResizeStart(e, handle)}
                />
              ))}
            </>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onFlipHorizontal}>
          <FlipHorizontal className="mr-2 h-3.5 w-3.5" />
          Flip Horizontal
          <ContextMenuShortcut>⇧H</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onFlipVertical}>
          <FlipVertical className="mr-2 h-3.5 w-3.5" />
          Flip Vertical
          <ContextMenuShortcut>⇧V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onGenerateAscii}>
          <Sparkles className="mr-2 h-3.5 w-3.5" />
          Generate ASCII
          <ContextMenuShortcut>⌘G</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-3.5 w-3.5" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onBringToFront}>
          <ArrowUpToLine className="mr-2 h-3.5 w-3.5" />
          Bring to Front
        </ContextMenuItem>
        <ContextMenuItem onClick={onSendToBack}>
          <ArrowDownToLine className="mr-2 h-3.5 w-3.5" />
          Send to Back
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
