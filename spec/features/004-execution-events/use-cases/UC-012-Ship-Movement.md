# UC-012: Dịch chuyển tàu (Ship Movement)

## Metadata
- **ID:** UC-012
- **Bounded Context:** GamePlay, Execution
- **Liên quan tới BR:** BR-004
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-17

## Actor
- Hệ thống (System)

## Trigger
- Navigator chốt lá bài Điều hướng (ở UC-010).

## Preconditions
- Đã nhận được thông tin màu (color_direction) của lá bài điều hướng được chọn.
- Bản đồ (MapBoard) đang sẵn sàng với đồ thị Node tĩnh.

## Main Flow
1. Hệ thống tra cứu Node hiện tại (`ship_position`) trong cấu hình đồ thị bản đồ (`quick-journey.json` hoặc `long-journey.json`).
2. Xác định Node kết nối tiếp theo dựa theo màu của lá bài điều hướng:
   - 🔴 `RED`: Đi theo cạnh Tây Bắc `transitions.RED` (hướng về Crimson Cove).
   - 🟡 `YELLOW`: Đi theo cạnh Bắc `transitions.YELLOW` (hướng về Kraken's Nest).
   - 🔵 `BLUE`: Đi theo cạnh Đông Bắc `transitions.BLUE` (hướng về Bluewater Bay).
3. Hệ thống cập nhật `ship_position` sang Node mới và thêm vào `visitedNodes`.
4. Nếu đường nối có cờ `crossesSupplyLine == true`, hệ thống kích hoạt kiểm tra nạp súng đường tiếp tế (xem UC-013).
5. Giao diện toàn phòng phát animation tàu buồm di chuyển mượt mà tới Node mới.
6. Hệ thống quét kiểm tra điều kiện kết thúc game (End Game - Rule 3.6):
   - Nếu Node mới có `victoryZone == 'SAILOR_VICTORY'` (Bluewater Bay) -> Trò chơi kết thúc, phe Sailor thắng.
   - Nếu Node mới có `victoryZone == 'PIRATE_VICTORY'` (Crimson Cove) -> Trò chơi kết thúc, phe Pirate thắng.
   - Nếu Node mới có `victoryZone == 'CULT_VICTORY'` (Kraken's Nest) -> Trò chơi kết thúc, phe Cult thắng.
7. Nếu chưa thỏa mãn điều kiện thắng nào:
   - Nếu Node mới có `mapAction !== 'NONE'`, chuyển sang thực thi Hành động Bản đồ (UC-013).
   - Nếu `mapAction === 'NONE'`, chuyển thẳng sang thực thi Hiệu ứng Thẻ bài (UC-014).

## Alternative Flows
- Không có.

## Exceptions
- **E1. Node không có hướng đi hợp lệ:** Nếu dữ liệu map bị lỗi, hệ thống giữ nguyên vị trí tàu và throw Exception rõ ràng để bảo vệ Invariants.

## Postconditions
- Tàu nằm ở vị trí mới trên bản đồ.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `SHIP_MOVED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ new_position_id, card_color, visitedNodes, victoryZone }`

## Acceptance Criteria (Tầng 4)
### AC-1: Dịch chuyển đúng màu trên đồ thị lục giác
- **Given:** Tàu ở Node A (`START`), cấu hình `transitions: { RED: 'NODE_R', YELLOW: 'NODE_Y', BLUE: 'NODE_B' }`.
- **When:** Lá bài đánh xuống là `BLUE`.
- **Then:** `ship_position` cập nhật thành `'NODE_B'`, `visitedNodes` gồm `['START', 'NODE_B']`, broadcast sự kiện `SHIP_MOVED`.

### AC-2: Phát hiện End Game tức thì khi tàu cán đích
- **Given:** Tàu bước vào ô có `victoryZone == 'CULT_VICTORY'` (Kraken's Nest).
- **When:** Hệ thống di chuyển tàu xong.
- **Then:** Trò chơi dừng, luồng bị block, phát thông báo phe Cultist thắng cuộc, không đi tiếp vào UC-013 hay UC-014.

## Dependencies
- **Upstream UC:** UC-010 (Navigator chốt lá bài điều hướng)
- **Downstream UC:** UC-013 (Map Actions), UC-014 (Card Effects), BR-005 (Victory / End Game)

## Notes
- Chi tiết cấu trúc đồ thị lục giác tham khảo tại: [spec-map-graph.md](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/spec/features/004-execution-events/spec-map-graph.md).

## History
- v1 (2026-08-17, AI): initial
- v2 (2026-08-21, AI & User): cập nhật chi tiết luồng chuyển dịch theo đồ thị lục giác 3 hướng và kiểm tra victoryZone chuẩn hóa
