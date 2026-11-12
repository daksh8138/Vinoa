"use client"

import { Command, ArrowBigUp, Delete } from "lucide-react"
import type { ShortcutKey } from "@/lib/shortcuts"

type ShortcutKeysProps = {
  keys: ShortcutKey
}

export function ShortcutKeys({ keys }: ShortcutKeysProps) {
  return (
    <span className="flex items-center gap-0.5 text-muted-foreground">
      {keys.cmd && (
        <kbd className="flex h-5 w-5 items-center justify-center rounded bg-muted">
          <Command className="h-3 w-3" />
        </kbd>
      )}
      {keys.shift && (
        <kbd className="flex h-5 w-5 items-center justify-center rounded bg-muted">
          <ArrowBigUp className="h-3 w-3" />
        </kbd>
      )}
      {keys.alt && (
        <kbd className="flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1 text-xs">
          Alt
        </kbd>
      )}
      <kbd className="flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1 text-xs font-medium">
        {keys.key === "⌫" ? <Delete className="h-3 w-3" /> : keys.key}
      </kbd>
    </span>
  )
}
