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
1. Hệ thống nạp Design Tokens "Eldritch Parchment": bảng màu nâu ấm + xanh rêu verdigris, font gothic 3 tầng, bề mặt phong hóa cổ xưa, vignette tối viền toàn cục.
2. Toàn bộ nền trang mang sắc độ đại dương/khoang tàu trầm mặc (`--abyss`), các panel và container thể hiện chất liệu gỗ/giấy da phong hóa, loại bỏ hoàn toàn phong cách bóng bẩy hiện đại (glassmorphism, neon).
3. Khi người chơi ở trong Game View, render thanh HUD Header cố định tại đỉnh:
   - Thông tin phòng (Room Code kèm thao tác sao chép).
   - Vòng chơi và Phase hiện tại (font `Cinzel`).
   - Tiến trình Cult Track (hiệu ứng tím mờ ảo).
   - Phím tắt kiểm tra Thẻ vai trò cá nhân.
   - Nút bật/tắt âm thanh, nút Dissolve / Leave room.
4. Không gian bàn chơi trung tâm hiển thị các phân vùng theo kiến trúc Command Layout.
5. Danh sách thuyền viên (Crew Roster) và vị trí ngồi (Seating Radar) được tổ chức khoa học, dễ tiếp cận qua thao tác trượt mở hộc ngăn kéo gầm bàn.

## Alternative Flows
- **3a. Mobile/Tablet View:** HUD co giãn linh hoạt, các icon chức năng tự động tinh gọn phù hợp kích thước màn hình.

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
- **Then** tiêu đề dùng `Pirata One`/`Cinzel` gothic, nội dung dùng `Outfit`, nền `--abyss` + vignette, panel thể hiện chất liệu phong hóa, KHÔNG glassmorphism, KHÔNG neon.

### AC-2: HUD Chỉ Huy Cố Định
- **Given** ván game đang chạy bất kỳ phase,
- **When** người chơi cuộn trang hoặc thao tác trên bàn,
- **Then** thanh HUD luôn cố định ở đỉnh, hiển thị rõ ràng Room Code, Phase (font `Cinzel`), Cult Track và các nút điều hướng cơ bản.

## Dependencies
- **Upstream UC:** N/A
- **Downstream UC:** UC-022, UC-023

## Notes
- Tối ưu CSS, ưu tiên CSS thuần cho texture (gradients, blend-modes) thay vì asset hình ảnh nặng.

## History
- v1 (2026-08-27, AI): initial.
- v2 (2026-08-27, AI): Cập nhật hoàn toàn theo "Eldritch Parchment" v1.1 — gỗ phong hóa, font gothic, verdigris, loại bỏ glassmorphism.
