# Address Maker

Frame address generator for the *Framework* book series: https://www.amazon.com/dp/B0BQV88XBQ

Download these files to a directory and open `addressMaker.html` in any browser (or host them on a static web server) to generate and edit addresses.

## Features

- **Interactive Canvas & Hotkeys**: Adjust spoke counts, increments, fill types, line widths, and intersection dots using simple hotkeys.
- **Visual Edit Mode (`e`)**: Drag individual spoke vertices directly on the canvas.
- **Copy/Paste**: Press `k` to copy the address to clipboard in standard format (`Outer: ... Inner: ...`).
- **Batch Chapter Export (`Shift+B` or Top Bar Button)**:
  - Paste lists of chapter addresses copied straight from Google Sheets (e.g. column F in your Story Binder).
  - Built-in **Book Chapter Art Preset** (Black & White hash fill, line width 5, outer intersection dots).
  - Thumbnail gallery preview with individual `✏️ Edit` and `💾 PNG` download buttons.
  - Interactive tweaking: edit any chapter on the main canvas and sync changes back to the batch.
  - One-click **Download All (`chapters.zip`)** exporting high-resolution chapter PNGs (`chapter1.png`, `chapter2.png`, etc.).
  - 100% client-side and serverless with bundled `jszip.min.js`.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Shift + B` | Open Batch Chapter Export Modal |
| `Space` | Randomize current address |
| `e` | Toggle Drag-and-Drop Edit Mode |
| `k` | Copy address to clipboard |
| `b` | Toggle Black & White / Hash Fill |
| `c` / `C` | Toggle Outer Circle / Concentric Guide Circles |
| `d` | Cycle Dots (None -> All Intersections -> Outer-only Intersections) |
| `w` / `W` | Decrease / Increase Line Width |
| `s` / `S` | Decrease / Increase Spoke Count |
| `i` / `I` | Decrease / Increase Increment Count |
| `r` / `l` | Radial / Linear Graph Type |
| `a` | Toggle Address Text Overlay |
