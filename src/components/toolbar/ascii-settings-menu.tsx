"use client"

import { Settings2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { useDockContext } from "@/components/dock"
import type { AsciiOptions, AsciiCharacterSet, AsciiColorMode } from "@/types/canvas"

const DEFAULT_OPTIONS: AsciiOptions = {
  width: 150,
  characterSet: "standard",
  invert: false,
  colorMode: "colored",
  dithering: true,
  brightness: 50,
}

type AsciiSettingsMenuProps = {
  options: AsciiOptions
  onOptionsChange: (options: AsciiOptions) => void
  disabled?: boolean
}

export function AsciiSettingsMenu({
  options,
  onOptionsChange,
  disabled,
}: AsciiSettingsMenuProps) {
  const { tooltipSide } = useDockContext()

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={disabled}>
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} className="text-xs">
          ASCII Settings
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="center"
        side={tooltipSide}
        sideOffset={12}
        className="w-52"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="text-xs">Character Set</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={options.characterSet}
          onValueChange={(value) =>
            onOptionsChange({ ...options, characterSet: value as AsciiCharacterSet })
          }
        >
          <DropdownMenuRadioItem value="standard" onSelect={(e) => e.preventDefault()}>Standard</DropdownMenuRadioItem>
          {/* Value stays "blocks" so settings already saved in localStorage keep working; the ramp is " .:oO8@#". */}
          <DropdownMenuRadioItem value="blocks" onSelect={(e) => e.preventDefault()}>Bold .:oO8@#</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="minimal" onSelect={(e) => e.preventDefault()}>Minimal</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="detailed" onSelect={(e) => e.preventDefault()}>Detailed</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Color Mode</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={options.colorMode}
          onValueChange={(value) =>
            onOptionsChange({ ...options, colorMode: value as AsciiColorMode })
          }
        >
          <DropdownMenuRadioItem value="grayscale" onSelect={(e) => e.preventDefault()}>Grayscale</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="colored" onSelect={(e) => e.preventDefault()}>Colored</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={options.invert}
          onCheckedChange={(checked) =>
            onOptionsChange({ ...options, invert: !!checked })
          }
          onSelect={(e) => e.preventDefault()}
        >
          Invert
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={options.dithering}
          onCheckedChange={(checked) =>
            onOptionsChange({ ...options, dithering: !!checked })
          }
          onSelect={(e) => e.preventDefault()}
        >
          Dithering
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Width</span>
            <span className="text-xs font-medium">{options.width}</span>
          </div>
          <Slider
            value={[options.width]}
            onValueChange={([value]) =>
              onOptionsChange({ ...options, width: value })
            }
            min={60}
            max={300}
            step={15}
            className="w-full"
          />
        </div>
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Brightness</span>
            <span className="text-xs font-medium">{options.brightness}</span>
          </div>
          <Slider
            value={[options.brightness]}
            onValueChange={([value]) =>
              onOptionsChange({ ...options, brightness: value })
            }
            min={-100}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
        <DropdownMenuSeparator />
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs justify-start"
          onClick={() => onOptionsChange(DEFAULT_OPTIONS)}
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Reset to defaults
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
