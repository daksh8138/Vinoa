"use client"

import { useEffect, useRef } from "react"

type ShortcutAction = {
  key: string
  cmd?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts(shortcuts: ShortcutAction[]) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      const isMeta = e.metaKey || e.ctrlKey

      for (const shortcut of shortcutsRef.current) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase() || e.key === shortcut.key
        const cmdMatch = shortcut.cmd ? isMeta : !isMeta
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey
        const enabled = shortcut.enabled !== false

        if (keyMatch && cmdMatch && shiftMatch && altMatch && enabled) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
}
