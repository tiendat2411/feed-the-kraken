# ENT-005: Map Board (Bàn cờ)

## Metadata
- **ID:** ENT-005
- **Bounded Context:** GamePlay, Board
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-17

## 1. Description (Mô tả)
`MapBoard` quản lý vị trí hiện tại của con tàu trên lưới tọa độ, lưu trữ cấu hình bản đồ đã chọn, quản lý bộ bài Nghi thức Giáo phái (Cult Ritual Deck) và theo dõi trạng thái đã qua đường tiếp tế (Supply Line) hay chưa.

## 2. Attributes (Thuộc tính dữ liệu)

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc (Req) | Ràng buộc/Mặc định (Validation/Default) | Mô tả (Description) |
| :--- | :--- | :---: | :--- | :--- |
| `id` | UUID | Y | Auto-generated | Định danh |
| `room_id` | String | Y | Khớp ID Room | Thuộc phòng nào |
| `map_mode` | Enum | Y | `QUICK_JOURNEY`, `LONG_JOURNEY` | Chế độ bản đồ |
| `ship_position` | String | Y | Bắt đầu ở Start Node | ID của ô (node) hiện tại của tàu |
| `has_crossed_supply_line`| Boolean| Y | Default: `false` | Cờ ghi nhận đã đi qua đường tiếp tế (Long Journey) |
| `cult_ritual_deck`| Array[Enum] | Y | Length: 5 | Bộ 5 lá bài Nghi thức (1 súng, 1 soi phe, 3 thu nạp). |

## 3. State Lifecycle (Vòng đời trạng thái)
- `ship_position` thay đổi sau mỗi lần Navigator chốt lá bài điều hướng ở phase Execution.
- `cult_ritual_deck` giảm dần (bị rút mất 1) mỗi lần có sự kiện CULT UPRISING. Nếu mảng này rỗng, sự kiện CULT UPRISING bị bỏ qua trong tương lai.
- `has_crossed_supply_line` chỉ được bật từ `false` thành `true` một lần duy nhất khi tàu cắt qua đường nối tiếp tế.

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
- Luôn kiểm tra điều kiện kết thúc game ngay khi `ship_position` thay đổi (vào vùng Bluewater Bay, Crimson Cove, hoặc Kraken).

## 5. Relationships (Quan hệ với các Entity khác)
- **1-1 với [ENT-001-Room]**

## 6. Related Use Cases
- Sử dụng trong: UC-012, UC-013, UC-015

## History
- v1 (2026-08-17, AI): initial
