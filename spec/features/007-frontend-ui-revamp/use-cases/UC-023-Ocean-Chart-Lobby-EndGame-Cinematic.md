# UC-023: Hải Đồ Da Dê Cổ, Sảnh Gỗ Phong Hóa & Vinh Danh Kết Thúc

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
   - Nền giấy da dê ố vàng (`--parchment-dim`) với vệt ố nâu, mép rách/cháy, viền rêu xanh mờ ở góc (`--moss-dim`).
   - La bàn cổ (Compass Rose SVG) ở góc.
   - 3 vùng đích: Sailor Cove (xanh rêu `--verdigris`), Crimson Cove (đỏ lửa `--pirate`), Kraken Sanctuary (tím `--cult`).
   - Đường vẽ mực lông vũ, nét run rẩy không hoàn hảo.
   - Con tàu buồm gỗ tối dập dềnh (`shipBob 3s ease-in-out infinite`).
   - Bấm ô → popover chú thích sự kiện (nền `--hull`, viền `--gold-dim`, font `Outfit`).
2. **Sảnh Gỗ Phong Hóa (Thematic Lobby):**
   - Nền sàn gỗ ván thuyền phong hóa (`--hull-dark` + texture wood-grain).
   - Thẻ gỗ mục đóng đinh gỉ cho mỗi người chơi — avatar, tên, crown host vàng đồng gỉ, chấm verdigris online.
   - Sổ da thuộc captain's journal bên phải — Room code, Map selection (cuộn giấy hải đồ Quick/Long), avatar grid.
   - START VOYAGE = nút bánh lái tàu gỗ tối, phát sáng firelight khi hover.
3. **Vinh Danh Kết Thúc (EndGame Ceremony):**
   - Banner chiến thắng hoành tráng theo phe:
     - Sailor Win: Cờ xanh tung bay, ánh bình minh ấm.
     - Pirate Win: Jolly Roger cháy rực lửa đỏ, khói lan tỏa.
     - Cult Win: Xúc tu Kraken trồi lên, nuốt chửng tàu, hào quang tím bùng nổ.
   - Lật mở toàn bộ vai trò bí mật trên bàn gỗ mục — hiệu ứng card flip đồng loạt.
   - Nút quay lại / rời phòng trên thanh gỗ dưới cùng.

## Acceptance Criteria (Tầng 4)
### AC-1: Hải Đồ Da Dê Cổ
- **Given** mở MapBoard,
- **When** quan sát hải trình và bấm ô,
- **Then** bản đồ da dê ố + rêu xanh mờ, 3 vùng đích màu đặc trưng, tàu buồm gỗ dập dềnh, popover giải thích rõ ràng.

### AC-2: Sảnh Gỗ & Vinh Danh Kết Thúc
- **Given** ở Lobby hoặc EndGame,
- **When** quan sát giao diện,
- **Then** Lobby: thẻ gỗ mục đinh gỉ + sổ da thuộc + bánh lái phát sáng. EndGame: banner phe thắng hoành tráng + lật vai đồng loạt trên bàn gỗ.

## Dependencies
- **Upstream UC:** UC-021, UC-022

## History
- v1 (2026-08-27, AI): initial.
- v2 (2026-08-27, AI): Cập nhật hoàn toàn theo "Eldritch Parchment" v1.1 — hải đồ da dê, gỗ phong hóa, verdigris, loại bỏ tham chiếu cũ.
