import os
from collections import deque
from PIL import Image

def clean_white_cavities(img_path, is_cult_leader=False):
    img = Image.open(img_path).convert('RGBA')
    w, h = img.size
    pixels = img.load()

    def is_white(x, y):
        r, g, b, a = pixels[x, y]
        if a < 30: return False
        # White background is bright (>225) and neutral (|r-g| < 20 and |r-b| < 20)
        return r > 225 and g > 225 and b > 225 and abs(r - g) < 20 and abs(r - b) < 20 and abs(g - b) < 20

    visited = set()
    to_clear = set()

    for y in range(h):
        for x in range(w):
            if (x, y) not in visited and is_white(x, y):
                comp = []
                queue = deque([(x, y)])
                visited.add((x, y))
                while queue:
                    cx, cy = queue.popleft()
                    comp.append((cx, cy))
                    for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited and is_white(nx, ny):
                            visited.add((nx, ny))
                            queue.append((nx, ny))
                
                # Check if this component is the eye pupil highlight in cult leader
                avg_x = sum(p[0] for p in comp) / len(comp)
                avg_y = sum(p[1] for p in comp) / len(comp)
                if is_cult_leader and (150 < avg_x < 210 and 130 < avg_y < 180):
                    print(f'Preserving pupil highlight in {img_path} at ({avg_x:.1f}, {avg_y:.1f})')
                    continue
                
                for pt in comp:
                    to_clear.add(pt)

    # Clear cavities
    for x, y in to_clear:
        pixels[x, y] = (0, 0, 0, 0)

    # 1-pixel boundary defringe for the newly cleared cavities
    fringe_cleared = 0
    for x, y in list(to_clear):
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in to_clear:
                r, g, b, a = pixels[nx, ny]
                if a > 0 and r > 210 and g > 210 and b > 210:
                    pixels[nx, ny] = (0, 0, 0, 0)
                    fringe_cleared += 1

    img.save(img_path, 'PNG')
    print(f'Saved {img_path}: cleared {len(to_clear)} cavity pixels + {fringe_cleared} fringe pixels')

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")

    targets = [
        ("title_role_sailor.png", False),
        ("title_role_pirate.png", False),
        ("title_role_cult_leader.png", False),
        ("title_role_cultist.png", False),
        ("emblem_sailor.png", False),
        ("emblem_pirate.png", False),
        ("emblem_cult_leader.png", True),
        ("emblem_cultist.png", False),
        ("icon_flintlock_pistol.png", False),
    ]

    for filename, is_cl in targets:
        full_path = os.path.join(sprites_dir, filename)
        if os.path.exists(full_path):
            clean_white_cavities(full_path, is_cult_leader=is_cl)

if __name__ == "__main__":
    main()
