# UC-010: Giai đoạn quyết định của Hoa tiêu (Navigator Action)

## Metadata
- **ID:** UC-010
- **Bounded Context:** GamePlay, Navigation
- **Liên quan tới BR:** BR-003
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Hoa tiêu (Navigator)
- Hệ thống (System)

## Trigger
- Sau khi Captain và Lieutenant đã chốt bài vào Logbook thành công (UC-009).

## Preconditions
- `logbook_cards` có đúng 2 lá bài và đã được xáo trộn trên Server.
- Game chuyển sang trạng thái `NAVIGATION_NAVIGATOR_DRAW`.

## Main Flow
1. Hệ thống gửi bí mật thông tin 2 lá bài trong `logbook_cards` tới client của Navigator.
2. Navigator xem 2 lá bài trên màn hình.
3. **Lựa chọn Đánh bài:** Navigator chọn 1 lá để thực thi, 1 lá loại bỏ.
4. Navigator bấm "Xác nhận Điều hướng". (Time-out 60s cho người online chây ì, nếu hết giờ tự random).
5. Hệ thống ghi nhận lá bài được chọn. Lá còn lại đưa thẳng vào `discard_pile` ở trạng thái úp (không công khai lá loại).
6. Chuyển sang tiến trình thực thi hành động (BR-004).

## Alternative Flows
- **1a. Nhảy tàu (Overboard):** Ở bước 3, Navigator không muốn đi theo cả 2 lá bài, quyết định bấm nút "Tự Nhảy Tàu". (Chuyển sang UC-011).

## Exceptions
- **E1. Rớt mạng:** Nếu Navigator offline, thời gian dừng chờ người đó reconnect theo luật Time-out mới.

## Postconditions
- Một lá bài được chốt để định đoạt nước đi của tàu (hoặc kích hoạt luồng nhảy tàu).

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `NAVIGATOR_DRAWING`
- **To:** Toàn bộ phòng.
- **Payload:** `{ timeout: 60 }`

- **Emit Event:** `NAVIGATOR_CARDS_SECRET`
- **To:** Chỉ riêng client Navigator.
- **Payload:** `{ cards: [{ id, color, action }] }`

## Acceptance Criteria (Tầng 4)
### AC-1: Xáo trộn Logbook
- **Given:** Captain bỏ thẻ X (màu Đỏ), Lieutenant bỏ thẻ Y (màu Xanh).
- **When:** Hệ thống gửi thẻ cho Navigator.
- **Then:** Thứ tự của thẻ X và Y là ngẫu nhiên, Navigator không thể biết ai đã đưa thẻ nào dựa trên index hiển thị.

### AC-2: Time-out Auto-play (Đối với người Online)
- **Given:** Navigator đang online nhưng cố tình không thao tác trong 60s.
- **When:** Timer = 0.
- **Then:** Hệ thống tự động chọn random 1 trong 2 lá bài và đi tiếp luồng, không nhảy tàu.

## Dependencies
- **Upstream UC:** UC-009
- **Downstream UC:** UC-011 (nếu nhảy tàu), hoặc BR-004 (nếu chốt bài).

## History
- v1 (2026-08-14, AI): initial
