import type {
  AsciiCharacterSet,
  AsciiOptions,
  AsciiOutput,
  AsciiColoredChar,
} from "@/types/canvas"

const CHARACTER_SETS: Record<AsciiCharacterSet, string> = {
  standard: " .,:;i1tfLCG08@",
  blocks: " .:oO8@#",
  minimal: " .:#",
  detailed:
    " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
}

const CHAR_ASPECT_RATIO = 0.5

function calculateLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function sampleArea(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  startX: number,
  startY: number,
  cellWidth: number,
  cellHeight: number
): { r: number; g: number; b: number; brightness: number; alpha: number } {
  let totalR = 0
  let totalG = 0
  let totalB = 0
  let totalAlpha = 0
  let alphaWeightedR = 0
  let alphaWeightedG = 0
  let alphaWeightedB = 0
  let count = 0

  const endX = Math.min(startX + cellWidth, imgWidth)
  const endY = startY + cellHeight

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * imgWidth + x) * 4
      const r = pixels[idx]
      const g = pixels[idx + 1]
      const b = pixels[idx + 2]
      const a = pixels[idx + 3] / 255 // Normalize alpha to 0-1

      totalR += r
      totalG += g
      totalB += b
      totalAlpha += a

      // Weight colors by alpha for proper blending
      alphaWeightedR += r * a
      alphaWeightedG += g * a
      alphaWeightedB += b * a
      count++
    }
  }

  if (count === 0) {
    return { r: 0, g: 0, b: 0, brightness: 0, alpha: 0 }
  }

  const avgAlpha = totalAlpha / count

  // Use alpha-weighted colors if there's any opacity, otherwise fallback to simple average
  let r: number, g: number, b: number
  if (totalAlpha > 0) {
    r = Math.round(alphaWeightedR / totalAlpha)
    g = Math.round(alphaWeightedG / totalAlpha)
    b = Math.round(alphaWeightedB / totalAlpha)
  } else {
    r = Math.round(totalR / count)
    g = Math.round(totalG / count)
    b = Math.round(totalB / count)
  }

  const brightness = calculateLuminance(r, g, b)

  return { r, g, b, brightness, alpha: avgAlpha }
}

function applyFloydSteinberg(
  brightness: number[][],
  width: number,
  height: number,
  levels: number
): number[][] {
  const result = brightness.map((row) => [...row])

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const oldValue = result[y][x]
      const newValue = Math.round(oldValue * (levels - 1)) / (levels - 1)
      result[y][x] = newValue

      const error = oldValue - newValue

      if (x + 1 < width) {
        result[y][x + 1] += error * (7 / 16)
      }
      if (y + 1 < height) {
        if (x > 0) {
          result[y + 1][x - 1] += error * (3 / 16)
        }
        result[y + 1][x] += error * (5 / 16)
        if (x + 1 < width) {
          result[y + 1][x + 1] += error * (1 / 16)
        }
      }
    }
  }

  return result
}

function adjustBrightness(value: number, adjustment: number): number {
  const adjusted = value + adjustment / 100
  return Math.max(0, Math.min(1, adjusted))
}

function getCharacterForBrightness(
  brightness: number,
  characters: string,
  invert: boolean
): string {
  const normalizedBrightness = invert ? 1 - brightness : brightness
  const clampedBrightness = Math.max(0, Math.min(1, normalizedBrightness))
  const index = Math.floor(clampedBrightness * (characters.length - 1))
  return characters[Math.min(index, characters.length - 1)]
}

function renderAsciiToCanvas(
  content: string,
  colored: AsciiColoredChar[][] | null,
  fontSize: number = 10
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  const fontFamily = "monospace"
  const lines = content.split("\n").filter((line) => line.length > 0)
  const maxLineLength = Math.max(...lines.map((line) => line.length), 1)

  const charWidth = fontSize * 0.6
  const lineHeight = fontSize

  canvas.width = Math.ceil(maxLineLength * charWidth) + 4
  canvas.height = Math.ceil(lines.length * lineHeight) + 4

  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.textBaseline = "top"

  if (colored) {
    colored.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.char !== " ") {
          ctx.fillStyle = cell.color
          ctx.fillText(cell.char, 2 + x * charWidth, 2 + y * lineHeight)
        }
      })
    })
  } else {
    ctx.fillStyle = "#ffffff"
    lines.forEach((line, y) => {
      for (let x = 0; x < line.length; x++) {
        if (line[x] !== " ") {
          ctx.fillText(line[x], 2 + x * charWidth, 2 + y * lineHeight)
        }
      }
    })
  }

  return canvas
}

export async function imageToAscii(
  imageSrc: string,
  options: AsciiOptions
): Promise<AsciiOutput> {
  const { width, characterSet, invert, colorMode, dithering, brightness } = options
  const characters = CHARACTER_SETS[characterSet]

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const aspectRatio = img.height / img.width
      const asciiHeight = Math.floor(width * aspectRatio * CHAR_ASPECT_RATIO)

      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Failed to get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      const pixels = imageData.data

      const cellWidth = img.width / width
      const cellHeight = img.height / asciiHeight

      const brightnessGrid: number[][] = []
      const colorGrid: { r: number; g: number; b: number }[][] = []
      const alphaGrid: number[][] = []

      for (let y = 0; y < asciiHeight; y++) {
        const brightnessRow: number[] = []
        const colorRow: { r: number; g: number; b: number }[] = []
        const alphaRow: number[] = []

        for (let x = 0; x < width; x++) {
          const startX = Math.floor(x * cellWidth)
          const startY = Math.floor(y * cellHeight)

          const sample = sampleArea(
            pixels,
            img.width,
            startX,
            startY,
            Math.ceil(cellWidth),
            Math.ceil(cellHeight)
          )

          brightnessRow.push(sample.brightness)
          colorRow.push({ r: sample.r, g: sample.g, b: sample.b })
          alphaRow.push(sample.alpha)
        }

        brightnessGrid.push(brightnessRow)
        colorGrid.push(colorRow)
        alphaGrid.push(alphaRow)
      }

      const adjustedBrightness = brightnessGrid.map((row) =>
        row.map((value) => adjustBrightness(value, brightness))
      )

      const finalBrightness = dithering
        ? applyFloydSteinberg(
            adjustedBrightness,
            width,
            asciiHeight,
            characters.length
          )
        : adjustedBrightness

      let text = ""
      const colored: AsciiColoredChar[][] = []

      // Threshold below which we consider pixels fully transparent
      const alphaThreshold = 0.1

      for (let y = 0; y < asciiHeight; y++) {
        const coloredRow: AsciiColoredChar[] = []

        for (let x = 0; x < width; x++) {
          const alpha = alphaGrid[y][x]
          const brightness = finalBrightness[y][x]
          const color = colorGrid[y][x]

          // Use space for transparent areas
          const char =
            alpha < alphaThreshold
              ? " "
              : getCharacterForBrightness(brightness, characters, invert)

          text += char
          coloredRow.push({
            char,
            color: rgbToHex(color.r, color.g, color.b),
          })
        }

        text += "\n"
        colored.push(coloredRow)
      }

      const coloredOutput = colorMode === "colored" ? colored : null
      const previewCanvas = renderAsciiToCanvas(text, coloredOutput, 12)
      const previewUrl = previewCanvas.toDataURL("image/png")

      resolve({
        text,
        colored: coloredOutput,
        previewUrl,
        previewWidth: previewCanvas.width,
        previewHeight: previewCanvas.height,
      })
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = imageSrc
  })
}

export function getDefaultAsciiOptions(): AsciiOptions {
  return {
    width: 150,
    characterSet: "standard",
    invert: false,
    colorMode: "colored",
    dithering: true,
    brightness: 50,
  }
}

export function exportAsciiAsText(content: string): void {
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "ascii-art.txt"
  a.click()
  URL.revokeObjectURL(url)
}

export function exportAsciiAsHtml(
  content: string,
  colored: AsciiColoredChar[][] | null,
  fontSize: number = 6
): void {
  let bodyContent: string

  if (colored) {
    const lines = colored
      .map((row) =>
        row.map((c) => `<span style="color:${c.color}">${escapeHtml(c.char)}</span>`).join("")
      )
      .join("\n")
    bodyContent = `<pre>${lines}</pre>`
  } else {
    bodyContent = `<pre>${escapeHtml(content)}</pre>`
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ASCII Art</title>
<style>
body { background: #000; display: flex; justify-content: center; padding: 20px; }
pre { color: #fff; font-family: monospace; font-size: ${fontSize}px; line-height: 1; letter-spacing: 0; }
pre span { display: inline; }
</style>
</head>
<body>
${bodyContent}
</body>
</html>`

  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "ascii-art.html"
  a.click()
  URL.revokeObjectURL(url)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/ /g, "&nbsp;")
}

export function copyAsciiToClipboard(content: string): Promise<void> {
  return navigator.clipboard.writeText(content)
}

export function exportAsciiAsPng(
  content: string,
  colored: AsciiColoredChar[][] | null,
  fontSize: number = 12
): void {
  const canvas = renderAsciiToCanvas(content, colored, fontSize)
  const url = canvas.toDataURL("image/png")
  const a = document.createElement("a")
  a.href = url
  a.download = "ascii-art.png"
  a.click()
}

export async function copyAsciiAsPng(
  content: string,
  colored: AsciiColoredChar[][] | null,
  fontSize: number = 12
): Promise<void> {
  const canvas = renderAsciiToCanvas(content, colored, fontSize)
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/png")
  })
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
}
