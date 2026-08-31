import os
from PIL import Image
from collections import deque

def clean_sound_on_perfect(threshold=220):
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")

    sheet_raw = os.path.join(brain_dir, "game_header_sprites_sheet_1787993009180.jpg")
    img = Image.open(sheet_raw)
    w, h = img.size
    hw, hh = w // 2, h // 2

    crop = img.crop((0, 0, hw, hh)).convert("RGBA")
    cw, ch = crop.size
    pixels = crop.load()

    # Flood fill starting from all 4 borders
    visited = [[False for _ in range(ch)] for _ in range(cw)]
    q = deque()

    for x in range(cw):
        q.append((x, 0))
        q.append((x, ch - 1))
        visited[x][0] = True
        visited[x][ch - 1] = True

    for y in range(ch):
        q.append((0, y))
        q.append((cw - 1, y))
        visited[0][y] = True
        visited[cw - 1][y] = True

    bg_mask = [[False for _ in range(ch)] for _ in range(cw)]

    while q:
        cx, cy = q.popleft()
        r, g, b, a = pixels[cx, cy]
        # Any light pixel connected to border is background
        if r > threshold and g > threshold and b > threshold:
            bg_mask[cx][cy] = True
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < cw and 0 <= ny < ch and not visited[nx][ny]:
                    visited[nx][ny] = True
                    q.append((nx, ny))

    for x in range(cw):
        for y in range(ch):
            if bg_mask[x][y]:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                # Also check if it's an isolated outer white artifact on the far right
                r, g, b, a = pixels[x, y]
                if x > cw * 0.7:
                    if r > 210 and g > 210 and b > 200:
                        # Soften/fade the outer sound wave edge to avoid hard white boundary
                        avg = (r + g + b) / 3.0
                        if avg > 230:
                            pixels[x, y] = (0, 0, 0, 0)

    # Check inner horn loop
    for x in range(int(cw * 0.25), int(cw * 0.45)):
        for y in range(int(ch * 0.55), int(ch * 0.95)):
            r, g, b, a = pixels[x, y]
            if r > threshold and g > threshold and b > threshold:
                pixels[x, y] = (0, 0, 0, 0)

    bbox = crop.getbbox()
    if bbox:
        crop = crop.crop(bbox)

    out_path = os.path.join(sprites_dir, "icon_sound_on.png")
    crop.save(out_path, "PNG")
    print(f"Clean Sound On saved: {out_path} ({crop.size})")

if __name__ == "__main__":
    clean_sound_on_perfect()
