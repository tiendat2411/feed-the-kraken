# UC-005: Bổ nhiệm Thuyền trưởng ban đầu (Assign Initial Captain)

## Metadata
- **ID:** UC-005
- **Bounded Context:** GamePlay
- **Liên quan tới BR:** BR-001
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Hệ thống (System)
- Thuyền trưởng (Captain)

## Trigger
- Sau khi UC-004 (Đêm đầu tiên - Hội tụ bí mật) kết thúc.

## Preconditions
- Mọi người đã mở mắt (Trạng thái DAY_PHASE).

## Main Flow
1. Hệ thống lựa chọn ngẫu nhiên 1 PlayerID trong danh sách những người chơi hiện có trong phòng.
2. Cấp danh hiệu "Captain" (Thuyền trưởng) cho người chơi này.
3. Giao "Nhật ký hành trình" (Logbook) và quyền chọn Thuyền phó (Lieutenant) + Hoa tiêu (Navigator) cho Thuyền trưởng.
4. Hiển thị thông báo (Banner) lớn trên màn hình tất cả người chơi: "[Nickname] là Thuyền trưởng đầu tiên!".

## Alternative Flows
- Không có. (Việc chọn Thuyền trưởng vòng 1 luôn là ngẫu nhiên).

## Exceptions
- **E1. Thuyền trưởng được random đang rớt mạng (Offline):** Hệ thống vẫn cấp quyền cho họ. Vì game là real-time turn-based, tiến trình game sẽ chờ họ reconnect. Nếu họ đi vắng quá lâu, Host có thể dùng quyền giải tán phòng (hoặc kích hoạt luật kick tùy chọn).

## Postconditions
- Có chính xác 1 người chơi mang chức danh Captain.
- Game chính thức bước vào Vòng (Round) 1 - Giai đoạn chọn phi hành đoàn (Crew Selection).

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `CAPTAIN_ASSIGNED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ captain_id: "id_of_player" }`

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- Biểu tượng Thuyền trưởng (ví dụ: Mũ thuyền trưởng) BẮT BUỘC phải được lưu vào cấu trúc `room_state`. Bất cứ người chơi nào bị rớt mạng và F5 vào lại, UI của họ vẫn sẽ hiển thị đúng người đó đang giữ chức Thuyền trưởng thông qua dữ liệu phục hồi.

## Acceptance Criteria (Tầng 4)
### AC-1: Random công bằng
- **Given:** Bắt đầu ngày đầu tiên của game.
- **When:** Hệ thống chọn Thuyền trưởng.
- **Then:** Hệ thống chọn ngẫu nhiên 1 người (Xác suất bằng nhau, không phân biệt Host hay phe phái).

### AC-2: Cập nhật UI đồng bộ toàn phòng
- **Given:** Một Thuyền trưởng mới được chọn.
- **When:** Sự kiện `CAPTAIN_ASSIGNED` được broadcast.
- **Then:** UI của tất cả người chơi trong phòng đồng loạt hiển thị thẻ/icon Captain bên cạnh tên của người chơi được chọn.

## Dependencies
- **Upstream UC:** UC-004
- **Downstream UC:** Các tính năng trong BR-002 (Voting & Crew Selection).

## Notes
- Chú ý phân biệt Quyền Thuyền trưởng (Captain) với Vai trò phe phái (Sailor/Pirate). Captain là một chức danh hiển thị công khai (Public Title) có thể luân chuyển.

## History
- v1 (2026-08-14, AI): initial.
