# 護法博覽會虛擬展廳 — 專案總覽

> 建立日期：2026-05-14
> 最後更新：2026-07-13
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

## 目前進度（截至 2026-07-13）

- [x] 11 張展板 PDF（`PDF/` 資料夾）轉成網頁用圖，輸出到 `assets/images/`（原圖）與 `assets/images/thumbs/`（首頁縮圖）
- [x] 前台 `index.html` + `js/app.js`：展板選單、點擊看大圖、播語音介紹（用 `location.hash` 做路由，例如 `#4-1`）
- [x] 後台 `admin.html` + `js/admin.js` + `js/github-api.js`：Token 登入、改名稱、上傳音檔、調整順序，皆透過 GitHub Contents API 寫回 `data/boards.json` 與 `assets/audio/`
- [x] `data/boards.json`：11 個展板的資料骨架，名稱先用預設值「展板 4-1」等，待法師用後台改成正式名稱
- [x] 用 Playwright 在本機（`python -m http.server`）實測前台、後台頁面，無 JS 錯誤，畫面正常
- [x] `README.md`：白話版操作手冊（上傳 GitHub → 開 GitHub Pages → 改 `js/config.js` → 申請 Token → 後台怎麼用 → 產生 QR code）
- [ ] **`js/config.js` 裡的 `githubOwner` 還是預設值 `REPLACE_WITH_GITHUB_USERNAME`，尚未填入傳乂實際的 GitHub 帳號名稱**
- [ ] 傳乂尚未把整個資料夾上傳到 GitHub、尚未開啟 GitHub Pages
- [ ] 尚未產生正式 QR code（要等網站上線、確認網址可正常開啟後才做）
- [ ] 11 個展板目前都還是預設名稱，尚未由法師透過後台填入正式顯示名稱
- [ ] 尚未上傳任何語音介紹音檔

## 關鍵檔案路徑

- 專案根目錄：`C:\Users\25XJB03-1\Desktop\系統開發組\ctcm-exhibition\`
- 原始展板 PDF（不要動）：`PDF\`
- 轉檔腳本：`scripts\convert_pdf_to_web.py`
- 網站程式碼：`index.html`、`admin.html`、`css\styles.css`、`js\app.js`、`js\admin.js`、`js\github-api.js`、`js\config.js`
- 展板資料：`data\boards.json`
- 使用說明：`README.md`

## 下次從哪開始

1. 先問傳乂：資料夾上傳 GitHub、開 GitHub Pages 這幾步做到哪了？
2. 確認 GitHub 帳號名稱，協助改好 `js/config.js` 的 `githubOwner`
3. 網站網址出來後，實際打開確認前台能正常顯示（可能要提醒瀏覽器快取問題）
4. 陪同或指導傳乂申請後台用的 GitHub Token（README 步驟四），並實際登入 `admin.html` 測試存檔
5. 引導把 11 個展板的正式名稱、語音介紹音檔透過後台補齊
6. 網站確認上線穩定後，產生前台網址的 QR code

## 中途決策點 / 待確認事項

- GitHub 帳號名稱尚未提供（傳乂表示「等一下會提供」，後續對話要記得追問）
- Token 到期時間：README 建議設 1 年，到期後需要重新申請並貼到 `admin.html`，沒有自動提醒機制，可考慮之後排程提醒

---

