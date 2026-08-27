# ENT-007: Theme Tokens & Visual System — "Eldritch Parchment"

## Metadata
- **ID:** ENT-007
- **Bounded Context:** Presentation / DesignSystem
- **Status:** approved
- **Owner:** Frontend Team
- **Last updated:** 2026-08-27

## 1. Description (Mô tả)
Thực thể định nghĩa toàn bộ hệ thống Design Tokens theo art style **"Eldritch Parchment"** (Don't Starve Together × Lovecraftian Sea Horror × Gothic Sketchbook): bảng màu nâu ấm cực hẹp + xanh lá rêu verdigris, font gothic 3 tầng (`Pirata One` → `Cinzel` → `Outfit`), hệ thống ánh sáng firelight vs bóng tối, hiệu ứng phong hóa/cũ kỹ (texture gỗ mục, giấy da dê nứt, đinh gỉ, rêu xanh), và hoạt cảnh nặng nề chậm rãi.

Chi tiết đầy đủ tại [art-direction-guide.md](../art-direction-guide.md).

## 2. Attributes (Thuộc tính dữ liệu)

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc (Req) | Ràng buộc/Mặc định (Validation/Default) | Mô tả (Description) |
| :--- | :--- | :---: | :--- | :--- |
| `colorAbyss` | String (Hex) | Y | `#0A0A08` | Nền chính đại dương đen kịt |
| `colorHullDark` | String (Hex) | Y | `#1A1510` | Nền panel chính — Gỗ thuyền tối |
| `colorHull` | String (Hex) | Y | `#2A2118` | Nền panel phụ / Card background |
| `colorHullLight` | String (Hex) | Y | `#3D3228` | Viền panel nổi / Hover state |
| `colorParchment` | String (Hex) | Y | `#D4C5A0` | Văn bản nội dung — Giấy da dê cổ |
| `colorParchmentDim` | String (Hex) | Y | `#9B8E72` | Văn bản phụ / Placeholder |
| `colorParchmentBright` | String (Hex) | Y | `#F0E6CC` | Tiêu đề nổi bật — Sáng nhất (KHÔNG #FFFFFF) |
| `colorVerdigris` | String (Hex) | Y | `#4A7A6A` | Xanh rêu đồng thau gỉ — Accent phụ, trạng thái online |
| `colorVerdigrisGlow` | String (Hex) | Y | `#6BA89A` | Xanh rêu sáng — Hover, glow biển |
| `colorMoss` | String (Hex) | Y | `#3A5A3A` | Rêu tối — Badge connected, thanh info |
| `colorGold` | String (Hex) | Y | `#C9A84C` | Vàng đồng thau cổ — Vương miện, viền card |
| `colorGoldDim` | String (Hex) | Y | `#8B7535` | Vàng xỉn — Viền trang trí mờ |
| `colorFirelight` | String (Hex) | Y | `#E8A63E` | Ánh lửa ấm — Nguồn sáng chính |
| `colorSailor` | String (Hex) | Y | `#4A7A8C` | Xanh biển bạc phai — Phe Thủy thủ |
| `colorPirate` | String (Hex) | Y | `#A83B2A` | Đỏ sẫm cháy — Phe Hải tặc |
| `colorCult` | String (Hex) | Y | `#6B3FA0` | Tím thẫm huyền bí — Phe Tà giáo |
| `fontDisplay` | String | Y | `'Pirata One', 'Georgia', serif` | Font tiêu đề game gothic hải tặc |
| `fontHeading` | String | Y | `'Cinzel', 'Times New Roman', serif` | Font tiêu đề phase, tên vai trò — Cổ điển La Mã |
| `fontBody` | String | Y | `'Outfit', sans-serif` | Font nội dung, nút bấm — Sắc nét dễ đọc |
| `animationShake` | String | Y | `gunShake 0.4s ease-out` | Rung lắc khi nổ súng |
| `animationEldritchPulse` | String | Y | `eldritch-pulse 3s ease-in-out infinite` | Phát sáng tím Cult |
| `animationShipBob` | String | Y | `shipBob 3s ease-in-out infinite` | Tàu dập dềnh |
| `animationCardFlip` | String | Y | `600ms cubic-bezier(0.4, 0, 0.2, 1)` | Lật thẻ 3D |

## 3. State Lifecycle (Vòng đời trạng thái)
Thực thể tĩnh (Static Configuration) khởi tạo cùng ứng dụng. Chuyển đổi khi bật `prefers-reduced-motion` (tắt animation phức tạp).

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
- Độ tương phản giữa `parchment`/`parchment-bright` và `hull-dark` MUST luôn đạt WCAG AA (tối thiểu 4.5:1).
- Font MUST luôn có fallback chuẩn (`serif` / `sans-serif`).
- Màu phe phái (Sailor, Pirate, Cult) MUST giữ nguyên mã nhận diện cốt lõi xuyên suốt mọi linh kiện.
- Mọi bề mặt panel/card MUST có texture phong hóa — KHÔNG BAO GIỜ phẳng lì.
- Vignette tối viền MUST áp dụng toàn cục trên mọi màn hình.
- Không dùng glassmorphism, neon, gradient AI mặc định.
- Xanh rêu verdigris dùng TIẾT CHẾ — KHÔNG BAO GIỜ làm màu chủ đạo.

## 5. Relationships (Quan hệ với các Entity khác)
- Được sử dụng bởi toàn bộ Components và Pages trong Frontend.
- Liên kết với: `ENT-001` (Room), `ENT-002` (Player), `ENT-004` (NavigationDeck), `ENT-005` (MapBoard), `ENT-006` (GameResult).

## 6. Related Use Cases
- Sử dụng trong: [UC-021], [UC-022], [UC-023]

## History
- v1 (2026-08-27, AI): Khởi tạo đặc tả ENT-007 Theme Tokens.
- v2 (2026-08-27, AI): Cập nhật hoàn toàn theo art style "Eldritch Parchment" v1.1 — thêm Verdigris/Moss, tăng aging effects, loại bỏ glassmorphism.
