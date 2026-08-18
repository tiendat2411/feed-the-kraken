# UC-017: Kiểm tra Điều kiện Thắng (Victory Check)

## Metadata
- **ID:** UC-017
- **Bounded Context:** GamePlay, Rules
- **Liên quan tới BR:** BR-005
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-18

## Actor
- Hệ thống (System)

## Trigger
- Bất cứ khi nào `ship_position` của tàu bị thay đổi.
- Bất cứ khi nào `status` của một người chơi bị đổi thành `ELIMINATED`.

## Preconditions
- Trò chơi đang trong trạng thái `IN_GAME`.

## Main Flow
1. Hệ thống ngầm kích hoạt kiểm tra các ràng buộc chiến thắng sau mỗi hành động:
   - **Tàu đã ở vùng Bluewater Bay?** -> Nhận định Sailor Victory.
   - **Tàu đã ở vùng Crimson Cove?** -> Nhận định Pirate Victory.
   - **Tàu đã ở ô Kraken (phương Bắc)?** -> Nhận định Cult Victory.
   - **Có người bị loại (`ELIMINATED`) do Feed the Kraken, và người đó có `faction == CULT_LEADER`?** -> Nhận định Cult Victory.
2. Nếu KHÔNG CÓ điều kiện nào thỏa mãn, hệ thống im lặng và cho phép trò chơi tiếp tục luồng game hiện tại.
3. Nếu CÓ BẤT KỲ điều kiện nào thỏa mãn, hệ thống lập tức đóng băng (freeze) trò chơi, ngắt mọi luồng Timer hoặc Action đang chạy.
4. Chuyển thẳng sang UC-018 (End Game Flow).

## Alternative Flows
- Không có.

## Exceptions
- **E1. Bị ELIMINATED do Tự nhảy tàu (Jump Overboard):** Việc Navigator tự nhảy tàu khiến họ bị `ELIMINATED`, nhưng luật ghi rõ "Tự ý nhảy tàu không kích hoạt thắng cuộc cho phe Cult". Do đó, UC-017 phải phân biệt sự kiện `ELIMINATED` là do Feed the Kraken hay do Overboard trước khi kích hoạt thắng cuộc.

## Postconditions
- Trò chơi bị ngắt kết nối khỏi vòng lặp và đi tới End Game, hoặc không có gì xảy ra.

## State Synchronization (Đồng bộ trạng thái)
- Hoạt động ngầm (Backend logic). Chỉ emit event tại luồng UC-018 nếu thắng.

## Acceptance Criteria (Tầng 4)
### AC-1: Bỏ qua Jump Overboard
- **Given:** Cult Leader đóng vai trò Navigator và quyết định bấm nút Tự Nhảy Tàu.
- **When:** Hệ thống set Cult Leader thành `ELIMINATED`.
- **Then:** Trò chơi KHÔNG kết thúc, phe Cultist KHÔNG thắng. Game tiếp tục tìm Hoa tiêu khẩn cấp.

### AC-2: Cán đích tự động kết thúc
- **Given:** Lá bài Đỏ đưa tàu vào 1 Node thuộc Crimson Cove.
- **When:** Tàu dịch chuyển tới node đó xong.
- **Then:** Hệ thống lập tức trigger UC-018, Pirate thắng cuộc. Mọi sự kiện khác (nếu có) bị hủy.

## Dependencies
- **Upstream UC:** Bất kỳ UC nào làm thay đổi vị trí tàu (UC-012) hoặc loại bỏ người chơi (UC-011, UC-013).
- **Downstream UC:** UC-018.

## History
- v1 (2026-08-18, AI): initial
