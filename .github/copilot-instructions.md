# Pixel Reader - AI Coding Assistant Instructions

## Project Overview

Pixel Reader adalah aplikasi web vanilla JavaScript untuk image processing dengan multiple fitur: pixel analysis, binary/grayscale conversion, brightness adjustment, arithmetic operations, boolean operations, dan geometric transformations. Aplikasi menggunakan HTML5 Canvas API untuk manipulasi pixel dan Vite sebagai build tool, dengan arsitektur Single Page Application (SPA) menggunakan tab navigation.

## Architecture

### Core Components

- **TabManager Class** (`src/main.js`): Mengelola tab switching untuk SPA navigation
- **ImageProcessor Class** (`src/main.js`): Pure image processing operations (grayscale, binary, brightness, arithmetic, boolean, geometry)
- **PixelReader Class** (`src/main.js`): Main application controller yang menghubungkan UI dengan ImageProcessor
  - Canvas manipulation menggunakan `getContext('2d', { willReadFrequently: true })` - flag ini penting untuk performa saat membaca pixel berulang kali
  - Data structure: Array of pixel objects `{ x, y, r, g, b, a }`
  - Pixel dibaca dari kiri atas (0,0) secara row-major order (y kemudian x)

### SPA Architecture Pattern

Tab content menggunakan CSS show/hide dengan class `active`:

```javascript
// Tab switching pattern
switchTab(tabId) {
  this.tabButtons.forEach(btn => btn.classList.remove('active'));
  this.tabPanes.forEach(pane => pane.classList.remove('active'));
  // Activate selected
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}
```

**Why**: Lightweight SPA tanpa router framework, semua content pre-loaded di HTML.

### Data Flow

1. User uploads image → FileReader API → Image object
2. Image drawn to canvas → `ctx.drawImage()`
3. Canvas pixels extracted → `ctx.getImageData()` → returns `ImageData` with RGBA array
4. RGBA array (flat) → structured pixel objects → `pixelDataArray`
5. ImageProcessor operations → new ImageData → `ctx.putImageData()` → result canvas
6. Multiple process canvases (processCanvas1-5) untuk setiap tab fitur

## Key Technical Decisions

### Canvas Context Configuration

```javascript
this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
```

**Why**: Flag `willReadFrequently` mengoptimalkan performa saat reading pixels untuk hover functionality dan table generation.

### Multiple Canvas Strategy

Setiap tab fitur punya dedicated canvas (`processCanvas1` - `processCanvas5`) plus original canvas. **Why**: Memungkinkan user switch tab tanpa losing hasil operasi, dan setiap operasi bisa di-reset ke original independently.

### ImageProcessor Separation

ImageProcessor adalah pure class tanpa DOM dependency. Terima `sourceCanvas`, return `ImageData`. **Why**: Testability dan reusability - bisa digunakan untuk batch processing atau web workers di masa depan.

### Table Display Limitation (500x500)

Aplikasi membatasi display ke 500x500 pixel pertama di Pixel Data tab. Ini hardcoded dalam `displayPixelTable(500, 500)` untuk menghindari DOM overload.

### Brightness-Based Text Color

```javascript
const brightness = 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
const isLight = brightness > 180;
```

Formula luminance digunakan untuk menentukan warna text (hitam/putih) berdasarkan background RGB cell di table.

## Developer Workflows

### Development

```bash
npm run dev
```

Runs Vite dev server on `http://localhost:5173/` dengan hot module replacement.

**Note**: Vite 7.x requires Node.js 22.12+. Jika menggunakan Node.js versi lebih lama, downgrade ke `vite@5.4.11`.

### Production Build

```bash
npm run build
```

Output ke `dist/` folder (tidak di-commit ke repo).

### Preview Build

```bash
npm run preview
```

Preview production build locally sebelum deployment.

## Code Conventions

### File Organization

- **No framework**: Pure vanilla JavaScript - jangan suggest React, Vue, atau framework lain
- **Multiple classes pattern**: TabManager, ImageProcessor, PixelReader - separation of concerns
- **ES6 modules**: `import './style.css'` untuk CSS, `type="module"` di package.json

### Class Structure Pattern

```javascript
class FeatureName {
  constructor() {
    // DOM references
    // State properties
    this.init();
  }

  init() {
    // Event listeners setup
  }

  // Public methods
  // Private helpers
}
```

### Naming Patterns

- DOM elements: camelCase IDs (`imageCanvas`, `pixelList`, `hoverInfo`)
- Methods: camelCase verbs (`handleImageUpload`, `readPixels`, `updatePixelDisplay`)
- Data properties: descriptive nouns (`pixelDataArray`, `currentImage`, `processor`)
- Tab IDs: kebab-case (`pixel-data`, `binary-grayscale`, `arithmetic`)

### Event Handling

Event listeners di-attach dalam `init()` method:

```javascript
this.canvas.addEventListener("mousemove", (e) => this.handleCanvasHover(e));
this.canvas.addEventListener("mouseleave", () => this.hideHoverInfo());
```

**Pattern**: Always use arrow functions untuk preserve `this` context.

### CSS Architecture

- Utility-first approach dengan custom variables
- Tab navigation: border-bottom indicator untuk active state
- Sticky table headers (row 0) dan column headers (column 0) untuk navigasi
- Gradient backgrounds: `linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)`
- Color scheme: Blue (#3b82f6) untuk primary actions, slate grays (#64748b) untuk secondary

## Image Processing Features

### 1. Pixel Data Tab (Original Feature)

- 500x500 pixel table dengan RGB values
- Hover untuk real-time pixel info
- Luminance-based text color (dark text on light bg, vice versa)

### 2. Binary & Grayscale Tab

**Grayscale**: Luminance formula `0.299*R + 0.587*G + 0.114*B`
**Binary**: Threshold-based (default 128), adjustable dengan slider

```javascript
const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
const binary = gray >= threshold ? 255 : 0;
```

### 3. Brightness Tab

Add/subtract constant value ke semua RGB channels:

```javascript
data[i] = this.clamp(data[i] + value); // -100 to +100
```

**Clamp function**: Ensure values stay dalam range 0-255.

### 4. Arithmetic Tab

Dua modes:

- **Constant mode**: Add/subtract/multiply dengan single number
- **Image mode**: Pixel-wise operations dengan image kedua

**Multiply normalization**: Divide by 255 untuk prevent overflow:

```javascript
data1[i] = clamp((data1[i] * data2[i]) / 255);
```

### 5. Boolean Tab

Bitwise operations (AND, OR, XOR) antara dua images:

```javascript
data1[i] = data1[i] & data2[i]; // AND
data1[i] = data1[i] | data2[i]; // OR
data1[i] = data1[i] ^ data2[i]; // XOR
```

**UI**: Preview kedua images side-by-side sebelum operation.

### 6. Geometry Tab

**Rotations**: 90°, 180°, 270° - manual pixel remapping (no CSS transform)

```javascript
// Rotate 90° example
destX = height - 1 - y;
destY = x;
```

**Flipping**: Horizontal & Vertical

```javascript
// Flip horizontal
destX = width - 1 - x;
```

**Important**: Geometry operations create new ImageData dengan dimensi berbeda (untuk 90°/270°). After operation, processor di-update ke result canvas untuk consecutive transformations.

## Critical Implementation Details

### Pixel Reading Algorithm

```javascript
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const index = (y * width + x) * 4; // RGBA = 4 bytes per pixel
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const a = data[index + 3];
  }
}
```

**Urutan penting**: ImageData.data adalah flat Uint8ClampedArray dengan format `[R,G,B,A, R,G,B,A, ...]`.

### Hover Coordinate Calculation

```javascript
const scaleX = this.canvas.width / rect.width;
const scaleY = this.canvas.height / rect.height;
const x = Math.floor((event.clientX - rect.left) * scaleX);
```

**Why**: Canvas dapat di-scale oleh CSS (`max-width: 100%`), jadi perlu mapping dari screen coordinates ke canvas coordinates.

### Image Size Validation

Arithmetic dan Boolean operations require same-sized images. Validation:

```javascript
if (data1.length !== data2.length) {
  alert("Ukuran gambar harus sama!");
  return imageData;
}
```

### Canvas Reset Pattern

Setiap tab punya reset button yang redraw original image:

```javascript
resetCanvas(canvasId) {
  canvas.width = this.currentImage.width;
  canvas.height = this.currentImage.height;
  ctx.drawImage(this.currentImage, 0, 0);
  this.processor = new ImageProcessor(this.canvas); // Reset processor
}
```

### Unused File

`src/counter.js` adalah leftover dari Vite template dan tidak digunakan. Bisa dihapus safely.

## Integration Points

### External Dependencies

- **Vite 5.4.11+**: Build tool - konfigurasi zero-config, semua defaults
- **No runtime dependencies**: Aplikasi fully standalone setelah build

### Browser APIs Used

- FileReader API untuk image upload
- Canvas API untuk pixel manipulation
- MouseEvent untuk hover tracking
- DOM manipulation (no jQuery atau abstraction library)
- ImageData constructor untuk creating new image buffers

## Common Patterns

### Showing/Hiding Elements

```javascript
element.classList.remove("hidden");
element.classList.add("hidden");
```

**Pattern**: CSS class `.hidden { display: none !important; }` digunakan untuk visibility control.

### Dynamic HTML Generation

String concatenation untuk table HTML (bukan createElement). Ini trade-off untuk simplicity vs performance untuk tables besar.

### Slider Value Display

Real-time value update pattern:

```javascript
slider.addEventListener("input", (e) => {
  document.getElementById("valueDisplay").textContent = e.target.value;
});
```

### Console Logging

Output format example ke console:

```javascript
console.log("🎨 Image Processing App initialized!");
console.log(
  "Features: Pixel Data, Binary/Grayscale, Brightness, Arithmetic, Boolean, Geometry"
);
```

## Language & Localization

- UI dalam Bahasa Indonesia (buttons, labels, messages, alerts)
- Comments dalam kode mix ID/EN
- Console logs dalam Bahasa Indonesia dengan emoji
- Maintain bilingual approach saat menambah features

## Performance Considerations

- Table display limited ke 500x500 untuk mencegah browser freeze
- `willReadFrequently: true` canvas flag untuk optimize getImageData calls
- Hover info menggunakan `position: fixed` untuk smooth tracking tanpa reflow
- Geometry operations: Manual pixel remapping lebih efisien daripada canvas transformations untuk this use case
- Multiple canvases strategy: Trade memory untuk better UX (no computation when switching tabs)

## Testing Considerations

- Test dengan gambar kecil (< 100x100) untuk pixel table accuracy
- Test arithmetic/boolean dengan same-size images
- Test consecutive geometry operations (rotate → flip → rotate)
- Verify brightness extremes (-100 and +100) don't overflow
- Check binary threshold edge cases (0, 128, 255)
