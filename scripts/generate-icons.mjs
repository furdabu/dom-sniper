// 拡張機能のアイコン (照準マーク) を public/icon/ に生成する。依存なしで PNG を書き出す。
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const SIZES = [16, 32, 48, 128];
// Chrome Web Store の指定: 128px は絵柄を 96px に収め、周囲 16px を透明にする
const PADDING = { 128: 16 };
const OUT_DIR = new URL('../public/icon/', import.meta.url);
const BACKGROUND = [24, 24, 27];
const FOREGROUND = [244, 63, 94];
const SAMPLES = 4;

/** 0〜1 の座標での色。角丸の外側は null (透明) */
function colorAt(x, y) {
  const radius = 0.22;
  const qx = Math.abs(x - 0.5) - (0.5 - radius);
  const qy = Math.abs(y - 0.5) - (0.5 - radius);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0);
  if (outside > radius) return null;

  const dx = Math.abs(x - 0.5);
  const dy = Math.abs(y - 0.5);
  const distance = Math.hypot(dx, dy);
  const ring = Math.abs(distance - 0.25) <= 0.045;
  const dot = distance <= 0.07;
  const tick = (a, b) => a <= 0.045 && b >= 0.17 && b <= 0.4;
  return ring || dot || tick(dx, dy) || tick(dy, dx) ? FOREGROUND : BACKGROUND;
}

function render(size) {
  const padding = PADDING[size] ?? 0;
  const inner = size - padding * 2;
  const pixels = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, covered = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const x = (px - padding + (sx + 0.5) / SAMPLES) / inner;
          const y = (py - padding + (sy + 0.5) / SAMPLES) / inner;
          const color = x < 0 || x > 1 || y < 0 || y > 1 ? null : colorAt(x, y);
          if (!color) continue;
          r += color[0];
          g += color[1];
          b += color[2];
          covered++;
        }
      }
      const offset = (py * size + px) * 4;
      if (covered) pixels.set([r / covered, g / covered, b / covered], offset);
      pixels[offset + 3] = Math.round((covered / SAMPLES ** 2) * 255);
    }
  }
  return pixels;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8bit RGBA

  // 各行の先頭にフィルター種別 (0 = なし) を付ける
  const rows = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    pixels.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of SIZES) {
  writeFileSync(new URL(`${size}.png`, OUT_DIR), encodePng(size, render(size)));
}
console.log(`public/icon/ に ${SIZES.join(', ')}px のアイコンを生成しました`);
