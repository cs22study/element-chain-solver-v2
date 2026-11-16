// scripts/generate_icons.js
// Generate PNG icons (192x192 and 512x512) for PWA without external dependencies

const fs = require('fs');
const zlib = require('zlib');

function createPng(size, filename) {
  const width = size;
  const height = size;

  // Raw RGBA buffer
  // Each scanline starts with filter byte 0
  const rowStride = 1 + width * 4;
  const rawBuffer = Buffer.alloc(height * rowStride);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  // 5 element colors: Water, Fire, Wood, Light, Dark
  const colors = [
    [59, 130, 246],  // Water #3b82f6
    [229, 57, 53],   // Fire  #e53935
    [34, 197, 94],   // Wood  #22c55e
    [234, 179, 8],   // Light #eab308
    [168, 85, 247]   // Dark  #a855f7
  ];

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawBuffer[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background rounded circle
      if (dist > radius) {
        // Outside circular badge: transparent or dark edge
        if (dist <= radius + 2) {
          rawBuffer[pxOffset] = 30;
          rawBuffer[pxOffset + 1] = 33;
          rawBuffer[pxOffset + 2] = 48;
          rawBuffer[pxOffset + 3] = 120;
        } else {
          rawBuffer[pxOffset] = 0;
          rawBuffer[pxOffset + 1] = 0;
          rawBuffer[pxOffset + 2] = 0;
          rawBuffer[pxOffset + 3] = 0;
        }
        continue;
      }

      // Base badge background #1e2130
      let r = 30, g = 33, b = 48, a = 255;

      // Golden border ring at outer edge
      if (dist >= radius - (size * 0.04)) {
        r = 245; g = 196; b = 81;
      } else {
        // 5 circular element orbs around center
        let inOrb = false;
        const orbRadius = size * 0.13;
        const orbitRadius = size * 0.23;

        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
          const ox = cx + orbitRadius * Math.cos(angle);
          const oy = cy + orbitRadius * Math.sin(angle);
          const odist = Math.sqrt((x - ox) * (x - ox) + (y - oy) * (y - oy));

          if (odist < orbRadius) {
            const col = colors[i];
            const shade = 1 - (odist / orbRadius) * 0.4;
            r = Math.min(255, Math.round(col[0] * shade));
            g = Math.min(255, Math.round(col[1] * shade));
            b = Math.min(255, Math.round(col[2] * shade));
            inOrb = true;
            break;
          } else if (odist <= orbRadius + 2) {
            r = 255; g = 255; b = 255;
            inOrb = true;
            break;
          }
        }

        // Center link star #ffd21f
        if (!inOrb && dist < size * 0.08) {
          r = 255; g = 210; b = 31;
        }
      }

      rawBuffer[pxOffset] = r;
      rawBuffer[pxOffset + 1] = g;
      rawBuffer[pxOffset + 2] = b;
      rawBuffer[pxOffset + 3] = a;
    }
  }

  // Deflate compressed data
  const compressed = zlib.deflateSync(rawBuffer);

  // PNG builder
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcPayload = Buffer.concat([typeBuf, data]);

    const crc = crc32(crcPayload);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = chunk('IHDR', ihdrData);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  const pngFile = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(filename, pngFile);
  console.log(`Generated ${filename} (${width}x${height}, ${pngFile.length} bytes)`);
}

// CRC32 table & calculator
let crcTable = null;
function getCrcTable() {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  return crcTable;
}

function crc32(buf) {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

createPng(192, 'icon-192.png');
createPng(512, 'icon-512.png');
