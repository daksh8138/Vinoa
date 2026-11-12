import type { Position, Size } from "@/types/canvas"

type GridConfig = {
  viewportWidth: number
  viewportHeight: number
  pan: Position
  itemCount: number
  baseItemSize: Size
  gap?: number
}

export function calculateGridPositions(config: GridConfig): { positions: Position[] } {
  const { viewportWidth, viewportHeight, pan, itemCount, baseItemSize, gap = 40 } = config

  if (itemCount === 0) return { positions: [] }
  if (itemCount === 1) {
    const randomOffsetX = (Math.random() - 0.5) * 20
    const randomOffsetY = (Math.random() - 0.5) * 20
    return {
      positions: [
        {
          x: viewportWidth / 2 - baseItemSize.width / 2 + randomOffsetX - pan.x,
          y: viewportHeight / 2 - baseItemSize.height / 2 + randomOffsetY - pan.y,
        },
      ],
    }
  }

  const cols = Math.ceil(Math.sqrt(itemCount))
  const rows = Math.ceil(itemCount / cols)

  const totalGridWidth = cols * baseItemSize.width + (cols - 1) * gap
  const totalGridHeight = rows * baseItemSize.height + (rows - 1) * gap

  const startX = viewportWidth / 2 - totalGridWidth / 2 - pan.x
  const startY = viewportHeight / 2 - totalGridHeight / 2 - pan.y

  const positions: Position[] = []

  for (let i = 0; i < itemCount; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    const randomOffsetX = (Math.random() - 0.5) * 20
    const randomOffsetY = (Math.random() - 0.5) * 20

    positions.push({
      x: startX + col * (baseItemSize.width + gap) + randomOffsetX,
      y: startY + row * (baseItemSize.height + gap) + randomOffsetY,
    })
  }

  return { positions }
}
