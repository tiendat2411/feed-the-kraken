# ENT-002: Player (Người chơi)

## Metadata
- **ID:** ENT-002
- **Bounded Context:** Room/Session, Identity, GamePlay
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## 1. Description (Mô tả)
Player đại diện cho một người dùng đang tham gia vào một Room. Thực thể này không yêu cầu đăng nhập tài khoản hệ thống (không cần Google/Facebook), mà được quản lý dựa trên Session Token lưu ở trình duyệt. Nó lưu trữ các thông tin công khai (nickname, avatar, trạng thái kết nối) và thông tin bí mật (vai trò phe phái - chỉ Server và chính người đó được biết).

## 2. Attributes (Thuộc tính dữ liệu)

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc (Req) | Ràng buộc/Mặc định (Validation/Default) | Mô tả (Description) |
| :--- | :--- | :---: | :--- | :--- |
| `id` | UUID | Y | Auto-generated | Định danh duy nhất của Player trong hệ thống |
| `room_id` | String | Y | Khớp với ID của Room | Phòng mà người này đang tham gia |
| `session_token` | String | Y | Unique Token (JWT/UUID) | Chuỗi token dùng để nhận diện và phục hồi trạng thái (State Recovery) |
| `nickname` | String | Y | Length: 1-15 chars | Tên hiển thị do người chơi tự nhập |
| `avatar` | String | Y | Thuộc danh sách có sẵn | ID hoặc URL của Avatar được chọn |
| `connection_status`| Enum | Y | Default: `ONLINE` | Trạng thái mạng (`ONLINE`, `RECONNECTING`) |
| `faction_role` | Enum | N | Bắt buộc khi vào `IN_GAME`| Phe phái bí mật (`SAILOR`, `PIRATE`, `CULT_LEADER`, `CULTIST`) |
| `public_titles` | Array[Enum]| Y | Default: `[]` | Các chức danh công khai (VD: `CAPTAIN`, `LIEUTENANT`, `NAVIGATOR`) |
| `speech_restricted`| Boolean| Y | Default: `false` | Bị cắt lưỡi (OFF WITH THE TONGUE). Nếu `true`, người chơi bị cấm chat và không bao giờ được làm Captain. |

## 3. State Lifecycle (Vòng đời trạng thái)
- **[ONLINE] -> [RECONNECTING]:** Kích hoạt khi có sự kiện `socket_disconnect` (rớt mạng, F5, đóng tab). Time-out đếm ngược có thể bắt đầu kích hoạt tự động tại đây để auto-kick/auto-clean nếu quá lâu.
- **[RECONNECTING] -> [ONLINE]:** Kích hoạt khi client cung cấp đúng `session_token` qua kết nối mới (State Recovery).
- **[ONLINE/RECONNECTING] -> [DELETED]:** Kích hoạt khi người dùng chủ động bấm "Rời phòng" hoặc bị Host kick, hoặc auto-clean do mất kết nối quá lâu.

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
- Một `session_token` chỉ được phép active trên MỘT kết nối (socket) duy nhất tại một thời điểm để ngăn tình trạng multi-tabbing (Trùng lặp định danh).
- Giá trị của `faction_role` TUYỆT ĐỐI không được gửi xuống client của những người chơi khác thông qua các event broadcast chung. (Tuân thủ Nguyên tắc Uncompromising Game Logic).

## 5. Relationships (Quan hệ với các Entity khác)
- **N-1 với [ENT-001]:** Thuộc về 1 Room duy nhất trong một thời điểm.

## 6. Related Use Cases
- Sử dụng trong: UC-001, UC-002, UC-003, UC-004, UC-005.
- Thay đổi bởi: UC-001 (Khởi tạo, gán session_token, avatar), UC-002 (Đổi trạng thái mạng, kick/leave), UC-003 (Gán faction_role), UC-005 (Gán title CAPTAIN).

## History
- v1 (2026-08-14, AI): initial
