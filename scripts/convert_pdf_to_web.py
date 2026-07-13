import fitz
import glob
import os
import re

SRC_DIR = os.path.join(os.path.dirname(__file__), "..", "PDF")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "images")
THUMB_DIR = os.path.join(OUT_DIR, "thumbs")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)

LONG_EDGE_PX = 2400
JPEG_QUALITY = 82

THUMB_LONG_EDGE_PX = 480
THUMB_JPEG_QUALITY = 70

def board_id(filename):
    m = re.match(r"(4-\d+)", filename)
    return m.group(1) if m else os.path.splitext(filename)[0]

results = []
for path in sorted(glob.glob(os.path.join(SRC_DIR, "*.pdf"))):
    fname = os.path.basename(path)
    bid = board_id(fname)
    doc = fitz.open(path)
    page = doc[0]
    w_pt, h_pt = page.rect.width, page.rect.height
    long_pt = max(w_pt, h_pt)

    scale = LONG_EDGE_PX / long_pt
    mat = fitz.Matrix(scale, scale)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    out_path = os.path.join(OUT_DIR, f"{bid}.jpg")
    pix.save(out_path, jpg_quality=JPEG_QUALITY)
    size_kb = os.path.getsize(out_path) / 1024

    thumb_scale = THUMB_LONG_EDGE_PX / long_pt
    thumb_mat = fitz.Matrix(thumb_scale, thumb_scale)
    thumb_pix = page.get_pixmap(matrix=thumb_mat, alpha=False)
    thumb_path = os.path.join(THUMB_DIR, f"{bid}.jpg")
    thumb_pix.save(thumb_path, jpg_quality=THUMB_JPEG_QUALITY)
    thumb_kb = os.path.getsize(thumb_path) / 1024

    results.append((fname, bid, pix.width, pix.height, size_kb, thumb_kb))
    doc.close()

print(f"{'來源檔':40s} {'ID':8s} {'寬x高(px)':16s} {'原圖':>8s} {'縮圖':>8s}")
for fname, bid, w, h, kb, thumb_kb in results:
    print(f"{fname:40s} {bid:8s} {f'{w}x{h}':16s} {kb:7.0f}K {thumb_kb:7.0f}K")
