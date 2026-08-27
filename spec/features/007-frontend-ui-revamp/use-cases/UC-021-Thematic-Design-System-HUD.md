# UC-021: Ngôn ngữ Thiết kế "Eldritch Parchment" & Thanh Chỉ huy HUD Gỗ Phong Hóa

## Metadata
- **ID:** UC-021
- **Bounded Context:** Presentation / GamePlayUI
- **Liên quan tới BR:** 007-frontend-ui-revamp
- **Status:** approved
- **Owner:** Frontend Team
- **Last updated:** 2026-08-27

## Actor
Người chơi (Player), Chủ phòng (Host), Khán giả quan sát.

## Trigger
Người chơi truy cập vào trang web hoặc đang tham gia trong một phòng chơi.

## Preconditions
Frontend đã tải thành công CSS, Google Fonts (`Pirata One`, `Cinzel`, `Outfit`) và kết nối Socket.

## Main Flow
1. Hệ thống nạp Design Tokens "Eldritch Parchment": bảng màu nâu ấm + xanh rêu verdigris, font gothic 3 tầng, texture gỗ mục/da dê cổ, vignette tối viền toàn cục.
2. Toàn bộ body nền đại dương đen kịt (`--abyss`), mọi panel có texture gỗ phong hóa (`.panel-wood`), mọi card có chất liệu da dê cổ (`.card-parchment`).
3. Khi người chơi ở trong Game View, render thanh HUD Header gỗ sẫm phong hóa cố định tại đỉnh:
   - Mã phòng khắc vào gỗ (font `Cinzel`, kèm nút copy).
   - Round counter / Phase hiện tại.
   - Cult Track tím ẩn hiện (eldritch-pulse khi có tiến triển).
   - Huy hiệu vai trò cá nhân (nút bật xem Thẻ vai trò).
   - Nút mở bản đồ + Cài đặt / Rời phòng.
4. Main Stage tự động căn giữa, hiển thị component phase hiện tại.
5. Crew Dock hiển thị thẻ gỗ mục từng thuyền viên: Tên, Avatar, Chức danh (Captain/Lieutenant/Navigator/Off-duty), Số súng, Trạng thái kết nối (chấm verdigris thay xanh neon).

## Alternative Flows
- **3a. Mobile/Tablet View:** HUD co gọn, Crew Dock chuyển thanh cuộn ngang hoặc Drawer trượt.

## Exceptions
- **E1. Font loading latency:** Sử dụng fallback `Georgia`/`serif` cho Display/Heading, `sans-serif` cho Body. Chuyển đổi mượt khi font tải xong (FOUT prevention).

## Postconditions
Giao diện nhất quán phong cách "Eldritch Parchment", sắc nét, đầy đủ thông tin trạng thái.

## State Synchronization
- **Emit Event:** N/A (Chỉ render dựa trên `room_state`).
- **To:** Client hiện tại.

## Edge Cases & Network Resilience
- **F5 / Tải lại trang:** HUD và Main Stage khôi phục tức thì từ server state.
- **Window Resize:** Layout tự động recalculate không vỡ bố cục.

## Acceptance Criteria (Tầng 4)
### AC-1: Typography & Theme Tokens "Eldritch Parchment"
- **Given** người chơi mở bất kỳ trang nào,
- **When** trang hiển thị,
- **Then** tiêu đề dùng `Pirata One`/`Cinzel` gothic, nội dung dùng `Outfit`, nền `--abyss` + vignette, panel có texture gỗ mục phong hóa, KHÔNG glassmorphism, KHÔNG neon.

### AC-2: HUD Gỗ Phong Hóa Cố Định
- **Given** ván game đang chạy bất kỳ phase,
- **When** người chơi cuộn trang/thao tác,
- **Then** thanh HUD gỗ sẫm cố định, hiển thị Round, Phase (font `Cinzel`), Cult Track tím, nút Role — tất cả trên nền gỗ mục có texture.

## Dependencies
- **Upstream UC:** N/A
- **Downstream UC:** UC-022, UC-023

## Notes
- Tối ưu CSS, ưu tiên CSS thuần cho texture (gradients, blend-modes) thay vì asset hình ảnh nặng.

## History
- v1 (2026-08-27, AI): initial.
- v2 (2026-08-27, AI): Cập nhật hoàn toàn theo "Eldritch Parchment" v1.1 — gỗ phong hóa, font gothic, verdigris, loại bỏ glassmorphism.
