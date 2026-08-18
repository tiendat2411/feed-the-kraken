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
1. **Supply Line (Đường tiếp tế):**
   - Nếu tàu qua đường tiếp tế và `has_crossed_supply_line == false`: Hệ thống tự động sạc súng cho tất cả người chơi có `status == ACTIVE`. (Logic: `gun_count = max(gun_count, 3)`). Sau đó bật cờ `has_crossed_supply_line = true`.
2. **Hành động Tương tác (4 loại ô đặc biệt):**
   - Nếu ô là (Cabin Search, Flogging, Off with the tongue, Feed the Kraken): Giao diện yêu cầu Captain chọn 1 mục tiêu hợp lệ. (Timeout 60s, hết giờ tự động random mục tiêu).
3. **Thực thi logic tương ứng với từng loại hành động:**
   - **Cabin Search (Khám xét):** Hệ thống kiểm tra mục tiêu. Nếu `faction == CULTIST` (đã thu nạp), hệ thống chỉ gửi riêng cho màn hình Captain biểu tượng Vòi Bạch Tuộc (Tentacle). Nếu là phe gốc chưa thu nạp, gửi đúng `faction`. Gán `is_convertible = false` cho mục tiêu.
   - **Flogging (Đánh roi):** Hệ thống tự động phân tích phe thật của mục tiêu, sinh ra ngẫu nhiên 1 câu "I am not a..." của 1 trong 2 phe sai, sau đó broadcast công khai câu đó cho toàn phòng thấy. Gán `is_convertible = false` cho mục tiêu.
   - **Off with the tongue (Cắt lưỡi):** Hệ thống gán `speech_restricted = true` cho mục tiêu. Người này vĩnh viễn bị cấm chat/mic và MẤT QUYỀN trở thành Captain.
   - **Feed the Kraken (Hiến tế):** Hệ thống gán `status = ELIMINATED` và thu hồi `gun_count = 0` cho mục tiêu. 
   *(ĐẶC BIỆT End Game Rule: Nếu mục tiêu có `faction == CULT_LEADER`, phe CULT lập tức chiến thắng trò chơi ngay tại bước này).*
4. Hoàn tất hành động bản đồ, luồng chuyển sang UC-014.

## Alternative Flows
- Không có.

## Exceptions
- **E1. Captain rớt mạng khi chọn mục tiêu:** Theo luật Game Pace, hệ thống dừng chờ Captain kết nối lại thay vì ép Timeout 60s (trừ khi admin có config auto-play).

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

### AC-2: Supply Line dùng 1 lần
- **Given:** Cờ `has_crossed_supply_line = true`.
- **When:** Tàu đi qua đường tiếp tế lần 2 do vòng vèo.
- **Then:** Không có người chơi nào được cộng súng, luồng tự bỏ qua sự kiện.

### AC-3: Feed the Kraken bắt trúng Cult Leader
- **Given:** Captain ném người chơi B cho Kraken. B là `CULT_LEADER`.
- **When:** Hành động thực thi.
- **Then:** Game dừng lập tức, phe Cultist chiến thắng mà không cần đợi tàu tới đích.

## Dependencies
- **Upstream UC:** UC-012
- **Downstream UC:** UC-014

## History
- v1 (2026-08-17, AI): initial
