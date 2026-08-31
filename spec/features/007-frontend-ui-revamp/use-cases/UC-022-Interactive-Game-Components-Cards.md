# UC-022: Thẻ Bài Tarot Cổ, Bảng Nổi Loạn Gỗ Mục & Khay Lái Tàu Da Dê

## Metadata
- **ID:** UC-022
- **Bounded Context:** Presentation / GameComponents
- **Liên quan tới BR:** 007-frontend-ui-revamp
- **Status:** approved
- **Owner:** Frontend Team
- **Last updated:** 2026-08-27

## Actor
Người chơi, Thuyền trưởng (Captain), Thuyền phó (Lieutenant), Hoa tiêu (Navigator), Giáo chủ (Cult Leader).

## Trigger
Ván game chuyển sang: Chia vai (Role Reveal), Bỏ phiếu Nổi loạn (Mutiny), Lái tàu (Navigation), hoặc Nghi thức Tà giáo (Cult Uprising).

## Preconditions
Người chơi trong phòng chơi trạng thái `PLAYING`.

## Main Flow
1. **Thẻ Vai trò Tarot Cổ (Role Card) & Màn Che Bóng Đêm (Night Overlay):**
   - Phase `ROLE_REVEAL`: Hiển thị thẻ kiểu tarot cổ — mặt sau da dê tối ố + hoa văn xúc tu Kraken vàng + viền vàng gỉ. Click kích hoạt lật 3D 600ms (`cubic-bezier(0.4, 0, 0.2, 1)`), ánh lửa hắt lên khi lật. Mặt trước: biểu tượng phe, tên vai trò (font `Cinzel`, màu phe), điều kiện thắng trên nền giấy da dê cổ.
   - Phase `PIRATES_GATHERING` / `CULT_UPRISING_BLIND`: Màn đen kịt phủ toàn bộ + đôi mắt Kraken tím eldritch-pulse chập chờn + đồng hồ đếm ngược vòng tròn ember.
2. **Bảng Nổi Loạn Gỗ Mục (Mutiny Board):**
   - Đồng tiền vàng cổ / flintlock pistol trên bàn gỗ mục texture phong hóa.
   - Xác nhận cược → khóa vào rương gỗ cũ bản lề gỉ.
   - Kết quả → rương mở + screen shake (`gunShake 0.4s ease-out`) + tổng súng xếp hạng + vương miện vàng đồng gỉ trao tay.
3. **Khay Lái Tàu Da Dê (Navigation Cards Tray):**
   - 3 thẻ bài cổ mực phai: Blue Sailor (`--sailor`), Red Pirate (`--pirate`), Yellow Cult (`--cult`) — tất cả kiểu bột màu cổ.
   - Captain giữ 2 loại 1, Lieutenant giữ 1 loại 1, Navigator chọn đi/nhảy tàu. Bấm chọn → viền vàng + sáng firelight. Loại → mờ đi + trượt ra.

## Alternative Flows
- **3a. Jump Overboard:** Nút nhảy tàu với biểu tượng đầu lâu/sóng biển, cảnh báo trước khi xác nhận.

## Exceptions
- **E1. Rapid clicks / lag:** Nút vô hiệu hóa tức thì sau bấm, tránh duplicate emit.

## Postconditions
Thao tác tương tác thẻ bài / bỏ phiếu hoàn tất mượt mà.

## State Synchronization
- **Emit Event:** `submit_mutiny_vote`, `captain_select_card`, v.v.
- **To:** Server / Socket.

## Acceptance Criteria (Tầng 4)
### AC-1: Thẻ Bài Tarot 3D Flip & Màn Che Bóng Đêm
- **Given** nhận thẻ vai trò bí mật,
- **When** bấm vào thẻ (da dê tối + xúc tu Kraken vàng),
- **Then** lật 3D 600ms mượt mà, hiển thị biểu tượng phe + tên vai trò (`Cinzel`, màu phe) + điều kiện thắng trên nền giấy da dê cổ; Night Phase → đen kịt + mắt Kraken tím + đếm ngược ember.

### AC-2: Bỏ Phiếu Gỗ Mục & Rút Bài Mực Phai
- **Given** tham gia Mutiny / Navigation,
- **When** chọn súng hoặc chọn bài,
- **Then** Mutiny: rương gỗ gỉ khóa cược + screen shake khi công bố. Navigation: 3 thẻ mực phai 3 màu phe, viền vàng khi chọn giữ.

## Dependencies
- **Upstream UC:** UC-021
- **Downstream UC:** UC-023

## History
- v1 (2026-08-27, AI): initial.
- v2 (2026-08-27, AI): Cập nhật hoàn toàn theo "Eldritch Parchment" v1.1 — thẻ tarot cổ, gỗ mục, mực phai, loại bỏ glassmorphism.
