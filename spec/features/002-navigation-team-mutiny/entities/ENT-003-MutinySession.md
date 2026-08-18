# ENT-003: Mutiny Session (Phiên Nổi Loạn)

## Metadata
- **ID:** ENT-003
- **Bounded Context:** GamePlay, Mutiny
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## 1. Description (Mô tả)
`MutinySession` là một thực thể tạm thời (transient entity) được tạo ra mỗi khi bước vào giai đoạn Biểu quyết (Loyalty Check). Nó lưu trữ trạng thái biểu quyết của từng người chơi, đếm ngược thời gian, và duy trì trạng thái của chuỗi loại trừ (Tie-breaker) nếu xảy ra kết quả hòa.

## 2. Attributes (Thuộc tính dữ liệu)

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc (Req) | Ràng buộc/Mặc định (Validation/Default) | Mô tả (Description) |
| :--- | :--- | :---: | :--- | :--- |
| `id` | UUID | Y | Auto-generated | Định danh phiên biểu quyết |
| `room_id` | String | Y | Khớp với ID của Room | Phòng diễn ra nổi loạn |
| `votes` | Map<UUID, Int>| Y | Default: `{}` | Lưu `player_id` và số súng họ nộp |
| `status` | Enum | Y | `VOTING`, `RESOLVING`, `TIE_BREAKER`, `COMPLETED` | Trạng thái của phiên |
| `required_guns` | Int | Y | Theo luật (3, 4, hoặc 5) | Số súng tối thiểu để thành công |
| `tie_candidates`| Array[UUID] | N | | Danh sách những người đang hòa |
| `current_chooser`| UUID | N | | ID của người đang cầm quyền loại trừ (Tie-breaker) |

## 3. State Lifecycle (Vòng đời trạng thái)
- **[VOTING] -> [RESOLVING]:** Khi tất cả mọi người (trừ Captain) đã nộp súng hoặc hết time-out (90s).
- **[RESOLVING] -> [COMPLETED]:** Tính toán xong, không có kết quả hòa, chốt trừ súng/đổi Captain.
- **[RESOLVING] -> [TIE_BREAKER]:** Tính toán xong, Mutiny thành công nhưng có >1 người nộp số súng cao nhất bằng nhau.
- **[TIE_BREAKER] -> [TIE_BREAKER]:** Khi một người bị loại, quyền `current_chooser` chuyển sang người đó.
- **[TIE_BREAKER] -> [COMPLETED]:** Khi `tie_candidates` chỉ còn 1 người duy nhất.

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
- `votes` chỉ chấp nhận `player_id` hợp lệ và số lượng súng `0 <= vote <= current_gun_count` của người đó.
- Captain hiện tại TUYỆT ĐỐI KHÔNG có mặt trong quá trình bầu phiếu `votes`.
- Tổng thời gian ở state `VOTING` khi có người rớt mạng không vượt quá 90s. (Nếu tất cả online, họ có thời gian vô hạn theo Game Pace logic).

## 5. Relationships (Quan hệ với các Entity khác)
- **N-1 với [ENT-001-Room]:** Thuộc về 1 Game Session.
- Liên kết với **[ENT-002-Player]**: Trừ súng trực tiếp vào `gun_count` của Player khi thành công.

## 6. Related Use Cases
- Sử dụng trong: UC-007, UC-008.

## History
- v1 (2026-08-14, AI): initial
