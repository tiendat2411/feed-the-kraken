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
1. Hệ thống tra cứu Node hiện tại (`ship_position`) và tìm Node kết nối tiếp theo dựa theo màu của lá bài (Vàng, Xanh, Đỏ).
2. Hệ thống cập nhật `ship_position` sang Node mới.
3. Giao diện toàn phòng phát animation tàu di chuyển.
4. Hệ thống quét kiểm tra điều kiện kết thúc game (End Game - Rule 3.6):
   - Nếu Node mới thuộc vùng `Bluewater Bay` -> Trò chơi kết thúc, phe Sailor thắng.
   - Nếu Node mới thuộc vùng `Crimson Cove` -> Trò chơi kết thúc, phe Pirate thắng.
   - Nếu Node mới là ô vị trí `Kraken` ở phương Bắc -> Trò chơi kết thúc, phe Cult thắng.
5. Nếu chưa thỏa mãn điều kiện thắng nào, hệ thống kiểm tra xem Node mới (hoặc đường nối đi qua) có kích hoạt Hành động bản đồ không, nếu có chuyển sang UC-013. Nếu không, chuyển thẳng sang UC-014.

## Alternative Flows
- Không có.

## Exceptions
- Không có, mọi thứ xử lý tự động trong tích tắc.

## Postconditions
- Tàu nằm ở vị trí mới trên bản đồ.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `SHIP_MOVED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ new_position_id, card_color }`

## Acceptance Criteria (Tầng 4)
### AC-1: Dịch chuyển đúng màu
- **Given:** Tàu ở Node A, thẻ bài màu Xanh nối A tới B, màu Đỏ nối A tới C.
- **When:** Lá bài đánh xuống là Xanh.
- **Then:** `ship_position` cập nhật thành B, broadcast sự kiện.

### AC-2: Phát hiện End Game
- **Given:** Tàu bước vào ô Kraken.
- **When:** Hệ thống di chuyển tàu xong.
- **Then:** Trò chơi dừng, luồng bị block, màn hình hiển thị phe Cultist thắng cuộc, không đi tiếp vào UC-013 hay 014.

## Dependencies
- **Upstream UC:** UC-010
- **Downstream UC:** UC-013, UC-014

## History
- v1 (2026-08-17, AI): initial
