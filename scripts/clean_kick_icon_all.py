import os
from PIL import Image
from collections import deque

def clean_all_white_pockets(img, threshold=230):
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # 1. Connected components flood fill for white pixels
    visited = [[False for _ in range(h)] for _ in range(w)]

    for x in range(w):
        for y in range(h):
            if visited[x][y]:
                continue
            r, g, b, a = pixels[x, y]
            if r > threshold and g > threshold and b > threshold:
                # Found a white region (either outer or enclosed pocket)
                component = []
                q = deque([(x, y)])
                visited[x][y] = True

                while q:
                    cx, cy = q.popleft()
                    component.append((cx, cy))
                    for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                            nr, ng, nb, na = pixels[nx, ny]
                            if nr > threshold and ng > threshold and nb > threshold:
                                visited[nx][ny] = True
                                q.append((nx, ny))

                # Make all pixels in this white region transparent
                for px, py in component:
                    pixels[px, py] = (0, 0, 0, 0)

    # Clean slight antialiased edges
    for x in range(w):
        for y in range(h):
            r, g, b, a = pixels[x, y]
            if a > 0:
                is_near_transparent = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and pixels[nx, ny][3] == 0:
                        is_near_transparent = True
                        break
                if is_near_transparent and r > threshold - 25 and g > threshold - 25 and b > threshold - 25:
                    avg = (r + g + b) / 3.0
                    alpha = int(max(0, (255 - avg) / (255 - threshold + 25)) * 255)
                    pixels[x, y] = (r, g, b, alpha)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def fix_kick_icon():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")

    icon_raw = os.path.join(brain_dir, "kick_player_icon_1787973590794.jpg")
    img = Image.open(icon_raw)
    clean = clean_all_white_pockets(img, threshold=230)

    out_path = os.path.join(sprites_dir, "icon_kick_skull.png")
    clean.save(out_path, "PNG")
    print(f"Clean Kick Icon saved: {out_path} ({clean.size})")

if __name__ == "__main__":
    fix_kick_icon()
