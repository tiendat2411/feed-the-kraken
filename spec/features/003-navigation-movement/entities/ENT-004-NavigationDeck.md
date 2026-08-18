# ENT-004: Navigation Deck (Bộ bài Điều hướng)

## Metadata
- **ID:** ENT-004
- **Bounded Context:** GamePlay, Navigation
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## 1. Description (Mô tả)
Thực thể đại diện cho toàn bộ bộ bài điều hướng và các chồng bài liên quan trên bàn. Nó là "Source of Truth" để đảm bảo tính ngẫu nhiên, ẩn danh của các thẻ bài, và quản lý luồng xáo trộn (Auto-reshuffle) khi hết bài.

## 2. Attributes (Thuộc tính dữ liệu)

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc (Req) | Ràng buộc/Mặc định (Validation/Default) | Mô tả (Description) |
| :--- | :--- | :---: | :--- | :--- |
| `id` | UUID | Y | Auto-generated | Định danh duy nhất |
| `room_id` | String | Y | Khớp với ID của Room | Thuộc về phòng nào |
| `draw_pile` | Array[Card] | Y | Khởi tạo theo Map Type | Chồng bài bốc (Úp) |
| `discard_pile` | Array[Card] | Y | Default: `[]` | Chồng bài bỏ (Úp) |
| `logbook_cards` | Array[Card] | Y | Max length: 2 | Các lá bài nằm trong Nhật ký hành trình |

*(Cấu trúc object `Card`: `{ id, color_direction, card_action }`)*

## 3. State Lifecycle (Vòng đời trạng thái)
- `draw_pile` giảm dần khi Captain và Lieutenant bốc bài.
- Khi `draw_pile` không đủ số lượng bài cần bốc, hệ thống sẽ di chuyển toàn bộ `discard_pile`, xáo trộn ngẫu nhiên và nối vào bên dưới phần còn lại của `draw_pile`.
- `logbook_cards` nhận thẻ từ Captain và Lieutenant, sau đó được hệ thống xáo trộn ngẫu nhiên trước khi chuyển cho Navigator.
- Sau khi Navigator đưa ra quyết định, các thẻ bài sẽ rời `logbook_cards` (1 lá thực thi, 1 lá vào `discard_pile`, hoặc cả 2 vào `discard_pile` nếu Nhảy tàu).

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
- Các lá bài đang nằm trong `logbook_cards` hoặc đang được chọn để bốc TUYỆT ĐỐI không bị đưa vào quá trình xáo trộn lại (Reshuffle).
- Thông tin về các thẻ bài (màu, action) chỉ được gửi chính xác đến client có quyền (Captain xem 2 lá đầu, Lieutenant xem 2 lá kế, Nav xem 2 lá logbook). Client người khác không nhận được dữ liệu này.

## 5. Relationships (Quan hệ với các Entity khác)
- **1-1 với [ENT-001-Room]:** Mỗi Room có duy nhất 1 Navigation Deck trong suốt một session game.

## 6. Related Use Cases
- Sử dụng trong: UC-009, UC-010, UC-011.

## History
- v1 (2026-08-14, AI): initial
