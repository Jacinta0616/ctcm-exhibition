(function () {
  "use strict";

  var DATA_PATH = "data/boards.json";

  var tokenPanel = document.getElementById("token-panel");
  var tokenInput = document.getElementById("token-input");
  var tokenLoginBtn = document.getElementById("token-login-btn");
  var tokenStatus = document.getElementById("token-status");
  var adminActions = document.getElementById("admin-actions");
  var logoutBtn = document.getElementById("logout-btn");
  var boardList = document.getElementById("board-list");

  var currentData = null; // { title, boards: [...] }

  function setTokenStatus(msg, type) {
    tokenStatus.textContent = msg || "";
    tokenStatus.className = "status-line" + (type ? " " + type : "");
  }

  function setRowStatus(el, msg, type) {
    el.textContent = msg || "";
    el.className = "status-line" + (type ? " " + type : "");
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function init() {
    var saved = window.GithubAPI.getToken();
    if (saved) {
      tokenInput.value = saved;
      tryLogin(saved, true);
    }
  }

  function tryLogin(token, silent) {
    setTokenStatus("驗證 Token 中…");
    window.GithubAPI.setToken(token);
    window.GithubAPI.verifyToken()
      .then(function () {
        setTokenStatus("登入成功", "ok");
        adminActions.style.display = "";
        loadBoards();
      })
      .catch(function (err) {
        window.GithubAPI.clearToken();
        adminActions.style.display = "none";
        boardList.innerHTML = "";
        if (!silent) {
          setTokenStatus(err.message, "error");
        } else {
          setTokenStatus("尚未登入，請貼上 Token", null);
        }
      });
  }

  tokenLoginBtn.addEventListener("click", function () {
    var token = tokenInput.value.trim();
    if (!token) {
      setTokenStatus("請先貼上 Token", "error");
      return;
    }
    tryLogin(token, false);
  });

  logoutBtn.addEventListener("click", function () {
    window.GithubAPI.clearToken();
    tokenInput.value = "";
    adminActions.style.display = "none";
    boardList.innerHTML = "";
    setTokenStatus("已登出", null);
  });

  function loadBoards() {
    boardList.innerHTML = '<div class="loading">展板資料載入中…</div>';
    window.GithubAPI.getFile(DATA_PATH)
      .then(function (result) {
        if (!result.text) throw new Error("找不到 data/boards.json，請確認 repo 設定是否正確");
        currentData = JSON.parse(result.text);
        renderList();
      })
      .catch(function (err) {
        boardList.innerHTML = '<div class="status-line error">' + escapeHtml(err.message) + "</div>";
      });
  }

  function renderList() {
    var boards = currentData.boards.slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });
    boardList.innerHTML = "";
    boards.forEach(function (board, idx) {
      var type = board.type || "image";
      var typeFieldsHtml;
      if (type === "video") {
        typeFieldsHtml =
          "<label>影片位置（YouTube 網址／Google Drive 分享連結／檔案路徑，尚未決定可留空）</label>" +
          '<input type="text" class="extra-input" data-field="video" value="' + escapeHtml(board.video || "") + '" placeholder="https://youtu.be/xxxx 或 assets/video/' + board.id + '.mp4">';
      } else if (type === "game") {
        typeFieldsHtml =
          "<label>互動遊戲網址</label>" +
          '<input type="text" class="extra-input" data-field="url" value="' + escapeHtml(board.url || "") + '" placeholder="https://...">';
      } else {
        typeFieldsHtml =
          "<label>語音介紹</label>" +
          '<div class="audio-row">' +
            '<span class="audio-name">' + (board.audio ? escapeHtml(board.audio.split("/").pop()) : "尚未上傳") + '</span>' +
          "</div>" +
          '<div class="audio-row"><input type="file" accept="audio/*" class="audio-input"></div>';
      }

      var row = document.createElement("div");
      row.className = "admin-board";
      row.innerHTML =
        '<div class="order-btns">' +
          '<button type="button" data-act="up" ' + (idx === 0 ? "disabled" : "") + '>▲</button>' +
          '<button type="button" data-act="down" ' + (idx === boards.length - 1 ? "disabled" : "") + '>▼</button>' +
        "</div>" +
        '<div class="thumb-wrap"><img src="' + (board.thumb || board.image) + '" alt=""></div>' +
        '<div class="fields">' +
          "<label>展板顯示名稱" + (type !== "image" ? "（類型：" + (type === "video" ? "影片" : "互動遊戲") + "）" : "") + "</label>" +
          '<input type="text" class="name-input" value="' + escapeHtml(board.name) + '">' +
          typeFieldsHtml +
          '<div class="row-actions">' +
            '<button type="button" class="btn save-btn">儲存這個展板</button>' +
          "</div>" +
          '<div class="status-line row-status"></div>' +
        "</div>";

      row.querySelector('[data-act="up"]').addEventListener("click", function () {
        moveBoard(board.id, -1);
      });
      row.querySelector('[data-act="down"]').addEventListener("click", function () {
        moveBoard(board.id, 1);
      });
      row.querySelector(".save-btn").addEventListener("click", function () {
        saveBoard(board.id, row);
      });

      boardList.appendChild(row);
    });
  }

  function moveBoard(id, direction) {
    var boards = currentData.boards.slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });
    var idx = boards.findIndex(function (b) { return b.id === id; });
    var swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= boards.length) return;

    var tmp = boards[idx].order;
    boards[idx].order = boards[swapIdx].order;
    boards[swapIdx].order = tmp;

    currentData.boards = boards;
    persist("調整展板順序").then(function () {
      renderList();
    }).catch(function (err) {
      alert("排序儲存失敗：" + err.message);
    });
  }

  function saveBoard(id, row) {
    var nameInput = row.querySelector(".name-input");
    var audioInput = row.querySelector(".audio-input");
    var extraInput = row.querySelector(".extra-input");
    var rowStatus = row.querySelector(".row-status");
    var saveBtn = row.querySelector(".save-btn");

    var board = currentData.boards.find(function (b) { return b.id === id; });
    if (!board) return;

    saveBtn.disabled = true;
    setRowStatus(rowStatus, "儲存中…");

    var newName = nameInput.value.trim() || board.name;
    var file = audioInput ? audioInput.files[0] : null;

    var uploadPromise;
    if (file) {
      var ext = (file.name.split(".").pop() || "mp3").toLowerCase();
      var audioPath = "assets/audio/" + id + "." + ext;
      setRowStatus(rowStatus, "上傳語音檔中…");
      uploadPromise = window.GithubAPI.putBinaryFile(audioPath, file, "上傳「" + newName + "」語音介紹")
        .then(function () {
          board.audio = audioPath;
        });
    } else {
      uploadPromise = Promise.resolve();
    }

    uploadPromise
      .then(function () {
        board.name = newName;
        if (extraInput) {
          board[extraInput.dataset.field] = extraInput.value.trim();
        }
        setRowStatus(rowStatus, "更新展板資料中…");
        return persist("更新展板「" + newName + "」");
      })
      .then(function () {
        setRowStatus(rowStatus, "已儲存 ✓", "ok");
        renderList();
      })
      .catch(function (err) {
        setRowStatus(rowStatus, "儲存失敗：" + err.message, "error");
      })
      .finally(function () {
        saveBtn.disabled = false;
      });
  }

  function persist(message) {
    return window.GithubAPI.getFile(DATA_PATH).then(function (existing) {
      var text = JSON.stringify(currentData, null, 2);
      return window.GithubAPI.putTextFile(DATA_PATH, text, message, existing.sha);
    });
  }

  init();
})();
