# UC-002: Quản lý Sảnh chờ và Giải tán phòng (Lobby Management & Dissolution)

## Metadata
- **ID:** UC-002
- **Bounded Context:** Room/Session
- **Liên quan tới BR:** BR-001
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Chủ phòng (Host)
- Người chơi (Player)
- Hệ thống (System)

## Trigger
- Host chọn loại map và bấm "Bắt đầu game".
- Host bấm "Giải tán phòng" hoặc "Kick người chơi".
- Người chơi bấm "Rời phòng".
- Mất kết nối WebSocket (Disconnect) / F5.

## Preconditions
- Người chơi/Host đã ở trong Sảnh chờ và có `sessionToken` hợp lệ.

## Main Flow (Bắt đầu game)
1. Host chọn loại bản đồ cho phòng (Quick Journey hoặc Long Journey).
2. Host bấm "Bắt đầu".
3. Server kiểm tra số lượng người chơi (từ 5 đến 11 người).
4. Server lưu cấu hình bản đồ và chuyển trạng thái phòng sang IN_GAME.
5. Server kích hoạt hệ thống chia phe phái (chuyển sang UC-003).

## Alternative Flows
- **1a. Giải tán phòng (Close Room):** Host chọn "Giải tán phòng" từ sảnh chờ hoặc khi đang trong game. Server xác nhận quyền Host, xóa toàn bộ data của phòng, phát sự kiện `ROOM_DISSOLVED` và điều hướng mọi người về trang chủ.
- **1b. Kích người chơi (Kick Player):** Trong sảnh chờ, Host chọn một người chơi và bấm Kick. Server xóa người đó khỏi phòng, phát sự kiện `PLAYER_KICKED` (người bị kick văng ra trang chủ) và `PLAYER_LEFT` cho những người còn lại.
- **1c. Người chơi rời phòng (Leave Room):** Người chơi tự bấm "Rời phòng" khi ở sảnh chờ. Server xóa người đó khỏi phòng và phát sự kiện `PLAYER_LEFT`.

## Exceptions
- **E1. Không đủ người chơi:** Host bấm "Bắt đầu" khi chưa đủ 5 người -> Báo lỗi "Cần tối thiểu 5 người để bắt đầu".
- **E2. Mất quyền Host:** Nếu Host rớt mạng và không quay lại sau khoảng thời gian nhất định, hệ thống có thể tự động đóng phòng hoặc (tùy luật) chuyển quyền Host.

## Postconditions
- Tùy luồng: Phòng bị giải tán, hoặc trò chơi bắt đầu, hoặc danh sách người chơi thay đổi.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `ROOM_DISSOLVED`
- **To:** Toàn bộ người trong phòng.
- **Payload:** `{ reason: "Host closed the room" }`

- **Emit Event:** `PLAYER_LEFT`
- **To:** Những người còn lại trong phòng.
- **Payload:** `{ player_id }`

- **Emit Event:** `PLAYER_KICKED`
- **To:** Client của người bị kick.
- **Payload:** `{ reason: "You have been kicked by the Host" }`

- **Emit Event:** `PLAYER_DISCONNECTED` / `PLAYER_RECONNECTED`
- **To:** Những người còn lại trong phòng.
- **Payload:** `{ player_id, status }`

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- **Trường hợp player_leave (Chủ động rời):** Xóa player khỏi database phòng.
- **Trường hợp socket_disconnect (Rớt mạng tạm thời / Tắt tab):** Đánh dấu trạng thái player là "Reconnecting" (Offline). KHÔNG xóa khỏi phòng. Broadcast để UI người khác làm mờ Avatar của người này.
- **Trường hợp State Recovery (F5 / Reconnect):** Khi client có lại mạng, client gửi lên `sessionToken`. Server xác thực và trả về TOÀN BỘ payload `room_state` (danh sách người chơi, trạng thái game, vai trò) để UI khôi phục hoàn toàn. Trạng thái của player chuyển lại thành "Online" và broadcast cho người khác.
- **Trường hợp Auto-clean:** Nếu phòng không có ai active hoặc một người disconnect quá 2 tiếng, tự động xóa data rác.

## Acceptance Criteria (Tầng 4)
### AC-1: Quyền giải tán phòng của Host
- **Given:** Host đang ở trong phòng (bất kể giai đoạn nào).
- **When:** Host chọn "Giải tán".
- **Then:** Phòng bị hủy và TẤT CẢ client bị đẩy về trang chủ.

### AC-2: Xử lý Rớt mạng tạm thời
- **Given:** Một người chơi bị rớt mạng đột ngột.
- **When:** Kết nối WebSocket bị đứt (`socket_disconnect`).
- **Then:** Người chơi đó KHÔNG bị văng khỏi hệ thống, hiển thị biểu tượng Offline trên màn hình những người khác.

### AC-3: Phục hồi trạng thái (State Recovery)
- **Given:** Người chơi vừa F5 trang web hoặc mất mạng vào lại.
- **When:** Client gửi `sessionToken` hợp lệ lên server.
- **Then:** Server trả về nguyên vẹn `room_state` để giao diện khôi phục chính xác trạng thái phòng.
- **And:** Biểu tượng Offline của người đó biến mất trên màn hình những người khác (sự kiện `PLAYER_RECONNECTED`).

## Dependencies
- **Upstream UC:** UC-001
- **Downstream UC:** UC-003

## Notes
- State Recovery là cốt lõi của tính năng chống chịu lỗi (Resilience) trong dự án này.

## History
- v1 (2026-08-14, AI): initial theo chuẩn Networking mới.
