import os
from PIL import Image
from collections import deque

def extract_hat():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    src_path = os.path.join(brain_dir, "badge_captain_hat_1788160963913.jpg")
    out_path = r"d:\PersonaPropjects\Feed The Kurumeo\feed-the-kraken\frontend\src\assets\ui\sprites\badge_captain_hat.png"

    img = Image.open(src_path).convert("RGBA")
    w, h = img.size

    # Flood fill from edges for color >= 235
    visited = [[False for _ in range(w)] for _ in range(h)]
    queue = deque()

    for x in range(w):
        for y in [0, h - 1]:
            r, g, b, a = img.getpixel((x, y))
            if r >= 235 and g >= 235 and b >= 235:
                queue.append((x, y))
                visited[y][x] = True

    for y in range(h):
        for x in [0, w - 1]:
            r, g, b, a = img.getpixel((x, y))
            if r >= 235 and g >= 235 and b >= 235 and not visited[y][x]:
                queue.append((x, y))
                visited[y][x] = True

    while queue:
        cx, cy = queue.popleft()
        img.putpixel((cx, cy), (255, 255, 255, 0))

        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                r, g, b, a = img.getpixel((nx, ny))
                if r >= 235 and g >= 235 and b >= 235:
                    visited[ny][nx] = True
                    queue.append((nx, ny))

    # Auto crop
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(out_path, "PNG")
    print(f"Extracted captain hat: {img.size} -> {out_path}")

if __name__ == "__main__":
    extract_hat()
