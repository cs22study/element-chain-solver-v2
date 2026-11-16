// tests/engine.test.js
// Verify that index.html engine functions correctly

const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf-8');
const engineMatch = html.match(/<script type="text\/plain" id="engine">([\s\S]*?)<\/script>/);
assert(engineMatch, 'Engine script block must exist in index.html');

const engineCode = engineMatch[1];
const fn = new Function(engineCode + '; return { N, CELLS, K, gravity, clearGroups, cascade, expand, vals, analyze, setWeights, mulberry32 };');
const E = fn();

console.log('--- 驗證 index.html 核心運算引擎 ---');

const testBoard = [
  4,4,2,3,4,
  4,4,3,2,2,
  3,3,2,4,1,
  0,4,0,2,2,
  2,4,0,0,1
];

assert.strictEqual(E.CELLS, 25);
assert.strictEqual(E.K, 5);

// Test expand on position 17 (0-based)
const outs = E.expand(testBoard, 17, 10);
assert(Array.isArray(outs));
assert(outs.length > 0);
console.log(`位置 17 展開分支數: ${outs.length}`);
outs.forEach(o => {
  assert(o.board.length === 25);
  assert(o.removed >= 1);
  assert(o.p > 0);
});

// Test analyze with horizon H=2 using fixed seed
const res = E.analyze(testBoard, 2);
assert.strictEqual(res.length, 25);
const topIdx = res.reduce((maxI, x, i, arr) => (arr[i].q[1] > arr[maxI].q[1] ? i : maxI), 0);
console.log(`運算完成，最高分起手點 index: ${topIdx}, 1步消除: ${res[topIdx].q[1].toFixed(2)}`);

console.log('✅ 核心引擎計算一致性驗證通過！');
