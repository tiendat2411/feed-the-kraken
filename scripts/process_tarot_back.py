import os
from collections import deque
from PIL import Image, ImageFilter

def process_tarot_back():
    mockup_path = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\ee889917-0fa7-4ddf-b436-406bd887f6ae\card_tarot_back_parchment_mockup_1788443217971.jpg"
    dest_path = r"d:\PersonaPropjects\Feed The Kurumeo\feed-the-kraken\frontend\src\assets\ui\frames\card_tarot_back.png"

    img = Image.open(mockup_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Find the outer white boundary via BFS
    visited = set()
    queue = deque()

    threshold = 230

    def is_outer_white(x, y):
        r, g, b, _ = pixels[x, y]
        return r > threshold and g > threshold and b > threshold

    for x in range(width):
        if is_outer_white(x, 0) and (x, 0) not in visited:
            visited.add((x, 0))
            queue.append((x, 0))
        if is_outer_white(x, height - 1) and (x, height - 1) not in visited:
            visited.add((x, height - 1))
            queue.append((x, height - 1))

    for y in range(height):
        if is_outer_white(0, y) and (0, y) not in visited:
            visited.add((0, y))
            queue.append((0, y))
        if is_outer_white(width - 1, y) and (width - 1, y) not in visited:
            visited.add((width - 1, y))
            queue.append((width - 1, y))

    neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in neighbors:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited and is_outer_white(nx, ny):
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    # Create crisp alpha mask
    mask = Image.new("L", (width, height), 255)
    mask_pixels = mask.load()
    for x, y in visited:
        mask_pixels[x, y] = 0

    img.putalpha(mask)

    # Crop tightly to card
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Cropped to bbox: {bbox}, new size: {img.size}")

    # Check target size of front card
    front_path = r"d:\PersonaPropjects\Feed The Kurumeo\feed-the-kraken\frontend\src\assets\ui\frames\card_tarot_front.png"
    front_img = Image.open(front_path)
    target_w, target_h = front_img.size
    print(f"Front card size: {target_w}x{target_h}")

    # Resize using high quality Lanczos filter
    final_card = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    final_card.save(dest_path, "PNG", optimize=True)
    print(f"Saved extracted tarot back to {dest_path} with size {final_card.size}")

if __name__ == "__main__":
    process_tarot_back()
