"use client"

import {
  Copy,
  FileText,
  FileCode,
  RefreshCw,
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
import type { AsciiCanvasItem, Position, Size } from "@/types/canvas"
import { cn } from "@/lib/utils"

const RESIZE_HANDLES: ResizeHandleType[] = ["nw", "ne", "sw", "se"]

type CanvasAsciiItemProps = {
  item: AsciiCanvasItem
  isSelected: boolean
  isPreviewSelected?: boolean
  onSelect: (shiftKey: boolean) => void
  onPositionChange: (position: Position) => void
  onSizeChange: (size: Size) => void
  onMultiDragStart?: (e: React.MouseEvent) => boolean
  onCopyToClipboard?: () => void
  onExportText?: () => void
  onExportHtml?: () => void
  onDuplicate?: () => void
  onBringToFront?: () => void
  onSendToBack?: () => void
  onDelete?: () => void
}

export function CanvasAsciiItem({
  item,
  isSelected,
  isPreviewSelected,
  onSelect,
  onPositionChange,
  onSizeChange,
  onMultiDragStart,
  onCopyToClipboard,
  onExportText,
  onExportHtml,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onDelete,
}: CanvasAsciiItemProps) {
  const { isResizing, handleResizeStart } = useElementResize({
    size: item.size,
    position: item.position,
    onSizeChange,
    onPositionChange,
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
            src={item.previewUrl}
            alt="ASCII art"
            className="pointer-events-none w-full h-full"
            draggable={false}
          />
          {isSelected && (
            <>
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
        <ContextMenuItem onClick={onCopyToClipboard}>
          <Copy className="mr-2 h-3.5 w-3.5" />
          Copy to Clipboard
        </ContextMenuItem>
        <ContextMenuItem onClick={onExportText}>
          <FileText className="mr-2 h-3.5 w-3.5" />
          Export as .txt
        </ContextMenuItem>
        <ContextMenuItem onClick={onExportHtml}>
          <FileCode className="mr-2 h-3.5 w-3.5" />
          Export as .html
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDuplicate}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
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
