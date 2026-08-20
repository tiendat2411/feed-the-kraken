# UC-018: Quản lý vòng đời Bot và Kết nối Sandbox (Bot Lifecycle & Sandbox Connection)

## Metadata
- **ID:** UC-018
- **Bounded Context:** Testing / Sandbox
- **Liên quan tới BR:** BR-006
- **Status:** draft
- **Owner:** Developer / QA Team
- **Last updated:** 2026-08-20

## Actor
- Tester / Developer (thực thi thông qua Node.js CLI script).

## Trigger
- Người kiểm thử chạy lệnh khởi tạo bot trên terminal: `node scripts/bots/spawn.js --room <ROOM_ID> --count <N>`.

## Preconditions
- Máy chủ WebSocket backend đang chạy và phản hồi tốt.
- Phòng chơi mục tiêu đã được tạo trước đó trên hệ thống và đang ở trạng thái `LOBBY` hoặc đang mở cho người chơi tham gia.
- Số lượng bot yêu cầu ($N$) cộng với số người chơi hiện tại trong phòng không vượt quá giới hạn tối đa 11 người.

## Main Flow
1. Tester thực thi lệnh spawn bot với tham số `roomCode` và số lượng `count` (mặc định từ 1 đến 10).
2. Tiến trình Node.js khởi tạo $N$ đối tượng Bot ảo hoàn toàn trong bộ nhớ RAM (In-Memory).
3. Với mỗi Bot ảo, hệ thống tự động sinh một `sessionToken` ngẫu nhiên độc lập (`bot_session_<uuid>`) và gán một Nickname mặc định (ví dụ: `Bot_1`, `Bot_2`,...).
4. Mỗi Bot thiết lập một kết nối WebSocket riêng biệt tới backend kèm `sessionToken` trong auth payload (Bypass hoàn toàn cơ chế LocalStorage của trình duyệt).
5. Sau khi kết nối socket thành công, từng Bot tự động phát sự kiện `join_room` kèm thông tin định danh và lựa chọn avatar ngẫu nhiên.
6. Server xác thực và đưa các Bot vào sảnh chờ phòng chơi.
7. Backend broadcast sự kiện `room_state` và `PLAYER_JOINED` tới tất cả các client (bao gồm cả trình duyệt của Tester thật).
8. Terminal in thông báo xác nhận: `[Sandbox] Đã kết nối thành công N bots vào phòng <ROOM_ID>`.

## Alternative Flows
- **1a. Tự động khởi tạo phòng mới (Auto-Create Room):** Tester chạy script không truyền `--room`, script sẽ tự động đóng vai trò Host, gửi `create_room` để tạo phòng mới, sau đó tự spawn thêm các bot còn lại để đủ 5-11 người chơi.

## Exceptions
- **E1. Phòng không tồn tại hoặc sai Room Code:** Server trả về lỗi -> Script in log cảnh báo `[Error] Phòng không tồn tại` và dừng tiến trình.
- **E2. Phòng đã đầy (Quá 11 người):** Số lượng bot thêm vào làm vượt quá 11 -> Script chỉ spawn số lượng bot tối đa có thể tham gia và ngắt kết nối các bot thừa.
- **E3. Server không khả dụng:** Không kết nối được tới cổng WebSocket -> Script thử kết nối lại 3 lần rồi thoát với mã lỗi rõ ràng.

## Postconditions
- $N$ Bot kết nối đồng thời và duy trì trạng thái active trong phòng chơi.
- Phòng chơi đạt đủ số lượng người chơi cần thiết để Host có thể bấm bắt đầu ván game (`START VOYAGE`).

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event (Client -> Server):** `join_room`
  - **Payload:** `{ roomId, nickname, avatar }`
- **Receive Event (Server -> Client):** `room_state`
  - **Payload:** Toàn bộ thông tin phòng đã được sanitize.

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- **Trường hợp Tester nhấn Ctrl+C (Tắt script):** Script đăng ký sự kiện `process.on('SIGINT')` để tự động gửi sự kiện `leave_room` và ngắt kết nối gracefully toàn bộ các socket bot đang active, tránh để lại zombie session trên server.

## Acceptance Criteria (Tầng 4)
### AC-1: Khởi tạo và kết nối nhiều Bot đồng thời
- **Given:** Một phòng chơi có mã `ABCDEF` đang mở ở màn hình sảnh chờ với 1 người chơi thật.
- **When:** Tester chạy lệnh `node scripts/bots/spawn.js --room ABCDEF --count 4`.
- **Then:** 4 bot ảo kết nối thành công qua 4 socket riêng biệt trong vòng dưới 3 giây.
- **And:** Giao diện của người chơi thật hiển thị đủ 5/11 thành viên và nút "START VOYAGE" chuyển sang trạng thái kích hoạt (enabled).

### AC-2: Độc lập định danh In-Memory (Bypass LocalStorage)
- **Given:** Một tiến trình Node.js duy nhất đang chạy 5 bot ảo.
- **When:** Các bot gửi sự kiện tới Server.
- **Then:** Server nhận diện 5 `sessionToken` và `socket.id` hoàn toàn tách biệt, không xảy ra xung đột hay ghi đè session lẫn nhau.

### AC-3: Ngắt kết nối an toàn (Graceful Shutdown)
- **Given:** 4 bot đang kết nối trong phòng chờ.
- **When:** Tester nhấn tổ hợp phím `Ctrl + C` trên terminal của tiến trình bot.
- **Then:** Toàn bộ 4 bot gửi tín hiệu rời phòng và ngắt kết nối socket, server cập nhật số lượng thành viên còn lại chính xác.

## Dependencies
- **Upstream UC:** Không có (Hoạt động độc lập thông qua giao thức WebSocket).
- **Downstream UC:** UC-019 (Bot Auto-Responder Engine), UC-020 (Bot CLI Override Controller).
- **External Systems:** `socket.io-client`.

## Notes
- Script phải đặt trong thư mục `scripts/bots/`, không đặt trong thư mục `src/` của backend/frontend.

## History
- v1 (2026-08-20, AI): initial đặc tả use case UC-018 cho BR-006.
