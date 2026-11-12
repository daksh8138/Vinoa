"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

const GLYPHS = "アイウエオカキクケコ░▒▓█▄▀■□●○◆◇0123456789@#$%&*"

function generateGlyphs() {
  return Array.from({ length: 4 }, () =>
    GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
  )
}

interface GlyphTextProps {
  text: string
  className?: string
  speed?: number
  animateOnLoad?: boolean
}

export function GlyphText({
  text,
  className,
  speed = 0.3,
  animateOnLoad = true,
}: GlyphTextProps) {
  const [animate, setAnimate] = useState(false)
  const [chars, setChars] = useState(() =>
    text.split("").map((char, index) => ({ char, index, glyphs: ["_", "_", "_", "_"] }))
  )

  useEffect(() => {
    setChars(text.split("").map((char, index) => ({ char, index, glyphs: generateGlyphs() })))
    if (animateOnLoad) {
      const timer = setTimeout(() => setAnimate(true), 100)
      return () => clearTimeout(timer)
    }
  }, [text, animateOnLoad])

  useEffect(() => {
    if (!animate) return
    const duration = (speed * 1000) + (chars.length * 40) + 100
    const timer = setTimeout(() => setAnimate(false), duration)
    return () => clearTimeout(timer)
  }, [animate, speed, chars.length])

  const handleMouseEnter = useCallback(() => {
    if (animate) return
    setChars(text.split("").map((char, index) => ({ char, index, glyphs: generateGlyphs() })))
    setAnimate(true)
  }, [animate, text])

  return (
    <span
      className={cn("glyph-text", animate && "animate", className)}
      style={{ "--glyph-speed": speed } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
    >
      {chars.map(({ char, index, glyphs }) => (
        <span
          key={index}
          className="glyph-char"
          data-char={char}
          style={
            {
              "--index": index,
              "--char-1": `"${glyphs[0]}"`,
              "--char-2": `"${glyphs[1]}"`,
              "--char-3": `"${glyphs[2]}"`,
              "--char-4": `"${glyphs[3]}"`,
            } as React.CSSProperties
          }
        >
          {char}
        </span>
      ))}
    </span>
  )
}
