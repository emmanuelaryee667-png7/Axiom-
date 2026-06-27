import * as fs from "fs";
import * as path from "path";
import * as JimpModule from "jimp";

// Handle ESM/CommonJS difference across Jimp versions
let Jimp: any = (JimpModule as any).Jimp || JimpModule;
if (typeof Jimp !== "function" && (Jimp as any).default) {
  Jimp = (Jimp as any).default;
}

const PUBLIC_DIR = path.join(process.cwd(), "public");

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Function to test if point is inside triangle
function isInsideTriangle(px: number, py: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): boolean {
  const d1 = (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
  const d2 = (px - x3) * (y2 - y3) - (x2 - x3) * (py - y3);
  const d3 = (px - x1) * (y3 - y1) - (x3 - x1) * (py - y1);

  const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

  return !(has_neg && has_pos);
}

async function renderIcon(size: number, filename: string, isMaskable: boolean) {
  const bgBlue = 0x2563ebff;
  let img: any;
  try {
    img = new Jimp({ width: size, height: size, color: bgBlue });
  } catch (e) {
    img = new Jimp(size, size, bgBlue);
  }

  // Scaling factor relative to 512px
  const scale = size / 512;

  // Let's scale visual elements depending on standard vs maskable
  let tx1 = 256, ty1 = 110;
  let tx2 = 130, ty2 = 330;
  let tx3 = 382, ty3 = 330;

  let eqXMin = 300, eqXMax = 380;
  let eqY1Min = 355, eqY1Max = 367;
  let eqY2Min = 379, eqY2Max = 391;

  if (isMaskable) {
    // Maskable icons are padded/scaled down to fit in the 60% safe circle
    tx1 = 256; ty1 = 150;
    tx2 = 160; ty2 = 310;
    tx3 = 352; ty3 = 310;

    eqXMin = 290; eqXMax = 350;
    eqY1Min = 330; eqY1Max = 340;
    eqY2Min = 350; eqY2Max = 360;
  }

  // Render pixels with scaled coordinates
  const colorEquals = 0x10b981ff;
  const colorWhite = 0xffffffff;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const rx = x / scale;
      const ry = y / scale;

      const isEqualsBar1 = (rx >= eqXMin && rx <= eqXMax && ry >= eqY1Min && ry <= eqY1Max);
      const isEqualsBar2 = (rx >= eqXMin && rx <= eqXMax && ry >= eqY2Min && ry <= eqY2Max);

      if (isEqualsBar1 || isEqualsBar2) {
        img.setPixelColor(colorEquals, x, y);
      } else if (isInsideTriangle(rx, ry, tx1, ty1, tx2, ty2, tx3, ty3)) {
        img.setPixelColor(colorWhite, x, y);
      }
    }
  }

  const outPath = path.join(PUBLIC_DIR, filename);
  if (typeof img.write === "function") {
    await img.write(outPath);
  } else if (typeof img.writeAsync === "function") {
    await img.writeAsync(outPath);
  }
  console.log(`Successfully created icon: ${filename}`);
}

async function renderScreenshot(width: number, height: number, filename: string) {
  // Deep space / dark slate blue background: #0f172a (RGBA: 0x0f172aff)
  const bgDark = 0x0f172aff;
  let img: any;
  try {
    img = new Jimp({ width, height, color: bgDark });
  } catch (e) {
    img = new Jimp(width, height, bgDark);
  }

  const colorWhite = 0xffffffff;
  const colorGrey = 0x475569ff; // slate-600
  const colorBlue = 0x2563ebff;  // blue-600
  const colorEmerald = 0x10b981ff; // emerald-500
  const colorPurple = 0x8b5cf6ff; // purple-500

  // Draw decorative math grid lines
  for (let x = 0; x < width; x += 40) {
    for (let y = 0; y < height; y++) {
      if (y % 10 < 3) {
        img.setPixelColor(0x1e293bff, x, y); // slate-800 grid
      }
    }
  }
  for (let y = 0; y < height; y += 40) {
    for (let x = 0; x < width; x++) {
      if (x % 10 < 3) {
        img.setPixelColor(0x1e293bff, x, y);
      }
    }
  }

  // Draw simulated coordinate system with a sine wave
  const cy = Math.floor(height * 0.6); // Center Y of the graph
  const cx = Math.floor(width * 0.5);  // Center X
  
  // Draw X axis
  for (let x = 40; x < width - 40; x++) {
    img.setPixelColor(colorGrey, x, cy);
  }
  // Draw Y axis
  for (let y = 80; y < height - 80; y++) {
    img.setPixelColor(colorGrey, cx, y);
  }

  // Draw smooth math sine function in emerald green
  const amplitude = Math.min(width, height) * 0.15;
  const frequency = 0.025;
  for (let x = 50; x < width - 50; x++) {
    const rx = x - cx;
    const ry = Math.sin(rx * frequency) * amplitude;
    const py = Math.round(cy - ry);
    
    if (py >= 0 && py < height) {
      img.setPixelColor(colorEmerald, x, py);
      if (py - 1 >= 0) img.setPixelColor(colorEmerald, x, py - 1);
      if (py + 1 < height) img.setPixelColor(colorEmerald, x, py + 1);
    }
  }

  // Draw quadratic curve (parabola) in beautiful purple
  for (let x = cx - 120; x < cx + 120; x++) {
    const rx = x - cx;
    const ry = (rx * rx) * 0.005; // Parabola
    const py = Math.round(cy - ry);
    if (py >= 80 && py < height - 80) {
      img.setPixelColor(colorPurple, x, py);
      if (py - 1 >= 0) img.setPixelColor(colorPurple, x, py - 1);
      if (py + 1 < height) img.setPixelColor(colorPurple, x, py + 1);
    }
  }

  // Draw a beautiful header block card at the top
  const headerYMin = 30;
  const headerYMax = Math.min(height * 0.15, 100);
  const headerXMin = 40;
  const headerXMax = width - 40;
  
  for (let x = headerXMin; x < headerXMax; x++) {
    for (let y = headerYMin; y < headerYMax; y++) {
      const dx = x < headerXMin + 10 ? (headerXMin + 10 - x) : (x > headerXMax - 10 ? x - (headerXMax - 10) : 0);
      const dy = y < headerYMin + 10 ? (headerYMin + 10 - y) : (y > headerYMax - 10 ? y - (headerYMax - 10) : 0);
      if (dx * dx + dy * dy <= 100) {
        img.setPixelColor(colorBlue, x, y);
      } else if (dx === 0 && dy === 0) {
        img.setPixelColor(colorBlue, x, y);
      }
    }
  }

  const outPath = path.join(PUBLIC_DIR, filename);
  if (typeof img.write === "function") {
    await img.write(outPath);
  } else if (typeof img.writeAsync === "function") {
    await img.writeAsync(outPath);
  }
  console.log(`Successfully created screenshot: ${filename}`);
}

async function run() {
  console.log("Starting high-fidelity mathematical PWA asset generation...");
  
  // Render App Icons
  await renderIcon(512, "icon-512.png", false);
  await renderIcon(192, "icon-192.png", false);
  await renderIcon(512, "icon-maskable-512.png", true);
  await renderIcon(192, "icon-maskable-192.png", true);

  // Render PWA Screenshots (Desktop & Mobile)
  await renderScreenshot(1280, 720, "screenshot-desktop.png");
  await renderScreenshot(720, 1280, "screenshot-mobile.png");

  console.log("All high-fidelity PWA asset generation finished successfully!");
}

run().catch(err => {
  console.error("Asset generation failed:", err);
  process.exit(1);
});
