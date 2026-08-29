import os
from PIL import Image

def inspect_plate():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    plates_raw = os.path.join(brain_dir, "lobby_ui_plates_1787924437061.jpg")
    p_img = Image.open(plates_raw)
    pw, ph = p_img.size
    print(f"Plates raw size: {pw} x {ph}")

    # The crew plate is in Y: 280 to 480
    # Let's save a crop of just the right 200px of the crew plate to inspect
    right_end = p_img.crop((pw - 250, 260, pw, 500))
    debug_path = os.path.join(brain_dir, "debug_right_gem_raw.png")
    right_end.save(debug_path)
    print(f"Saved raw right end crop to: {debug_path}")

if __name__ == "__main__":
    inspect_plate()
