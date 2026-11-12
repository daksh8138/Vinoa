"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Canvas } from "@/components/canvas"
import { Toolbar } from "@/components/toolbar"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"
import { useCanvas } from "@/hooks/use-canvas"
import { useAsciiSettings } from "@/hooks/use-ascii-settings"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useImageHistory } from "@/hooks/use-image-history"
import type { AsciiCanvasItem, ImageCanvasItem, Size, Position } from "@/types/canvas"
import { calculateGridPositions } from "@/utils/grid-placement"
import { resizeImage } from "@/utils/image-utils"
import { toast } from "sonner"
import {
  imageToAscii,
  exportAsciiAsText,
  exportAsciiAsHtml,
  exportAsciiAsPng,
  copyAsciiToClipboard,
  copyAsciiAsPng,
} from "@/utils/ascii-generator"

export default function Home() {
  const {
    state,
    addItem,
    removeItem,
    removeItems,
    updateItem,
    selectItem,
    selectItems,
    selectAll,
    clearSelection,
    setZoom,
    zoomIn,
    zoomOut,
    resetView,
    getSelectedItems,
    getSelectedImageItems,
    getSelectedAsciiItems,
    setPan,
    bringToFront,
    sendToBack,
    duplicateItem,
    duplicateItems,
    updateItemsPositions,
  } = useCanvas()

  const { options: asciiOptions, setOptions: setAsciiOptions } = useAsciiSettings()
  const { initHistory, pushState, undo, redo, canUndo, canRedo, removeHistory } = useImageHistory()
  const [isGenerating, setIsGenerating] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const stateRef = useRef(state)
  stateRef.current = state

  const asciiOptionsRef = useRef(asciiOptions)
  asciiOptionsRef.current = asciiOptions

  const handleImagesDrop = useCallback(
    (files: File[]) => {
      const maxSize = 400
      const baseItemSize = { width: maxSize, height: maxSize }

      const { positions } = calculateGridPositions({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        pan: stateRef.current.pan,
        itemCount: files.length,
        baseItemSize,
        gap: 40,
      })

      files.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const src = e.target?.result as string
          const img = new Image()
          img.onload = () => {
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
            const width = img.width * scale
            const height = img.height * scale

            const position = positions[index] || {
              x: window.innerWidth / 2 - width / 2 - stateRef.current.pan.x,
              y: window.innerHeight / 2 - height / 2 - stateRef.current.pan.y,
            }

            const adjustedPosition = {
              x: position.x + (baseItemSize.width - width) / 2,
              y: position.y + (baseItemSize.height - height) / 2,
            }

            const item: Omit<ImageCanvasItem, "id"> = {
              type: "image",
              src,
              name: file.name,
              position: adjustedPosition,
              size: { width, height },
            }
            addItem(item)
          }
          img.src = src
        }
        reader.readAsDataURL(file)
      })
    },
    [addItem]
  )

  const handleGenerateAscii = useCallback(async () => {
    const selectedImages = getSelectedImageItems()
    if (selectedImages.length === 0) return

    setIsGenerating(true)
    try {
      for (const selectedItem of selectedImages) {
        const output = await imageToAscii(selectedItem.src, asciiOptionsRef.current)

        const randomOffsetX = (Math.random() - 0.5) * 100
        const randomOffsetY = (Math.random() - 0.5) * 100

        const maxWidth = selectedItem.size.width
        const scale = output.previewWidth > maxWidth ? maxWidth / output.previewWidth : 1
        const finalWidth = output.previewWidth * scale
        const finalHeight = output.previewHeight * scale

        const item: Omit<AsciiCanvasItem, "id"> = {
          type: "ascii",
          content: output.text,
          colored: output.colored,
          previewUrl: output.previewUrl,
          fontSize: 6,
          sourceImageId: selectedItem.id,
          position: {
            x: selectedItem.position.x + selectedItem.size.width + 40 + randomOffsetX,
            y: selectedItem.position.y + randomOffsetY,
          },
          size: { width: finalWidth, height: finalHeight },
        }
        addItem(item)
      }
    } catch (error) {
      console.error("Failed to generate ASCII:", error)
    } finally {
      setIsGenerating(false)
    }
  }, [getSelectedImageItems, addItem])

  const handleDeleteSelected = useCallback(() => {
    const selectedIds = Array.from(stateRef.current.selectedItemIds)
    if (selectedIds.length > 0) {
      removeItems(selectedIds)
    }
  }, [removeItems])

  const handleDuplicateSelected = useCallback(() => {
    const selectedIds = Array.from(stateRef.current.selectedItemIds)
    if (selectedIds.length > 0) {
      duplicateItems(selectedIds)
    }
  }, [duplicateItems])

  const handleExportText = useCallback(() => {
    const asciiItems = getSelectedAsciiItems()
    asciiItems.forEach((item) => {
      exportAsciiAsText(item.content)
    })
    if (asciiItems.length > 0) {
      toast.success("Exported as .txt")
    }
  }, [getSelectedAsciiItems])

  const handleExportHtml = useCallback(() => {
    const asciiItems = getSelectedAsciiItems()
    asciiItems.forEach((item) => {
      exportAsciiAsHtml(item.content, item.colored, item.fontSize)
    })
    if (asciiItems.length > 0) {
      toast.success("Exported as .html")
    }
  }, [getSelectedAsciiItems])

  const handleExportPng = useCallback(() => {
    const asciiItems = getSelectedAsciiItems()
    asciiItems.forEach((item) => {
      exportAsciiAsPng(item.content, item.colored, item.fontSize)
    })
    if (asciiItems.length > 0) {
      toast.success("Exported as .png")
    }
  }, [getSelectedAsciiItems])

  const handleCopyAsPng = useCallback(async () => {
    const asciiItems = getSelectedAsciiItems()
    if (asciiItems.length > 0) {
      await copyAsciiAsPng(asciiItems[0].content, asciiItems[0].colored, asciiItems[0].fontSize)
      toast.success("Copied as PNG")
    }
  }, [getSelectedAsciiItems])

  const handleCopyToClipboard = useCallback(async () => {
    const asciiItems = getSelectedAsciiItems()
    if (asciiItems.length > 0) {
      await copyAsciiToClipboard(asciiItems[0].content)
      toast.success("Copied to clipboard")
    }
  }, [getSelectedAsciiItems])

  const handleCopyAsciiToClipboard = useCallback(async (item: AsciiCanvasItem) => {
    await copyAsciiToClipboard(item.content)
    toast.success("Copied to clipboard")
  }, [])

  const handleExportAsciiText = useCallback((item: AsciiCanvasItem) => {
    exportAsciiAsText(item.content)
    toast.success("Exported as .txt")
  }, [])

  const handleExportAsciiHtml = useCallback((item: AsciiCanvasItem) => {
    exportAsciiAsHtml(item.content, item.colored, item.fontSize)
    toast.success("Exported as .html")
  }, [])

  const handleFlipHorizontal = useCallback(() => {
    const selectedImages = getSelectedImageItems()
    selectedImages.forEach((item) => {
      updateItem(item.id, { flipH: !item.flipH } as Partial<ImageCanvasItem>)
    })
  }, [getSelectedImageItems, updateItem])

  const handleFlipVertical = useCallback(() => {
    const selectedImages = getSelectedImageItems()
    selectedImages.forEach((item) => {
      updateItem(item.id, { flipV: !item.flipV } as Partial<ImageCanvasItem>)
    })
  }, [getSelectedImageItems, updateItem])

  const handleSelectItem = useCallback(
    (id: string | null, shiftKey: boolean) => {
      selectItem(id, shiftKey ? "toggle" : "replace")
    },
    [selectItem]
  )

  const handleMarqueeSelect = useCallback(
    (ids: string[], additive: boolean) => {
      if (ids.length === 0 && !additive) {
        selectItem(null, "replace")
      } else {
        selectItems(ids, additive ? "add" : "replace")
      }
    },
    [selectItem, selectItems]
  )

  const handleImageResizeEnd = useCallback(
    async (id: string, size: Size, position: Position) => {
      const item = stateRef.current.items.find(
        (i): i is ImageCanvasItem => i.id === id && i.type === "image"
      )
      if (!item) return

      initHistory(id, { src: item.src, size: item.size })

      try {
        const newSrc = await resizeImage(item.src, Math.round(size.width), Math.round(size.height))
        pushState(id, { src: newSrc, size })
        updateItem(id, { src: newSrc, size, position } as Partial<ImageCanvasItem>)
      } catch (error) {
        console.error("Failed to resize image:", error)
      }
    },
    [initHistory, pushState, updateItem]
  )

  const handleUndo = useCallback(() => {
    const selectedIds = Array.from(stateRef.current.selectedItemIds)
    if (selectedIds.length !== 1) return

    const id = selectedIds[0]
    const item = stateRef.current.items.find((i) => i.id === id)
    if (!item || item.type !== "image") return

    if (!canUndo(id)) return

    const previous = undo(id)
    if (previous) {
      updateItem(id, { src: previous.src, size: previous.size } as Partial<ImageCanvasItem>)
    }
  }, [canUndo, undo, updateItem])

  const handleRedo = useCallback(() => {
    const selectedIds = Array.from(stateRef.current.selectedItemIds)
    if (selectedIds.length !== 1) return

    const id = selectedIds[0]
    const item = stateRef.current.items.find((i) => i.id === id)
    if (!item || item.type !== "image") return

    if (!canRedo(id)) return

    const next = redo(id)
    if (next) {
      updateItem(id, { src: next.src, size: next.size } as Partial<ImageCanvasItem>)
    }
  }, [canRedo, redo, updateItem])

  useEffect(() => {
    const { items, selectedItemIds } = stateRef.current
    if (selectedItemIds.size !== 1) return

    const selectedId = Array.from(selectedItemIds)[0]
    const selectedItem = items.find((i) => i.id === selectedId)
    if (selectedItem?.type !== "ascii" || !selectedItem.sourceImageId) return

    const sourceImage = items.find(
      (i): i is ImageCanvasItem => i.type === "image" && i.id === selectedItem.sourceImageId
    )
    if (!sourceImage) return

    const regenerate = async () => {
      const output = await imageToAscii(sourceImage.src, asciiOptions)

      const maxWidth = sourceImage.size.width
      const scale = output.previewWidth > maxWidth ? maxWidth / output.previewWidth : 1
      const finalWidth = output.previewWidth * scale
      const finalHeight = output.previewHeight * scale

      updateItem(selectedItem.id, {
        content: output.text,
        colored: output.colored,
        previewUrl: output.previewUrl,
        size: { width: finalWidth, height: finalHeight },
      } as Partial<AsciiCanvasItem>)
    }

    regenerate()
  }, [asciiOptions, updateItem])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            imageFiles.push(file)
          }
        }
      }

      if (imageFiles.length > 0) {
        handleImagesDrop(imageFiles)
      }
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [handleImagesDrop])

  const hasSelection = state.selectedItemIds.size > 0

  useKeyboardShortcuts([
    { key: "Escape", action: clearSelection },
    { key: "a", cmd: true, action: selectAll },
    { key: "Backspace", action: handleDeleteSelected, enabled: hasSelection },
    { key: "Delete", action: handleDeleteSelected, enabled: hasSelection },
    { key: "g", cmd: true, action: handleGenerateAscii },
    { key: "=", cmd: true, action: zoomIn },
    { key: "-", cmd: true, action: zoomOut },
    { key: "0", cmd: true, action: resetView },
    { key: "h", shift: true, action: handleFlipHorizontal },
    { key: "v", shift: true, action: handleFlipVertical },
    { key: "d", cmd: true, action: handleDuplicateSelected, enabled: hasSelection },
    { key: "]", cmd: true, action: () => {
      const ids = Array.from(state.selectedItemIds)
      if (ids.length === 1) bringToFront(ids[0])
    }, enabled: hasSelection },
    { key: "[", cmd: true, action: () => {
      const ids = Array.from(state.selectedItemIds)
      if (ids.length === 1) sendToBack(ids[0])
    }, enabled: hasSelection },
    { key: "/", cmd: true, action: () => setShortcutsOpen(true) },
    { key: "z", cmd: true, action: handleUndo },
    { key: "z", cmd: true, shift: true, action: handleRedo },
  ])

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Canvas
        items={state.items}
        zoom={state.zoom}
        pan={state.pan}
        selectedItemIds={state.selectedItemIds}
        onPanChange={setPan}
        onZoomChange={setZoom}
        onSelectItem={handleSelectItem}
        onMarqueeSelect={handleMarqueeSelect}
        onUpdateItem={updateItem}
        onUpdateItemsPositions={updateItemsPositions}
        onImagesDrop={handleImagesDrop}
        onGenerateAscii={handleGenerateAscii}
        onDeleteItem={removeItem}
        onDuplicateItem={duplicateItem}
        onBringToFront={bringToFront}
        onSendToBack={sendToBack}
        onCopyAsciiToClipboard={handleCopyAsciiToClipboard}
        onExportAsciiText={handleExportAsciiText}
        onExportAsciiHtml={handleExportAsciiHtml}
        onImageResizeEnd={handleImageResizeEnd}
      />
      <Toolbar
        selectedItems={getSelectedItems()}
        asciiOptions={asciiOptions}
        onAsciiOptionsChange={setAsciiOptions}
        onAddImages={handleImagesDrop}
        onGenerateAscii={handleGenerateAscii}
        onDeleteSelected={handleDeleteSelected}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onExportText={handleExportText}
        onExportHtml={handleExportHtml}
        onExportPng={handleExportPng}
        onCopyToClipboard={handleCopyToClipboard}
        onCopyAsPng={handleCopyAsPng}
        isGenerating={isGenerating}
      />
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </main>
  )
}
