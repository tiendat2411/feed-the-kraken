import os
from PIL import Image
from collections import deque

def clean_outer_background_only(input_path, output_path, threshold=25):
    """
    Chỉ xóa nền đen bên ngoài bao quanh asset (flood-fill từ viền ngoài).
    Giữ nguyên vẹn 100% chi tiết bên trong (lòng máng, hoa văn kim loại, bóng đổ).
    """
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    visited = [[False for _ in range(h)] for _ in range(w)]
    q = deque()

    # Enqueue tất cả các pixel trên 4 cạnh biên ngoài
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

    bg_mask = [[False for _ in range(h)] for _ in range(w)]

    while q:
        cx, cy = q.popleft()
        r, g, b, a = pixels[cx, cy]
        brightness = (r + g + b) / 3.0

        # Nếu pixel là màu đen nền ngoài
        if brightness < threshold:
            bg_mask[cx][cy] = True
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    q.append((nx, ny))

    # Áp dụng độ trong suốt cho vùng nền ngoài
    for x in range(w):
        for y in range(h):
            if bg_mask[x][y]:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                # Soft edge feathering cho viền ngoài
                is_edge = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and bg_mask[nx][ny]:
                        is_edge = True
                        break
                if is_edge:
                    r, g, b, a = pixels[x, y]
                    brightness = (r + g + b) / 3.0
                    if brightness < threshold + 10:
                        alpha = int((brightness / (threshold + 10)) * 255)
                        pixels[x, y] = (r, g, b, alpha)

    # Autocrop sát viền
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Processed cleanly: {output_path} (Size: {img.size})")

if __name__ == "__main__":
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ui_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui")

    # Clean new Brass Gold Input Slot
    input_in = os.path.join(brain_dir, "input_slot_brass_gold_1787919840299.jpg")
    input_out = os.path.join(ui_dir, "frames", "input_wood_slot_clean.png")
    clean_outer_background_only(input_in, input_out, threshold=25)
