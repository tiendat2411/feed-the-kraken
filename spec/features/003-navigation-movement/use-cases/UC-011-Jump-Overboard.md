# UC-011: Xử lý sự kiện Hoa tiêu Nhảy tàu (Jump Overboard)

## Metadata
- **ID:** UC-011
- **Bounded Context:** GamePlay, Navigation
- **Liên quan tới BR:** BR-003
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Hệ thống (System)
- Thuyền trưởng (Captain)

## Trigger
- Navigator bấm nút "Tự Nhảy Tàu" ở luồng UC-010.

## Preconditions
- Lượt của Navigator và `logbook_cards` đang có 2 lá.

## Main Flow
1. Giao diện toàn phòng phát thông báo: "Hoa tiêu [Tên] đã quyết định nhảy tàu!".
2. Hệ thống cập nhật trạng thái của Navigator đó thành `status = ELIMINATED`. (Lập tức tước bỏ toàn bộ súng `gun_count = 0` và hủy mọi quyền tham gia trò chơi tiếp theo).
3. 2 lá bài trong Logbook bị xóa bỏ thẳng vào `discard_pile` (TUYỆT ĐỐI KHÔNG ĐƯỢC lật mở công khai 2 lá này).
4. Hệ thống chuyển quyền điều khiển về màn hình của Thuyền trưởng (Captain) để bổ nhiệm Hoa tiêu khẩn cấp (Emergency Navigator).
5. Captain chọn 1 Emergency Navigator mới từ danh sách người chơi hợp lệ. (Lưu ý: BỎ QUA luật UI Filtering của Lieutanent ở phase chọn team ban đầu, tức là CÓ THỂ chọn người đang `OFF_DUTY`, nhưng không thể chọn chính mình hoặc Lieutenant hiện tại).
6. Sau khi Captain chọn xong, quy trình rút bài BẮT ĐẦU LẠI TỪ ĐẦU (chuyển về UC-009: Lượt Captain), bỏ qua bước Biểu quyết (Mutiny Vote).

## Alternative Flows
- **1a. Hoa tiêu mới lại nhảy tàu:** Ở bước 6, khi đến lượt Hoa tiêu khẩn cấp bốc bài, người này lại chọn Nhảy tàu -> Trạng thái của người đó thành `ELIMINATED` và luồng game quay ngược lại vòng lặp bước 4. Cứ lặp lại cho tới khi có một Hoa tiêu đồng ý chọn bài thì thôi.

## Exceptions
- **E1. Không còn ai hợp lệ để chọn Emergency Navigator:** Nếu tất cả người chơi đều bị `ELIMINATED` hoặc chỉ còn duy nhất Captain và Lieutenant, hệ thống tự động fallback: Ép buộc Captain phải vào vai Navigator bốc logbook luôn (Hoặc tự động lấy bài trên cùng của draw_pile đánh xuống, tùy thuộc vào setup Game Rule mở rộng của Admin).

## Postconditions
- Một người bị `ELIMINATED` khỏi trò chơi.
- Vòng lặp rút bài (Captain -> Lieut -> Nav) chạy lại từ đầu với Navigator mới. Không lật đổ, không check súng.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `NAVIGATOR_JUMPED_OVERBOARD`
- **To:** Toàn bộ phòng.
- **Payload:** `{ eliminated_player_id }`

- **Emit Event:** `EMERGENCY_NAVIGATOR_SELECTION`
- **To:** Toàn bộ phòng.
- **Payload:** `{ captain_id }`

## Acceptance Criteria (Tầng 4)
### AC-1: Trừng phạt nhảy tàu
- **Given:** Navigator A nhảy tàu.
- **When:** Hệ thống xử lý sự kiện.
- **Then:** `status` của A thành `ELIMINATED`, `gun_count` = 0.

### AC-2: Cập nhật danh sách Emergency
- **Given:** Giai đoạn chọn Emergency Navigator.
- **When:** Captain mở danh sách chọn.
- **Then:** Những người `OFF_DUTY` được phép chọn. Chỉ cấm chọn Captain, Lieutenant hiện tại, và người vừa nhảy tàu.

## Dependencies
- **Upstream UC:** UC-010
- **Downstream UC:** Trở lại UC-009.

## History
- v1 (2026-08-14, AI): initial
