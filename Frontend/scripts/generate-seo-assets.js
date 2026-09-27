import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Pure Node.js PNG file builder using zlib.deflateSync
 */
function createPngBuffer(width, height, drawPixelFn) {
  // Each scanline begins with a filter byte (0 = None) followed by width * 4 bytes (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress with zlib
  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcData);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

/**
 * Draw Brand Icon (Violet-Pink Gradient Rounded Speech Bubble)
 */
function drawBrandIcon(x, y, w, h) {
  // Normalize coords [0, 1]
  const nx = x / w;
  const ny = y / h;

  // Outer circle / bubble math
  const cx = 0.5;
  const cy = 0.48;
  const r = 0.40;

  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Tail triangle check
  const inTail = (nx >= 0.16 && nx <= 0.36 && ny >= 0.65 && ny <= 0.88 && (nx * 1.5 - ny) < 0.1);

  // Linear gradient color (Indigo #6366f1 -> Violet #8b5cf6 -> Pink #ec4899)
  const t = (nx + ny) / 2;
  let red, green, blue;
  if (t < 0.5) {
    const factor = t / 0.5;
    red = Math.round(99 + (139 - 99) * factor);
    green = Math.round(102 + (92 - 102) * factor);
    blue = Math.round(241 + (246 - 241) * factor);
  } else {
    const factor = (t - 0.5) / 0.5;
    red = Math.round(139 + (236 - 139) * factor);
    green = Math.round(92 + (72 - 92) * factor);
    blue = Math.round(246 + (153 - 246) * factor);
  }

  // Inside bubble or tail
  if (dist <= r || inTail) {
    // Inner speech dots for larger icons (3 dots)
    const isDot1 = (Math.hypot(nx - 0.38, ny - 0.48) < 0.045);
    const isDot2 = (Math.hypot(nx - 0.50, ny - 0.48) < 0.045);
    const isDot3 = (Math.hypot(nx - 0.62, ny - 0.48) < 0.045);

    if (w >= 32 && (isDot1 || isDot2 || isDot3)) {
      return [255, 255, 255, 255]; // White inner dot
    }

    // Antialiasing border edge
    let alpha = 255;
    if (dist > r - 0.02 && !inTail) {
      alpha = Math.round(255 * (1 - (dist - (r - 0.02)) / 0.02));
    }
    return [red, green, blue, Math.max(0, Math.min(255, alpha))];
  }

  return [0, 0, 0, 0]; // Transparent outside
}

/**
 * Draw OpenGraph 1200x630 Banner
 */
function drawOgBanner(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Background deep dark slate with ambient glow
  const dGlow1 = Math.hypot(nx - 0.2, ny - 0.3);
  const dGlow2 = Math.hypot(nx - 0.8, ny - 0.7);

  let bgR = 15;
  let bgG = 23;
  let bgB = 42;

  // Add indigo/violet ambient light
  if (dGlow1 < 0.5) {
    const f = (0.5 - dGlow1) / 0.5;
    bgR += Math.round(60 * f);
    bgG += Math.round(40 * f);
    bgB += Math.round(140 * f);
  }
  if (dGlow2 < 0.5) {
    const f = (0.5 - dGlow2) / 0.5;
    bgR += Math.round(120 * f);
    bgG += Math.round(20 * f);
    bgB += Math.round(90 * f);
  }

  // Centered Glass card
  const cardX1 = 0.10;
  const cardX2 = 0.90;
  const cardY1 = 0.12;
  const cardY2 = 0.88;

  if (nx >= cardX1 && nx <= cardX2 && ny >= cardY1 && ny <= cardY2) {
    // Glass card body
    bgR = Math.round(bgR * 0.4 + 30 * 0.6);
    bgG = Math.round(bgG * 0.4 + 41 * 0.6);
    bgB = Math.round(bgB * 0.4 + 59 * 0.6);

    // Border highlight
    if (nx - cardX1 < 0.003 || cardX2 - nx < 0.003 || ny - cardY1 < 0.005 || cardY2 - ny < 0.005) {
      bgR = Math.min(255, bgR + 100);
      bgG = Math.min(255, bgG + 100);
      bgB = Math.min(255, bgB + 160);
    }
  }

  // Draw Logo in left area of card
  const logoX = 0.18;
  const logoY = 0.32;
  const logoSize = 0.14;

  if (nx >= logoX && nx <= logoX + logoSize && ny >= logoY && ny <= logoY + logoSize * (w / h)) {
    const lx = (nx - logoX) / logoSize;
    const ly = (ny - logoY) / (logoSize * (w / h));
    const [lr, lg, lb, la] = drawBrandIcon(lx * 100, ly * 100, 100, 100);
    if (la > 0) {
      const alphaNorm = la / 255;
      bgR = Math.round(bgR * (1 - alphaNorm) + lr * alphaNorm);
      bgG = Math.round(bgG * (1 - alphaNorm) + lg * alphaNorm);
      bgB = Math.round(bgB * (1 - alphaNorm) + lb * alphaNorm);
    }
  }

  return [Math.min(255, bgR), Math.min(255, bgG), Math.min(255, bgB), 255];
}

/**
 * ICO generator wrapping 16x16 and 32x32 PNGs
 */
function createIcoBuffer(png16, png32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(2, 4); // 2 images

  const dir16 = Buffer.alloc(16);
  dir16[0] = 16; // Width
  dir16[1] = 16; // Height
  dir16[2] = 0;  // Colors
  dir16[3] = 0;  // Reserved
  dir16.writeUInt16LE(1, 4);  // Color planes
  dir16.writeUInt16LE(32, 6); // Bit depth
  dir16.writeUInt32LE(png16.length, 8); // Size
  dir16.writeUInt32LE(6 + 32, 12);     // Offset

  const dir32 = Buffer.alloc(16);
  dir32[0] = 32;
  dir32[1] = 32;
  dir32[2] = 0;
  dir32[3] = 0;
  dir32.writeUInt16LE(1, 4);
  dir32.writeUInt16LE(32, 6);
  dir32.writeUInt32LE(png32.length, 8);
  dir32.writeUInt32LE(6 + 32 + png16.length, 12);

  return Buffer.concat([header, dir16, dir32, png16, png32]);
}

// Generate all assets and save to Frontend/public
const publicDir = path.resolve('Frontend/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating SEO and Favicon assets...');

// 1. Favicons
const png16 = createPngBuffer(16, 16, drawBrandIcon);
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);

const png32 = createPngBuffer(32, 32, drawBrandIcon);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);

const png180 = createPngBuffer(180, 180, drawBrandIcon);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);

const png192 = createPngBuffer(192, 192, drawBrandIcon);
fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), png192);

const png512 = createPngBuffer(512, 512, drawBrandIcon);
fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), png512);

const ico = createIcoBuffer(png16, png32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);

// 2. OpenGraph 1200x630 PNG Thumbnail
const ogPng = createPngBuffer(1200, 630, drawOgBanner);
fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogPng);
fs.writeFileSync(path.join(publicDir, 'twitter-image.png'), ogPng);

console.log('✅ All favicon and OpenGraph PNG assets generated successfully!');
