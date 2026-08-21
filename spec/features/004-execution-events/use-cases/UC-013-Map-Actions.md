# UC-013: Thực thi Hành động Bản đồ (Map Actions)

## Metadata
- **ID:** UC-013
- **Bounded Context:** GamePlay, Execution
- **Liên quan tới BR:** BR-004
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-17

## Actor
- Thuyền trưởng (Captain)
- Hệ thống (System)

## Trigger
- Tàu vừa di chuyển vào một ô hoặc cắt qua đường nối có cờ kích hoạt Action (sau UC-012).

## Preconditions
- `ship_position` hiện tại có tính năng, hoặc đường đi có cờ `crosses_supply_line`.

## Main Flow
1. **Supply Line (Đường tiếp tế - Chỉ Map Long Journey):**
   - Nếu tàu cắt qua ranh giới tiếp tế (`crossesSupplyLine == true`) và `hasCrossedSupplyLine == false`: Hệ thống tự động nạp súng cho tất cả người chơi có `status == ACTIVE` lên mức tối đa là 3 (`gun_count = Math.max(gun_count, 3)`). Sau đó bật cờ `hasCrossedSupplyLine = true`.
2. **Hành động Tương tác (4 loại ô đặc biệt):**
   - Nếu ô là (`CABIN_SEARCH`, `FLOGGING`, `OFF_WITH_THE_TONGUE`, `FEED_THE_KRAKEN`): Giao diện hiển thị Modal nổi bật yêu cầu Thuyền trưởng (Captain) chọn 1 mục tiêu hợp lệ trên tàu (Timeout 60s nếu Captain offline, hết giờ tự động random mục tiêu).
3. **Thực thi logic tương ứng với từng loại hành động:**
   - **Cabin Search (Khám xét Cabin):** Hệ thống kiểm tra mục tiêu. Nếu `faction == CULTIST` (đã thu nạp), hệ thống chỉ gửi riêng cho màn hình Captain biểu tượng Vòi Bạch Tuộc (Tentacle 🐙). Nếu là phe gốc chưa thu nạp, gửi đúng `faction`. Gán `is_convertible = false` cho mục tiêu.
   - **Flogging (Đánh roi / Tra khảo):** Hệ thống tự động phân tích phe thật của mục tiêu, sinh ra ngẫu nhiên 1 câu "I am not a..." của 1 trong 2 phe sai, sau đó broadcast công khai câu đó cho toàn phòng thấy. Gán `is_convertible = false` cho mục tiêu.
   - **Off with the tongue (Cắt lưỡi):** Hệ thống gán `speech_restricted = true` cho mục tiêu. Người này vĩnh viễn bị khóa chat và MẤT QUYỀN trở thành Captain.
   - **Feed the Kraken (Tế thần Kraken):** Hệ thống gán `status = ELIMINATED` và thu hồi toàn bộ súng (`gun_count = 0`) của mục tiêu. Danh tính thực sự của người bị hiến tế được GIẤU KÍN (không công khai cho phòng biết).
   *(ĐẶC BIỆT End Game Rule: Nếu mục tiêu có `faction == CULT_LEADER`, phe CULT lập tức chiến thắng trò chơi ngay tại bước này).*
4. **Xác nhận Game Pace:** Sau khi kết quả hành động được phát ra, Thuyền trưởng (Captain) bấm nút **"XÁC NHẬN TIẾP TỤC ➡️"** để chuyển tiếp sang Hiệu ứng Thẻ bài (UC-014).

## Alternative Flows
- **Ô không có Action (`NONE`):** Nếu `mapAction === 'NONE'`, hệ thống bỏ qua bước chọn mục tiêu và chuyển thẳng sang UC-014.

## Exceptions
- **E1. Captain rớt mạng khi chọn mục tiêu:** Theo luật Game Pace, hệ thống dừng chờ Captain kết nối lại thay vì ép Timeout (trừ khi phòng bật chế độ auto-play sandbox).

## Postconditions
- Hiệu ứng bản đồ đã tác động lên các Entity Player (Miễn nhiễm, cấm chat, chết).

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `MAP_ACTION_EXECUTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ action_type, target_player_id (nếu có), public_result (vd: token Flogging) }`

- **Emit Event:** `CABIN_SEARCH_RESULT`
- **To:** Chỉ riêng client Captain.
- **Payload:** `{ result: "CULTIST_TENTACLE" | "SAILOR" | "PIRATE" }`

## Acceptance Criteria (Tầng 4)
### AC-1: Cabin Search giấu danh tính Cultist
- **Given:** Mục tiêu A trước đây là Sailor, đã bị thu nạp thành `CULTIST`.
- **When:** Captain dùng Cabin Search lên A.
- **Then:** Hệ thống gửi về màn hình Captain duy nhất biểu tượng Tentacle, TUYỆT ĐỐI không hiện chữ Sailor.
- **And:** Gán `is_convertible = false` cho A.

### AC-2: Supply Line dùng 1 lần duy nhất
- **Given:** Cờ `hasCrossedSupplyLine = true`.
- **When:** Tàu đi qua đường tiếp tế lần 2 do đi vòng.
- **Then:** Không có người chơi nào được cộng súng, luồng tự bỏ qua sự kiện.

### AC-3: Feed the Kraken bắt trúng Cult Leader
- **Given:** Captain ném người chơi B cho Kraken. B là `CULT_LEADER`.
- **When:** Hành động thực thi.
- **Then:** Game dừng lập tức, phe Cultist chiến thắng mà không cần đợi tàu tới đích.

### AC-4: Flogging công khai thông tin loại trừ và gán miễn nhiễm
- **Given:** Người chơi C là `SAILOR`.
- **When:** Captain thực hiện Flogging lên C.
- **Then:** Toàn bộ phòng nhận thông báo công khai *"C không phải là [PIRATE]"* hoặc *"C không phải là [CULT_LEADER]"*.
- **And:** Gán `is_convertible = false` cho C.

## Dependencies
- **Upstream UC:** UC-012 (Ship Movement)
- **Downstream UC:** UC-014 (Card Effects)

## Notes
- Chi tiết cấu trúc đồ thị lục giác và danh mục node tham khảo tại: [spec-map-graph.md](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/spec/features/004-execution-events/spec-map-graph.md).

## History
- v1 (2026-08-17, AI): initial
- v2 (2026-08-21, AI & User): cập nhật chi tiết luồng Map Actions, xác nhận Game Pace, và bổ sung AC-4 Flogging
