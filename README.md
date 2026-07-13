# 護法博覽會虛擬展廳 — 使用說明

給傳乂看的白話版操作手冊。網站本體已經做好，這份文件說明「怎麼把它變成一個大家掃得到的網址」。

---

## 網站裡有什麼

- `index.html`：前台首頁，展板選單
- `admin.html`：後台，改展板名稱、上傳語音介紹
- `data/boards.json`：所有展板的資料（名稱、圖片、音檔路徑），後台改的東西都存在這裡
- `assets/images/`：11 張展板的網頁用圖（已經從 PDF 轉好，原圖較大，`thumbs/` 資料夾內是首頁選單用的縮圖）
- `assets/audio/`：法師上傳的語音介紹會放這裡（目前是空的）
- `js/config.js`：**上傳到 GitHub 之後要改的檔案**，見下面步驟

---

## 步驟一：把整個資料夾傳到 GitHub

傳乂已經決定自己手動上傳，這裡簡單提醒兩個重點：

1. 建立一個新的 repository（名稱建議就用 `ctcm-exhibition`），設定 Public（GitHub Pages 的免費方案需要公開才能架站，除非你有付費方案）
2. 把 `ctcm-exhibition` 這整個資料夾內容（不含這份 README 也沒關係）都上傳上去

---

## 步驟二：改一個設定檔（重要，只需要做一次）

上傳完成後，打開 `js/config.js`，把裡面的 `REPLACE_WITH_GITHUB_USERNAME` 改成你的 GitHub 帳號名稱：

```js
window.SITE_CONFIG = {
  githubOwner: "你的GitHub帳號",   // 改這裡
  githubRepo: "ctcm-exhibition",
  branch: "main"
};
```

改完存檔，再上傳（覆蓋）這個檔案回 GitHub。**這步驟不做的話，後台會沒辦法存檔。**

---

## 步驟三：開啟 GitHub Pages（讓網站有網址）

1. 到 repo 頁面 → 上方 `Settings`
2. 左側選單找到 `Pages`
3. 「Source」選 `Deploy from a branch`，Branch 選 `main`，資料夾選 `/ (root)`，按 `Save`
4. 等 1~2 分鐘，畫面會出現網址，長得像：
   `https://你的帳號.github.io/ctcm-exhibition/`

這個網址就是**前台展廳**的網址，之後轉成 QR code 給大家掃。
後台網址是在後面加 `admin.html`：
`https://你的帳號.github.io/ctcm-exhibition/admin.html`

---

## 步驟四：申請一組後台專用的 Token（法師管理展板要用）

後台要能「存檔」，需要一組 GitHub 的通行證（Token）。申請步驟：

1. 登入 GitHub，右上角頭像 → `Settings`
2. 左側選單最下面找到 `Developer settings`
3. 選 `Personal access tokens` → `Fine-grained tokens` → `Generate new token`
4. 設定：
   - Token name：隨便取，例如 `ctcm-admin`
   - Expiration：建議設 1 年（到期要重新申請一次，比較安全）
   - Repository access：選 `Only select repositories`，勾選 `ctcm-exhibition`
   - Permissions → 找到 `Contents`，改成 `Read and write`
5. 按 `Generate token`，會出現一長串英文數字（例如 `github_pat_xxxxx...`）
6. **馬上複製起來**，這串只會顯示這一次，關掉頁面就看不到了

拿到這串 Token 後，打開後台網址（`admin.html`），貼進去，按「登入」。這台電腦、這個瀏覽器之後就會記住，不用每次貼。

**⚠️ 這組 Token 等於是「誰拿到就能改展板內容」，不要傳給不相關的人。** 如果外流了，回到剛剛申請的地方把它刪掉（Delete）就能失效，再重新申請一組。

---

## 後台怎麼用

打開 `admin.html`，登入後會看到 11 個展板，每個展板可以：

- 改「展板顯示名稱」
- 上傳語音介紹檔（選好檔案後按「儲存這個展板」）
- 用 ▲▼ 調整展板在首頁選單出現的順序

存檔後，前台網站大約幾秒到 1 分鐘內就會更新（GitHub Pages 偶爾會有一點點延遲，重新整理頁面即可看到最新內容）。

---

## 步驟五：QR code

網站上線、確認可以正常打開後，把前台網址（`https://你的帳號.github.io/ctcm-exhibition/`）拿去產生 QR code 即可（Canva、線上 QR code 產生器都可以）。

---

## 之後如果要換電腦 / 交接

- 這個專案完全不依賴這台電腦，所有東西都在 GitHub 上
- 只要有 GitHub 帳號權限，在任何電腦打開 `admin.html` 貼上 Token 就能繼續管理
- Token 記得存放在安全的地方（例如密碼管理工具），不要寫在公開的地方
