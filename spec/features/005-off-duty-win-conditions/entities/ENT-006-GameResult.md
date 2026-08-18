# ENT-006: Game Result (Kết quả Ván Chơi)

## Metadata
- **ID:** ENT-006
- **Bounded Context:** GamePlay, Analytics
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-18

## 1. Description (Mô tả)
Thực thể đại diện cho bản ghi kết quả của một ván chơi sau khi kết thúc. Hỗ trợ cho màn hình vinh danh, xuất báo cáo tổng kết, và lưu lịch sử ván đấu.

## 2. Attributes (Thuộc tính dữ liệu)

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc (Req) | Ràng buộc/Mặc định (Validation/Default) | Mô tả (Description) |
| :--- | :--- | :---: | :--- | :--- |
| `id` | UUID | Y | Auto-generated | Định danh duy nhất của record |
| `room_id` | String | Y | Khớp ID Room | Mã phòng diễn ra trận đấu |
| `winning_faction` | Enum | Y | `SAILOR`, `PIRATE`, `CULT` | Phe chiến thắng |
| `win_reason` | Enum/String| Y | `REACHED_DESTINATION`, `CULT_LEADER_SACRIFICED` | Lý do/sự kiện kích hoạt chiến thắng |
| `players_snapshot`| Array | Y | | Snapshot trạng thái cuối cùng (vai trò nguyên thủy, vai trò hiện tại) của toàn bộ người chơi lúc kết thúc |
| `timestamp` | DateTime | Y | Auto | Thời điểm kết thúc ván đấu |

## 3. State Lifecycle (Vòng đời trạng thái)
- **[CREATED]:** Được khởi tạo ở bước cuối cùng của luồng UC-018 (End Game Flow). Tồn tại tĩnh (immutable) như một bản ghi lịch sử.

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
- `players_snapshot` bắt buộc phải phơi bày 100% dữ liệu phe phái thật sự của mọi người chơi tại thời điểm game kết thúc, không được giấu giếm bất cứ ai.

## 5. Relationships (Quan hệ với các Entity khác)
- **N-1 với [ENT-001-Room]:** Một phòng có thể có nhiều Game Result theo thời gian (khi chơi nhiều ván liên tục).

## 6. Related Use Cases
- Sử dụng trong: UC-018.

## History
- v1 (2026-08-18, AI): initial
