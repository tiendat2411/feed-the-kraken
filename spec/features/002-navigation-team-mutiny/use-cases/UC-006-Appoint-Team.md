# UC-006: Chọn Ban điều hướng (Appoint Navigation Team)

## Metadata
- **ID:** UC-006
- **Bounded Context:** GamePlay, Navigation
- **Liên quan tới BR:** BR-002
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Thuyền trưởng (Captain)
- Hệ thống (System)

## Trigger
- Bắt đầu một vòng chơi mới (DAY_PHASE), hoặc sau khi một vòng bị lật đổ/kết thúc (mutiny success nhưng chưa đổi lượt).

## Preconditions
- Game đang ở trạng thái APPOINT_TEAM.
- Đã có 1 người giữ chức `CAPTAIN`.

## Main Flow
1. Giao diện hiển thị danh sách người chơi cho Captain để chọn Thuyền phó (Lieutenant).
2. Hệ thống áp dụng UI Smart Filtering: Ẩn/disable bản thân Captain và những người có `status == OFF_DUTY` hoặc `ELIMINATED`.
3. Captain chọn 1 người làm Thuyền phó.
4. Giao diện tiếp tục hiển thị danh sách để chọn Hoa tiêu (Navigator).
5. Hệ thống áp dụng UI Smart Filtering: Ẩn/disable thêm người vừa được chọn làm Thuyền phó.
6. Captain chọn 1 người làm Hoa tiêu.
7. Captain bấm "Xác nhận Ban điều hướng" để chốt.
8. Hệ thống lưu đề xuất và chuyển sang trạng thái LOYALTY_CHECK (Mutiny Vote).

## Alternative Flows
- Không có. (Bắt buộc phải chọn đủ 2 người hợp lệ).

## Exceptions

- **E1. Captain mất kết nối (socket_disconnect):** Trò chơi tạm dừng chờ Captain quay lại (Time-out tự động sẽ KHÔNG đếm để kết thúc lượt, tuân thủ nguyên tắc Game Pace, trừ khi Host dùng quyền kick/giải tán do rời đi quá lâu).
- **E2. Chọn người chơi đang mất kết nối:** Vẫn cho phép Captain chọn người chơi đang ở trạng thái Offline (mất kết nối/reconnecting) làm Thuyền phó hoặc Hoa tiêu. Hệ thống sẽ tự động xử lý auto-play/auto-pass (ví dụ: rút bài ngẫu nhiên, nộp 0 súng) cho người chơi này nếu họ không phản hồi khi hết thời gian quy định ở các phase sau.

## Postconditions
- 2 người chơi được tạm thời gắn mác là "Lieutenant (đề xuất)" và "Navigator (đề xuất)" trên màn hình của tất cả mọi người.
- Kích hoạt UC-007 (Mutiny Vote).

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `TEAM_PROPOSED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ proposed_lieutenant_id, proposed_navigator_id }`

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- **F5 trong lúc chọn:** Khi Captain F5, UI phải giữ lại lựa chọn Thuyền phó nếu đã chọn trước đó để không phải thao tác lại từ đầu. Trạng thái bản nháp lưu tại local hoặc memory room.

## Acceptance Criteria (Tầng 4)
### AC-1: UI Smart Filtering Thuyền phó
- **Given:** Game ở trạng thái chọn Ban điều hướng.
- **When:** Captain mở danh sách chọn Thuyền phó.
- **Then:** Tên của Captain và những người `OFF_DUTY`, `ELIMINATED` không thể được chọn (bị ẩn hoặc mờ).

### AC-2: UI Smart Filtering Hoa tiêu
- **Given:** Captain đã chọn Thuyền phó là Player A.
- **When:** Captain mở danh sách chọn Hoa tiêu.
- **Then:** Player A tiếp tục bị chặn không thể được chọn.

## Dependencies
- **Upstream UC:** UC-005 (hoặc quy trình kết thúc lượt trước).
- **Downstream UC:** UC-007

## Notes
- Captain chỉ mới ĐỀ XUẤT, họ chưa chính thức nhận chức. Mọi thứ phụ thuộc vào kết quả Nổi loạn.

## History
- v1 (2026-08-14, AI): initial
