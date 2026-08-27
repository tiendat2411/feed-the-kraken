# UC-023: Bản đồ Hải trình Cổ điển, Sảnh chờ & Vinh danh Kết thúc (Vintage Chart, Lobby & EndGame)

## Metadata
- **ID:** UC-023
- **Bounded Context:** Presentation / WorldMapAndCeremony
- **Liên quan tới BR:** 007-frontend-ui-revamp
- **Status:** approved
- **Owner:** Frontend Team
- **Last updated:** 2026-08-27

## Actor
Người chơi (Player), Host phòng, Thuyền trưởng (Captain).

## Trigger
Người chơi xem bản đồ hải trình, ở sảnh chờ Lobby hoặc khi ván đấu kết thúc.

## Preconditions
Ứng dụng đang hiển thị các màn hình: MapBoard, Lobby, hoặc EndGame.

## Main Flow
1. **Bản đồ Hải trình Cổ điển (Vintage MapBoard):**
   - Bản đồ được dựng trên nền giấy da dê cổ xưa với la bàn cổ (Compass Rose) và 3 vùng biển đích (Sailor, Pirate, Cult).
   - Con tàu buồm (Flagship) có hoạt cảnh dập dềnh trên sóng nước tại tọa độ hiện tại.
   - Khi tàu di chuyển, tàu lướt êm ái trên đường vẽ hải trình.
   - Bấm vào bất kỳ ô nào sẽ hiển thị popover chú thích ý nghĩa sự kiện (Tra khảo, Cắt lưỡi, Say rượu, Cho Kraken ăn...).
2. **Sảnh chờ Nâng cấp (Thematic Lobby):**
   - Bàn tròn thủy thủ đoàn hiển thị các vị trí người chơi trang trọng, có huy hiệu Host, trạng thái kết nối Online/Offline.
   - Bộ chọn Avatar phong phú theo phong cách hải tặc/thủy thủ.
   - Bộ chọn Map (Quick Journey / Long Journey) có hình minh họa preview trực quan.
3. **Màn hình Vinh danh Kết thúc (End Game Ceremony):**
   - Banner chiến thắng hoành tráng theo phe thắng cuộc (Hải quân, Hải tặc, Tà giáo).
   - Lật mở toàn bộ vai trò bí mật của mọi người chơi trong phòng.
   - Nút quay lại sảnh chờ và rời phòng trang nhã.

## Acceptance Criteria (Tầng 4)
### AC-1: Trực quan hóa Bản đồ Hải trình
- **Given** người chơi mở bản đồ hải trình,
- **When** quan sát hải trình và bấm vào các ô sự kiện,
- **Then** bản đồ hiển thị rõ mạng lưới đường đi, con tàu buồm dập dềnh tại ô hiện tại và popover giải thích sự kiện xuất hiện rõ ràng.

### AC-2: Sảnh chờ và Vinh danh Kết thúc Trận đấu
- **Given** người chơi ở sảnh Lobby hoặc màn hình kết thúc EndGame,
- **When** quan sát giao diện,
- **Then** Lobby hiển thị thủy thủ đoàn trang nhã, và EndGame hiển thị banner chiến thắng ấn tượng cùng toàn bộ danh tính thật của người chơi.

## Dependencies
- **Upstream UC:** UC-021, UC-022

## History
- v1 (2026-08-27, AI): initial đặc tả use case UC-023.
