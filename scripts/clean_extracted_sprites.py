import os
from PIL import Image
from collections import deque

def flood_fill_transparency(image_path, color_threshold=230):
    img = Image.open(image_path).convert("RGBA")
    w, h = img.size

    visited = [[False for _ in range(w)] for _ in range(h)]
    queue = deque()

    # Find edge pixels that are bright/white
    for x in range(w):
        for y in [0, h - 1]:
            r, g, b, a = img.getpixel((x, y))
            if r >= color_threshold and g >= color_threshold and b >= color_threshold:
                queue.append((x, y))
                visited[y][x] = True
    for y in range(h):
        for x in [0, w - 1]:
            r, g, b, a = img.getpixel((x, y))
            if r >= color_threshold and g >= color_threshold and b >= color_threshold and not visited[y][x]:
                queue.append((x, y))
                visited[y][x] = True

    # 4-direction flood fill
    while queue:
        cx, cy = queue.popleft()
        img.putpixel((cx, cy), (255, 255, 255, 0))

        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                r, g, b, a = img.getpixel((nx, ny))
                if r >= color_threshold and g >= color_threshold and b >= color_threshold:
                    visited[ny][nx] = True
                    queue.append((nx, ny))

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.save(image_path, "PNG")
    print(f"Cleaned and saved: {image_path} ({img.size})")

def main():
    frontend_dir = r"d:\PersonaPropjects\Feed The Kurumeo\feed-the-kraken\frontend\src\assets\ui"
    files = [
        os.path.join(frontend_dir, "frames", "compass_table_round.png"),
        os.path.join(frontend_dir, "sprites", "handle_drawer_brass.png"),
        os.path.join(frontend_dir, "sprites", "badge_lieutenant_medal.png"),
        os.path.join(frontend_dir, "sprites", "badge_navigator_compass.png"),
        os.path.join(frontend_dir, "sprites", "icon_silence_cut_tongue.png"),
        os.path.join(frontend_dir, "sprites", "icon_offduty_waves.png"),
    ]

    for f in files:
        if os.path.exists(f):
            flood_fill_transparency(f, color_threshold=230)

if __name__ == "__main__":
    main()
