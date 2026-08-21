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
| `id` | UUID | Y | Auto-generated | Định danh duy nhất |
| `room_id` | String | Y | Khớp ID Room | Thuộc phòng nào |
| `map_mode` | Enum | Y | `QUICK_JOURNEY`, `LONG_JOURNEY` | Chế độ bản đồ |
| `ship_position` | String | Y | Mặc định: `'START'` | ID của ô (node) hiện tại của con tàu |
| `has_crossed_supply_line`| Boolean| Y | Default: `false` | Cờ ghi nhận đã đi qua đường tiếp tế (Map Long Journey) |
| `cult_ritual_deck`| Array[Enum] | Y | Length: 5 (1 Guns, 1 Search, 3 Conversion) | Bộ bài 5 lá Nghi thức Tà giáo |
| `visitedNodes` | Array[String] | Y | Mặc định: `['START']` | Lịch sử danh sách các node tàu đã đi qua |

## 3. State Lifecycle (Vòng đời trạng thái)
- `ship_position` thay đổi sau mỗi lần Navigator chốt lá bài điều hướng ở phase Execution.
- `visitedNodes` tự động append thêm node mới sau mỗi lần di chuyển.
- `cult_ritual_deck` giảm dần (bị rút mất 1) mỗi lần có sự kiện CULT UPRISING. Nếu mảng này rỗng, sự kiện CULT UPRISING bị bỏ qua trong tương lai.
- `has_crossed_supply_line` chỉ được bật từ `false` thành `true` một lần duy nhất khi tàu cắt qua đường nối tiếp tế.

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
- Luôn kiểm tra điều kiện kết thúc game ngay khi `ship_position` thay đổi (vào vùng Bluewater Bay, Crimson Cove, hoặc Kraken).
- Chi tiết cấu trúc đồ thị lục giác và danh mục node tham khảo tại: [spec-map-graph.md](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/spec/features/004-execution-events/spec-map-graph.md).

## 5. Relationships (Quan hệ với các Entity khác)
- **1-1 với [ENT-001-Room]**
- **Nạp cấu hình từ Graph JSON tĩnh:** `quick-journey.json` và `long-journey.json`.

## 6. Related Use Cases
- Sử dụng trong: UC-012 (Ship Movement), UC-013 (Map Actions), UC-014 (Card Effects), UC-015 (Cult Uprising)

## History
- v1 (2026-08-17, AI): initial
- v2 (2026-08-21, AI & User): cập nhật chuẩn hóa theo bản đồ lục giác vật lý gốc và tài liệu spec-map-graph.md
