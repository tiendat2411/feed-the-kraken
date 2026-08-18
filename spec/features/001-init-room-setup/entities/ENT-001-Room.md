# ENT-001: Room (Phòng Chơi / Game Session)

## Metadata
- **ID:** ENT-001
- **Bounded Context:** Room/Session, GamePlay
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## 1. Description (Mô tả)
Room đại diện cho một phiên chơi game (Session) duy nhất. Nó chịu trách nhiệm quản lý danh sách người chơi, cấu hình bản đồ do Host chọn, và là nơi lưu trữ "Source of Truth" về trạng thái hiện tại của toàn bộ ván game (đang ở sảnh, đang đêm, hay đang ngày).

## 2. Attributes (Thuộc tính dữ liệu)

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc (Req) | Ràng buộc/Mặc định (Validation/Default) | Mô tả (Description) |
| :--- | :--- | :---: | :--- | :--- |
| `id` | String | Y | Random 6 chữ cái (e.g. `ABCDEF`) | Mã phòng để join |
| `host_id` | UUID | Y | ID của Player | Định danh của người làm Host |
| `status` | Enum | Y | Default: `LOBBY` | Trạng thái vòng đời của phòng (`LOBBY`, `IN_GAME`, `FINISHED`) |
| `game_phase` | Enum | N | Tùy thuộc tiến trình | Giai đoạn trong game (VD: `NIGHT_1`, `DAY_1_CREW_SELECTION`...) |
| `map_type` | Enum | Y | Default: `QUICK_JOURNEY` | Loại bản đồ hành trình (`QUICK_JOURNEY` hoặc `LONG_JOURNEY`) |
| `captain_id` | UUID | N | Nullable | ID của người chơi đang giữ chức Thuyền trưởng hiện tại |
| `created_at` | Timestamp | Y | Auto-generated | Thời điểm tạo phòng |
| `last_activity` | Timestamp | Y | Cập nhật khi có event | Dùng để auto-clean phòng nếu không có ai active quá 2 tiếng |

## 3. State Lifecycle (Vòng đời trạng thái)
- **[LOBBY] -> [IN_GAME]:** Kích hoạt khi Host bấm "Bắt đầu game" và số lượng người chơi thỏa mãn (5-11).
- **[LOBBY] -> [DISSOLVED]:** Kích hoạt khi Host bấm "Giải tán phòng" hoặc phòng bị auto-clean do không có người.
- **[IN_GAME] -> [DISSOLVED]:** Kích hoạt khi Host bấm "Giải tán phòng" giữa chừng.
- **[IN_GAME] -> [FINISHED]:** Kích hoạt khi game kết thúc tự nhiên theo luật (sẽ có ở các BR sau).

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
- Số lượng người chơi (Players) trong Room đang ở trạng thái `IN_GAME` phải luôn luôn nằm trong khoảng từ 5 đến 11 người.
- `host_id` phải luôn trỏ đến một Player hợp lệ đang thuộc về Room này.
- Chỉ có tối đa 1 người giữ chức danh `captain_id` ở bất kỳ thời điểm nào.

## 5. Relationships (Quan hệ với các Entity khác)
- **1-N với [ENT-002]:** Một Room có thể chứa từ 1 đến 11 Player.

## 6. Related Use Cases
- Sử dụng trong: UC-001, UC-002, UC-003, UC-004, UC-005.
- Thay đổi bởi: UC-001 (Tạo phòng), UC-002 (Bắt đầu/Giải tán phòng), UC-003 (Cập nhật game_phase), UC-005 (Cập nhật captain).

## History
- v1 (2026-08-14, AI): initial
