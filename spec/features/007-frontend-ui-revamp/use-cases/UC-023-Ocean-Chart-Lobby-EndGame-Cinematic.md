# UC-023: Hải Đồ Da Dê Cổ, Sảnh Chờ Hải Tặc & Vinh Danh Chiến Thắng

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
Người chơi xem MapBoard, ở sảnh Lobby, hoặc khi ván đấu kết thúc.

## Preconditions
Ứng dụng đang hiển thị MapBoard, Lobby, hoặc EndGame.

## Main Flow
1. **Hải Đồ Da Dê Cổ (Vintage MapBoard):**
   - Bản đồ hàng hải cổ điển trên nền chất liệu giấy da dê phong hóa, lộ trình các hải trình rõ ràng.
   - 3 vùng cập bến phân biệt rõ nét theo nhận diện 3 phe: Sailor Cove (`--verdigris`), Crimson Cove (`--pirate`), Kraken Sanctuary (`--cult`).
   - Con tàu buồm di chuyển theo từng bước đi của ván cờ.
   - Bấm ô bản đồ hiển thị popover chú thích sự kiện chi tiết và dễ hiểu.
2. **Sảnh Chờ Tập Hợp (Thematic Lobby):**
   - Danh sách thuyền viên: Thẻ người chơi hiển thị rõ ràng tên, avatar, trạng thái kết nối trực tuyến và huy hiệu Chủ phòng.
   - Bảng cài đặt hành trình: Mã phòng trực quan kèm thao tác sao chép, bộ chọn hải đồ (Quick/Long Journey) và avatar thuyền viên.
   - Nút bắt đầu hành trình (`START VOYAGE`): Nổi bật, trang trọng với hiệu ứng ánh sáng ấm.
3. **Vinh Danh Kết Thúc (EndGame Ceremony):**
   - Banner chiến thắng hoành tráng vinh danh phe thắng cuộc (Sailor / Pirate / Cult).
   - Lật mở đồng loạt toàn bộ vai trò bí mật của người chơi trên bàn với hiệu ứng card flip.
   - Nút điều hướng quay lại phòng chờ hoặc rời phòng rõ ràng.

## Acceptance Criteria (Tầng 4)
### AC-1: Hải Đồ Cổ & Trực Quan Sự Kiện
- **Given** mở MapBoard,
- **When** quan sát hải trình và bấm ô,
- **Then** bản đồ da dê cổ hiển thị rõ nét 3 vùng đích, con tàu di chuyển chính xác và popover giải thích sự kiện trực quan.

### AC-2: Sảnh Chờ & Vinh Danh Kết Thúc
- **Given** ở Lobby hoặc EndGame,
- **When** quan sát giao diện,
- **Then** Lobby: danh sách thuyền viên và bảng cài đặt hiển thị mạch lạc, nút xuất phát nổi bật. EndGame: banner vinh danh phe thắng hoành tráng + lật mở đồng loạt vai trò trên bàn chơi.

## Dependencies
- **Upstream UC:** UC-021, UC-022

## History
- v1 (2026-08-27, AI): initial.
- v2 (2026-08-27, AI): Cập nhật hoàn toàn theo "Eldritch Parchment" v1.1 — hải đồ da dê, gỗ phong hóa, verdigris, loại bỏ tham chiếu cũ.
