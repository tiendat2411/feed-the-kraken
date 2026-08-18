# UC-018: Luồng Kết Thúc Game (End Game Flow)

## Metadata
- **ID:** UC-018
- **Bounded Context:** GamePlay, Session
- **Liên quan tới BR:** BR-005
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-18

## Actor
- Hệ thống (System)

## Trigger
- Được gọi từ UC-017 (Victory Check) khi có một phe đạt đủ điều kiện thắng.

## Preconditions
- Có phe chiến thắng được xác định hợp lệ (Sailor, Pirate, hoặc Cult).

## Main Flow
1. Hệ thống ra lệnh đóng băng toàn bộ Game State: Ngắt tất cả các Timeout đang đếm ngược, hủy bỏ các luồng biểu quyết/chọn bài/kỹ năng đang pending.
2. Hệ thống chuyển Game State của Room từ `IN_GAME` sang `GAME_OVER`.
3. Hệ thống tạo ra một bản ghi thực thể `ENT-006: Game Result` lưu lại `winning_faction`, `win_reason`, và lấy snapshot trạng thái cuối cùng của tất cả người chơi.
4. Hệ thống công khai toàn bộ dữ liệu ẩn của TẤT CẢ mọi người (Tiết lộ: Vai trò nguyên thủy ban đầu, Vai trò hiện tại, Ai là Cult Leader, Ai đã bị thu nạp làm Cultist).
5. Giao diện toàn phòng hiển thị Màn hình Vinh danh (Victory Screen):
   - Logo/Animation hoành tráng của phe chiến thắng.
   - Danh sách những người chơi thuộc phe thắng.
   - Danh sách những người chơi thuộc phe thua (kèm theo avatar & nickname).
6. Cung cấp nút "Quay lại Sảnh (Back to Lobby)" dành cho Host. Khi Host bấm, bàn chơi được reset, tất cả cùng được đưa trở lại sảnh chờ (Lobby) để chuẩn bị cho ván mới.

## Alternative Flows
- Không có.

## Exceptions
- Không có, quá trình End Game hoàn toàn tự động trên server.

## Postconditions
- Game Session hoàn tất và ghi vào lịch sử.
- Trạng thái phòng được dọn dẹp để chuẩn bị ván sau.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `GAME_OVER`
- **To:** Toàn bộ phòng.
- **Payload:** `{ winning_faction, win_reason, players_snapshot: [{ id, nickname, original_faction, current_faction }] }`

## Acceptance Criteria (Tầng 4)
### AC-1: Tiết lộ thông tin triệt để
- **Given:** Trò chơi kết thúc do Sailor chiến thắng khi cán đích.
- **When:** Màn hình End Game hiện lên (nhận event `GAME_OVER`).
- **Then:** Mọi người chơi đều có thể nhìn thấy dữ liệu phe phái thật sự (ví dụ: A là Pirate, B là Cult Leader, C ban đầu là Sailor nhưng đã thành Cultist) trên bảng tổng kết, bất kể họ thuộc phe nào.

## Dependencies
- **Upstream UC:** UC-017.
- **Downstream UC:** Chuyển về sảnh chờ (Lobby - BR-001).

## History
- v1 (2026-08-18, AI): initial
