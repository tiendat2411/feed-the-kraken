import os
import re
import sys

def find_vietnamese():
    # Set stdout encoding to utf-8
    sys.stdout.reconfigure(encoding='utf-8')
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frontend_src = os.path.join(base_dir, "frontend", "src")

    vn_regex = re.compile(r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]')

    results = {}

    for root, dirs, files in os.walk(frontend_src):
        for f in files:
            if f.endswith(('.js', '.jsx', '.html')):
                fpath = os.path.join(root, f)
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as file:
                    lines = file.readlines()
                    for idx, line in enumerate(lines, 1):
                        if vn_regex.search(line):
                            rel = os.path.relpath(fpath, frontend_src)
                            if rel not in results:
                                results[rel] = []
                            results[rel].append((idx, line.strip()))

    print(f"Files containing Vietnamese text: {len(results)}\n")
    for rel, line_list in results.items():
        print(f"=== {rel} ({len(line_list)} occurrences) ===")
        for lnum, lcontent in line_list[:8]:
            print(f"  Line {lnum}: {lcontent}")
        if len(line_list) > 8:
            print(f"  ... and {len(line_list) - 8} more lines")
        print()

if __name__ == "__main__":
    find_vietnamese()
