# 元素連鎖計算機 APP - 專案文件總覽與 Hub 樞紐中心

> **專案名稱**：元素連鎖計算機 APP (神魔之塔小遊戲輔助工具)  
> **架構模式**：Hub-and-Spoke 模組化開發架構  
> **核心目標**：高精度期望值運算、秒級截圖辨識、流暢動畫預覽、極致 UX、零花費、隨時可復原  
> **本地專案路徑**：`D:\志松資料\GAS程式AI運用小松資料區cs22study\遊戲_神魔之塔小遊戲元素連鎖計算機20261116\element-chain-solver-v2`  
> **GitHub 倉庫**：https://github.com/cs22study/element-chain-solver-v2  
> **原作者參考專案**：https://github.com/vaz1306011/element-chain-solver  

---

## 🧭 五大系統開發原則 (Golden Principles)

本專案所有後續擴充、測試、交接與維護均嚴格遵守以下五大原則：

1. **自主撰寫與測試 (Autonomous Implementation & Verification)**：
   - 所有程式碼（前端 HTML5/Canvas/Web Worker/PWA 與後端服務）皆由 AI 自行撰寫、建立自動化測試（單元測試與計算邏輯驗證），驗證無誤後方能交付。
2. **零資安風險與防資料外洩 (Zero-Vulnerability & Anti-Leakage)**：
   - 徹底杜絕 XSS（HTML 與動態資料渲染安全隔離）。
   - 敏感配置雲端隔離，白名單限制來源，本機純靜態演算不外洩使用者遊戲資料。
3. **隨時可復原 (High Recoverability & Zero Data Loss)**：
   - 盤面操作支援軟刪除/歷史步驟復原（Undo/Redo）。
   - 程式碼採 Git 版本控制雙向同步，隨時可回滾至任一 Commit。
4. **零花費 (100% Free Tier Architecture)**：
   - 核心前端託管於 GitHub Pages，無需任何付費伺服器或第三方付費 API。若擴充雲端記錄或排行榜功能，優先整合 Google Apps Script (GAS) + Google Sheets 免費配額。
5. **節省 Token (Hub-and-Spoke Modular Efficiency)**：
   - 後續各子模組開發（如：截圖辨識增強、歷史紀錄、PWA 離線、多手規劃優化等）均可在新對話視窗開展。
   - 每次模組完成後，必須即時回寫 `docs/` 相關文件，維持 Central Hub 資訊同步。

---

## 📚 專案文件索引 (Hub-and-Spoke Documents)

| 文件編號 | 文件名稱 | 檔案路徑 | 說明 |
| :--- | :--- | :--- | :--- |
| **00** | **中央樞紐與新開 Session 指南** | [`docs/00_MASTER_INDEX.md`](file:///d:/志松資料/GAS程式AI運用小松資料區cs22study/遊戲_神魔之塔小遊戲元素連鎖計算機20261116/element-chain-solver-v2/docs/00_MASTER_INDEX.md) | 本文件。定義整體架構原則、開場白模板、開發規範 |
| **01** | **系統架構藍圖規格書** | [`docs/01_ARCHITECTURE_BLUEPRINT.md`](file:///d:/志松資料/GAS程式AI運用小松資料區cs22study/遊戲_神魔之塔小遊戲元素連鎖計算機20261116/element-chain-solver-v2/docs/01_ARCHITECTURE_BLUEPRINT.md) | 系統模組架構、Web Worker 執行架構、Canvas 圖形架構 |
| **02** | **原作者專案分析與計算原理** | [`docs/02_ORIGINAL_ALGORITHM_ANALYSIS.md`](file:///d:/志松資料/GAS程式AI運用小松資料區cs22study/遊戲_神魔之塔小遊戲元素連鎖計算機20261116/element-chain-solver-v2/docs/02_ORIGINAL_ALGORITHM_ANALYSIS.md) | 深入解析神魔之塔元素連鎖規則、馬可夫決策/期望值動態規劃演算法、HSV色彩分類模型 |
| **03** | **工作進度與開發日誌** | [`docs/03_WORK_LOG.md`](file:///d:/志松資料/GAS程式AI運用小松資料區cs22study/遊戲_神魔之塔小遊戲元素連鎖計算機20261116/element-chain-solver-v2/docs/03_WORK_LOG.md) | 歷次版本更新記錄、需求變更分析、重大演算法調整與測試記錄 |
| **04** | **各模組詳細規格書** | [`docs/04_MODULE_SPECS.md`](file:///d:/志松資料/GAS程式AI運用小松資料區cs22study/遊戲_神魔之塔小遊戲元素連鎖計算機20261116/element-chain-solver-v2/docs/04_MODULE_SPECS.md) | 模組 1~7 詳細功能規格、演算法方程式、資料格式與防護設計 |
| **05** | **待辦事項與優化清單** | [`docs/05_TODO_LIST.md`](file:///d:/志松資料/GAS程式AI運用小松資料區cs22study/遊戲_神魔之塔小遊戲元素連鎖計算機20261116/element-chain-solver-v2/docs/05_TODO_LIST.md) | UX 回饋改進項目、優先級標註與模組完成狀態追蹤 |

---

## 🚀 新開 Session 開場白模板 (Session Kickoff Prompt)

未來若需開啟新對話視窗進行特定模組優化，請使用以下標準指令開場：

```markdown
【元素連鎖計算機 APP - Hub-and-Spoke 接續開發指令】

你好，我是專案負責人。本專案為「元素連鎖計算機 APP」，採用 Hub-and-Spoke 架構開發。
本地專案路徑：D:\志松資料\GAS程式AI運用小松資料區cs22study\遊戲_神魔之塔小遊戲元素連鎖計算機20261116\element-chain-solver-v2
GitHub Repo: https://github.com/cs22study/element-chain-solver-v2

請嚴格遵守本專案的 5 大系統開發原則：
1. 所有程式碼皆由你自行撰寫並執行完整自動化測試驗證。
2. 避免任何資料外洩與資安風險 (防止 XSS、敏感密碼雲端比對、白名單鎖定 ID)。
3. 隨時可復原 (採用軟刪除機制、Git 與 clasp 雙向版控)。
4. 零花費 (僅使用 GitHub Pages + Google Apps Script + Google Sheets + Google Drive 免費服務)。
5. 節省 Token (本對話視窗專注於指定模組開發，完成後必須回寫 docs/ 相關文件)。

請讀取 `docs/00_MASTER_INDEX.md` 與 `docs/05_TODO_LIST.md`，並告知我目前待辦任務中最優先的模組是什麼，待我確認後即可開始實作！
```
