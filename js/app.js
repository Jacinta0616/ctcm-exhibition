(function () {
  "use strict";

  var homeView = document.getElementById("home-view");
  var detailView = document.getElementById("detail-view");
  var boardGrid = document.getElementById("board-grid");
  var backBtn = document.getElementById("back-btn");
  var detailTitle = document.getElementById("detail-title");
  var detailBody = document.getElementById("detail-body");
  var siteTitle = document.getElementById("site-title");

  var boardsById = {};

  function loadBoards() {
    fetch("data/boards.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("讀取失敗");
        return res.json();
      })
      .then(function (data) {
        if (data.title) {
          siteTitle.textContent = data.title;
          document.title = data.title;
        }
        var boards = (data.boards || []).slice().sort(function (a, b) {
          return (a.order || 0) - (b.order || 0);
        });
        renderGrid(boards);
        boards.forEach(function (b) {
          boardsById[b.id] = b;
        });
        handleRoute();
      })
      .catch(function () {
        boardGrid.innerHTML = '<div class="empty-msg">展板資料載入失敗，請重新整理頁面</div>';
      });
  }

  function renderGrid(boards) {
    if (!boards.length) {
      boardGrid.innerHTML = '<div class="empty-msg">目前尚未設定展板</div>';
      return;
    }
    boardGrid.innerHTML = "";
    boards.forEach(function (b) {
      var card = document.createElement("div");
      card.className = "board-card";
      card.innerHTML =
        '<div class="thumb-wrap"><img src="' + (b.thumb || b.image) + '" alt="' + escapeHtml(b.name) + '" loading="lazy"></div>' +
        '<div class="board-name">' + escapeHtml(b.name) + "</div>";
      card.addEventListener("click", function () {
        location.hash = "#" + encodeURIComponent(b.id);
      });
      boardGrid.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // 把 YouTube / Google Drive 分享連結轉成可嵌入的 embed 網址
  function toEmbedUrl(url) {
    if (!url) return null;
    var yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]+)/);
    if (yt) return "https://www.youtube.com/embed/" + yt[1];
    var drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (drive) return "https://drive.google.com/file/d/" + drive[1] + "/preview";
    return url;
  }

  function isDirectVideoFile(url) {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }

  function showDetail(board) {
    detailTitle.textContent = board.name;
    var type = board.type || "image";

    if (type === "video") {
      renderVideoDetail(board);
    } else if (type === "game") {
      renderGameDetail(board);
    } else {
      renderImageDetail(board);
    }

    homeView.style.display = "none";
    detailView.classList.add("active");
    window.scrollTo(0, 0);
  }

  function renderImageDetail(board) {
    detailBody.innerHTML =
      '<div class="detail-image-wrap"><img id="detail-image" src="' + board.image + '" alt="' + escapeHtml(board.name) + '"></div>' +
      '<div class="audio-bar" id="audio-bar"></div>';

    var audioBar = document.getElementById("audio-bar");
    if (board.audio) {
      audioBar.innerHTML = '<audio controls preload="none" src="' + board.audio + '"></audio>';
      var audioEl = audioBar.querySelector("audio");
      audioEl.play().catch(function () {
        /* 需要使用者手動按播放，屬正常瀏覽器行為 */
      });
    } else {
      audioBar.innerHTML = '<span class="no-audio">這個展板尚未上傳語音介紹</span>';
    }
  }

  function renderVideoDetail(board) {
    if (!board.video) {
      detailBody.innerHTML = '<div class="empty-msg">這個展板尚未設定影片</div>';
      return;
    }
    if (isDirectVideoFile(board.video)) {
      detailBody.innerHTML =
        '<div class="video-wrap"><video controls playsinline src="' + board.video + '"></video></div>';
    } else {
      var embed = toEmbedUrl(board.video);
      detailBody.innerHTML =
        '<div class="video-wrap"><iframe src="' + embed + '" allow="autoplay; fullscreen" allowfullscreen></iframe></div>';
    }
  }

  function renderGameDetail(board) {
    if (!board.url) {
      detailBody.innerHTML = '<div class="empty-msg">這個展板尚未設定遊戲連結</div>';
      return;
    }
    detailBody.innerHTML =
      '<div class="game-wrap">' +
        '<iframe src="' + board.url + '" allow="autoplay; fullscreen" allowfullscreen></iframe>' +
      "</div>" +
      '<div class="game-actions"><a class="btn-link" href="' + board.url + '" target="_blank" rel="noopener">在新視窗開啟遊戲 ↗</a></div>';
  }

  function showHome() {
    homeView.style.display = "";
    detailView.classList.remove("active");
    var audioEl = detailBody.querySelector("audio");
    if (audioEl) audioEl.pause();
    detailBody.innerHTML = "";
    window.scrollTo(0, 0);
  }

  function handleRoute() {
    var id = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (id && boardsById[id]) {
      showDetail(boardsById[id]);
    } else {
      showHome();
    }
  }

  backBtn.addEventListener("click", function () {
    location.hash = "";
  });

  window.addEventListener("hashchange", handleRoute);

  loadBoards();
})();
