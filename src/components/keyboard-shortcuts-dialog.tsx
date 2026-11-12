"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShortcutKeys } from "@/components/ui/shortcut-keys"
import {
  shortcuts,
  shortcutCategories,
  getShortcutsByCategory,
} from "@/lib/shortcuts"

type KeyboardShortcutsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {shortcutCategories.map((category) => {
            const categoryShortcuts = getShortcutsByCategory(category)
            return (
              <div key={category}>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                  {category}
                </h3>
                <div className="space-y-1">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{shortcut.label}</span>
                      <ShortcutKeys keys={shortcut.keys} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
