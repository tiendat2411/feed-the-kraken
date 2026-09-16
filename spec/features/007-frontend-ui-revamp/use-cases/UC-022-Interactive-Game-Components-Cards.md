# UC-022: Thẻ Bài Tarot Cổ, Giao Diện Bỏ Phiếu Nổi Loạn & Khay Lái Tàu

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
   - Phase `ROLE_REVEAL`: Hiển thị thẻ phong cách tarot cổ — mặt sau da dê tối có hoa văn nhận diện, click kích hoạt lật 3D 600ms (`cubic-bezier(0.4, 0, 0.2, 1)`) với ánh sáng ấm hắt lên. Mặt trước: biểu tượng phe, tên vai trò (font `Cinzel`, màu phe), điều kiện thắng trên nền giấy da dê cổ.
   - Phase `PIRATES_GATHERING` / `CULT_UPRISING_BLIND`: Màn đen kịt phủ toàn bộ + đôi mắt Kraken tím eldritch-pulse chập chờn + đồng hồ đếm ngược vòng tròn ember.
2. **Giao Diện Bỏ Phiếu Nổi Loạn (Mutiny Board):**
   - Người chơi bí mật chọn số lượng súng cược trên giao diện với phản hồi xúc giác trực quan.
   - Xác nhận cược → thông tin được chốt bảo mật cho đến khi toàn bộ thuyền viên hoàn tất.
   - Khi công bố kết quả → hiệu ứng rung màn hình kịch tính (`gunShake 0.4s ease-out`) + bảng xếp hạng tổng số súng cược và vinh danh Thuyền trưởng mới.
3. **Khay Lái Tàu Điều Hướng (Navigation Cards Tray):**
   - Hiển thị 3 lá bài điều hướng với sắc thái nhận diện 3 phe: Blue Sailor (`--sailor`), Red Pirate (`--pirate`), Yellow Cult (`--cult`).
   - Captain chọn giữ 2 loại 1, Lieutenant giữ 1 loại 1, Navigator chọn hướng đi hoặc nhảy tàu. Thao tác chọn giữ và loại bỏ có phản hồi màu sắc và ánh sáng tương phản rõ ràng.

## Alternative Flows
- **3a. Jump Overboard:** Nút nhảy tàu với biểu tượng và cảnh báo xác nhận rõ ràng.

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
- **When** bấm vào thẻ,
- **Then** lật 3D 600ms mượt mà, hiển thị biểu tượng phe + tên vai trò (`Cinzel`, màu phe) + điều kiện thắng trên nền giấy da dê cổ; Night Phase → đen kịt + mắt Kraken tím + đếm ngược ember.

### AC-2: Bỏ Phiếu Kịch Tính & Lái Tàu Trực Quan
- **Given** tham gia Mutiny / Navigation,
- **When** chọn súng hoặc chọn bài,
- **Then** Mutiny: cược bảo mật + rung màn hình khi công bố kết quả phân định thứ bậc. Navigation: 3 thẻ bài nhận diện rõ ràng 3 phe, trạng thái chọn/loại trực quan.

## Dependencies
- **Upstream UC:** UC-021
- **Downstream UC:** UC-023

## History
- v1 (2026-08-27, AI): initial.
- v2 (2026-08-27, AI): Cập nhật hoàn toàn theo "Eldritch Parchment" v1.1 — thẻ tarot cổ, gỗ mục, mực phai, loại bỏ glassmorphism.
