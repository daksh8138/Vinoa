"use client"

import { Download, Copy, FileText, FileCode, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDockContext } from "@/components/dock"

type ExportMenuProps = {
  disabled?: boolean
  onCopyText: () => void
  onCopyPng: () => void
  onExportText: () => void
  onExportHtml: () => void
  onExportPng: () => void
}

export function ExportMenu({
  disabled,
  onCopyText,
  onCopyPng,
  onExportText,
  onExportHtml,
  onExportPng,
}: ExportMenuProps) {
  const { tooltipSide } = useDockContext()

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={disabled}>
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} className="text-xs">
          Export
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="center"
        side={tooltipSide}
        sideOffset={12}
        className="w-48"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="text-xs">Copy</DropdownMenuLabel>
        <DropdownMenuItem onClick={onCopyText}>
          <Copy className="mr-2 h-4 w-4" />
          Copy as text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyPng}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Copy as PNG
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Export</DropdownMenuLabel>
        <DropdownMenuItem onClick={onExportText}>
          <FileText className="mr-2 h-4 w-4" />
          Export as .txt
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportHtml}>
          <FileCode className="mr-2 h-4 w-4" />
          Export as .html
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPng}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Export as .png
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
