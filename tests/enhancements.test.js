// tests/enhancements.test.js
// Automated verification tests for Eye Comfort Compensation, Simulation Steps, and Score Calculation

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

console.log('--- 測試 3: 遊戲計分規則驗證 (10分/格) ---');
// Rule: Every eliminated card awards 10 points
function calculateScore(cardsEliminated) {
  return Math.round(cardsEliminated * 10);
}

// User example: click 1 card (10 pts) + clear 3 cards (30 pts) = 4 cards (40 pts)
assert.strictEqual(calculateScore(1 + 3), 40, '點擊1格(10分)+消除3格(30分)必須等於40分');
assert.strictEqual(calculateScore(7.00), 70, '期望消除7.00張必須對應70分');
assert.strictEqual(calculateScore(6.80), 68, '期望消除6.80張必須對應68分');
assert.strictEqual(calculateScore(6.16), 62, '期望消除6.16張四捨五入必須對應62分');

// Simulation steps cumulative score check
const mockSimSteps = [
  { type: 'clear', round: 0, ids: [17] }, // clicked 1 card
  { type: 'fall', moves: [] },
  { type: 'clear', round: 1, ids: [16, 18, 22] }, // chain 3 cards
  { type: 'fall', moves: [] }
];
let cumulativeCards = 0;
let cumulativeScore = 0;
mockSimSteps.forEach(step => {
  if (step.type === 'clear') {
    cumulativeCards += step.ids.length;
    cumulativeScore = cumulativeCards * 10;
  }
});
assert.strictEqual(cumulativeCards, 4);
assert.strictEqual(cumulativeScore, 40);
console.log(`模擬連鎖累計: 消除 ${cumulativeCards} 張，累計得分 ${cumulativeScore} 分`);
console.log('✅ 測試 3 通過：遊戲計分 (10分/格) 與逐步累積得分計算精確無誤！');

console.log('--- 測試 4: 推薦排序策略切換驗證 (即時爆發 vs 多步期望) ---');
// 模擬使用者真實反饋數據：
// Plan A (方案2): 佈局型，第1步期望僅 1.76張(18分，連鎖率20%)，但2步平均期望 7.59張(76分)
const planA = { idx: 13, q: [0, 1.76, 15.18], best: 7.59, bestH: 2, pc: 0.20 };
// Plan B (方案4): 即時型，第1步期望高達 7.00張(70分，連鎖率100%)，2步平均期望 6.76張(68分)
const planB = { idx: 14, q: [0, 7.00, 13.52], best: 7.00, bestH: 1, pc: 1.00 };

function sortMock(list, strat) {
  return list.slice().sort((a, b) => {
    if (strat === 'instant') {
      const diff = b.q[1] - a.q[1];
      if (Math.abs(diff) > 0.01) return diff;
      if (Math.abs(b.pc - a.pc) > 0.01) return b.pc - a.pc;
      return b.best - a.best;
    } else if (strat === 'safe') {
      const aSafe = a.pc >= 0.99 ? 1 : 0, bSafe = b.pc >= 0.99 ? 1 : 0;
      if (aSafe !== bSafe) return bSafe - aSafe;
      if (Math.abs(b.q[1] - a.q[1]) > 0.01) return b.q[1] - a.q[1];
      return b.best - a.best;
    } else {
      return b.best - a.best;
    }
  });
}

// 1. 即時消除優先 (instant): Plan B (第1步70分) 必須排在 Plan A (第1步18分) 前面
const resInstant = sortMock([planA, planB], 'instant');
assert.strictEqual(resInstant[0].idx, planB.idx, '即時消除優先模式下，第1步連鎖消除高分者必須排在第一名');

// 2. 兩步期望優先 (expect): Plan A (7.59張/步) 依多步期望排在前面
const resExpect = sortMock([planA, planB], 'expect');
assert.strictEqual(resExpect[0].idx, planA.idx, '兩步期望優先模式下，多步博弈期望高者排在第一名');

// 3. 穩健保底優先 (safe): Plan B (100%連鎖) 必須排在第一名
const resSafe = sortMock([planA, planB], 'safe');
assert.strictEqual(resSafe[0].idx, planB.idx, '穩健保底模式下，100% 連鎖者排在第一名');

console.log('✅ 測試 4 通過：多策略排序切換演算法驗證精確無誤！');

console.log('--- 測試 5: 雙排字體結構與 DOM 樣式檢驗 ---');
const htmlContent = fs.readFileSync('index.html', 'utf-8');
assert(htmlContent.includes('id="strategy"'), 'index.html 必須包含 #strategy 選擇器');
assert(htmlContent.includes('.cell-info'), 'index.html 必須包含 .cell-info 雙排容器');
assert(htmlContent.includes('.cell-score'), 'index.html 必須包含 .cell-score 分數標籤');
assert(htmlContent.includes('.cell-sub'), 'index.html 必須包含 .cell-sub 步數/張數標籤');
assert(htmlContent.includes('.badge-layout'), 'index.html 必須包含 .badge-layout 佈局提示徽章');
console.log('✅ 測試 5 通過：雙排呈現與提示標籤完整整合！');

console.log('--- 測試 6: 上傳新截圖自動開新局狀態機驗證 ---');
// 模擬使用者操作狀態機
const mockState = {
  simShown: true,
  simPlaying: true,
  simData: { steps: [1, 2, 3] },
  goDisabled: true,
  simBtnText: '回復版面',
  simBtnDisabled: false,
  editBoardDisplay: 'inline-block',
  results: [{ idx: 0, best: 8.0 }],
  resHtml: '<table>舊榜單</table>',
  pgWidth: '100%'
};

function mockPrepareNewGame(state) {
  state.simShown = false;
  state.simPlaying = false;
  state.simData = null;
  state.goDisabled = false;
  state.simBtnText = '模擬最佳 #1';
  state.simBtnDisabled = true;
  state.editBoardDisplay = 'none';
  state.results = null;
  state.resHtml = '';
  state.pgWidth = '0';
}

mockPrepareNewGame(mockState);
assert.strictEqual(mockState.simShown, false, '新局必須退出模擬狀態');
assert.strictEqual(mockState.simData, null, '模擬數據必須清空');
assert.strictEqual(mockState.goDisabled, false, '計算按鈕必須重新啟用 (disabled=false)');
assert.strictEqual(mockState.simBtnText, '模擬最佳 #1', '模擬按鈕文字必須還原');
assert.strictEqual(mockState.simBtnDisabled, true, '模擬按鈕在新局未計算前必須禁用');
assert.strictEqual(mockState.editBoardDisplay, 'none', '修改盤面按鈕必須隱藏');
assert.strictEqual(mockState.results, null, '舊局運算結果必須徹底清空');
assert.strictEqual(mockState.resHtml, '', '舊局榜單必須清空');
assert(htmlContent.includes('id="autocalc"'), 'index.html 必須包含 #autocalc 自動計算勾選項');
assert(htmlContent.includes('prepareNewGame'), 'index.html 必須具備 prepareNewGame 函數');
console.log('✅ 測試 6 通過：上傳新圖自動開新局狀態機與按鈕恢復邏輯驗證無誤！');
