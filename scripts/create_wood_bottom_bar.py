import os
from PIL import Image, ImageOps

def create_bottom_bar():
    frames_dir = r"d:\PersonaPropjects\Feed The Kurumeo\feed-the-kraken\frontend\src\assets\ui\frames"
    header_path = os.path.join(frames_dir, "wood_header_bar.png")
    bottom_path = os.path.join(frames_dir, "wood_bottom_bar.png")

    if not os.path.exists(header_path):
        print(f"Header bar not found at {header_path}")
        return

    img = Image.open(header_path).convert("RGBA")
    # Flip vertically so the metal bracket corners hug the bottom of the screen
    flipped = ImageOps.flip(img)
    flipped.save(bottom_path, "PNG")
    print(f"Saved wood_bottom_bar.png: {flipped.size} -> {bottom_path}")

if __name__ == "__main__":
    create_bottom_bar()
