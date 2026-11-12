"use client"

import { motion } from "motion/react"
import { GlyphText } from "./glyph-text"
import { ShortcutKeys } from "./ui/shortcut-keys"
import { shortcuts } from "@/lib/shortcuts"

const displayShortcuts = shortcuts.filter((s) =>
  ["Paste image", "Generate ASCII", "Flip dock", "Shortcuts"].includes(s.label)
)

export function EmptyState() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <h1 className="pointer-events-auto font-mono text-xl font-medium tracking-wide text-foreground">
            <GlyphText text="charify" speed={0.25} />
          </h1>
          <p
            className="font-mono text-xs text-muted-foreground/70"
          >
            image to ascii
          </p>
        </div>

        <div
          className="flex flex-col"
        >
          {displayShortcuts.map((shortcut) => (
            <div
              key={shortcut.label}
              className="pointer-events-auto flex cursor-default items-center justify-between w-64 rounded-sm px-2 py-1.5 transition-colors hover:bg-muted/40"
            >
              <span className="text-xs text-muted-foreground/60">{shortcut.label}</span>
              <ShortcutKeys keys={shortcut.keys} />
            </div>
          ))}
        </div>

        <p
          className="text-xs text-muted-foreground/60"
        >
          drop or paste to begin
        </p>
      </div>
    </div>
  )
}
