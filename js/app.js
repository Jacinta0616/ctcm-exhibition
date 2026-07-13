(function () {
  "use strict";

  var homeView = document.getElementById("home-view");
  var detailView = document.getElementById("detail-view");
  var boardGrid = document.getElementById("board-grid");
  var backBtn = document.getElementById("back-btn");
  var detailTitle = document.getElementById("detail-title");
  var detailImage = document.getElementById("detail-image");
  var audioBar = document.getElementById("audio-bar");
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

  function showDetail(board) {
    detailTitle.textContent = board.name;
    detailImage.src = board.image;
    detailImage.alt = board.name;

    if (board.audio) {
      audioBar.innerHTML =
        '<audio controls preload="none" src="' + board.audio + '"></audio>';
      var audioEl = audioBar.querySelector("audio");
      audioEl.play().catch(function () {
        /* 需要使用者手動按播放，屬正常瀏覽器行為 */
      });
    } else {
      audioBar.innerHTML = '<span class="no-audio">這個展板尚未上傳語音介紹</span>';
    }

    homeView.style.display = "none";
    detailView.classList.add("active");
    window.scrollTo(0, 0);
  }

  function showHome() {
    homeView.style.display = "";
    detailView.classList.remove("active");
    var audioEl = audioBar.querySelector("audio");
    if (audioEl) audioEl.pause();
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
