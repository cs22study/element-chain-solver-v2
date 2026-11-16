// tests/solver.test.js
// Automated verification tests for Element Chain Solver v2

const assert = require('assert');

// 1. Core Board Generation
const DEFAULT_BOARD = [
  4,4,2,3,4,
  4,4,3,2,2,
  3,3,2,4,1,
  0,4,0,2,2,
  2,4,0,0,1
];

function generateRandomBoard(noInitialMatches = true) {
  const N = 5;
  const board = new Array(25);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const excluded = new Set();
      if (noInitialMatches) {
        // Check horizontal 2 prior neighbors
        if (c >= 2 && board[r * N + (c - 1)] === board[r * N + (c - 2)]) {
          excluded.add(board[r * N + (c - 1)]);
        }
        // Check vertical 2 prior neighbors
        if (r >= 2 && board[(r - 1) * N + c] === board[(r - 2) * N + c]) {
          excluded.add(board[(r - 1) * N + c]);
        }
      }
      const candidates = [0, 1, 2, 3, 4].filter(col => !excluded.has(col));
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      board[r * N + c] = chosen;
    }
  }
  return board;
}

// 2. Check 3-in-a-row matches
function hasInitialMatch(board) {
  const N = 5;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N - 2; c++) {
      const v = board[r * N + c];
      if (v === board[r * N + c + 1] && v === board[r * N + c + 2]) return true;
    }
  }
  for (let c = 0; c < N; c++) {
    for (let r = 0; r < N - 2; r++) {
      const v = board[r * N + c];
      if (v === board[(r + 1) * N + c] && v === board[(r + 2) * N + c]) return true;
    }
  }
  return false;
}

// 3. History Manager (Undo / Redo)
class HistoryManager {
  constructor(maxSize = 40) {
    this.maxSize = maxSize;
    this.undoStack = [];
    this.redoStack = [];
  }
  push(state) {
    this.undoStack.push(state.slice());
    if (this.undoStack.length > this.maxSize) this.undoStack.shift();
    this.redoStack = [];
  }
  undo(currentState) {
    if (!this.canUndo) return null;
    this.redoStack.push(currentState.slice());
    return this.undoStack.pop();
  }
  redo(currentState) {
    if (!this.canRedo) return null;
    this.undoStack.push(currentState.slice());
    return this.redoStack.pop();
  }
  get canUndo() {
    return this.undoStack.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }
}

// 4. Fill with single brush color
function fillWithColor(color) {
  assert(color >= 0 && color <= 4, 'Color must be in 0..4');
  return new Array(25).fill(color);
}

// 5. Test Suite Execution
console.log('--- 開始執行自動化測試 (Element Chain Solver v2) ---');

// Test 1: generateRandomBoard constraints
console.log('測試 1: 隨機自由開局演算法 (1000 次蒙地卡羅驗證)');
for (let i = 0; i < 1000; i++) {
  const b = generateRandomBoard(true);
  assert.strictEqual(b.length, 25, '盤面大小必須為 25');
  assert(b.every(x => x >= 0 && x <= 4), '所有元素屬性必須在 0~4 區間');
  assert.strictEqual(hasInitialMatch(b), false, `無預消隨機盤面不可包含任何 3 連線 (第 ${i} 次)`);
}
console.log('✅ 測試 1 通過：無初始 3 連隨機開局保證 100% 合法且無初始消除');

// Test 2: hasInitialMatch accuracy
console.log('測試 2: 3 連線檢查函數準確性');
const matchingBoardH = [
  0, 0, 0, 1, 2,
  3, 4, 1, 2, 3,
  0, 1, 2, 3, 4,
  1, 2, 3, 4, 0,
  2, 3, 4, 0, 1
];
const matchingBoardV = [
  1, 2, 3, 4, 0,
  1, 3, 4, 0, 2,
  1, 4, 0, 2, 3,
  2, 0, 1, 3, 4,
  3, 1, 2, 4, 0
];
const square2x2Board = [
  0, 0, 1, 2, 3,
  0, 0, 2, 3, 4,
  1, 2, 3, 4, 0,
  2, 3, 4, 0, 1,
  3, 4, 0, 1, 2
];
assert.strictEqual(hasInitialMatch(matchingBoardH), true, '應檢測出水平 3 連');
assert.strictEqual(hasInitialMatch(matchingBoardV), true, '應檢測出垂直 3 連');
assert.strictEqual(hasInitialMatch(square2x2Board), false, '2x2 方塊不應算作 3 連線');
console.log('✅ 測試 2 通過：3 連線與 2x2 方塊邊界判定精確無誤');

// Test 3: History Manager (Undo / Redo)
console.log('測試 3: 歷史紀錄 (Undo / Redo) 堆疊與邊界條件');
const hist = new HistoryManager(5);
assert.strictEqual(hist.canUndo, false);
assert.strictEqual(hist.canRedo, false);

let current = [0, 0, 0];
hist.push(current);

current = [1, 1, 1];
hist.push(current);

current = [2, 2, 2];
assert.strictEqual(hist.canUndo, true);

// Undo
current = hist.undo(current);
assert.deepStrictEqual(current, [1, 1, 1]);
assert.strictEqual(hist.canRedo, true);

// Undo again
current = hist.undo(current);
assert.deepStrictEqual(current, [0, 0, 0]);
assert.strictEqual(hist.canUndo, false);

// Redo
current = hist.redo(current);
assert.deepStrictEqual(current, [1, 1, 1]);

// New action clears redo
hist.push(current);
current = [3, 3, 3];
assert.strictEqual(hist.canRedo, false);
console.log('✅ 測試 3 通過：Undo/Redo 狀態機與邊界條件處理完整');

// Test 4: Default & Single color board reset
console.log('測試 4: 單色填滿與重設盤面功能驗證');
const filledRed = fillWithColor(1);
assert.strictEqual(filledRed.length, 25);
assert(filledRed.every(c => c === 1));

assert.strictEqual(DEFAULT_BOARD.length, 25);
assert(DEFAULT_BOARD.every(c => c >= 0 && c <= 4));
console.log('✅ 測試 4 通過：單色填滿與重設盤面規格驗證無誤');

console.log('🎉 所有單元與演算法自動化測試全部通過！');
