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

### 2.2 Kiểu Chữ & Ngôn Ngữ (Typography & 100% English Display Language)
Toàn bộ dự án sử dụng duy nhất font Gothic hải tặc **`'Pirata One'`** và **100% TIẾNG ANH (English - en-US)** làm ngôn ngữ hiển thị giao diện chính thức:
- **Game Title & Display:** `'Pirata One'`, `'Georgia'`, `serif` (cỡ lớn, drop-shadow vàng đồng/firelight).
- **Heading / Phase / Role Names:** `'Pirata One'`, `'Georgia'`, `serif` (100% English: `MUTINY VOTE`, `CAPTAIN DRAW`, `ROLE REVEAL`...).
- **Body / Status / Buttons / Input Labels:** `'Pirata One'`, `'Georgia'`, `serif` (100% English: `START VOYAGE`, `DISSOLVE ROOM`, `LEAVE ROOM`, `CREW QUARTERS`...).
- **Cấm:** Tuyệt đối không dùng font mặc định browser, sans-serif hiện đại, và không để sót bất kỳ văn bản tiếng Việt nào trên giao diện UI Frontend.

### 2.3 Chất Liệu Bề Mặt (Surfaces & Textures)
- **Không bao giờ phẳng lì:** Mọi panel, card, input và modal phải có texture bề mặt (thớ gỗ mục `.panel-wood`, da dê cổ sần sùi `.card-parchment`, vệt ố `.aged-stain`, đinh sắt gỉ).
- **Corner Radius:** Sử dụng góc sắc/thô (`rounded` 4px hoặc `rounded-sm` 2px). Nút bấm tối đa `rounded-md` (6px).

### 2.4 Đồng Bộ Phong Cách Nghệ Thuật Asset Tuyệt Đối (Mandatory Asset Art Style Consistency)
- **Hệ Quy Chiếu Đồng Bộ 100%:** Mọi Asset đồ họa (hình nền, sprite, texture, khung viền, phiến gỗ, thẻ giấy da, avatar, icon, nút bấm) khi được khởi tạo hoặc cập nhật cho dự án **BẮT BUỘC PHẢI ĐỒNG BỘ 100% ART STYLE** với các asset đã được chuẩn hóa và đang có sẵn trong dự án:
  - **Nét vẽ (Inking Style):** Nét mực đen gothic đậm chất phác thảo tay, kỹ thuật đánh bóng gạch chéo tỉ mỉ (*hand-drawn dark ink crosshatching*), viền rách mép tự nhiên theo phong cách *Don't Starve Together*.
  - **Chất liệu & Bề mặt (Materials):** Gỗ sồi phong hóa màu nâu ấm chạm khắc tinh xảo (`crew_plate_wood.png`, `wood_panel_clean.png`), kim loại đồng cổ đúc viền bọc góc rêu xanh verdigris (`wood_header_bar.png`), và giấy da dê cổ ố vàng đóng đinh sắt (`parchment_sheet_clean.png`, `parchment_nailed_plate.png`).
  - **Quy tắc Kiểm tra Đối chiếu (Pre-Asset Audit):** Trước khi đưa bất kỳ asset mới nào vào mã nguồn, AI bắt buộc phải đối chiếu trực quan với các asset mẫu có sẵn (`crew_plate_wood.png`, `button_helm_gold.png`, `parchment_sheet_clean.png`, `icon_kick_skull.png`) để đảm bảo tính đồng nhất 100% về độ tương phản, ánh sáng, nét vẽ và bảng màu.

### 2.5 Nghiêm Cấm Icon/Emoji Có Sẵn — Bắt Buộc 100% Custom Generated Graphic Assets (No Stock Icons / Unicode Emojis)
- **Cấm Tuyệt Đối Stock Icons & Unicode Emojis:** Nghiêm cấm hoàn toàn việc sử dụng bất kỳ icon có sẵn nào trên giao diện (ví dụ các emoji Unicode hệ thống như 👑, 🔫, 🧭, ⚓, 💀, 🎖️, 👁️, 🐙, 📜, 🪙, hoặc bộ icon vector phẳng stock từ các thư viện mặc định). Các emoji và icon có sẵn này mang phong cách phẳng/CGI hiện đại của hệ điều hành, làm phá vỡ hoàn toàn bầu không khí u ám cổ kính và tính nhất quán thị giác của game.
- **Bắt Buộc 100% Custom Generated Assets:** TẤT CẢ các biểu tượng chức vụ (Vương miện Thuyền trưởng, Huân chương Thuyền phó, La bàn Hoa tiêu), vũ khí (Súng lục flintlock), trạng thái (Nghỉ ca / Off-duty, Cắt lưỡi / Silenced, Online/Offline), ấn ký phe phái (Sailor, Pirate, Cult), rương gỗ, đồng tiền vàng... **BẮT BUỘC PHẢI ĐƯỢC GENERATE ĐỒ HỌA RIÊNG BIỆT 100%** theo chuẩn nghệ thuật *Eldritch Parchment* (nét mực phác thảo tay gothic hand-inked crosshatch, chất liệu đồng thau gỉ sét / gỗ sồi phong hóa / giấy da dê cổ, tách phông PNG trong suốt lưu trữ trong `frontend/src/assets/ui/sprites/`) hoặc SVG vẽ nét mực lông vũ run rẩy thủ công.

### 2.6 Phân Tách Tuyệt Đối Giữa "Tham Khảo Art-Style" và "Bố Cục / Ý Tưởng" (Art-Style Reference vs Layout Isolation)
- **Định nghĩa "Tham khảo Art-Style":** Khi User yêu cầu tham khảo phong cách nghệ thuật (Art-Style) từ một mockup cũ (kể cả mockup đó đã từng bị reject hoặc có lỗi về thiết kế), AI **CHỈ ĐƯỢC PHÉP KẾ THỪA VỀ PHONG CÁCH ĐỒ HỌA THUẦN TÚY**:
  - Bảng màu & Ánh sáng (Palette tone, tương phản giữa ánh nến firelight và vực thẳm abyss).
  - Nét vẽ & Kỹ thuật chất liệu (Inking style, nét gạch chéo hand-inked crosshatching, độ sần sùi của giấy da dê, thớ gỗ nứt, viền đồng thau oxy hóa).
  - Cảm giác thẩm mỹ Gothic hàng hải (Eldritch Nautical Horror).
- **Nghiêm Cấm Sao Chép Bố Cục & Vị Trí Thành Phần (Strict Layout Isolation):**
  - AI **TUYỆT ĐỐI KHÔNG ĐƯỢC BẮT CHƯỚC** bố cục (layout), tỷ lệ chia khung, cấu trúc không gian, hoặc vị trí sắp đặt các thành phần (element positioning) từ mockup tham khảo đó.
  - Toàn bộ bố cục và vị trí đặt vật thể **BẮT BUỘC PHẢI THIẾT KẾ MỚI ĐỘC LẬP 100%** theo đúng mô tả kiến trúc hiện tại của User, tránh việc kéo theo các sai sót thiết kế cũ sang mockup mới.
  - Khi sử dụng công cụ `generate_image`, nếu tham chiếu ảnh cũ qua `ImagePaths`, prompt **BẮT BUỘC PHẢI CHỈ ĐỊNH RÕ RÀNG**: *"Art style and material texture reference ONLY. DO NOT replicate the layout, map, widgets, or component positioning of the reference image. The spatial layout MUST strictly follow [mô tả kiến trúc mới]..."* để ngăn AI image generation bám rễ vào các lỗi bố cục cũ.

---

## 3. Danh Sách Nghiêm Cấm Về Thẩm Mỹ (Strict Visual DON'Ts)

1. ❌ **CẤM Khởi tạo hoặc sử dụng các Asset mới có Art Style bị lệch khỏi phong cách gothic hand-inked crosshatch của các asset hiện hữu trong dự án.**
2. ❌ **CẤM Chỉ dùng CSS thuần (border, box-shadow) để giả lập chất liệu hữu cơ (mép giấy rách, vân gỗ nứt, ngọn nến) mà không qua Asset Generation.**
3. ❌ **CẤM Sử dụng asset có viền/hộp nền đen hoặc trắng chưa tách phông (non-transparent assets)** — Bắt buộc phải qua bước tách phông thành file PNG trong suốt (`scripts/remove_background.py`) trước khi nạp vào giao diện.
4. ❌ **CẤM Glassmorphism / Backdrop-blur bóng bẩy kiểu Apple / Linear.**
5. ❌ **CẤM Màu Gradient Neon AI mặc định (tím xanh rực rỡ).**
6. ❌ **CẤM Góc bo tròn lớn (`rounded-2xl`, `rounded-3xl`, `rounded-full` cho card/panel).**
7. ❌ **CẤM Màu trắng tinh khiết (`#FFFFFF`)** — Màu sáng nhất cho phép là `--parchment-bright` (`#F0E6CC`).
8. ❌ **CẤM Chấm trạng thái xanh lá cây neon** — Bắt buộc dùng `--verdigris` (`#4A7A6A`).
9. ❌ **CẤM Animation nảy lò xo (bouncy/spring)** — Chuyển động phải có độ trễ và sức nặng.
10. ❌ **CẤM Bề mặt đơn sắc phẳng lì không có texture/chiều sâu.**
11. ❌ **CẤM Cắt cúp lười biếng (lazy cropping) các props/sprites rời từ ảnh Mockup phẳng** — Mọi đạo cụ nổi (cuộn giấy trigger, súng, thẻ bài, tay nắm) bắt buộc phải được khởi tạo độc lập từ đầu trên phông nền đơn sắc trung tính để tách biên alpha sắc nét 100%, không dính răng cưa tạp chất nền.
12. ❌ **CẤM Nướng chết (bake) các linh kiện động hoặc hình vẽ tượng trưng vào Canvas nền** — Bề mặt nền (bàn gỗ, sàn tàu) phải sạch bóng đạo cụ và để trống không gian cho các component động (`MapBoardUI`, `Action Desk Overlay`) render đè lên bằng code React.
