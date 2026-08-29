import os
from PIL import Image
from collections import deque

def remove_all_inner_and_outer_white(img, threshold=230):
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    visited = [[False for _ in range(h)] for _ in range(w)]

    # 1. Standard outer boundary queue
    q = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
        visited[x][0] = True
        visited[x][h - 1] = True

    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
        visited[0][y] = True
        visited[w - 1][y] = True

    # 2. Also add any white pixel in the left 25% of the image (the wheel area) to ensure internal wheel pockets get cleared
    for x in range(int(w * 0.25)):
        for y in range(h):
            r, g, b, a = pixels[x, y]
            if r > threshold and g > threshold and b > threshold and not visited[x][y]:
                # Check if it's white pocket
                q.append((x, y))
                visited[x][y] = True

    bg_mask = [[False for _ in range(h)] for _ in range(w)]

    while q:
        cx, cy = q.popleft()
        r, g, b, a = pixels[cx, cy]
        if r > threshold and g > threshold and b > threshold:
            bg_mask[cx][cy] = True
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    q.append((nx, ny))

    for x in range(w):
        for y in range(h):
            if bg_mask[x][y]:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                is_edge = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and bg_mask[nx][ny]:
                        is_edge = True
                        break
                if is_edge:
                    r, g, b, a = pixels[x, y]
                    if r > threshold - 20 and g > threshold - 20 and b > threshold - 20:
                        avg = (r + g + b) / 3.0
                        alpha = int(max(0, (255 - avg) / (255 - threshold + 20)) * 255)
                        pixels[x, y] = (r, g, b, alpha)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def fix_helm():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    buttons_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "buttons")

    plates_raw = os.path.join(brain_dir, "lobby_ui_plates_1787924437061.jpg")
    p_img = Image.open(plates_raw)
    pw, ph = p_img.size

    # Helm button is at bottom Y: 510 to 768
    helm_crop = p_img.crop((0, 510, pw, ph))
    helm_clean = remove_all_inner_and_outer_white(helm_crop, threshold=232)

    helm_out = os.path.join(buttons_dir, "button_helm_gold.png")
    helm_clean.save(helm_out, "PNG")
    print(f"Clean Helm Button saved: {helm_out} ({helm_clean.size})")

if __name__ == "__main__":
    fix_helm()
