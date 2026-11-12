"use client"

import { useCallback, useRef, useState } from "react"
import type { Position, CanvasItem, Size, ImageCanvasItem, AsciiCanvasItem, SelectionBox as SelectionBoxType } from "@/types/canvas"
import { cn } from "@/lib/utils"
import { CanvasImageItem } from "./canvas-image-item"
import { CanvasAsciiItem } from "./canvas-ascii-item"
import { SelectionBox } from "./selection-box"
import { rectsIntersect, normalizeSelectionBox } from "@/utils/geometry"
import { useMultiDrag } from "@/hooks/use-multi-drag"
import { EmptyState } from "../empty-state"

type CanvasProps = {
  items: CanvasItem[]
  zoom: number
  pan: Position
  selectedItemIds: Set<string>
  onPanChange: (pan: Position) => void
  onZoomChange: (zoom: number) => void
  onSelectItem: (id: string | null, shiftKey: boolean) => void
  onMarqueeSelect: (ids: string[], additive: boolean) => void
  onUpdateItem: (id: string, updates: Partial<Omit<CanvasItem, "id" | "type">>) => void
  onUpdateItemsPositions: (updates: Array<{ id: string; position: Position }>) => void
  onImagesDrop: (files: File[]) => void
  onGenerateAscii: () => void
  onDeleteItem: (id: string) => void
  onDuplicateItem: (id: string) => void
  onBringToFront: (id: string) => void
  onSendToBack: (id: string) => void
  onCopyAsciiToClipboard: (item: AsciiCanvasItem) => void
  onExportAsciiText: (item: AsciiCanvasItem) => void
  onExportAsciiHtml: (item: AsciiCanvasItem) => void
  onImageResizeEnd?: (id: string, size: Size, position: Position) => void
}

export function Canvas({
  items,
  zoom,
  pan,
  selectedItemIds,
  onPanChange,
  onZoomChange,
  onSelectItem,
  onMarqueeSelect,
  onUpdateItem,
  onUpdateItemsPositions,
  onImagesDrop,
  onGenerateAscii,
  onDeleteItem,
  onDuplicateItem,
  onBringToFront,
  onSendToBack,
  onCopyAsciiToClipboard,
  onExportAsciiText,
  onExportAsciiHtml,
  onImageResizeEnd,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<SelectionBoxType>(null)
  const [previewedItemIds, setPreviewedItemIds] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)

  const { startMultiDrag } = useMultiDrag({
    items,
    selectedItemIds,
    onUpdateItemsPositions,
    onSelectItem: (id, shiftKey) => onSelectItem(id, shiftKey),
  })

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const cursorX = e.clientX - rect.left
        const cursorY = e.clientY - rect.top
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        const newZoom = Math.max(0.1, Math.min(5, zoom + delta))
        const scale = newZoom / zoom

        onZoomChange(newZoom)
        onPanChange({
          x: cursorX - (cursorX - pan.x) * scale,
          y: cursorY - (cursorY - pan.y) * scale,
        })
      } else {
        onPanChange({
          x: pan.x - e.deltaX,
          y: pan.y - e.deltaY,
        })
      }
    },
    [zoom, pan, onZoomChange, onPanChange]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === containerRef.current || e.target === containerRef.current?.firstChild) {
        if (!e.shiftKey) {
          onSelectItem(null, false)
        }
        if (e.button === 0 && items.length > 0) {
          setIsSelecting(true)
          const rect = containerRef.current?.getBoundingClientRect()
          if (rect) {
            const x = (e.clientX - rect.left - pan.x) / zoom
            const y = (e.clientY - rect.top - pan.y) / zoom
            setSelectionBox({ start: { x, y }, end: { x, y } })
          }
        }
      }
    },
    [pan, zoom, onSelectItem, items.length]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isSelecting && selectionBox) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const x = (e.clientX - rect.left - pan.x) / zoom
          const y = (e.clientY - rect.top - pan.y) / zoom
          const newBox = { ...selectionBox, end: { x, y } }
          setSelectionBox(newBox)

          const selRect = normalizeSelectionBox(newBox.start, newBox.end)
          const intersecting = items
            .filter((item) =>
              rectsIntersect(selRect, {
                x: item.position.x,
                y: item.position.y,
                width: item.size.width,
                height: item.size.height,
              })
            )
            .map((item) => item.id)
          setPreviewedItemIds(new Set(intersecting))
        }
      }
    },
    [isSelecting, selectionBox, pan, zoom, items]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isSelecting && selectionBox) {
        const selRect = normalizeSelectionBox(selectionBox.start, selectionBox.end)

        const intersectingIds = items
          .filter((item) =>
            rectsIntersect(selRect, {
              x: item.position.x,
              y: item.position.y,
              width: item.size.width,
              height: item.size.height,
            })
          )
          .map((item) => item.id)

        onMarqueeSelect(intersectingIds, e.shiftKey)
      }
      setIsSelecting(false)
      setSelectionBox(null)
      setPreviewedItemIds(new Set())
    },
    [isSelecting, selectionBox, items, onMarqueeSelect]
  )

  const handleMouseLeave = useCallback(() => {
    setIsSelecting(false)
    setSelectionBox(null)
    setPreviewedItemIds(new Set())
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))
      if (imageFiles.length > 0) {
        onImagesDrop(imageFiles)
      }
    },
    [onImagesDrop]
  )

  const handleItemPositionChange = useCallback(
    (id: string, position: Position) => {
      onUpdateItem(id, { position })
    },
    [onUpdateItem]
  )

  const handleItemSizeChange = useCallback(
    (id: string, size: Size) => {
      onUpdateItem(id, { size })
    },
    [onUpdateItem]
  )

  const handleFlipHorizontal = useCallback(
    (item: ImageCanvasItem) => {
      onUpdateItem(item.id, { flipH: !item.flipH } as Partial<ImageCanvasItem>)
    },
    [onUpdateItem]
  )

  const handleFlipVertical = useCallback(
    (item: ImageCanvasItem) => {
      onUpdateItem(item.id, { flipV: !item.flipV } as Partial<ImageCanvasItem>)
    },
    [onUpdateItem]
  )

  const handleImageResizeEnd = useCallback(
    (id: string, size: Size, position: Position) => {
      onImageResizeEnd?.(id, size, position)
    },
    [onImageResizeEnd]
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden bg-background",
        isSelecting && "cursor-crosshair",
        isDragging && "ring-2 ring-inset ring-primary/50"
      )}
      style={{ touchAction: "none" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="absolute origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {items.map((item) =>
          item.type === "image" ? (
            <CanvasImageItem
              key={item.id}
              item={item}
              isSelected={selectedItemIds.has(item.id)}
              isPreviewSelected={previewedItemIds.has(item.id)}
              onSelect={(shiftKey) => onSelectItem(item.id, shiftKey)}
              onPositionChange={(pos) => handleItemPositionChange(item.id, pos)}
              onSizeChange={(size) => handleItemSizeChange(item.id, size)}
              onResizeEnd={(size, pos) => handleImageResizeEnd(item.id, size, pos)}
              onMultiDragStart={(e) => startMultiDrag(e, item.id)}
              onFlipHorizontal={() => handleFlipHorizontal(item)}
              onFlipVertical={() => handleFlipVertical(item)}
              onGenerateAscii={onGenerateAscii}
              onDuplicate={() => onDuplicateItem(item.id)}
              onBringToFront={() => onBringToFront(item.id)}
              onSendToBack={() => onSendToBack(item.id)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ) : (
            <CanvasAsciiItem
              key={item.id}
              item={item}
              isSelected={selectedItemIds.has(item.id)}
              isPreviewSelected={previewedItemIds.has(item.id)}
              onSelect={(shiftKey) => onSelectItem(item.id, shiftKey)}
              onPositionChange={(pos) => handleItemPositionChange(item.id, pos)}
              onSizeChange={(size) => handleItemSizeChange(item.id, size)}
              onMultiDragStart={(e) => startMultiDrag(e, item.id)}
              onCopyToClipboard={() => onCopyAsciiToClipboard(item)}
              onExportText={() => onExportAsciiText(item)}
              onExportHtml={() => onExportAsciiHtml(item)}
              onDuplicate={() => onDuplicateItem(item.id)}
              onBringToFront={() => onBringToFront(item.id)}
              onSendToBack={() => onSendToBack(item.id)}
              onDelete={() => onDeleteItem(item.id)}
            />
          )
        )}
        {selectionBox && (
          <SelectionBox start={selectionBox.start} end={selectionBox.end} />
        )}
      </div>

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 pointer-events-none">
          <div className="text-sm text-muted-foreground">Drop images here</div>
        </div>
      )}

      {selectedItemIds.size > 1 && (
        <div className="absolute top-4 left-4 text-xs bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border pointer-events-none select-none">
          {selectedItemIds.size} items selected
        </div>
      )}

      {items.length === 0 && !isDragging && <EmptyState />}

      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground pointer-events-none select-none">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  )
}
