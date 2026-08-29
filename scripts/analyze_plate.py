import os
from PIL import Image

def analyze_crew_plate():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    plates_raw = os.path.join(brain_dir, "lobby_ui_plates_1787924437061.jpg")
    p_img = Image.open(plates_raw)
    pw, ph = p_img.size

    # Crop crew plate Y: 275 to 485
    crew_crop = p_img.crop((0, 275, pw, 485))
    w, h = crew_crop.size

    # Save to examine
    debug_plate_path = os.path.join(brain_dir, "debug_crew_plate_raw.png")
    crew_crop.save(debug_plate_path)

    # Let's find the green gem in this crop (only looking in right 30% of image, X > 0.7 * w)
    pixels = crew_crop.convert("RGB").load()
    green_pts = []
    for x in range(int(w * 0.7), w):
        for y in range(h):
            r, g, b = pixels[x, y]
            if g > 60 and g > r * 1.15 and g > b * 0.95:
                green_pts.append((x, y))

    xs = [p[0] for p in green_pts]
    ys = [p[1] for p in green_pts]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    cx = (min_x + max_x) / 2.0
    cy = (min_y + max_y) / 2.0
    rx = (max_x - min_x) / 2.0
    ry = (max_y - min_y) / 2.0

    print(f"Crew plate raw crop size: {w} x {h}")
    print(f"Green Gem Bounding Box in raw crop: X=[{min_x}, {max_x}], Y=[{min_y}, {max_y}]")
    print(f"Centroid: ({cx}, {cy}), Radii: rx={rx}, ry={ry}")

if __name__ == "__main__":
    analyze_crew_plate()
