# 清淨慧博覽會虛擬展廳 — 專案總覽

> 建立日期：2026-05-14
> 最後更新：2026-07-14
> 專案代號：ctcm-exhibition
> 負責人：劉芸秀

---

## 下次對話的起手式（重要）

**新對話一開始，貼這句話：**

```
請先讀 C:\Users\25XJB03-1\Desktop\系統開發組\ctcm-exhibition\ctcmexhibition.md、CLAUDE.md，了解背景後我們再繼續。
```

**結束對話前，貼這句話：**

```
請更新 "C:\Users\25XJB03-1\Desktop\系統開發組\ctcm-exhibition\ctcmexhibition.md"，紀錄今天做了什麼、下次從哪開始。
```

---

## 專案目標

為中台禪寺女眾環保組設計護法會博覽會的虛擬展廳，將虛擬展廳架設到github將網址做成QR code。

---

## 參考資料

各展板定稿圖片:"C:\Users\25XJB03-1\Desktop\系統開發組\ctcm-exhibition\PDF"

---

## 核心需求

- **前台**：使用者參觀者可以掃描QR code點擊自己想觀看的展板，可以邊聽展板介紹邊看展板內容。
- **後台**：師父可將錄音檔放進去，設定各展板出現在手機上的名稱

## 技術規格

- **形式**：響應式網頁（RWD），支援螢幕投影、平板、電視
- **視覺風格**：Q 版可愛插圖，動畫效果

## 規模

- 典型一場活動 500-1000 人

---

## 架構決策（2026-07-13 確定）

參考朋友的類似專案（`gretakay.github.io/vr-intruduction`：純 HTML/JS + Google Sheet 當後台資料庫）後，討論出以下方向：

- **素材存放**：圖片、音檔全部放進 GitHub repo（不用 Google Drive），法師不用碰 Google Apps Script
- **後台形式**：獨立的 `admin.html` 網頁後台（不是 Google Sheet）
- **後台如何存檔**：GitHub Pages 是純靜態網站沒有伺服器，`admin.html` 透過 **GitHub Contents API + 一組專屬 GitHub Token** 直接把修改（展板名稱、音檔）commit 回 repo。傳乂已確認可以接受這個做法
- **前台效能優先**：傳乂特別強調前台載入速度要最短 → 首頁選單改用縮圖（`assets/images/thumbs/`，16~51KB／張），點進展板才載入原圖（269~892KB／張）
- **PDF 轉檔**：由 Claude 用 Bash 沙盒（PyMuPDF + Pillow）處理，原始 PDF 不動，另外輸出網頁用圖
- **上傳 GitHub 這一步**：傳乂要自己手動上傳，不需要 Claude 寫 git 推送腳本

---

## 目前進度（截至 2026-07-14）

- [x] 11 張展板 PDF（`PDF/` 資料夾）轉成網頁用圖，輸出到 `assets/images/`（原圖）與 `assets/images/thumbs/`（首頁縮圖）
- [x] 前台 `index.html` + `js/app.js`：展板選單、點擊看大圖、播語音介紹（用 `location.hash` 做路由，例如 `#4-1`）
- [x] 後台 `admin.html` + `js/admin.js` + `js/github-api.js`：Token 登入、改名稱、上傳音檔、調整順序，皆透過 GitHub Contents API 寫回 `data/boards.json` 與 `assets/audio/`
- [x] `README.md`：白話版操作手冊
- [x] **已正式上線**：GitHub 帳號 `Jacinta0616`，repo `Jacinta0616/ctcm-exhibition`，GitHub Pages 已開啟
  - 前台：https://jacinta0616.github.io/ctcm-exhibition/
  - 後台：https://jacinta0616.github.io/ctcm-exhibition/admin.html
- [x] 後台 Token 登入已實測成功（過程中發生一次 Token 曝光事件，已請傳乂撤銷重辦，詳見下方「中途決策點」）
- [x] 新增兩種特殊展板類型：
  - `4-13`：`type: "game"`，內嵌傳乂另一個 repo 的互動遊戲 `https://jacinta0616.github.io/ctcm-game/`（iframe + 開新視窗連結）
  - `4-15`：`type: "video"`，架構已就緒（支援 YouTube／Google Drive／直接檔案路徑三種來源自動判斷），但**傳乂尚未決定影片來源**，目前欄位是空的
  - 後台 `admin.js` 已同步支援依展板類型顯示對應欄位（一般展板：語音上傳；影片展板：影片網址；遊戲展板：遊戲網址）
- [x] 新增圖片放大檢視（`js/lightbox.js`）：點擊展板圖片可放大，支援雙擊縮放、兩指縮放、拖曳查看細節（因應 4-2、4-3 這類超長橫幅展板在手機上看不清楚的問題）
  - 開發過程中抓到一個 bug：pointer capture 會讓「點擊圖片」被誤判成「點擊背景」，導致放大視窗點一下圖片就自動關閉，已修正並用 Playwright 實測（本機 + 線上正式站）雙擊放大/還原/背景關閉/✕ 關閉皆正常
- [ ] 11 個展板目前都還是預設名稱「展板 4-1」等，尚未由法師透過後台填入正式顯示名稱
- [ ] 尚未上傳任何語音介紹音檔（4-1~4-16 一般展板都適用）
- [ ] 4-15 影片來源尚未決定（檔案 / YouTube / Google Drive 三選一，傳乂之後有了再透過後台「影片位置」欄位填入即可）
- [ ] 尚未產生正式 QR code（等內容都補齊、確認網站穩定後再做）
- [ ] `ctcm-game`（傳乂另一個獨立 repo）的遊戲本身有一個 CORS 錯誤（呼叫 Google Apps Script 被擋），不影響畫面顯示，但如果遊戲有「記錄分數」等會呼叫該 API 的功能可能會失敗——這是別的 repo 的問題，不在這個專案的修改範圍內，只是提醒過傳乂

## 關鍵檔案路徑

- 專案根目錄：`C:\Users\25XJB03-1\Desktop\系統開發組\ctcm-exhibition\`
- 原始展板 PDF（不要動）：`PDF\`
- 轉檔腳本：`scripts\convert_pdf_to_web.py`
- 網站程式碼：`index.html`、`admin.html`、`css\styles.css`、`js\app.js`、`js\admin.js`、`js\github-api.js`、`js\config.js`、`js\lightbox.js`
- 展板資料：`data\boards.json`（含 `type` 欄位：預設一般圖文展板、`"video"`、`"game"`）
- 使用說明：`README.md`
- **重要提醒**：傳乂習慣自己手動把改好的檔案上傳/覆蓋到 GitHub（不透過 Claude 推送），每次改完程式碼要明確列出「這次改了哪幾個檔案」給她

## 下次從哪開始

1. 詢問傳乂：11 個展板的正式顯示名稱想好了嗎？可以直接陪她一個一個在後台填
2. 詢問語音介紹音檔的準備狀況，協助透過後台上傳
3. 4-15 影片如果傳乂已經有素材/連結了，協助她填進後台「影片位置」欄位並測試顯示效果
4. 以上都補齊、且傳乂確認內容穩定後，產生前台網址的 QR code（可用 Canva 或線上工具）

## 中途決策點 / 待確認事項

- ~~GitHub 帳號名稱尚未提供~~ → 已提供：`Jacinta0616`
- Token 到期時間：README 建議設 1 年，到期後需要重新申請並貼到 `admin.html`，沒有自動提醒機制，可考慮之後排程提醒
- **安全提醒**：傳乂曾經把一組真實 Token 明文貼在對話裡並要求寫進程式碼，已拒絕並說明原因，請她去 GitHub 撤銷重辦。之後若再發生類似情況，一律先拒絕寫死、建議撤銷重辦（詳見 Claude 記憶檔 `feedback_secrets-handling.md`）
- 4-15 影片最終要用哪種來源（自架檔案／YouTube／Google Drive）還沒決定，架構三種都支援，等傳乂決定後直接在後台填連結即可，不需要再改程式碼

---

