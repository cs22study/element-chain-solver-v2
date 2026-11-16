// tests/html.test.js
// Verify DOM structure, syntax, and element bindings in index.html

const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf-8');

// 1. Required IDs
const requiredIds = [
  'pal', 'grid', 'go', 'sim', 'up', 'file', 'pg', 'st', 'depth', 'shot',
  'cvbox', 'cv', 'redet', 'shotmsg', 'res', 'hint',
  'btn-random', 'btn-reset', 'btn-fill', 'btn-undo', 'btn-redo',
  'sim-ctrl', 'sim-title', 'sim-progress', 'sim-prev', 'sim-play', 'sim-next', 'sim-replay', 'sim-exit',
  'edit-board', 'eyemode'
];

requiredIds.forEach(id => {
  assert(html.includes(`id="${id}"`), `HTML must contain element with id="${id}"`);
});

// 2. Syntax check: script blocks compile cleanly
const scriptMatches = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
assert(scriptMatches.length >= 2, `Must have at least 2 script blocks, found ${scriptMatches.length}`);

scriptMatches.forEach((m, idx) => {
  const code = m[1];
  try {
    new Function(code);
    console.log(`✅ Script block #${idx + 1} syntax check passed`);
  } catch (err) {
    // If it uses DOM variables like document or localStorage, wrap with mock
    const wrapped = `
      const document = { getElementById: () => ({ addEventListener: () => {}, onclick: null, style: {}, classList: { add(){}, remove(){}, toggle(){} }, appendChild(){}, querySelectorAll: () => [], children: [] }), elementFromPoint: () => null, addEventListener: () => {} };
      const window = { addEventListener: () => {} };
      const navigator = { serviceWorker: { register: () => Promise.resolve() } };
      const localStorage = { getItem: () => null, setItem: () => {} };
      const URL = { createObjectURL: () => '', revokeObjectURL: () => {} };
      const Blob = function(){};
      const Image = function(){};
      ${code}
    `;
    new Function(wrapped);
    console.log(`✅ Script block #${idx + 1} (wrapped) syntax check passed`);
  }
});

console.log('🎉 HTML 與前端腳本整合測試全部通過！');
