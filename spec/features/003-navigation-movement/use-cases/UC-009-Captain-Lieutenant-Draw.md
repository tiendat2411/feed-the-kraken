# UC-009: Giai đoạn Rút bài của Captain & Lieutenant

## Metadata
- **ID:** UC-009
- **Bounded Context:** GamePlay, Navigation
- **Liên quan tới BR:** BR-003
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Thuyền trưởng (Captain)
- Thuyền phó (Lieutenant)
- Hệ thống (System)

## Trigger
- Bắt đầu phase điều hướng (Sau khi Ban điều hướng đã chốt thành công từ Mutiny Vote hoặc khi đổi Emergency Navigator).

## Preconditions
- Game ở trạng thái `NAVIGATION_CAPTAIN_DRAW`.
- Hệ thống có đủ bài bốc. (Nếu không đủ, tự động Auto-reshuffle).

## Main Flow
1. **Lượt Captain:**
   - Hệ thống tự động kiểm tra `draw_pile`. Nếu số lượng bài `< 2`, hệ thống lấy `discard_pile` xáo trộn và đưa xuống dưới đáy `draw_pile`.
   - Hệ thống gửi bí mật 2 lá bài trên cùng của `draw_pile` xuống client của Captain.
   - Captain xem 2 lá, chọn 1 lá cho vào Logbook (Nhật ký) và 1 lá bỏ vào `discard_pile`.
   - Captain bấm "Xác nhận". (Time-out: 60s, nếu hết giờ người đang ONLINE sẽ bị hệ thống tự động random 1 lá vào Logbook, 1 lá bỏ).
2. **Lượt Lieutenant:**
   - Sau khi Captain chốt, hệ thống chuyển sang `NAVIGATION_LIEUTENANT_DRAW`.
   - Hệ thống kiểm tra `draw_pile`. Nếu `< 2`, xáo bài.
   - Hệ thống gửi bí mật 2 lá bài tiếp theo xuống client của Lieutenant.
   - Lieutenant xem 2 lá, chọn 1 lá cho vào Logbook và 1 lá bỏ vào `discard_pile`.
   - Lieutenant bấm "Xác nhận". (Time-out: 60s, nếu hết giờ tự động random).
3. **Chốt Logbook:**
   - Hệ thống hiện có 2 lá bài trong `logbook_cards`.
   - Hệ thống tiến hành thuật toán xáo trộn (shuffle) 2 lá bài này để che giấu nguồn gốc.
   - Chuyển sang UC-010 (Lượt Navigator).

## Alternative Flows
- Không có.

## Exceptions
- **E1. Rớt mạng (socket_disconnect):** Theo luật *Time-out & Game Pace Logic* mới bổ sung, nếu người đến lượt bốc bài rớt mạng, Time-out 60s sẽ KHÔNG đếm để ép buộc kết thúc lượt. Game dừng chờ đến khi họ vào lại (hoặc chờ Host xử lý kick). 
- *Lưu ý: Luật auto-random 60s chỉ áp dụng cho người đang ONLINE nhưng chây ì (nếu cấu hình server cho phép).*

## Postconditions
- Có chính xác 2 lá bài được đưa vào `logbook_cards` đã được xáo trộn.
- 2 lá bị hủy được đưa vào `discard_pile`.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `CAPTAIN_DRAWING`
- **To:** Toàn bộ phòng.
- **Payload:** `{ timeout: 60 }` (Chỉ thông báo lượt của ai).

- **Emit Event:** `LIEUTENANT_DRAWING`
- **To:** Toàn bộ phòng.
- **Payload:** `{ timeout: 60 }`

- **Emit Event:** `CARDS_DRAWN_SECRET`
- **To:** Client cá nhân (Captain hoặc Lieutenant tương ứng).
- **Payload:** `{ cards: [{ id, color, action }] }`

## Acceptance Criteria (Tầng 4)
### AC-1: Bảo mật thẻ bài
- **Given:** Đến lượt Captain rút bài.
- **When:** Hệ thống gửi 2 thẻ bài xuống client của Captain.
- **Then:** Các client khác KHÔNG NHẬN ĐƯỢC packet chứa nội dung của 2 thẻ bài này.

### AC-2: Auto-reshuffle đúng luật
- **Given:** `draw_pile` chỉ còn 1 lá, `discard_pile` có 5 lá.
- **When:** Captain bắt đầu bốc bài.
- **Then:** Hệ thống trộn 5 lá từ `discard_pile` đưa vào dưới 1 lá của `draw_pile` thành 6 lá, sau đó cho Captain bốc 2 lá đầu tiên.

## Dependencies
- **Upstream UC:** UC-008, UC-011
- **Downstream UC:** UC-010

## History
- v1 (2026-08-14, AI): initial
