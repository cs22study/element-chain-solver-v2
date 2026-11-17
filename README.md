# 元素連鎖計算機 APP (element-chain-solver-v2)

> 🎮 《神魔之塔》小遊戲「元素連鎖」最佳起手點高精度計算機、即時連鎖模擬器與 PWA 輔助工具。  
> 採用 **Hub-and-Spoke** 模組化架構開發，遵循 5 大原則（自主開發自動化測試、零資安外洩、隨時可復原、零花費 GitHub Pages 部署、文檔同步節省 Token）。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-brightgreen)](https://cs22study.github.io/element-chain-solver-v2/)
[![Tests](https://img.shields.io/badge/tests-100%25%20passed-success)](tests/)

---

## 🌟 核心功能亮點 (Key Features)

### 1. 🎲 智能自由開局與盤面輔助
- **🎲 自由開局**：演算法動態檢測上方與左方卡片，排除 3 連消除，保證 100% 生成符合遊戲真實開局情境的合法隨機盤面。
- **🔄 重設盤面 / 🎨 單色重填**：一鍵返回預設盤面，或以指定屬性填滿 25 格，方便自訂佈局。
- **↩️ 復原 (Undo) / ↪️ 重做 (Redo)**：完整 40 步深度歷史堆疊，支援鍵盤快捷鍵 `Ctrl+Z` / `Ctrl+Y`。
- **🖐️ 滑動連續塗色 (Drag-to-Paint)**：支援滑鼠與手機觸控滑動連續上色（Pointer Events + `setPointerCapture`），單次劃刷自動合併為單一 Undo 步。
- **🖱️ 右鍵快速循環**：桌機電腦右鍵點擊單元格秒速循環切換 5 種屬性（水 $\to$ 火 $\to$ 木 $\to$ 光 $\to$ 暗）。

### 2. 🎯 雙模式防誤觸與多策略起手點推薦
- **雙模式隔離**：運算完成自動鎖定檢視模式，點擊盤面任一格直接模擬該起手點，徹底根除誤上色破壞計算結果的痛點；提供 `[✏️ 修改盤面]` 隨時解鎖。
- **多維度推薦排序策略 (`#strategy`)**：
  - 🥇 **`🎯 即時消除優先` (預設推薦)**：依第 1 步確定的消除期望分數排序，推薦點下去盤面立刻引爆大連鎖的高分起手點，模擬得分與實戰高度契合。
  - 🧠 **`兩步期望優先`**：評估隨機補牌後的理論極限期望（佈局型）。
  - 🛡️ **`穩健保底優先`**：連鎖率 100% 起手點優先。
  - **0 秒免重算切換**：策略切換零延遲重排盤面與榜單。
- **雙排高對比呈現**：單元格分 2 排大字體呈現分數與步數（例如第一排金色大字 `70分`、第二排 `1步·7.0張`）；榜單清楚區隔即時實拿與多步總計，並醒目標註 `[⚠️ 佈局蓄勢 (第1步僅消1格)]` 與 `[⚡ 盤面即時連鎖]`。

### 3. 🎬 逐步演練模擬動畫控制器
- 具備完整播放控制台：`⏮️ 上一步`、`▶️ 播放 / ⏸️ 暫停`、`⏭️ 下一步`、`🔄 重播`、`⏹️ 回復盤面`。
- 精確標記連鎖輪次（第 0 動點擊、第 1~N 輪連鎖消除、受重力掉落補位），並即時累積顯示當前獲得分數。

### 4. 🌙 截圖辨識微調、護眼校正與自動開局計算
- **⚡ 截圖自動新局與無縫計算 (`autocalc`)**：重新上傳新圖或自由開局時，自動徹底終止前局模擬並還原按鈕；若 25 格辨識無誤直接自動開始計算，免去手動重置與重複點擊。
- **🌙 護眼/濾藍光色差校正 (`eyemode`)**：動態通道增益與門檻適配，補償因手機護眼/濾藍光模式造成的嚴重偏暖偏黃，精確還原水屬性與暗屬性。
- **預覽畫布直接點選循環修正**：截圖後若有個別卡片誤判，直接在畫布上點擊該卡片即可循環切換屬性修正，無需重新拖曳框線。

### 5. 📱 PWA 離線完整支援 (Progressive Web App)
- 具備 `manifest.json` 與 Service Worker `sw.js`。
- 支援安裝加入手機主畫面，在無網路、弱訊號環境下秒開秒算，離線功能 100% 正常。

---

## 📐 計分與演算法規則

- **官方計分標準換算**：
  $$\text{得分 (Points)} = \text{消除總卡片數} \times 10$$
  （例：起手點消 1 格 10 分 + 掉落連鎖消除 3 格 30 分 = 共消除 4 格，得 40 分）。
- **有限時界馬可夫決策過程 (Finite-Horizon MDP)**：
  - 透過 Web Worker 獨立執行緒於後台計算各起手點在規劃步數 $H$ 下之消除期望值。
  - 精確枚舉第一步補牌結果，多分支蒙地卡羅取樣連鎖消除。

---

## 🧪 自動化測試驗證

專案具備完整自動化測試套件，以無外部依賴之 Node.js 原生執行：
```bash
# 執行全套自動化測試
node -e "['tests/solver.test.js','tests/engine.test.js','tests/enhancements.test.js','tests/html.test.js'].forEach(f=>require('./'+f))"
```

測試涵蓋項目：
1. **`tests/solver.test.js`**：1000 次蒙地卡羅自由開局合法性、3 連線檢查、40 步 Undo/Redo 狀態機、單色重填。
2. **`tests/engine.test.js`**：核心 Web Worker 分析引擎數值一致性驗證。
3. **`tests/enhancements.test.js`**：護眼色偏補償、PWA 資源完整性、10分/格計分公式、多策略動態排序切換、雙排 DOM 結構、上傳新圖自動開新局狀態機重置。
4. **`tests/html.test.js`**：DOM 元素綁定與 JavaScript 語法檢查。

---

## 📚 專案文件庫 (Hub-and-Spoke Documents)

所有系統設計、演算法原理與開發工作日誌均完整收錄於 `docs/`：
- [`docs/00_MASTER_INDEX.md`](file:///docs/00_MASTER_INDEX.md)：Central Hub 樞紐中心、5 大原則與接續開發開場白。
- [`docs/01_ARCHITECTURE_BLUEPRINT.md`](file:///docs/01_ARCHITECTURE_BLUEPRINT.md)：系統架構藍圖規格書。
- [`docs/02_ORIGINAL_ALGORITHM_ANALYSIS.md`](file:///docs/02_ORIGINAL_ALGORITHM_ANALYSIS.md)：原作者演算法分析與數學原理。
- [`docs/03_WORK_LOG.md`](file:///docs/03_WORK_LOG.md)：完整工作進度與歷次版本變更日誌。
- [`docs/04_MODULE_SPECS.md`](file:///docs/04_MODULE_SPECS.md)：模組 1~7 詳細功能規格書。
- [`docs/05_TODO_LIST.md`](file:///docs/05_TODO_LIST.md)：待辦事項追蹤與優化清單。

---

## 📄 授權條款 (License)
本專案基於原作者 [vaz1306011/element-chain-solver](https://github.com/vaz1306011/element-chain-solver) 進行開源擴充改良，採 MIT 授權協議。
