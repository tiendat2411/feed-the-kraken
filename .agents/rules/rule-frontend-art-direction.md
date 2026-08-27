# QUY TẮC BẮT BUỘC VỀ THIẾT KẾ VÀ PHÁT TRIỂN GIAO DIỆN (UI/UX & ART DIRECTION RULES)

## 1. Nguyên Tắc Cốt Lõi (Core Principles)
- **Tuân thủ Tuyệt đối Art Direction Guide:** Khi triển khai bất kỳ mã nguồn giao diện (HTML/CSS/JSX/Tailwind), linh kiện (Component) hoặc trang (Page) nào trong Frontend, AI **BẮT BUỘC PHẢI TUÂN THỦ 100%** tài liệu đặc tả nghệ thuật tại:
  - [art-direction-guide.md](file:///d:/PersonaPropjects/Feed/The/Kurumeo/feed-the-kraken/spec/features/007-frontend-ui-revamp/art-direction-guide.md)
  - Toàn bộ hồ sơ đặc tả Feature 007 (`spec.md`, `entities/ENT-007-Theme-Tokens.md`, `UC-021`, `UC-022`, `UC-023`).
  - Kế hoạch triển khai (Implementation Plan / Phase 9 trong `task.md`).
- **Triết lý Thẩm mỹ "Eldritch Parchment":** Ngôn ngữ thiết kế chủ đạo là sự hòa trộn giữa **Don't Starve Together × Lovecraftian Sea Horror × Gothic Sketchbook** (Ánh nến trong vực thẳm đại dương, bề mặt gỗ mục phong hóa, giấy da dê cổ ố vàng, điểm xuyết sắc xanh rêu verdigris/moss).

---

## 2. Các Ràng Buộc Thị Giác Bắt Buộc (Mandatory Visual Constraints)

### 2.1 Bảng Màu & Ánh Sáng (Palette & Lighting)
- **Palette nền tảng:** Sử dụng chuẩn mã màu `--abyss` (`#0A0A08`), `--hull-dark` (`#1A1510`), `--hull` (`#2A2118`), `--hull-light` (`#3D3228`), `--parchment` (`#D4C5A0`), `--parchment-dim` (`#9B8E72`), `--parchment-bright` (`#F0E6CC`).
- **Sắc xanh phong hóa (Verdigris & Moss):** Sử dụng `--verdigris` (`#4A7A6A`), `--verdigris-glow` (`#6BA89A`), `--moss` (`#3A5A3A`), `--seaweed` (`#5A8A5A`) cho các chi tiết biển, viền rêu, và indicator trạng thái.
- **Sắc phe phái cổ xưa:** Sailor (`#4A7A8C`), Pirate (`#A83B2A`), Cult (`#6B3FA0`) phải mang cảm giác bột màu cổ/mực phai, tuyệt đối không dùng màu neon.
- **Ánh sáng:** Tương phản cực mạnh giữa ánh sáng ấm (nến/lửa `--firelight` `#E8A63E`, `--gold` `#C9A84C`) và bóng tối bao quanh.
- **Vignette:** Bắt buộc áp dụng lớp phủ tối viền toàn cục (global dark vignette) trên toàn bộ viewport.

### 2.2 Kiểu Chữ (Typography)
- **Display / Game Title:** `'Pirata One'`, `'Georgia'`, `serif` — Gothic hải tặc.
- **Heading / Phase / Role Names:** `'Cinzel'`, `'Times New Roman'`, `serif` — Cổ điển La Mã trang trọng.
- **Body / Status / Buttons:** `'Outfit'`, `sans-serif` — Hiện đại sắc nét, dễ đọc.
- **Cấm:** Không dùng font mặc định browser hoặc các font hiện đại trơn lùi (như Inter, Roboto, Arial, Helvetica) cho tiêu đề/heading.

### 2.3 Chất Liệu Bề Mặt (Surfaces & Textures)
- **Không bao giờ phẳng lì:** Mọi panel, card, input và modal phải có texture bề mặt (thớ gỗ mục `.panel-wood`, da dê cổ sần sùi `.card-parchment`, vệt ố `.aged-stain`, đinh sắt gỉ).
- **Corner Radius:** Sử dụng góc sắc/thô (`rounded` 4px hoặc `rounded-sm` 2px). Nút bấm tối đa `rounded-md` (6px).

### 2.4 Chuyển Động & Hiệu Ứng (Motion & Effects)
- Chuyển động phải nặng nề, chậm rãi, có trọng lượng (như tàu dập dềnh `shipBob`, lật thẻ 3D `600ms`, rung nổ súng `gunShake`, lửa chập chờn `candleFlicker`).
- Tuân thủ khả năng tiếp cận (`prefers-reduced-motion` phải tắt các hoạt cảnh rung lắc hoặc 3D phức tạp).

---

## 3. Danh Sách Nghiêm Cấm Tuyệt Đối (Strict DON'Ts)

1. ❌ **CẤM Glassmorphism / Backdrop-blur bóng bẩy kiểu Apple / Linear.**
2. ❌ **CẤM Màu Gradient Neon AI mặc định (tím xanh rực rỡ).**
3. ❌ **CẤM Góc bo tròn lớn (`rounded-2xl`, `rounded-3xl`, `rounded-full` cho card/panel).**
4. ❌ **CẤM Màu trắng tinh khiết (`#FFFFFF`)** — Màu sáng nhất cho phép là `--parchment-bright` (`#F0E6CC`).
5. ❌ **CẤM Chấm trạng thái xanh lá cây neon** — Bắt buộc dùng `--verdigris` (`#4A7A6A`).
6. ❌ **CẤM Animation nảy lò xo (bouncy/spring)** — Chuyển động phải có độ trễ và sức nặng.
7. ❌ **CẤM Bề mặt đơn sắc phẳng lì không có texture/chiều sâu.**

---

## 4. Quy Trình Tự Đánh Giá Khi Code UI (UI Implementation Self-Review)

Trước khi đánh dấu hoàn thành bất kỳ task UI nào trong `task.md` hoặc đề xuất commit, AI **BẮT BUỘC** phải tự kiểm tra:
1. **Kiểm tra Art Style:** Component vừa tạo/sửa có vi phạm bất kỳ mục nào trong danh sách DON'Ts không?
2. **Kiểm tra Token:** Màu sắc, font chữ và viền có sử dụng đúng Design Tokens đã cấu hình trong `tailwind.config.js` và `index.css` không?
3. **Kiểm tra Responsive:** Giao diện có hiển thị chuẩn từ Mobile (375px) đến Desktop (1920px+) mà không bị tràn viền (zero horizontal overflow) không?
4. **Bảo toàn Game Logic:** Đảm bảo không làm thay đổi hay ngắt quãng bất kỳ hàm xử lý state/socket/props nào của backend và core logic.
