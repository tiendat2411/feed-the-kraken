# UC-003: Phân bổ Phe phái và Khởi tạo Bản đồ (Role Distribution & Map Setup)

## Metadata
- **ID:** UC-003
- **Bounded Context:** GamePlay
- **Liên quan tới BR:** BR-001
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Hệ thống (System)

## Trigger
- UC-002 hoàn tất (Host bấm Bắt đầu game khi đủ 5-11 người).

## Preconditions
- Số lượng người chơi hợp lệ (5-11).
- Trạng thái phòng chuyển sang IN_GAME.

## Main Flow
1. Hệ thống đếm tổng số người chơi (N).
2. Dựa vào N, hệ thống xác định số lượng của từng phe: Sailor, Pirate, Cult Leader, và Cultist theo bảng luật chuẩn của Feed the Kraken.
3. Thuật toán xáo trộn ngẫu nhiên (Shuffle) và gắn vai trò (Role) bí mật cho từng PlayerID.
4. Hệ thống chọn thiết kế Bản đồ (Map) dựa trên cấu hình mà Host đã chọn trước đó ở sảnh chờ (Quick Journey hoặc Long Journey trong UC-002).
5. Hệ thống lưu trạng thái Game (bao gồm phe phái, bản đồ) vào memory/database.
6. Gửi thông tin cá nhân (phe phái của chính họ) tới từng client tương ứng. (TUYỆT ĐỐI KHÔNG gửi role của người khác để chống hack/cheat).

## Alternative Flows
- Không có. (Luật chia phe là cố định dựa trên số lượng người chơi).

## Exceptions
- **E1. Lỗi phân bổ:** Nếu tổng số role sinh ra không khớp với N -> Báo lỗi hệ thống và fallback game về sảnh chờ (Lobby).

## Postconditions
- Mỗi người chơi đều nhận được role bí mật của mình hiển thị trên màn hình.
- Bản đồ hành trình được hiển thị ở trạng thái xuất phát (Mốc 0).

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `ROLE_ASSIGNED`
- **To:** Từng client riêng biệt (Direct Message qua Socket).
- **Payload:** `{ role: "Sailor" | "Pirate" | "Cult Leader" | "Cultist" }` (Chỉ chứa thông tin của chính client đó).

- **Emit Event:** `GAME_STARTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ map_type, total_players, current_phase: "NIGHT_1" }`

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- **Trường hợp F5 (State Recovery):** Nếu ai đó F5 ngay lúc này, `room_state` trả về từ server sẽ chứa trường `my_role` bí mật và giao diện bản đồ, đảm bảo người chơi không bị lỡ việc xem role của mình. Các client khác sẽ không thấy role này trong `room_state` của họ.

## Acceptance Criteria (Tầng 4)
### AC-1: Chia phe chính xác
- **Given:** Phòng có 7 người chơi.
- **When:** Host bắt đầu game.
- **Then:** Hệ thống chia đúng 4 Sailor, 2 Pirate, 1 Cult Leader.

### AC-2: Bảo mật thông tin phe phái
- **Given:** Giai đoạn chia phe.
- **When:** Client nhận dữ liệu từ server.
- **Then:** Payload trả về cho mỗi người chơi CHỈ chứa role của người đó, không thể dùng chức năng Inspect Network của trình duyệt để xem role người khác.

## Dependencies
- **Upstream UC:** UC-002
- **Downstream UC:** UC-004

## Notes
- Logic Game (Source of Truth) phải chặn mọi khả năng rò rỉ (leak) danh sách phe phái xuống client.

## History
- v1 (2026-08-14, AI): initial.
