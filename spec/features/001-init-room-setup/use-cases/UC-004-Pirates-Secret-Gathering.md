# UC-004: Giai đoạn Hội tụ bí mật của Hải tặc (Pirates Secret Gathering)

## Metadata
- **ID:** UC-004
- **Bounded Context:** GamePlay
- **Liên quan tới BR:** BR-001
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Người chơi phe Hải tặc (Pirates)
- Trưởng giáo (Cult Leader)
- Hệ thống (System)

## Trigger
- Sau khi UC-003 hoàn thành và người chơi đã xem xong Role của mình.

## Preconditions
- Mọi người chơi đã được chia phe.
- Game chuyển sang trạng thái `NIGHT_PHASE_1`.

## Main Flow
1. Màn hình của toàn bộ người chơi hiện chỉ báo "Tất cả nhắm mắt lại".
2. UI của người chơi phe Sailor và Cultist bị làm mờ/che tối hoàn toàn (Simulate nhắm mắt).
3. Server gửi danh sách các Hải tặc cho riêng những người chơi mang role Pirate.
4. Màn hình của nhóm Pirate sẽ sáng lên và hiển thị chân dung/nickname của những đồng bọn Hải tặc khác trong vòng 20 giây.
5. Hết 20 giây, màn hình của Hải tặc tối lại.
6. Tất cả mọi người cùng "Mở mắt" (Giao diện sáng trở lại).

## Alternative Flows
- Tùy thuộc vào bộ luật mở rộng hoặc số lượng người chơi, Trưởng giáo (Cult Leader) có thể có hành động mở mắt riêng để xem xét một số người. Nếu áp dụng, thêm phase phụ cho Cult Leader.

## Exceptions
- **E1. Người chơi F5 trong giai đoạn 20s này:** Nếu người chơi (VD: Pirate) F5 trang, khi reconnect server vẫn gửi lại payload chứa danh sách đồng bọn kèm thời gian đếm ngược còn lại (Countdown sync) để họ tiếp tục xem mà không bị lộ.

## Postconditions
- Các Hải tặc (Pirates) đã nhận diện được nhau.
- Game chuẩn bị chuyển sang trạng thái ban ngày (DAY_PHASE).

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `NIGHT_PHASE_STARTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ duration: 20 }`

- **Emit Event:** `PIRATES_REVEAL`
- **To:** CHỈ những client có role `Pirate`.
- **Payload:** `{ pirate_list: [player_id1, player_id2...] }`

- **Emit Event:** `DAY_PHASE_STARTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{}`

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- Server là người quản lý duy nhất bộ đếm thời gian (Timer = 20s). Client chỉ nhận Timer để hiển thị đếm ngược. Hết 20s, Server chủ động phát sự kiện chuyển phase, không phụ thuộc vào việc client có đếm xong hay bị lag hay không.

## Acceptance Criteria (Tầng 4)
### AC-1: Hải tặc thấy nhau
- **Given:** Giai đoạn hội tụ bí mật.
- **When:** Người chơi là Pirate nhìn vào màn hình.
- **Then:** Họ thấy rõ được nickname của các Pirate khác.

### AC-2: Thủy thủ bị che mắt
- **Given:** Giai đoạn hội tụ bí mật.
- **When:** Người chơi là Sailor hoặc Cultist.
- **Then:** Màn hình của họ hiển thị trạng thái "Đang nhắm mắt" và hoàn toàn KHÔNG nhận được bất kỳ data nào về danh tính của các Pirate qua mạng.

## Dependencies
- **Upstream UC:** UC-003
- **Downstream UC:** UC-005

## Notes
- UI/UX phần "nhắm mắt" cần được thiết kế trực quan (VD: overlay đen phủ kín, có icon mắt nhắm).

## History
- v1 (2026-08-14, AI): initial.
