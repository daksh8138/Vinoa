"use client"

import { useRef } from "react"
import { ImagePlus, Sparkles, Trash2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Dock, DockButton, DockSeparator, ThemeToggle } from "@/components/dock"
import { AsciiSettingsMenu } from "./ascii-settings-menu"
import { ExportMenu } from "./export-menu"
import type { CanvasItem, AsciiOptions } from "@/types/canvas"

type ToolbarProps = {
  selectedItems: CanvasItem[]
  asciiOptions: AsciiOptions
  onAsciiOptionsChange: (options: AsciiOptions) => void
  onAddImages: (files: File[]) => void
  onGenerateAscii: () => void
  onDeleteSelected: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onExportText: () => void
  onExportHtml: () => void
  onExportPng: () => void
  onCopyToClipboard: () => void
  onCopyAsPng: () => void
  isGenerating: boolean
}

export function Toolbar({
  selectedItems,
  asciiOptions,
  onAsciiOptionsChange,
  onAddImages,
  onGenerateAscii,
  onDeleteSelected,
  onZoomIn,
  onZoomOut,
  onResetView,
  onExportText,
  onExportHtml,
  onExportPng,
  onCopyToClipboard,
  onCopyAsPng,
  isGenerating,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onAddImages(Array.from(files))
      e.target.value = ""
    }
  }

  const hasSelection = selectedItems.length > 0
  const hasImageSelected = selectedItems.some((item) => item.type === "image")
  const hasAsciiSelected = selectedItems.some((item) => item.type === "ascii")
  const selectionCount = selectedItems.length

  const deleteLabel = selectionCount > 1 ? `Delete (${selectionCount})` : "Delete"

  return (
    <Dock>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <DockButton
        icon={<ImagePlus className="h-4 w-4" />}
        label="Add Images"
        shortcut={{ cmd: true, key: "V" }}
        onClick={() => fileInputRef.current?.click()}
      />
      <DockButton
        icon={<Sparkles className="h-4 w-4" />}
        label="Generate ASCII"
        shortcut={{ cmd: true, key: "G" }}
        onClick={onGenerateAscii}
        disabled={!hasImageSelected || isGenerating}
      />
      <AsciiSettingsMenu
        options={asciiOptions}
        onOptionsChange={onAsciiOptionsChange}
        disabled={!hasSelection}
      />
      <DockSeparator />
      <ExportMenu
        disabled={!hasAsciiSelected}
        onCopyText={onCopyToClipboard}
        onCopyPng={onCopyAsPng}
        onExportText={onExportText}
        onExportHtml={onExportHtml}
        onExportPng={onExportPng}
      />
      <DockButton
        icon={<Trash2 className="h-4 w-4" />}
        label={deleteLabel}
        shortcut={{ key: "⌫" }}
        onClick={onDeleteSelected}
        disabled={!hasSelection}
      />
      <DockSeparator />
      <DockButton
        icon={<ZoomOut className="h-4 w-4" />}
        label="Zoom Out"
        shortcut={{ cmd: true, key: "-" }}
        onClick={onZoomOut}
      />
      <DockButton
        icon={<ZoomIn className="h-4 w-4" />}
        label="Zoom In"
        shortcut={{ cmd: true, key: "+" }}
        onClick={onZoomIn}
      />
      <DockButton
        icon={<Maximize2 className="h-4 w-4" />}
        label="Reset View"
        shortcut={{ cmd: true, key: "0" }}
        onClick={onResetView}
      />
      <ThemeToggle />
    </Dock>
  )
}
