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
- **Mermaid / Telescope (Thuyền trưởng chỉ định người nhận hiệu ứng):**
  - **Quyền chỉ định:** Khi hiệu ứng `MERMAID` hoặc `TELESCOPE` được kích hoạt từ lá bài đã chốt, Thuyền trưởng (Captain) BẮT BUỘC phải chọn 1 người chơi khác trên tàu (không được chọn chính mình, người đó không bị `ELIMINATED`). (Timeout 60s chờ, hết giờ tự động chọn ngẫu nhiên 1 người chơi hợp lệ).
  - **Thực thi hiệu ứng cho người được chọn:**
    - *Với Mermaid (Tiếng Hát Tiên Cá):* Người được Thuyền trưởng chỉ định sẽ nhận được pop-up bí mật hiển thị tối đa 3 lá bài trên cùng từ `discard_pile` (nếu `discard_pile` có ít hơn 3 lá thì chỉ lấy số lá hiện có, KHÔNG trộn bù từ `draw_pile`). Các lá này được hệ thống xáo trộn thứ tự ngẫu nhiên trước khi gửi để đảm bảo không lộ thứ tự bài bị hủy gần nhất. Bấm OK để đóng.
    - *Với Telescope (Kính Viễn Vọng):* Người được Thuyền trưởng chỉ định sẽ nhận được pop-up bí mật hiển thị lá bài đầu tiên trên đỉnh của `draw_pile`. Người này có 2 lựa chọn: "Giữ trên đỉnh" hoặc "Vứt vào Discard Pile" (Timeout 20s tự động Giữ). Hệ thống xử lý dữ liệu cọc bài theo lệnh của người được chỉ định.
- **Kết thúc:** 
  - Nếu thẻ là `CULT_UPRISING`, chuyển sang UC-015.
  - Nếu không, trò chơi kết thúc vòng và chuyển sang BR-005 (Hoán đổi Off-duty).

## Alternative Flows
- **Không có hiệu ứng:** Nếu lá bài là `NONE`, hệ thống bỏ qua toàn bộ luồng này và đi thẳng tới cuối vòng.

## Exceptions
- **E1. Captain rớt mạng khi chọn Mermaid/Telescope:** Game dừng chờ Captain quay lại, không ép Timeout theo Game Pace.
- **E2. Người được chọn Mermaid/Telescope rớt mạng:** Game dừng chờ để họ quay lại xem pop-up (hoặc áp dụng timeout 20s tự động giữ bài trên đỉnh cho Telescope nếu phòng bật chế độ ép).

## Postconditions
- Hiệu ứng thẻ bài được ghi nhận vào trạng thái các Entity.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `CARD_ACTION_TARGET_SELECTION_STARTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ action: 'MERMAID' | 'TELESCOPE', captainId }` (Chỉ Captain hiển thị giao diện chọn người chơi).

- **Emit Event:** `CARD_ACTION_EXECUTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ action_type, target_id }` (Công khai ai là người được Captain chỉ định nhận hiệu ứng).

- **Emit Event:** `TELESCOPE_DATA` (Và `MERMAID_DATA`)
- **To:** Chỉ client của người được chỉ định (`target_id` / `sessionToken`).
- **Payload:** `{ card }` (Hoặc `{ cards }` cho Mermaid). Tuyệt đối không gửi broadcast.

## Acceptance Criteria (Tầng 4)
### AC-1: Drunk ưu tiên skip cắt lưỡi
- **Given:** Đến lượt Drunk. Người kế tiếp theo vòng là A bị `speech_restricted == true`. Kế tiếp nữa là B đang `OFF_DUTY`.
- **When:** Hệ thống tính toán người nhận chức.
- **Then:** Bỏ qua A hoàn toàn, trao cờ Captain cho B (dù B đang nghỉ phép).

### AC-2: Thuyền trưởng chỉ định người nhận hiệu ứng Mermaid & Telescope
- **Given:** Lá bài được điều hướng là `MERMAID` hoặc `TELESCOPE`.
- **When:** Giai đoạn Card Actions bắt đầu.
- **Then:** Hệ thống yêu cầu Thuyền trưởng (Captain) chọn 1 người chơi khác bản thân trên tàu.
- **And:** Chỉ người chơi được Thuyền trưởng chỉ định mới nhận được dữ liệu mật `MERMAID_DATA` (xem tối đa 3 lá discard ngẫu nhiên) hoặc `TELESCOPE_DATA` (xem lá đỉnh draw pile và quyết định giữ/vứt).

### AC-3: Kỹ năng Telescope xử lý bài đúng
- **Given:** Người chơi C được Captain chỉ định quyền Telescope soi đỉnh `draw_pile`.
- **When:** C chọn "Vứt".
- **Then:** Lá bài trên đỉnh `draw_pile` bị xóa và đẩy qua `discard_pile`. Lượt bốc sau sẽ dính lá bên dưới.

## Dependencies
- **Upstream UC:** UC-013
- **Downstream UC:** UC-015 (nếu là Cult) hoặc BR-005.

## Notes
- **LƯU Ý QUAN TRỌNG:** Cả 2 hiệu ứng `MERMAID` và `TELESCOPE` đều do **Thuyền trưởng (Captain)** lựa chọn 1 người chơi bất kỳ (khác bản thân) để trao quyền bí mật thực thi hiệu ứng. Không phải mặc định là Hoa tiêu.

## History
- v1 (2026-08-17, AI): initial
- v2 (2026-08-21, AI): cập nhật chính xác quyền chỉ định người nhận hiệu ứng Mermaid/Telescope thuộc về Thuyền trưởng
