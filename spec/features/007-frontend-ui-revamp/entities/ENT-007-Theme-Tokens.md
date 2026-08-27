# ENT-007: Theme Tokens & Visual System (Hệ thống Thiết kế & Token Giao diện)

## Metadata
- **ID:** ENT-007
- **Bounded Context:** Presentation / DesignSystem
- **Status:** approved
- **Owner:** Frontend Team
- **Last updated:** 2026-08-27

## 1. Description (Mô tả)
Thực thể định nghĩa toàn bộ hệ thống chuẩn hóa về bảng màu (Color Palette), kiểu chữ (Typography), khoảng cách (Spacing), hiệu ứng chiều sâu (Shadows/Glows), và hoạt cảnh (Animations) phục vụ phong cách hải trình kỳ bí (Dark Nautical & Eldritch Fantasy) cho boardgame "Feed the Kraken".

## 2. Attributes (Thuộc tính dữ liệu)

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc (Req) | Ràng buộc/Mặc định (Validation/Default) | Mô tả (Description) |
| :--- | :--- | :---: | :--- | :--- |
| `colorAbyss` | String (Hex/HSL) | Y | `#0b111e` / `rgb(11, 17, 30)` | Màu nền đại dương sâu thẳm |
| `colorParchment` | String (Hex/HSL) | Y | `#f4ebd0` / `rgb(244, 235, 208)` | Màu giấy da dê cổ điển |
| `colorGold` | String (Hex/HSL) | Y | `#d4af37` / `#f59e0b` | Màu vàng đồng thau / vương miện / huy hiệu |
| `colorSailor` | String (Hex/HSL) | Y | `#2563eb` / `#38bdf8` | Sắc xanh dương đại diện phe Thủy thủ |
| `colorPirate` | String (Hex/HSL) | Y | `#dc2626` / `#ef4444` | Sắc đỏ thẫm đại diện phe Hải tặc |
| `colorCult` | String (Hex/HSL) | Y | `#9333ea` / `#c084fc` | Sắc tím huyền bí đại diện phe Tà giáo Kraken |
| `fontDisplay` | String | Y | `'Cinzel', 'Pirata One', serif` | Font chữ tiêu đề, sự kiện và con dấu cổ điển |
| `fontBody` | String | Y | `'Outfit', 'Inter', sans-serif` | Font chữ nội dung, nút bấm, thông số trận đấu |
| `animationShake` | String | Y | `gunShake 0.4s ease-out` | Hoạt cảnh rung lắc khi nổ súng hoặc động đất |
| `animationPulse` | String | Y | `eldritchPulse 2.5s infinite` | Hoạt cảnh phát sáng ma mị của xúc tu Tà giáo |

## 3. State Lifecycle (Vòng đời trạng thái)
Thực thể này là tĩnh (Static Configuration) được khởi tạo cùng ứng dụng và có thể chuyển đổi chế độ hiển thị (ví dụ: kích hoạt hoặc giảm tải hoạt cảnh khi bật `prefers-reduced-motion`).

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
- Độ tương phản giữa màu chữ chính và màu nền panel MUST luôn đạt tiêu chuẩn WCAG AA (tối thiểu 4.5:1).
- Font chữ hiển thị tiêu đề MUST luôn có font dự phòng tiêu chuẩn (`serif` hoặc `sans-serif`) trong trường hợp kết nối mạng tải Google Fonts bị chậm.
- Các giá trị màu phe phái (Sailor, Pirate, Cult) MUST giữ nguyên mã nhận diện cốt lõi xuyên suốt mọi linh kiện trong game để tránh gây hiểu lầm vai trò.

## 5. Relationships (Quan hệ với các Entity khác)
- Được sử dụng bởi toàn bộ các Component và Page trong Frontend.
- Liên kết với: `ENT-001` (Room), `ENT-002` (Player), `ENT-004` (NavigationDeck), `ENT-005` (MapBoard), `ENT-006` (GameResult).

## 6. Related Use Cases
- Sử dụng trong: [UC-021], [UC-022], [UC-023]

## History
- v1 (2026-08-27, AI): Khởi tạo đặc tả ENT-007 Theme Tokens.
