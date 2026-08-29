import os
from PIL import Image

def find_gem_centroid():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    crop_path = os.path.join(brain_dir, "debug_right_gem_raw.png")
    img = Image.open(crop_path).convert("RGB")
    w, h = img.size
    pixels = img.load()

    green_pts = []
    for x in range(w):
        for y in range(h):
            r, g, b = pixels[x, y]
            # Green gem detector
            if g > 70 and g > r * 1.15 and g > b * 0.95:
                green_pts.append((x, y))

    if not green_pts:
        print("No green pixels found!")
        return

    xs = [p[0] for p in green_pts]
    ys = [p[1] for p in green_pts]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    cx = (min_x + max_x) / 2.0
    cy = (min_y + max_y) / 2.0
    radius = (max_x - min_x) / 2.0

    print(f"Green Gem Bounding Box in debug crop: X=[{min_x}, {max_x}], Y=[{min_y}, {max_y}]")
    print(f"Centroid: ({cx}, {cy}), Diameter: {max_x - min_x}, Radius: {radius}")

if __name__ == "__main__":
    find_gem_centroid()
