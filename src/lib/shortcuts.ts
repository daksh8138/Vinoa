export type ShortcutCategory = "Canvas" | "Item" | "View" | "Dock"

export type ShortcutKey = {
  cmd?: boolean
  shift?: boolean
  alt?: boolean
  key: string
}

export type Shortcut = {
  keys: ShortcutKey
  label: string
  category: ShortcutCategory
}

export const shortcuts: Shortcut[] = [
  { keys: { cmd: true, key: "A" }, label: "Select all", category: "Canvas" },
  { keys: { cmd: true, key: "V" }, label: "Paste image", category: "Canvas" },
  { keys: { cmd: true, key: "G" }, label: "Generate ASCII", category: "Item" },
  { keys: { cmd: true, key: "D" }, label: "Duplicate", category: "Item" },
  { keys: { key: "⌫" }, label: "Delete", category: "Item" },
  { keys: { shift: true, key: "H" }, label: "Flip horizontal", category: "Item" },
  { keys: { shift: true, key: "V" }, label: "Flip vertical", category: "Item" },
  { keys: { cmd: true, key: "]" }, label: "Bring to front", category: "Item" },
  { keys: { cmd: true, key: "[" }, label: "Send to back", category: "Item" },
  { keys: { cmd: true, key: "Z" }, label: "Undo resize", category: "Item" },
  { keys: { cmd: true, shift: true, key: "Z" }, label: "Redo resize", category: "Item" },
  { keys: { cmd: true, key: "+" }, label: "Zoom in", category: "View" },
  { keys: { cmd: true, key: "-" }, label: "Zoom out", category: "View" },
  { keys: { cmd: true, key: "0" }, label: "Reset view", category: "View" },
  { keys: { cmd: true, key: "/" }, label: "Shortcuts", category: "View" },
  { keys: { cmd: true, key: "\\" }, label: "Flip dock", category: "Dock" },
  { keys: { cmd: true, shift: true, key: "0" }, label: "Reset dock", category: "Dock" },
]

export const shortcutCategories: ShortcutCategory[] = ["Canvas", "Item", "View", "Dock"]

export function getShortcutsByCategory(category: ShortcutCategory): Shortcut[] {
  return shortcuts.filter((s) => s.category === category)
}
