# UC-014: Thực thi Hiệu ứng Thẻ bài (Card Actions)

## Metadata
- **ID:** UC-014
- **Bounded Context:** GamePlay, Execution
- **Liên quan tới BR:** BR-004
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-17

## Actor
- Hệ thống (System)
- Thuyền trưởng (Captain)

## Trigger
- Sau khi Hành động Bản đồ (UC-013) hoàn tất.

## Preconditions
- Lá bài Điều hướng được Navigator chốt ở phase trước có mang một trong các Action (Drunk, Armed, Disarmed, Mermaid, Telescope, Cult Uprising).

## Main Flow
Hệ thống xử lý lập tức (hoặc yêu cầu tương tác) dựa trên loại Action:
- **Drunk (Say rượu):**
  - Hệ thống lấy danh sách người chơi, tìm kiếm theo vòng tròn chiều kim đồng hồ bắt đầu từ Captain hiện tại.
  - BỎ QUA những người đang bị `speech_restricted == true` hoặc `ELIMINATED`. (Lưu ý: Những người đang `OFF_DUTY` vẫn ĐƯỢC CHỌN hợp lệ theo BR-004).
  - Tước danh hiệu `CAPTAIN` hiện tại, gán cho người hợp lệ đầu tiên tìm được.
- **Armed (Vũ trang):**
  - Hệ thống cộng thêm 1 súng cho Hoa tiêu (Navigator) đương nhiệm của vòng này. (`gun_count += 1`).
- **Disarmed (Tước vũ khí):**
  - Hệ thống trừ 1 súng của Hoa tiêu đương nhiệm nếu họ có súng. (`gun_count = max(0, gun_count - 1)`).
- **Mermaid / Telescope (Chỉ định tương tác):**
  - Giao diện yêu cầu Captain chọn 1 người KHÁC BẢN THÂN. (Timeout 60s chờ, hết giờ tự động random).
  - Người được chọn sẽ hiển thị một pop-up mật trên màn hình cá nhân:
    - *Với Mermaid:* Lấy tối đa 3 lá bài trên cùng từ `discard_pile` (nếu `discard_pile` có ít hơn 3 lá thì chỉ lấy số lá hiện có, KHÔNG trộn bù từ `draw_pile`). Tiến hành xáo trộn vị trí của các lá này, gửi ẩn cho riêng người đó xem. Bấm OK để đóng.
    - *Với Telescope:* Lấy lá bài trên đỉnh `draw_pile`, gửi ẩn cho riêng người đó xem. Pop-up có 2 lựa chọn: "Giữ trên đỉnh" hoặc "Vứt vào Discard Pile". (Timeout 20s tự chọn Giữ). Xử lý data theo lệnh chọn.
- **Kết thúc:** 
  - Nếu thẻ là `CULT_UPRISING`, chuyển sang UC-015.
  - Nếu không, trò chơi kết thúc vòng và chuyển sang BR-005 (Hoán đổi Off-duty).

## Alternative Flows
- **Không có hiệu ứng:** Nếu lá bài là `NONE`, hệ thống bỏ qua toàn bộ luồng này và đi thẳng tới cuối vòng.

## Exceptions
- **E1. Captain rớt mạng khi chọn Mermaid/Telescope:** Game dừng chờ Captain quay lại, không ép Timeout theo Game Pace.
- **E2. Người được chọn Telescope rớt mạng:** Game dừng chờ để họ quay lại xem pop-up (hoặc áp dụng timeout 20s tự động giữ bài trên đỉnh nếu phòng bật chế độ ép).

## Postconditions
- Hiệu ứng thẻ bài được ghi nhận vào trạng thái các Entity.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `CARD_ACTION_EXECUTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ action_type }` (Nếu có target như Mermaid/Telescope thì kèm `target_id`).

- **Emit Event:** `TELESCOPE_DATA` (Và `MERMAID_DATA`)
- **To:** Chỉ client của Target.
- **Payload:** `{ card }` (Hoặc `{ cards }` cho Mermaid). Tuyệt đối không gửi broadcast.

## Acceptance Criteria (Tầng 4)
### AC-1: Drunk ưu tiên skip cắt lưỡi
- **Given:** Đến lượt Drunk. Người kế tiếp theo vòng là A bị `speech_restricted == true`. Kế tiếp nữa là B đang `OFF_DUTY`.
- **When:** Hệ thống tính toán người nhận chức.
- **Then:** Bỏ qua A hoàn toàn, trao cờ Captain cho B (dù B đang nghỉ phép).

### AC-2: Kỹ năng Telescope xử lý bài đúng
- **Given:** C được cấp quyền Telescope soi đỉnh draw_pile.
- **When:** C chọn "Vứt".
- **Then:** Lá bài trên đỉnh `draw_pile` bị xóa và đẩy qua `discard_pile`. Lượt bốc sau sẽ dính lá bên dưới.

## Dependencies
- **Upstream UC:** UC-013
- **Downstream UC:** UC-015 (nếu là Cult) hoặc BR-005.

## History
- v1 (2026-08-17, AI): initial
