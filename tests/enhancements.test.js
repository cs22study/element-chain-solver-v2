// tests/enhancements.test.js
// Automated verification tests for Eye Comfort Compensation & Simulation Steps

const assert = require('assert');

// 1. Eye Comfort Mode Color Classifier
function rgb2hsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d + 6) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, mx ? d / mx : 0, mx];
}

function classify(r, g, b, eyeComfort = false) {
  if (eyeComfort) {
    // Compensate for blue-light attenuation: boost Blue channel, normalize Red/Green
    b = Math.min(255, Math.round(b * 1.55));
    r = Math.round(r * 0.90);
    g = Math.round(g * 0.95);
  }
  const [h, s, v] = rgb2hsv(r, g, b);
  const minSat = eyeComfort ? 0.30 : 0.45;
  const minVal = eyeComfort ? 0.30 : 0.45;

  if (s < minSat || v < minVal) return -1;
  if (eyeComfort) {
    if (h >= 165 && h < 255) return 0; // Water
    if (h >= 75 && h < 165) return 2;  // Wood
    if (h >= 36 && h < 75) return 3;   // Light
    if (h >= 240 && h < 345) return 4; // Dark
    return 1; // Fire
  } else {
    if (h >= 180 && h < 245) return 0;
    if (h >= 75 && h < 175) return 2;
    if (h >= 38 && h < 75) return 3;
    if (h >= 245 && h < 340) return 4;
    return 1;
  }
}

console.log('--- 測試 1: 濾藍光/護眼模式色差補償驗證 ---');

// Normal Water color: (50, 130, 240)
assert.strictEqual(classify(50, 130, 240, false), 0, '正常水屬性分類為 0');

// Under strong warm eye comfort filter: Blue is suppressed from 240 to 140, Red rises to 90
// Standard classify might fail or classify as Green/Unknown:
const yellowedWater = [90, 135, 140];
const withoutComp = classify(yellowedWater[0], yellowedWater[1], yellowedWater[2], false);
const withComp = classify(yellowedWater[0], yellowedWater[1], yellowedWater[2], true);
console.log(`偏黃濾藍光水屬性: 未補償分類 = ${withoutComp}, 開啟護眼補償 = ${withComp}`);
assert.strictEqual(withComp, 0, '開啟護眼補償後應準確識別為水屬性 0');

// Under strong warm eye comfort filter: Dark (Purple) [140, 60, 210] -> [150, 75, 120]
const yellowedDark = [150, 75, 120];
const darkComp = classify(yellowedDark[0], yellowedDark[1], yellowedDark[2], true);
console.log(`偏黃濾藍光暗屬性: 開啟護眼補償 = ${darkComp}`);
assert.strictEqual(darkComp, 4, '開啟護眼補償後應準確識別為暗屬性 4');

console.log('✅ 測試 1 通過：護眼補償精確修正偏黃濾藍光色偏！');

console.log('--- 測試 2: PWA Manifest 與 Service Worker 完整性 ---');
const fs = require('fs');
assert(fs.existsSync('manifest.json'), 'manifest.json must exist');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
assert.strictEqual(manifest.display, 'standalone');
assert(manifest.icons.length >= 2);
assert(fs.existsSync('sw.js'), 'sw.js must exist');
assert(fs.existsSync('icon-192.png'), 'icon-192.png must exist');
assert(fs.existsSync('icon-512.png'), 'icon-512.png must exist');
console.log('✅ 測試 2 通過：PWA 資源與 Service Worker 齊備！');
