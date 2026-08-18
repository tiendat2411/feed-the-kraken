# UC-016: Hoán đổi Thẻ Nghỉ Phép (Off-Duty Shift)

## Metadata
- **ID:** UC-016
- **Bounded Context:** GamePlay, Turn Management
- **Liên quan tới BR:** BR-005
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-18

## Actor
- Hệ thống (System)

## Trigger
- Một vòng điều hướng kết thúc THÀNH CÔNG (Sau khi tàu đã di chuyển, thực thi toàn bộ hành động bản đồ và thẻ bài mà chưa có phe nào đạt điều kiện chiến thắng).

## Preconditions
- Game chưa kích hoạt trạng thái End Game.
- Hệ thống nắm giữ danh sách Ban điều hướng (Captain, Lieutenant, Navigator) đã thực hiện vòng đi vừa rồi.

## Main Flow
1. **Thu hồi thẻ cũ (CLEAR_OLD):** Hệ thống duyệt qua tất cả người chơi trong phòng. Những người chơi đang có cờ `status == OFF_DUTY` sẽ được phục hồi về trạng thái `status = ACTIVE`.
2. **Phân bổ thẻ mới (ASSIGN_NEW):** Hệ thống dựa vào quy mô số người chơi ban đầu của phòng (Lobby Size) để xác định ai sẽ bị Off-duty trong vòng tiếp theo:
   - **Phòng 5-6 người:** Chỉ Hoa tiêu (Navigator) bị đổi thành `OFF_DUTY`.
   - **Phòng 7-8 người:** Hoa tiêu (Navigator) và Thuyền phó (Lieutenant) bị đổi thành `OFF_DUTY`.
   - **Phòng 9-11 người:** Hoa tiêu (Navigator), Thuyền phó (Lieutenant), và Thuyền trưởng (Captain) ĐỀU bị đổi thành `OFF_DUTY`.
3. *(Lưu ý: Mặc dù Captain có thể bị OFF_DUTY, nhưng quyền chỉ huy Captain (cờ `CAPTAIN`) KHÔNG BỊ TƯỚC ở bước này. Người đó vẫn là Captain ở vòng sau, chỉ là họ bị dán nhãn Off-duty để bị hạn chế các quyền lợi khác nếu có).*
4. Hệ thống hoàn tất vòng chơi, chuyển Game State về lại pha `APPOINT_TEAM` (Tiến hành UC-006 vòng mới).

## Alternative Flows
- Không có.

## Exceptions
- **E1. Vòng điều hướng thất bại do Nổi loạn (Mutiny):** Nếu một Ban điều hướng bị Mutiny lật đổ ngay từ đầu, vòng đó chưa hề đưa tàu đi. Do đó UC-016 sẽ KHÔNG được kích hoạt, thẻ Off-duty giữ nguyên ở người cũ.
- **E2. Vòng điều hướng có Emergency Navigator:** Nếu Navigator cũ nhảy tàu (Jump Overboard) và được thay bằng Emergency Navigator, người Emergency Navigator mới là người bị tính phạt thẻ `OFF_DUTY` ở bước 2. Lieutenant và Captain vẫn chịu phạt tùy theo Lobby Size.

## Postconditions
- Những người vừa làm việc bị đưa vào trạng thái nghỉ phép, những người nghỉ phép vòng trước được quay lại trạng thái hoạt động.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `OFF_DUTY_SHIFTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ newly_active_players: [ID], newly_off_duty_players: [ID] }`

## Acceptance Criteria (Tầng 4)
### AC-1: Thu hồi thẻ cũ
- **Given:** A đang `OFF_DUTY` từ vòng trước. Vòng này B làm Navigator (Phòng 5 người).
- **When:** Tàu di chuyển xong luồng.
- **Then:** `status` của A thành `ACTIVE`, `status` của B thành `OFF_DUTY`.

### AC-2: Đúng số lượng theo lobby size
- **Given:** Phòng có 8 người. (Luật phạt 2 người).
- **When:** Hoán đổi Off-duty diễn ra.
- **Then:** Lieutenant và Navigator bị `OFF_DUTY`, Captain vẫn giữ trạng thái `ACTIVE`.

## Dependencies
- **Upstream UC:** BR-004 (Hoàn tất thực thi).
- **Downstream UC:** UC-006 (Bắt đầu vòng mới).

## History
- v1 (2026-08-18, AI): initial
