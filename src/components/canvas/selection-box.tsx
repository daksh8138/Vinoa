import type { Position } from "@/types/canvas"

type SelectionBoxProps = {
  start: Position
  end: Position
}

export function SelectionBox({ start, end }: SelectionBoxProps) {
  const left = Math.min(start.x, end.x)
  const top = Math.min(start.y, end.y)
  const width = Math.abs(end.x - start.x)
  const height = Math.abs(end.y - start.y)

  return (
    <div
      className="absolute border border-primary bg-primary/10 pointer-events-none"
      style={{ left, top, width, height }}
    />
  )
}
