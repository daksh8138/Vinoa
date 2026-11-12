export type Position = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type BaseCanvasItem = {
  id: string
  position: Position
  size: Size
}

export type ImageCanvasItem = BaseCanvasItem & {
  type: "image"
  src: string
  name: string
  flipH?: boolean
  flipV?: boolean
}

export type AsciiCanvasItem = BaseCanvasItem & {
  type: "ascii"
  content: string
  colored: AsciiColoredChar[][] | null
  previewUrl: string
  fontSize: number
  sourceImageId?: string
}

export type CanvasItem = ImageCanvasItem | AsciiCanvasItem

export type DockPosition = "bottom" | "top" | "left" | "right"

export type CanvasState = {
  items: CanvasItem[]
  zoom: number
  pan: Position
  selectedItemIds: Set<string>
  focusStack: string[]
}

export type SelectionMode = "replace" | "toggle" | "add"

export type SelectionBox = {
  start: Position
  end: Position
} | null

export type AsciiCharacterSet = "standard" | "blocks" | "minimal" | "detailed"

export type AsciiColorMode = "grayscale" | "colored"

export type AsciiOptions = {
  width: number
  characterSet: AsciiCharacterSet
  invert: boolean
  colorMode: AsciiColorMode
  dithering: boolean
  brightness: number
}

export type AsciiColoredChar = {
  char: string
  color: string
}

export type AsciiOutput = {
  text: string
  colored: AsciiColoredChar[][] | null
  previewUrl: string
  previewWidth: number
  previewHeight: number
}
