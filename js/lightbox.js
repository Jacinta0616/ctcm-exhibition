// 展板圖片放大檢視：點兩下 / 兩指縮放、拖曳查看細節
(function () {
  "use strict";

  var overlay = document.getElementById("lightbox");
  var img = document.getElementById("lightbox-img");
  var closeBtn = document.getElementById("lightbox-close");

  var scale = 1;
  var tx = 0;
  var ty = 0;
  var MIN_SCALE = 1;
  var MAX_SCALE = 4;
  var DOUBLE_TAP_SCALE = 2.5;

  var pointers = {}; // 目前按住的手指/滑鼠
  var pinchStartDist = 0;
  var pinchStartScale = 1;
  var dragStart = null; // { x, y, tx, ty }
  var lastTapTime = 0;
  var downOnImage = false;
  var moved = false;

  function applyTransform() {
    img.style.transform = "translate(" + tx + "px, " + ty + "px) scale(" + scale + ")";
  }

  function resetTransform() {
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
  }

  function clampScale(s) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
  }

  function open(src, alt) {
    img.src = src;
    img.alt = alt || "";
    resetTransform();
    overlay.classList.remove("hidden");
  }

  function close() {
    overlay.classList.add("hidden");
    img.src = "";
    pointers = {};
  }

  function distance(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function pointerValues() {
    return Object.keys(pointers).map(function (k) { return pointers[k]; });
  }

  overlay.addEventListener("pointerdown", function (e) {
    if (e.target === closeBtn) return;
    overlay.setPointerCapture(e.pointerId);
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    moved = false;

    var pts = pointerValues();
    if (pts.length === 2) {
      pinchStartDist = distance(pts[0], pts[1]);
      pinchStartScale = scale;
      dragStart = null;
    } else if (pts.length === 1) {
      downOnImage = (e.target === img);
      dragStart = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };

      var now = Date.now();
      if (now - lastTapTime < 300) {
        // 雙擊：在原始大小與放大倍率間切換
        if (scale > MIN_SCALE + 0.05) {
          resetTransform();
        } else {
          scale = DOUBLE_TAP_SCALE;
          tx = 0;
          ty = 0;
          applyTransform();
        }
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    }
  });

  overlay.addEventListener("pointermove", function (e) {
    if (!(e.pointerId in pointers)) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var pts = pointerValues();

    if (pts.length === 2 && pinchStartDist > 0) {
      moved = true;
      var newDist = distance(pts[0], pts[1]);
      scale = clampScale(pinchStartScale * (newDist / pinchStartDist));
      applyTransform();
    } else if (pts.length === 1 && dragStart && scale > 1) {
      if (Math.abs(e.clientX - dragStart.x) > 3 || Math.abs(e.clientY - dragStart.y) > 3) {
        moved = true;
      }
      tx = dragStart.tx + (e.clientX - dragStart.x);
      ty = dragStart.ty + (e.clientY - dragStart.y);
      applyTransform();
    }
  });

  function endPointer(e) {
    delete pointers[e.pointerId];
    var pts = pointerValues();
    if (pts.length < 2) pinchStartDist = 0;

    if (pts.length === 1) {
      dragStart = { x: pts[0].x, y: pts[0].y, tx: tx, ty: ty };
    } else if (pts.length === 0) {
      dragStart = null;
      // 點到黑色背景（不是圖片本身）且沒有拖曳/縮放動作、目前也沒放大 → 視為「點外面關閉」
      if (!moved && !downOnImage && scale <= MIN_SCALE + 0.05) {
        close();
        return;
      }
      if (scale < MIN_SCALE + 0.05) resetTransform();
    }
  }

  overlay.addEventListener("pointerup", endPointer);
  overlay.addEventListener("pointercancel", endPointer);

  closeBtn.addEventListener("click", close);

  window.Lightbox = { open: open, close: close };
})();
