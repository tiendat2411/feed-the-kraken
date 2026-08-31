import os
from PIL import Image
from collections import deque

def clean_wood_slot():
    src_path = r"d:\PersonaPropjects\Feed The Kurumeo\feed-the-kraken\frontend\src\assets\ui\frames\input_wood_slot_clean.png"
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size

    # Flood fill from exterior to remove near-white edge pixels
    visited = [[False for _ in range(w)] for _ in range(h)]
    queue = deque()

    # Add all transparent borders and outer high-brightness pixels
    for x in range(w):
        for y in range(h):
            r, g, b, a = img.getpixel((x, y))
            if a == 0:
                queue.append((x, y))
                visited[y][x] = True

    # BFS expand to clean near-white/grey halo pixels connected to transparent background
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                r, g, b, a = img.getpixel((nx, ny))
                # If pixel is light grey / white halo (e.g. r, g, b > 180 or very pale parchment label outside)
                # Note that the center label plate has y in [0, 80] and x in [500, 750] - so keep interior label
                is_outer_side = (nx < 200 or nx > w - 200 or ny > h - 50)
                if (r > 190 and g > 190 and b > 190) and is_outer_side:
                    visited[ny][nx] = True
                    img.putpixel((nx, ny), (0, 0, 0, 0))
                    queue.append((nx, ny))
                elif a < 60:
                    visited[ny][nx] = True
                    img.putpixel((nx, ny), (0, 0, 0, 0))
                    queue.append((nx, ny))

    img.save(src_path, "PNG")
    print(f"Cleaned {src_path}")

if __name__ == "__main__":
    clean_wood_slot()
