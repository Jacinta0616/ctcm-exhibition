// 封裝 GitHub Contents API，讓後台可以直接把修改「存檔」回 repo。
// 需要 window.SITE_CONFIG（見 config.js）與一組具備 repo 寫入權限的 GitHub Token。
(function () {
  "use strict";

  var TOKEN_KEY = "ctcm_gh_token";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token.trim());
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  function apiBase() {
    var c = window.SITE_CONFIG;
    return "https://api.github.com/repos/" + c.githubOwner + "/" + c.githubRepo + "/contents/";
  }

  function authHeaders() {
    return {
      Authorization: "Bearer " + getToken(),
      Accept: "application/vnd.github+json"
    };
  }

  // 字串（可含中文）<-> base64，供 GitHub API 使用
  function utf8ToBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var binary = "";
    bytes.forEach(function (b) {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }

  function base64ToUtf8(b64) {
    var binary = atob(b64.replace(/\n/g, ""));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = reader.result;
        var b64 = result.substring(result.indexOf(",") + 1);
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 讀取 repo 內某個檔案，回傳 { text, sha } 或 sha=null（檔案不存在）
  function getFile(path) {
    var url = apiBase() + encodeURI(path) + "?ref=" + window.SITE_CONFIG.branch + "&t=" + Date.now();
    return fetch(url, { headers: authHeaders() }).then(function (res) {
      if (res.status === 404) return { text: null, sha: null };
      if (!res.ok) return res.json().then(function (e) { throw new Error(e.message || "讀取失敗"); });
      return res.json().then(function (data) {
        return { text: base64ToUtf8(data.content), sha: data.sha };
      });
    });
  }

  // 寫入（新增或更新）文字檔，例如 data/boards.json
  function putTextFile(path, text, message, sha) {
    var body = {
      message: message,
      content: utf8ToBase64(text),
      branch: window.SITE_CONFIG.branch
    };
    if (sha) body.sha = sha;
    return fetch(apiBase() + encodeURI(path), {
      method: "PUT",
      headers: Object.assign({ "Content-Type": "application/json" }, authHeaders()),
      body: JSON.stringify(body)
    }).then(function (res) {
      if (!res.ok) return res.json().then(function (e) { throw new Error(e.message || "存檔失敗"); });
      return res.json();
    });
  }

  // 上傳二進位檔（音檔），會先查詢是否已存在同路徑檔案以取得 sha
  function putBinaryFile(path, file, message) {
    return getFile(path).then(function (existing) {
      return fileToBase64(file).then(function (b64) {
        var body = {
          message: message,
          content: b64,
          branch: window.SITE_CONFIG.branch
        };
        if (existing.sha) body.sha = existing.sha;
        return fetch(apiBase() + encodeURI(path), {
          method: "PUT",
          headers: Object.assign({ "Content-Type": "application/json" }, authHeaders()),
          body: JSON.stringify(body)
        }).then(function (res) {
          if (!res.ok) return res.json().then(function (e) { throw new Error(e.message || "音檔上傳失敗"); });
          return res.json();
        });
      });
    });
  }

  // 驗證 Token 是否有效、且對這個 repo 有寫入權限
  function verifyToken() {
    var c = window.SITE_CONFIG;
    return fetch("https://api.github.com/repos/" + c.githubOwner + "/" + c.githubRepo, {
      headers: authHeaders()
    }).then(function (res) {
      if (!res.ok) throw new Error("Token 無效，或沒有這個 repo 的存取權限");
      return res.json();
    }).then(function (data) {
      if (!data.permissions || !data.permissions.push) {
        throw new Error("這組 Token 沒有寫入權限，請確認 Token 設定");
      }
      return true;
    });
  }

  window.GithubAPI = {
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    getFile: getFile,
    putTextFile: putTextFile,
    putBinaryFile: putBinaryFile,
    verifyToken: verifyToken
  };
})();
