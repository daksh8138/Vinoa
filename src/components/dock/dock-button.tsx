"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShortcutKeys } from "@/components/ui/shortcut-keys"
import { cn } from "@/lib/utils"
import { useDockContext } from "./dock-context"
import type { ShortcutKey } from "@/lib/shortcuts"

type DockButtonProps = {
  icon: ReactNode
  label: string
  shortcut?: ShortcutKey
  onClick?: () => void
  disabled?: boolean
  active?: boolean
}

export function DockButton({
  icon,
  label,
  shortcut,
  onClick,
  disabled,
  active,
}: DockButtonProps) {
  const { tooltipSide } = useDockContext()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn("h-8 w-8", active && "bg-accent")}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide} className="flex items-center gap-2 text-xs">
        <span>{label}</span>
        {shortcut && <ShortcutKeys keys={shortcut} />}
      </TooltipContent>
    </Tooltip>
  )
}
