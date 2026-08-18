# UC-001: Tạo và Tham gia phòng chơi (Create & Join Room)

## Metadata
- **ID:** UC-001
- **Bounded Context:** Room/Session
- **Liên quan tới BR:** BR-001
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Người chơi (Player)
- Chủ phòng (Host)

## Trigger
- Host bấm nút "Tạo Phòng" từ màn hình chính (kèm tùy chọn Nickname và Avatar).
- Player bấm "Vào Phòng" và nhập Code/Link, kèm Nickname và chọn 1 Avatar từ danh sách có sẵn.

## Preconditions
- Hệ thống server WebSocket đang hoạt động bình thường.
- Player/Host chưa có session nào đang trong trạng thái In-game (để tránh 1 người vào nhiều phòng).

## Main Flow
1. Host bấm "Tạo phòng" (đã chọn Nickname và Avatar).
2. Server tạo một phòng mới với mã phòng (Room Code) duy nhất.
3. Server khởi tạo session cho Host, trả về `sessionToken` và lưu vào LocalStorage của trình duyệt Host.
4. Server đưa Host vào Sảnh chờ (Lobby) và thiết lập Host làm người có quyền cao nhất.
5. Người chơi khác nhập Room Code, Nickname và chọn 1 Avatar từ danh sách có sẵn do game cung cấp để tham gia.
6. Server khởi tạo định danh (PlayerID) và cấp `sessionToken` riêng cho Player này, đồng thời lưu vào LocalStorage.
7. Player được đưa vào Sảnh chờ của phòng.
8. Giao diện sảnh chờ của tất cả mọi người được cập nhật danh sách thành viên.

## Alternative Flows
- **1a. Tham gia qua Link:** Người chơi click vào link chia sẻ, hệ thống tự động điền Room Code, người chơi chỉ cần nhập Nickname để vào.

## Exceptions
- **E1. Trùng lặp định danh (Multi-tabbing):** Nếu người chơi cố tình mở tab mới và join lại, hệ thống phát hiện `sessionToken` đang active -> Báo lỗi "Bạn đã có trong phòng" hoặc tự động redirect tab mới về đúng trạng thái của tab cũ (ngăn chặn duplicate connection).
- **E2. Phòng đã đầy hoặc đang chơi:** Nếu phòng đã đủ 11 người hoặc đang trong trận -> Báo lỗi "Phòng đã đầy hoặc đang trong trận đấu".
- **E3. Phòng không tồn tại:** Nhập sai Room Code -> Báo lỗi "Mã phòng không hợp lệ".

## Postconditions
- Phòng chờ được tạo thành công với ít nhất 1 Host.
- Người chơi được liệt kê trong danh sách sảnh chờ và có kết nối WebSocket ổn định với 1 Session duy nhất.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `PLAYER_JOINED`
- **To:** Toàn bộ client đang active trong phòng.
- **Payload:** `{ player_id, nickname, avatar, is_host, total_players }`

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- **Trường hợp F5 / Tải lại trang:** Khi user F5 ở màn hình sảnh chờ, client gửi lại `sessionToken`. Server xác nhận và trả về trạng thái phòng mà không khởi tạo player mới (Xem thêm UC-002 về State Recovery).

## Acceptance Criteria (Tầng 4)
### AC-1: Tạo phòng thành công
- **Given:** Máy chủ đang hoạt động.
- **When:** Người dùng chọn "Tạo phòng".
- **Then:** Một phòng mới được tạo và người dùng trở thành Host.
- **And:** Client nhận được và lưu `sessionToken`.

### AC-2: Tham gia phòng thành công
- **Given:** Một phòng đang ở trạng thái LOBBY và chưa đủ 11 người.
- **When:** Người dùng nhập đúng Code, Nickname và chọn Avatar.
- **Then:** Người dùng tham gia thành công.
- **And:** Giao diện của TẤT CẢ người chơi trong phòng cập nhật danh sách mới thông qua event broadcast.

### AC-3: Ngăn chặn join bằng nhiều tab (Identity Control)
- **Given:** Người chơi đang ở trong phòng bằng một tab.
- **When:** Người chơi mở tab mới và cố gắng truy cập lại phòng.
- **Then:** Hệ thống chặn kết nối mới hoặc tự động đồng bộ tab mới với trạng thái của tab hiện tại.

## Dependencies
- **Upstream UC:** Không có.
- **Downstream UC:** UC-002, UC-003
- **External Systems:** Không có.

## Notes
- Đây là điểm bắt đầu của mọi session, cần đảm bảo thời gian tạo phòng (latency) < 2s.

## History
- v1 (2026-08-14, AI): initial dựa theo nguyên tắc Mạng mới.
