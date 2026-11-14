"use client"

import { useCallback } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { AsciiOptions } from "@/types/canvas"

const STORAGE_KEY = "vinoa-ascii-settings"

const DEFAULT_OPTIONS: AsciiOptions = {
  width: 150,
  characterSet: "standard",
  invert: false,
  colorMode: "colored",
  dithering: true,
  brightness: 50,
}

export function useAsciiSettings() {
  const [options, setOptions] = useLocalStorage<AsciiOptions>(
    STORAGE_KEY,
    DEFAULT_OPTIONS
  )

  const updateOption = useCallback(
    <K extends keyof AsciiOptions>(key: K, value: AsciiOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }))
    },
    [setOptions]
  )

  return {
    options,
    setOptions,
    updateOption,
  }
}
