

# Vinoa

Transform images into ASCII art with an interactive, infinite canvas. Upload an image, customize its appearance, and export your creation in multiple formats.

**Live:** [https://vinoa.vercel.app/](https://vinoa.vercel.app/)

## Features

- Drag and drop or paste images (`Cmd/Ctrl + V`)
- Infinite canvas with pan and zoom
- Customizable ASCII art generation: colored or grayscale output, optional dithering, brightness control
- Four ASCII character sets (Standard, Bold `.:oO8@#`, Minimal, Detailed) and adjustable output width
- Inverted brightness mapping, plus horizontal and vertical image flipping
- Export generated artwork as PNG, plain text (`.txt`) or standalone HTML (`.html`)
- Copy generated artwork to the clipboard as text or as a PNG image
- Movable toolbar with snap zones
- Dark and light themes
- Keyboard shortcuts for common actions

## Planned Features

The following are **planned and not yet implemented**. They are not available in the current version.

1. **SVG Export (planned):** Allow users to export generated ASCII artwork as scalable SVG files.
2. **Block Character Sets (planned):** Introduce genuine Unicode block-character ramps such as ░, ▒, ▓ and █ for image-to-ASCII conversion.
3. **Enhanced Motion and Animations (planned):** Introduce polished animations and interactions using the Motion library.

## Tech Stack

- **Framework:** Next.js 16
- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui

The [Motion](https://motion.dev/) package is installed for the planned animation work above, but is not used in the current version.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system.

### Installation

Clone the repository:

```bash
git clone git@github.com:daksh8138/vinoa.git
cd vinoa
```

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

This project is distributed under the MIT License. See the `LICENSE` file for details.

