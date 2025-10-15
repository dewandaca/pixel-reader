import "./style.css";

// Tab Manager untuk handle tab switching
class TabManager {
  constructor() {
    this.tabButtons = document.querySelectorAll(".tab-button");
    this.tabPanes = document.querySelectorAll(".tab-pane");
    this.init();
  }

  init() {
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () =>
        this.switchTab(button.dataset.tab)
      );
    });
  }

  switchTab(tabId) {
    // Remove active class dari semua buttons dan panes
    this.tabButtons.forEach((btn) => btn.classList.remove("active"));
    this.tabPanes.forEach((pane) => pane.classList.remove("active"));

    // Add active class ke selected tab
    const selectedButton = document.querySelector(`[data-tab="${tabId}"]`);
    const selectedPane = document.getElementById(tabId);

    if (selectedButton) selectedButton.classList.add("active");
    if (selectedPane) selectedPane.classList.add("active");
  }
}

// Image Processor untuk semua operasi image processing
class ImageProcessor {
  constructor(sourceCanvas) {
    this.sourceCanvas = sourceCanvas;
    this.sourceCtx = sourceCanvas.getContext("2d", {
      willReadFrequently: true,
    });
  }

  // Get image data dari source canvas
  getImageData() {
    return this.sourceCtx.getImageData(
      0,
      0,
      this.sourceCanvas.width,
      this.sourceCanvas.height
    );
  }

  // Draw image data ke target canvas
  drawToCanvas(imageData, targetCanvas) {
    targetCanvas.width = imageData.width;
    targetCanvas.height = imageData.height;
    const ctx = targetCanvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
  }

  // Konversi ke Grayscale menggunakan luminance formula
  toGrayscale() {
    const imageData = this.getImageData();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      data[i] = gray; // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
      // Alpha (i+3) tetap sama
    }

    return imageData;
  }

  // Konversi ke Binary dengan threshold
  toBinary(threshold = 128) {
    const imageData = this.getImageData();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      const binary = gray >= threshold ? 255 : 0;
      data[i] = binary; // R
      data[i + 1] = binary; // G
      data[i + 2] = binary; // B
    }

    return imageData;
  }

  // Adjust brightness
  adjustBrightness(value) {
    const imageData = this.getImageData();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = this.clamp(data[i] + value); // R
      data[i + 1] = this.clamp(data[i + 1] + value); // G
      data[i + 2] = this.clamp(data[i + 2] + value); // B
    }

    return imageData;
  }

  // Arithmetic operations dengan konstanta
  arithmeticConstant(operation, constant) {
    const imageData = this.getImageData();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      switch (operation) {
        case "add":
          data[i] = this.clamp(data[i] + constant);
          data[i + 1] = this.clamp(data[i + 1] + constant);
          data[i + 2] = this.clamp(data[i + 2] + constant);
          break;
        case "subtract":
          data[i] = this.clamp(data[i] - constant);
          data[i + 1] = this.clamp(data[i + 1] - constant);
          data[i + 2] = this.clamp(data[i + 2] - constant);
          break;
        case "multiply":
          data[i] = this.clamp(data[i] * constant);
          data[i + 1] = this.clamp(data[i + 1] * constant);
          data[i + 2] = this.clamp(data[i + 2] * constant);
          break;
      }
    }

    return imageData;
  }

  // Arithmetic operations dengan image lain
  arithmeticImage(operation, otherImageData) {
    const imageData = this.getImageData();
    const data1 = imageData.data;
    const data2 = otherImageData.data;

    // Pastikan ukuran sama
    if (data1.length !== data2.length) {
      alert("Ukuran gambar harus sama!");
      return imageData;
    }

    for (let i = 0; i < data1.length; i += 4) {
      switch (operation) {
        case "add":
          data1[i] = this.clamp(data1[i] + data2[i]);
          data1[i + 1] = this.clamp(data1[i + 1] + data2[i + 1]);
          data1[i + 2] = this.clamp(data1[i + 2] + data2[i + 2]);
          break;
        case "subtract":
          data1[i] = this.clamp(data1[i] - data2[i]);
          data1[i + 1] = this.clamp(data1[i + 1] - data2[i + 1]);
          data1[i + 2] = this.clamp(data1[i + 2] - data2[i + 2]);
          break;
        case "multiply":
          data1[i] = this.clamp((data1[i] * data2[i]) / 255);
          data1[i + 1] = this.clamp((data1[i + 1] * data2[i + 1]) / 255);
          data1[i + 2] = this.clamp((data1[i + 2] * data2[i + 2]) / 255);
          break;
      }
    }

    return imageData;
  }

  // Boolean operations
  booleanOperation(operation, otherImageData) {
    const imageData = this.getImageData();
    const data1 = imageData.data;
    const data2 = otherImageData.data;

    // Pastikan ukuran sama
    if (data1.length !== data2.length) {
      alert("Ukuran gambar harus sama!");
      return imageData;
    }

    for (let i = 0; i < data1.length; i += 4) {
      switch (operation) {
        case "and":
          data1[i] = data1[i] & data2[i];
          data1[i + 1] = data1[i + 1] & data2[i + 1];
          data1[i + 2] = data1[i + 2] & data2[i + 2];
          break;
        case "or":
          data1[i] = data1[i] | data2[i];
          data1[i + 1] = data1[i + 1] | data2[i + 1];
          data1[i + 2] = data1[i + 2] | data2[i + 2];
          break;
        case "xor":
          data1[i] = data1[i] ^ data2[i];
          data1[i + 1] = data1[i + 1] ^ data2[i + 1];
          data1[i + 2] = data1[i + 2] ^ data2[i + 2];
          break;
      }
    }

    return imageData;
  }

  // Rotasi 90 derajat searah jarum jam
  rotate90() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(height, width);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destX = height - 1 - y;
        const destY = x;
        const destIdx = (destY * height + destX) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  // Rotasi 180 derajat
  rotate180() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(width, height);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destX = width - 1 - x;
        const destY = height - 1 - y;
        const destIdx = (destY * width + destX) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  // Rotasi 270 derajat (atau -90)
  rotate270() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(height, width);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destX = y;
        const destY = width - 1 - x;
        const destIdx = (destY * height + destX) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  // Flip Horizontal
  flipHorizontal() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(width, height);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destX = width - 1 - x;
        const destIdx = (y * width + destX) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  // Flip Vertical
  flipVertical() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(width, height);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destY = height - 1 - y;
        const destIdx = (destY * width + x) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  // Helper untuk clamp nilai RGB
  clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }
}

class PixelReader {
  constructor() {
    this.canvas = document.getElementById("imageCanvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.imageInput = document.getElementById("imageInput");
    this.imagePreview = document.getElementById("imagePreview");
    this.pixelList = document.getElementById("pixelList");
    this.showAllPixels = document.getElementById("showAllPixels");
    this.hoverInfo = document.getElementById("hoverInfo");
    this.imageSize = document.getElementById("imageSize");
    this.tabSection = document.getElementById("tabSection");

    this.currentImage = null;
    this.pixelDataArray = [];

    // Initialize processor
    this.processor = null;

    // Storage untuk second images (arithmetic & boolean operations)
    this.secondImage = null;
    this.booleanSecondImage = null;

    this.init();
  }

  init() {
    this.imageInput.addEventListener("change", (e) =>
      this.handleImageUpload(e)
    );
    this.showAllPixels.addEventListener("change", () =>
      this.updatePixelDisplay()
    );
    this.canvas.addEventListener("mousemove", (e) => this.handleCanvasHover(e));
    this.canvas.addEventListener("mouseleave", () => this.hideHoverInfo());

    // Grayscale tab (auto-convert on tab open)
    document
      .getElementById("resetImageGrayscale")
      .addEventListener("click", () =>
        this.resetCanvas("processCanvasGrayscale")
      );

    // Binary tab with real-time threshold slider
    const thresholdSlider = document.getElementById("thresholdSlider");
    thresholdSlider.addEventListener("input", (e) => {
      document.getElementById("thresholdValue").textContent = e.target.value;
      this.applyBinaryRealtime();
    });
    document
      .getElementById("resetImageBinary")
      .addEventListener("click", () => this.resetCanvas("processCanvasBinary"));

    // Brightness tab with real-time slider
    const brightnessSlider = document.getElementById("brightnessSlider");
    brightnessSlider.addEventListener("input", (e) => {
      document.getElementById("brightnessValue").textContent = e.target.value;
      this.applyBrightnessRealtime();
    });
    document
      .getElementById("resetImage2")
      .addEventListener("click", () => this.resetCanvas("processCanvas2"));

    // Arithmetic controls
    document
      .getElementById("arithmeticMode")
      .addEventListener("change", (e) => this.toggleArithmeticMode(e));
    document
      .getElementById("secondImageInput")
      .addEventListener("change", (e) => this.handleSecondImageUpload(e));
    document
      .getElementById("applyArithmetic")
      .addEventListener("click", () => this.applyArithmeticOperation());
    document
      .getElementById("resetImage3")
      .addEventListener("click", () => this.resetCanvas("processCanvas3"));

    // Boolean controls
    document
      .getElementById("booleanImageInput")
      .addEventListener("change", (e) => this.handleBooleanImageUpload(e));
    document
      .getElementById("applyBoolean")
      .addEventListener("click", () => this.applyBooleanOperation());
    document
      .getElementById("resetImage4")
      .addEventListener("click", () => this.resetCanvas("processCanvas4"));

    // Geometry controls
    document
      .getElementById("rotate90")
      .addEventListener("click", () => this.applyRotation(90));
    document
      .getElementById("rotate180")
      .addEventListener("click", () => this.applyRotation(180));
    document
      .getElementById("rotate270")
      .addEventListener("click", () => this.applyRotation(270));
    document
      .getElementById("flipHorizontal")
      .addEventListener("click", () => this.applyFlip("horizontal"));
    document
      .getElementById("flipVertical")
      .addEventListener("click", () => this.applyFlip("vertical"));
    document
      .getElementById("resetImage5")
      .addEventListener("click", () => this.resetCanvas("processCanvas5"));

    // Tab change listener untuk auto-apply grayscale
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.handleTabChange(e.target.dataset.tab)
      );
    });
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.currentImage = img;
        this.drawImage(img);
        this.readPixels();
        this.processor = new ImageProcessor(this.canvas);

        // Show tab section
        this.tabSection.classList.remove("hidden");

        // Reset all process canvases
        this.resetAllCanvases();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  drawImage(img) {
    // Set canvas size to match image
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    // Draw image on canvas
    this.ctx.drawImage(img, 0, 0);

    // Show preview
    this.imagePreview.classList.remove("hidden");
    this.imageSize.textContent = `Ukuran: ${img.width} x ${
      img.height
    } pixel (Total: ${img.width * img.height} pixel)`;
  }

  readPixels() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    this.pixelDataArray = [];

    // Read all pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        this.pixelDataArray.push({
          x,
          y,
          r,
          g,
          b,
          a,
        });
      }
    }

    console.log(`Total pixel yang dibaca: ${this.pixelDataArray.length}`);
    this.updatePixelDisplay();
  }

  updatePixelDisplay() {
    // Tampilkan tabel 100x100 pixel
    this.displayPixelTable(500, 500);
  }

  displayPixelTable(tableWidth, tableHeight) {
    // Ambil pixel 500x500 dari kiri atas
    const width = Math.min(tableWidth, this.canvas.width);
    const height = Math.min(tableHeight, this.canvas.height);
    if (width === 0 || height === 0) {
      this.pixelList.innerHTML =
        '<div class="loading">Gambar belum diunggah atau terlalu kecil.</div>';
      return;
    }

    // Create search box for main pixel data
    let html = `
      <div class="matrix-search-container">
        <label for="search-pixelList">🔍 Cari Koordinat:</label>
        <input type="number" id="search-x-pixelList" placeholder="X" min="0" max="${
          this.canvas.width - 1
        }" class="coord-input" />
        <input type="number" id="search-y-pixelList" placeholder="Y" min="0" max="${
          this.canvas.height - 1
        }" class="coord-input" />
        <button class="search-button" onclick="app.searchCoordinate('pixelList', ${
          this.canvas.width
        }, ${this.canvas.height})">Cari</button>
        <span id="search-result-pixelList" class="search-result"></span>
      </div>
    `;

    html +=
      '<div class="table-wrapper"><table class="pixel-table" id="table-pixelList">';
    html += "<thead><tr><th></th>";
    for (let x = 0; x < width; x++) {
      html += `<th>${x}</th>`;
    }
    html += "</tr></thead>";
    html += "<tbody>";
    for (let y = 0; y < height; y++) {
      html += `<tr><th>${y}</th>`;
      for (let x = 0; x < width; x++) {
        const idx = y * this.canvas.width + x;
        const pixel = this.pixelDataArray[idx];
        if (pixel) {
          const brightness =
            0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
          const isLight = brightness > 180;
          const lightClass = isLight ? " light-bg" : "";
          html += `<td class="${lightClass}" data-x="${x}" data-y="${y}" style="background:rgb(${pixel.r},${pixel.g},${pixel.b});font-size:7px;" title="x(${x}),y(${y}) RGB(${pixel.r},${pixel.g},${pixel.b})">${pixel.r},${pixel.g},${pixel.b}</td>`;
        } else {
          html += "<td></td>";
        }
      }
      html += "</tr>";
    }
    html += "</tbody></table></div>";
    this.pixelList.innerHTML = html;
  }

  // Display matrix untuk processing canvases
  displayMatrix(canvas, targetElementId, maxSize = 100) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement || !canvas || canvas.width === 0) {
      if (targetElement) {
        targetElement.innerHTML =
          '<div class="loading">Tidak ada data untuk ditampilkan</div>';
      }
      return;
    }

    const width = Math.min(maxSize, canvas.width);
    const height = Math.min(maxSize, canvas.height);

    // Get image data from canvas
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create search box
    let html = `
      <div class="matrix-search-container">
        <label for="search-${targetElementId}">🔍 Cari Koordinat:</label>
        <input type="number" id="search-x-${targetElementId}" placeholder="X" min="0" max="${
      canvas.width - 1
    }" class="coord-input" />
        <input type="number" id="search-y-${targetElementId}" placeholder="Y" min="0" max="${
      canvas.height - 1
    }" class="coord-input" />
        <button class="search-button" onclick="app.searchCoordinate('${targetElementId}', ${
      canvas.width
    }, ${canvas.height})">Cari</button>
        <span id="search-result-${targetElementId}" class="search-result"></span>
      </div>
    `;

    html +=
      '<div class="table-wrapper"><table class="pixel-table" id="table-' +
      targetElementId +
      '">';
    html += "<thead><tr><th></th>";
    for (let x = 0; x < width; x++) {
      html += `<th>${x}</th>`;
    }
    html += "</tr></thead>";
    html += "<tbody>";

    for (let y = 0; y < height; y++) {
      html += `<tr><th>${y}</th>`;
      for (let x = 0; x < width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        const isLight = brightness > 180;
        const lightClass = isLight ? " light-bg" : "";

        html += `<td class="${lightClass}" data-x="${x}" data-y="${y}" style="background:rgb(${r},${g},${b});font-size:7px;" title="x(${x}),y(${y}) RGB(${r},${g},${b})">${r},${g},${b}</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table></div>";
    targetElement.innerHTML = html;

    // Store canvas reference for search
    targetElement.dataset.canvasId = canvas.id;
  }

  handleCanvasHover(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);

    const pixel = this.pixelDataArray.find((p) => p.x === x && p.y === y);

    if (pixel) {
      this.showHoverInfo(event, pixel);
    }
  }

  showHoverInfo(event, pixel) {
    const hoverCoord = document.getElementById("hoverCoord");
    const hoverRGB = document.getElementById("hoverRGB");
    const hoverColor = document.getElementById("hoverColor");

    hoverCoord.textContent = `x(${pixel.x}), y(${pixel.y})`;
    hoverRGB.textContent = `R:${pixel.r}, G:${pixel.g}, B:${pixel.b}`;
    hoverColor.style.backgroundColor = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;

    this.hoverInfo.style.left = event.pageX + 20 + "px";
    this.hoverInfo.style.top = event.pageY - 50 + "px";
    this.hoverInfo.classList.remove("hidden");
  }

  hideHoverInfo() {
    this.hoverInfo.classList.add("hidden");
  }

  // Search coordinate in matrix
  searchCoordinate(targetElementId, canvasWidth, canvasHeight) {
    const xInput = document.getElementById(`search-x-${targetElementId}`);
    const yInput = document.getElementById(`search-y-${targetElementId}`);
    const resultSpan = document.getElementById(
      `search-result-${targetElementId}`
    );
    const table = document.getElementById(`table-${targetElementId}`);

    if (!xInput || !yInput || !resultSpan || !table) {
      console.error("Search elements not found");
      return;
    }

    const x = parseInt(xInput.value);
    const y = parseInt(yInput.value);

    // Validation
    if (isNaN(x) || isNaN(y)) {
      resultSpan.textContent = "⚠️ Masukkan koordinat X dan Y";
      resultSpan.className = "search-result error";
      return;
    }

    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) {
      resultSpan.textContent = `⚠️ Koordinat di luar range (0-${
        canvasWidth - 1
      }, 0-${canvasHeight - 1})`;
      resultSpan.className = "search-result error";
      return;
    }

    // Remove previous highlights
    const previousHighlight = table.querySelector(".highlight-cell");
    if (previousHighlight) {
      previousHighlight.classList.remove("highlight-cell");
    }

    // Find and highlight the cell
    const cell = table.querySelector(`td[data-x="${x}"][data-y="${y}"]`);

    if (cell) {
      cell.classList.add("highlight-cell");

      // Get RGB values from title attribute
      const title = cell.getAttribute("title");
      const rgbMatch = title.match(/RGB\((\d+),(\d+),(\d+)\)/);

      if (rgbMatch) {
        const r = rgbMatch[1];
        const g = rgbMatch[2];
        const b = rgbMatch[3];
        resultSpan.innerHTML = `✅ Ditemukan! RGB(${r}, ${g}, ${b})`;
        resultSpan.className = "search-result success";
      } else {
        resultSpan.textContent = "✅ Koordinat ditemukan";
        resultSpan.className = "search-result success";
      }

      // Scroll to cell
      cell.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    } else {
      resultSpan.textContent = `⚠️ Koordinat (${x}, ${y}) tidak terlihat di matrix 100x100`;
      resultSpan.className = "search-result warning";
    }
  }

  // Handle tab change - auto apply untuk grayscale
  handleTabChange(tabId) {
    if (tabId === "grayscale" && this.processor) {
      // Auto-apply grayscale saat tab dibuka
      setTimeout(() => this.applyGrayscale(), 100);
    } else if (tabId === "binary" && this.processor) {
      // Auto-apply binary saat tab dibuka
      setTimeout(() => this.applyBinaryRealtime(), 100);
    } else if (tabId === "brightness" && this.processor) {
      // Reset brightness slider to 0 when entering tab
      const slider = document.getElementById("brightnessSlider");
      if (slider.value !== "0") {
        slider.value = 0;
        document.getElementById("brightnessValue").textContent = "0";
      }
      setTimeout(() => this.applyBrightnessRealtime(), 100);
    }
  }

  // === Binary & Grayscale Features ===
  applyGrayscale() {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }
    const canvas = document.getElementById("processCanvasGrayscale");
    const imageData = this.processor.toGrayscale();
    this.processor.drawToCanvas(imageData, canvas);

    // Display matrix
    this.displayMatrix(canvas, "matrixListGrayscale");
  }

  applyBinaryRealtime() {
    if (!this.processor) return;

    const threshold = parseInt(
      document.getElementById("thresholdSlider").value
    );
    const canvas = document.getElementById("processCanvasBinary");
    const imageData = this.processor.toBinary(threshold);
    this.processor.drawToCanvas(imageData, canvas);

    // Display matrix
    this.displayMatrix(canvas, "matrixListBinary");
  }

  // === Brightness Feature ===
  applyBrightnessRealtime() {
    if (!this.processor) return;

    const value = parseInt(document.getElementById("brightnessSlider").value);
    const canvas = document.getElementById("processCanvas2");
    const imageData = this.processor.adjustBrightness(value);
    this.processor.drawToCanvas(imageData, canvas);

    // Display matrix
    this.displayMatrix(canvas, "matrixList2");
  }

  // === Arithmetic Features ===
  toggleArithmeticMode(event) {
    const mode = event.target.value;
    const constantGroup = document.getElementById("constantGroup");
    const imageGroup = document.getElementById("imageGroup");

    if (mode === "constant") {
      constantGroup.style.display = "block";
      imageGroup.style.display = "none";
    } else {
      constantGroup.style.display = "none";
      imageGroup.style.display = "block";
    }
  }

  // Helper function untuk resize image agar sama dengan target size
  resizeImageData(imageData, targetWidth, targetHeight) {
    // Buat temporary canvas untuk original image
    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = imageData.width;
    srcCanvas.height = imageData.height;
    const srcCtx = srcCanvas.getContext("2d");
    srcCtx.putImageData(imageData, 0, 0);

    // Buat canvas untuk hasil resize
    const dstCanvas = document.createElement("canvas");
    dstCanvas.width = targetWidth;
    dstCanvas.height = targetHeight;
    const dstCtx = dstCanvas.getContext("2d");

    // Resize dengan drawImage (automatic interpolation)
    dstCtx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight);

    // Return resized ImageData
    return dstCtx.getImageData(0, 0, targetWidth, targetHeight);
  }

  handleSecondImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusText = document.getElementById("arithmeticImageStatus");

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        this.secondImage = ctx.getImageData(0, 0, img.width, img.height);

        // Update status
        if (statusText) {
          if (
            this.currentImage &&
            (img.width !== this.currentImage.width ||
              img.height !== this.currentImage.height)
          ) {
            statusText.textContent = `✅ ${img.width}x${img.height} (akan di-resize ke ${this.currentImage.width}x${this.currentImage.height})`;
            statusText.className = "status-text warning";
          } else {
            statusText.textContent = `✅ ${img.width}x${img.height}`;
            statusText.className = "status-text success";
          }
        }

        console.log(
          `✅ Gambar kedua untuk Arithmetic berhasil di-upload: ${img.width}x${img.height}`
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  applyArithmeticOperation() {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const operation = document.getElementById("arithmeticOp").value;
    const mode = document.getElementById("arithmeticMode").value;
    const canvas = document.getElementById("processCanvas3");

    let imageData;
    if (mode === "constant") {
      const constant = parseFloat(
        document.getElementById("constantValue").value
      );
      imageData = this.processor.arithmeticConstant(operation, constant);
    } else {
      if (!this.secondImage) {
        alert("Upload gambar kedua terlebih dahulu!");
        return;
      }

      // Auto-resize gambar kedua jika ukurannya berbeda
      let processedSecondImage = this.secondImage;
      if (
        this.currentImage &&
        (this.secondImage.width !== this.currentImage.width ||
          this.secondImage.height !== this.currentImage.height)
      ) {
        console.log(
          `🔄 Resize gambar kedua dari ${this.secondImage.width}x${this.secondImage.height} ke ${this.currentImage.width}x${this.currentImage.height}`
        );
        processedSecondImage = this.resizeImageData(
          this.secondImage,
          this.currentImage.width,
          this.currentImage.height
        );
      }

      imageData = this.processor.arithmeticImage(
        operation,
        processedSecondImage
      );
    }

    this.processor.drawToCanvas(imageData, canvas);

    // Display matrix
    this.displayMatrix(canvas, "matrixList3");
  }

  // === Boolean Features ===
  handleBooleanImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusText = document.getElementById("image2Status");
    const statusPreview = document.getElementById("image2StatusPreview");

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Draw ke canvas preview
        const canvas1 = document.getElementById("booleanCanvas1");
        const canvas2 = document.getElementById("booleanCanvas2");

        // Draw original ke canvas1 (jika belum ada)
        if (this.currentImage && canvas1.width === 0) {
          canvas1.width = this.currentImage.width;
          canvas1.height = this.currentImage.height;
          const ctx1 = canvas1.getContext("2d");
          ctx1.drawImage(this.currentImage, 0, 0);
        }

        // Draw second image ke canvas2
        canvas2.width = img.width;
        canvas2.height = img.height;
        const ctx2 = canvas2.getContext("2d");
        ctx2.drawImage(img, 0, 0);

        // Simpan image data untuk operasi boolean
        this.booleanSecondImage = ctx2.getImageData(
          0,
          0,
          img.width,
          img.height
        );

        // Update status text
        const sizeText = `${img.width}x${img.height}`;
        const needsResize =
          this.currentImage &&
          (img.width !== this.currentImage.width ||
            img.height !== this.currentImage.height);

        if (statusText) {
          if (needsResize) {
            statusText.textContent = `✅ ${sizeText} (akan di-resize ke ${this.currentImage.width}x${this.currentImage.height})`;
            statusText.className = "status-text warning";
          } else {
            statusText.textContent = `✅ ${sizeText}`;
            statusText.className = "status-text success";
          }
        }

        if (statusPreview) {
          statusPreview.textContent = needsResize
            ? `⚠️ Gambar akan di-resize`
            : `✅ Ukuran sama`;
          statusPreview.className = needsResize
            ? "status-text warning"
            : "status-text success";
        }

        console.log(
          `✅ Gambar kedua untuk Boolean berhasil di-upload: ${sizeText}`
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  applyBooleanOperation() {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }
    if (!this.booleanSecondImage) {
      alert("Upload gambar kedua terlebih dahulu!");
      return;
    }

    // Auto-resize gambar kedua jika ukurannya berbeda
    let processedSecondImage = this.booleanSecondImage;
    if (
      this.currentImage &&
      (this.booleanSecondImage.width !== this.currentImage.width ||
        this.booleanSecondImage.height !== this.currentImage.height)
    ) {
      console.log(
        `🔄 Resize gambar kedua dari ${this.booleanSecondImage.width}x${this.booleanSecondImage.height} ke ${this.currentImage.width}x${this.currentImage.height}`
      );
      processedSecondImage = this.resizeImageData(
        this.booleanSecondImage,
        this.currentImage.width,
        this.currentImage.height
      );
    }

    const operation = document.getElementById("booleanOp").value;
    const canvas = document.getElementById("processCanvas4");
    const imageData = this.processor.booleanOperation(
      operation,
      processedSecondImage
    );
    this.processor.drawToCanvas(imageData, canvas);

    // Display matrix
    this.displayMatrix(canvas, "matrixList4");
  }

  // === Geometry Features ===
  applyRotation(degrees) {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const canvas = document.getElementById("processCanvas5");
    let imageData;

    switch (degrees) {
      case 90:
        imageData = this.processor.rotate90();
        break;
      case 180:
        imageData = this.processor.rotate180();
        break;
      case 270:
        imageData = this.processor.rotate270();
        break;
    }

    this.processor.drawToCanvas(imageData, canvas);

    // Update processor dengan canvas baru untuk rotasi berturut-turut
    this.processor = new ImageProcessor(canvas);

    // Display matrix
    this.displayMatrix(canvas, "matrixList5");
  }

  applyFlip(direction) {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const canvas = document.getElementById("processCanvas5");
    let imageData;

    if (direction === "horizontal") {
      imageData = this.processor.flipHorizontal();
    } else {
      imageData = this.processor.flipVertical();
    }

    this.processor.drawToCanvas(imageData, canvas);

    // Update processor
    this.processor = new ImageProcessor(canvas);

    // Display matrix
    this.displayMatrix(canvas, "matrixList5");
  }

  // === Helper Methods ===
  resetCanvas(canvasId) {
    if (!this.currentImage) return;

    const canvas = document.getElementById(canvasId);
    canvas.width = this.currentImage.width;
    canvas.height = this.currentImage.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.currentImage, 0, 0);

    // Reset processor ke original image
    this.processor = new ImageProcessor(this.canvas);

    // Update matrix display based on canvas
    const matrixMap = {
      processCanvasGrayscale: "matrixListGrayscale",
      processCanvasBinary: "matrixListBinary",
      processCanvas2: "matrixList2",
      processCanvas3: "matrixList3",
      processCanvas4: "matrixList4",
      processCanvas5: "matrixList5",
    };

    const matrixId = matrixMap[canvasId];
    if (matrixId) {
      this.displayMatrix(canvas, matrixId);
    }
  }

  resetAllCanvases() {
    if (!this.currentImage) return;

    const canvases = [
      "processCanvasGrayscale",
      "processCanvasBinary",
      "processCanvas2",
      "processCanvas3",
      "processCanvas4",
      "processCanvas5",
    ];
    const matrixIds = [
      "matrixListGrayscale",
      "matrixListBinary",
      "matrixList2",
      "matrixList3",
      "matrixList4",
      "matrixList5",
    ];

    canvases.forEach((id, index) => {
      const canvas = document.getElementById(id);
      canvas.width = this.currentImage.width;
      canvas.height = this.currentImage.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(this.currentImage, 0, 0);

      // Display initial matrix
      this.displayMatrix(canvas, matrixIds[index]);
    });

    // Reset boolean preview canvas 1 (untuk menampilkan original image)
    const canvas1 = document.getElementById("booleanCanvas1");
    canvas1.width = this.currentImage.width;
    canvas1.height = this.currentImage.height;
    const ctx1 = canvas1.getContext("2d");
    ctx1.drawImage(this.currentImage, 0, 0);

    // Clear boolean canvas 2 (akan diisi saat user upload image kedua)
    const canvas2 = document.getElementById("booleanCanvas2");
    canvas2.width = 0;
    canvas2.height = 0;

    // Reset second image data
    this.booleanSecondImage = null;
    this.secondImage = null;
  }
}

// Initialize the app
new TabManager();
const app = new PixelReader();

// Make app globally accessible for onclick handlers
window.app = app;

console.log("🎨 Image Processing App initialized!");
console.log(
  "Features: Pixel Data, Binary/Grayscale, Brightness, Arithmetic, Boolean, Geometry"
);
