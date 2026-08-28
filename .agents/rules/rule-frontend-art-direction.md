# QUY TẮC BẮT BUỘC VỀ THIẾT KẾ VÀ PHÁT TRIỂN GIAO DIỆN (UI/UX & ART DIRECTION RULES)

## 1. Nguyên Tắc Cốt Lõi (Core Principles)
- **Tuân thủ Tuyệt đối Art Direction Guide:** Khi triển khai bất kỳ mã nguồn giao diện (HTML/CSS/JSX/Tailwind), linh kiện (Component) hoặc trang (Page) nào trong Frontend, AI **BẮT BUỘC PHẢI TUÂN THỦ 100%** tài liệu đặc tả nghệ thuật tại:
  - [art-direction-guide.md](file:///d:/PersonaPropjects/Feed/The/Kurumeo/feed-the-kraken/spec/features/007-frontend-ui-revamp/art-direction-guide.md)
  - Toàn bộ hồ sơ đặc tả Feature 007 (`spec.md`, `entities/ENT-007-Theme-Tokens.md`, `UC-021`, `UC-022`, `UC-023`).
  - Kế hoạch triển khai (Implementation Plan / Phase 9 trong `task.md`).
  - Quy trình SOP thực hiện task và kích hoạt skills tại: [rule-ui-revamp-sop.md](file:///d:/PersonaPropjects/Feed/The/Kurumeo/feed-the-kraken/.agents/rules/rule-ui-revamp-sop.md).
- **Triết lý Thẩm mỹ "Eldritch Parchment":** Ngôn ngữ thiết kế chủ đạo là sự hòa trộn giữa **Don't Starve Together × Lovecraftian Sea Horror × Gothic Sketchbook** (Ánh nến trong vực thẳm đại dương, bề mặt gỗ mục phong hóa, giấy da dê cổ ố vàng, điểm xuyết sắc xanh rêu verdigris/moss).

---

## 2. Các Ràng Buộc Thị Giác Bắt Buộc (Mandatory Visual Constraints)

### 2.1 Bảng Màu & Ánh Sáng (Palette & Lighting)
- **Palette nền tảng:** Sử dụng chuẩn mã màu `--abyss` (`#0A0A08`), `--hull-dark` (`#1A1510`), `--hull` (`#2A2118`), `--hull-light` (`#3D3228`), `--parchment` (`#D4C5A0`), `--parchment-dim` (`#9B8E72`), `--parchment-bright` (`#F0E6CC`).
- **Sắc xanh phong hóa (Verdigris & Moss):** Sử dụng `--verdigris` (`#4A7A6A`), `--verdigris-glow` (`#6BA89A`), `--moss` (`#3A5A3A`), `--seaweed` (`#5A8A5A`) cho các chi tiết biển, viền rêu, và indicator trạng thái.
- **Sắc phe phái cổ xưa:** Sailor (`#4A7A8C`), Pirate (`#A83B2A`), Cult (`#6B3FA0`) phải mang cảm giác bột màu cổ/mực phai, tuyệt đối không dùng màu neon.
- **Ánh sáng:** Tương phản cực mạnh giữa ánh sáng ấm (nến/lửa `--firelight` `#E8A63E`, `--gold` `#C9A84C`) và bóng tối bao quanh.
- **Vignette:** Bắt buộc áp dụng lớp phủ tối viền toàn cục (global dark vignette) trên toàn bộ viewport.

### 2.2 Kiểu Chữ (Typography - Đồng bộ 100% Font 'Pirata One')
Toàn bộ dự án sử dụng duy nhất font Gothic hải tặc **`'Pirata One'`** làm kiểu chữ chủ đạo để tạo sự đồng bộ nhận diện cổ kính, huyền bí:
- **Game Title & Display:** `'Pirata One'`, `'Georgia'`, `serif` (cỡ lớn, drop-shadow vàng đồng/firelight).
- **Heading / Phase / Role Names:** `'Pirata One'`, `'Georgia'`, `serif` (tracking-wider).
- **Body / Status / Buttons / Input Labels:** `'Pirata One'`, `'Georgia'`, `serif` (tracking-wide, drop-shadow nổi khối).
- **Cấm:** Tuyệt đối không dùng font mặc định browser hoặc các font sans-serif hiện đại trơn lùi (như Inter, Roboto, Arial, Helvetica).

### 2.3 Chất Liệu Bề Mặt (Surfaces & Textures)
- **Không bao giờ phẳng lì:** Mọi panel, card, input và modal phải có texture bề mặt (thớ gỗ mục `.panel-wood`, da dê cổ sần sùi `.card-parchment`, vệt ố `.aged-stain`, đinh sắt gỉ).
- **Corner Radius:** Sử dụng góc sắc/thô (`rounded` 4px hoặc `rounded-sm` 2px). Nút bấm tối đa `rounded-md` (6px).

### 2.4 Chuyển Động & Hiệu Ứng (Motion & Effects)
- Chuyển động phải nặng nề, chậm rãi, có trọng lượng (như tàu dập dềnh `shipBob`, lật thẻ 3D `600ms`, rung nổ súng `gunShake`, lửa chập chờn `candleFlicker`).
- Tuân thủ khả năng tiếp cận (`prefers-reduced-motion` phải tắt các hoạt cảnh rung lắc hoặc 3D phức tạp).

---

## 3. Danh Sách Nghiêm Cấm Tuyệt Đối (Strict DON'Ts)

1. ❌ **CẤM Tự ý code giao diện khi chưa có Mockup (Track B) hoặc Bản đề xuất Token (Track A) được User duyệt và chốt.**
2. ❌ **CẤM Chỉ dùng CSS thuần (border, box-shadow) để giả lập chất liệu hữu cơ (mép giấy rách, vân gỗ nứt, ngọn nến) mà không qua Asset Generation.**
3. ❌ **CẤM Sử dụng asset có viền/hộp nền đen hoặc trắng chưa tách phông (non-transparent assets)** — Bắt buộc phải qua bước tách phông thành file PNG trong suốt (`scripts/remove_background.py`) trước khi nạp vào giao diện.
4. ❌ **CẤM Glassmorphism / Backdrop-blur bóng bẩy kiểu Apple / Linear.**
5. ❌ **CẤM Màu Gradient Neon AI mặc định (tím xanh rực rỡ).**
6. ❌ **CẤM Góc bo tròn lớn (`rounded-2xl`, `rounded-3xl`, `rounded-full` cho card/panel).**
7. ❌ **CẤM Màu trắng tinh khiết (`#FFFFFF`)** — Màu sáng nhất cho phép là `--parchment-bright` (`#F0E6CC`).
8. ❌ **CẤM Chấm trạng thái xanh lá cây neon** — Bắt buộc dùng `--verdigris` (`#4A7A6A`).
9. ❌ **CẤM Animation nảy lò xo (bouncy/spring)** — Chuyển động phải có độ trễ và sức nặng.
10. ❌ **CẤM Bề mặt đơn sắc phẳng lì không có texture/chiều sâu.**
