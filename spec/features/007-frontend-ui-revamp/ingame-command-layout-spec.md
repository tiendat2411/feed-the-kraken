# ĐẶC TẢ KIẾN TRÚC BỐ CỤC BÀN CHƠI TRONG TRẬN (IN-GAME COMMAND LAYOUT SPECIFICATION)

## Metadata
- **Tài liệu:** In-Game Command Layout Architecture & Core Interaction Specification
- **Feature ID:** Feature 007 - Frontend UI Revamp (Task T063)
- **Status:** approved
- **Version:** v1.5
- **Last Updated:** 2026-09-16
- **Phạm vi áp dụng:** `frontend/src/pages/Game.jsx`, `MapBoardUI.jsx`, `MutinyBoard.jsx`, `NavigationPhase.jsx`, `GameHeader.jsx`, `CrewSeatingDrawer.jsx`

---

## 1. Bối Cảnh & Mục Tiêu Kiến Trúc Cốt Lõi (Background & Core Goals)

### 1.1 Vấn Đề Cần Giải Quyết
- **Bố cục cũ:** `Game.jsx` chuyển trang nguyên khối (exclusive full-screen page switching). Khi bước vào phase Bạo loạn (`MutinyBoard`) hoặc phase Điều hướng (`NavigationPhase`), toàn bộ Hải đồ (`MapBoardUI`) bị ẩn hoàn toàn, khiến thuyền viên không thể quan sát vị trí con tàu, các bờ đích hay tiến trình Cult Track.
- **Thiếu vị trí ghế ngồi (Circular Seating Order):** Người chơi không trực quan hóa được ai ngồi cạnh mình (phục vụ lá bài Say Xỉn *Drunken Captain* hoặc thứ tự kế vị Thuyền trưởng).
- **Mặt bàn bị bè to quá mức:** Việc dùng trực tiếp mặt bàn làm việc làm hình nền phủ kín toàn màn hình gây mất cân đối tỷ lệ, thiếu chiều sâu không gian buồng cabin.

### 1.2 Nguyên Tắc Kiến Trúc Cốt Lõi (Core Architectural Principles)
1. **Phân Tách Nền & Mặt Bàn (Separation of Canvas & Tabletop Container):**
   - **Nền chính (Main Ambient Background - `cabin_room_bg.jpg`):** Không gian buồng cabin thuyền hải tặc ("Eldritch Parchment") bao quát toàn trang, mang lại chiều sâu điện ảnh chiaroscuro huyền bí.
   - **Bàn Thuyền Trưởng (Standalone Work Desk Container - `tabletop_captain_desk.png`):** Là một container độc lập đặt cân đối ở trung tâm khoang buồng cabin với kích thước vừa vặn (~80% - 85% chiều rộng viewport), tạo khoảng thở tự nhiên xung quanh.
2. **Góc Nhìn Chuẩn Mực (Strict Orthographic 90° Top-Down / Flat Lay):**
   - Mặt bàn và các linh kiện hiển thị trên bàn **bắt buộc tuân thủ góc nhìn từ trên xuống vuông góc 90 độ phẳng (2D Flat Lay)**.
   - **Không vẽ góc nghiêng phối cảnh 3D:** Mặt bàn chỉ thể hiện bề mặt phẳng bên trên (top plane); mép đáy bàn kết thúc phẳng lì, **tuyệt đối không vẽ mặt đứng phía trước của ngăn kéo, chân bàn hay thân vách bên hông** để tránh méo hình học khi đặt thẻ bài và ghép layer.
3. **Khu Vực Trung Tâm Đa Tầng (Central Stage — In-Place Alternate Hub):**
   - Chiếm 70% đến 80% diện tích mặt bàn, là trung tâm điều khiển xen kẽ tại chỗ:
     - *Trạng thái Mặc định (Sea Chart View):* Hiển thị Hải đồ trung tâm (`MapBoardUI.jsx`).
     - *Trạng thái Thao Tác (Action Desk View):* Trải đè hồ sơ hành động (Bổ nhiệm, Bạo loạn, Rút bài) tại chỗ kèm nút `[◀ PEEK SEA CHART]` và `[✕ CLOSE DESK]`.
     - Lòng trong khung trung tâm của asset bàn phải để trống/sạch sẽ hoàn toàn để React JSX render linh hoạt.
4. **Hộc Ngăn Kéo Gầm Bàn Độc Lập (Non-Sticky Tactile Under-Drawer):**
   - Nằm độc lập dưới mép đáy bàn làm việc, không cố định che đáy màn hình (chỉ thấy khi cuộn xuống mép bàn).
   - Tách bạch hoàn toàn khỏi mặt bàn: Mặt bàn kết thúc ở mép phẳng; ngăn kéo là một linh kiện trượt mở riêng biệt (`drawer_empty_shell.png`), chứa 2 chức năng:
     - **Tab A (Circular Seating Radar):** Bàn tròn vị trí ngồi la bàn (neo YOU ở vị trí 6 giờ).
     - **Tab B (Crew Roster):** Danh sách thẻ thủy thủ đoàn.
5. **Tính Tự Do Mỹ Thuật (Artistic Freedom for Atmosphere):**
   - Các đạo cụ trang trí trên viền mặt bàn mang phong cách hải tặc cổ điển (như la bàn, ấn ký, tiền cổ, nẹp đồng, v.v.) được bố trí linh hoạt theo góc nhìn 90° phẳng, không gò bó hay bắt buộc cố định vị trí cụ thể, miễn đảm bảo thẩm mỹ "Eldritch Parchment" nhất quán.

---

## 2. Sơ Đồ Phân Vùng Kiến Trúc (Architectural Blueprint)

```text
+=========================================================================================================+
| [ZONE 1: STICKY HUD HEADER] ROOM | PHASE | VOYAGE MODE | SOUND | DISSOLVE | LEAVE                       |
+=========================================================================================================+
|                                                                                                         |
|  <<< ZONE 0: MAIN AMBIENT BACKGROUND (cabin_room_bg.jpg - Khoang buồng thuyền hải tặc) >>>               |
|                                                                                                         |
|       +-----------------------------------------------------------------------------------------+       |
|       |  ⚓ CAPTAIN'S WORK DESK CONTAINER (tabletop_captain_desk.png - Orthographic 90° Flat Lay)|       |
|       |  (Container độc lập thu nhỏ ~80-85% width, đặt cân đối giữa buồng cabin)                |       |
|       |                                                                                         |       |
|       |       +---------------------------------------------------------+                 [⚔️]  |       |
|       |       | 🗺️ / ⚔️ ZONE 2: CENTRAL STAGE (70% - 80% DIỆN TÍCH BÀN)  |               [ACTION |       |
|       |       |    (RENDER XEN KẼ TẠI CHỖ GIỮA HẢI ĐỒ VÀ ACTION DESK)    |                DESK   |       |
|       |       |                                                         |               TRIGGER]|       |
|       |       |  [TRẠNG THÁI 1: CENTRAL SEA CHART - MapBoardUI.jsx]     |            <── [ZONE 3]       |
|       |       |  - Tấm hải đồ cổ da dê trải rộng ở trung tâm            |                       |       |
|       |       |                                                         |                       |       |
|       |       |  <<< KHI KÍCH HOẠT TRIGGER: TRẢI ACTION DESK ĐÈ TẠI CHỖ <<<                     |       |
|       |       |  [TRẠNG THÁI 2: SLIDING ACTION DESK OVERLAY]            |                       |       |
|       |       |  - [◀ PEEK SEA CHART]  |  [✕ CLOSE DESK]                |                       |       |
|       |       |  - Hồ sơ thao tác: Appointment / Mutiny / Navigation    |                       |       |
|       |       +---------------------------------------------------------+                       |       |
|       |                                                                                         |       |
|       +-----------------------------------------------------------------------------------------+       |
|       (Mép đáy mặt bàn kết thúc phẳng lì — Không vẽ mặt trước ngăn kéo dính vào bàn)                    |
|                                                                                                         |
|  (CUỘN XUỐNG MÉP ĐÁY BÀN MỚI THẤY GẦM BÀN & TAY NẮM MỞ NGĂN KÉO)                                        |
|                                                                                                         |
|       +-----------------------------------------------------------------------------------------+       |
|       | [ZONE 5: NON-STICKY TABLE UNDER-DRAWER (HỘC NGĂN KÉO GẦM BÀN ĐỘC LẬP)]                  |       |
|       |                     [▲ CLICK TO PULL OUT TABLE DRAWER]                                  |       |
|       +-----------------------------------------------------------------------------------------+       |
|                                                                                                         |
|  <<< KHI NHẤP MỞ: HỘC NGĂN KÉO GỖ TRƯỢT MỞ TỪ GẦM BÀN (drawer_empty_shell.png) <<<                      |
|  +---------------------------------------------------------------------------------------------------+  |
|  | [TAB A: CIRCULAR SEATING RADAR (Mâm la bàn)]       |  [TAB B: CREW ROSTER (Thẻ thủy thủ đoàn)]    |  |
|  |                                [▼ PUSH DRAWER BACK IN]                                           |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                                                                         |
|  🌟 [ZONE 4: MINIMIZABLE CENTER EVENT MODAL OVERLAY]                                                    |
|     (Tự động nổi lên khi có sự kiện ô bản đồ / Nghi thức — Có thể thu nhỏ thành huy hiệu góc màn hình)  |
+=========================================================================================================+
```

---

## 3. Quy Chuẩn 5 Phân Vùng Chức Năng (Core Zone Standards)

### 3.1 Zone 1: Thanh Tiêu Đề Cố Định (`GameHeader.jsx`)
- `sticky top-0 z-40`, hiển thị thông tin phòng, phase hiện tại, chế độ voyage, nút âm thanh và nút rời/giải tán phòng.

### 3.2 Zone 2: Central Stage (70% - 80% Diện Tích Mặt Bàn)
- **Vị trí:** Nằm chính giữa mặt bàn Thuyền trưởng, tạo viền bàn gỗ tự nhiên xung quanh.
- **Cơ chế:** Xen kẽ tại chỗ (In-Place Alternate Hub):
  - *Mặc định:* Render `MapBoardUI.jsx` (được revamp ở Task T067).
  - *Khi hành động:* Action Desk trượt ra trải đè trực tiếp lên chính khung này (chi tiết phase thuộc Task T064 - T066). Có nút `[◀ PEEK SEA CHART]` để tạm soi hải đồ bên dưới.

### 3.3 Zone 3: Điểm Kích Hoạt Thao Tác (Action Desk Trigger)
- Bố trí trên mặt bàn làm việc, có hiệu ứng ánh sáng ấm nhấp nháy khi đến lượt hành động, nhấp vào để mở/đóng Action Desk tại Central Stage.

### 3.4 Zone 4: Modal Sự Kiện Trung Tâm Thu Nhỏ Được (Minimizable Event Modal)
- Nổi lên khi có sự kiện bản đồ hoặc nghi thức tà giáo. Cho phép người chơi nhấn `[─ Minimize]` để thu nhỏ thành huy hiệu nổi ở góc màn hình soi lại bản đồ và ghế ngồi trước khi ra quyết định.

### 3.5 Zone 5: Hộc Ngăn Kéo Gầm Bàn Không Cố Định (Non-Sticky Under-Drawer)
- Nằm dưới mép đáy bàn, hoàn toàn không che khuất màn hình khi đang ở trên bàn.
- Khi người chơi tương tác, hộc ngăn kéo (`drawer_empty_shell.png`) trượt mở độc lập ra khỏi gầm bàn:
  - **TAB A (CIRCULAR SEATING RADAR):** Bàn tròn vị trí ngồi la bàn (`drawer_radar_base.png`), người chơi ở vị trí 6 giờ, làm nổi bật người kế bên trái (`Next Captain if Drunk`) và kế bên phải.
  - **TAB B (CREW ROSTER):** Danh sách thẻ thủy thủ đoàn (`card_crew_dossier.png`).

---

## 4. Tiêu Chuẩn Nghiệm Thu Cốt Lõi (Acceptance Criteria - AC)

### AC-1: Bố Cục Nền Khoang Buồng Cabin & Bàn Thuyền Trưởng Thu Nhỏ Vừa Vặn
- **Given:** Người chơi đang ở trang trận đấu (`Game.jsx`).
- **When:** Giao diện tải xong trên Desktop hoặc Mobile.
- **Then:** Nền chính toàn trang là khoang buồng thuyền (`cabin_room_bg.jpg`), Bàn Thuyền trưởng là container độc lập đặt giữa phòng (~80-85% viewport) với góc nhìn 90° phẳng (Flat Lay).
- **And:** Khung Central Stage ở trung tâm bàn chiếm 70-80% diện tích mặt bàn, mặc định render `MapBoardUI.jsx`.
- **And:** Điểm kích hoạt tác chiến trên bàn cho phép mở Action Desk trải đè tại chỗ lên Central Stage.

### AC-2: Hộc Ngăn Kéo Gầm Bàn Độc Lập Hoàn Toàn (Không Trùng Lặp Chi Tiết)
- **Given:** Người chơi ở trang trận đấu.
- **When:** Người chơi cuộn màn hình xuống mép đáy bàn làm việc.
- **Then:** Mặt bàn kết thúc ở mép phẳng (không có mặt đứng ngăn kéo hay tay nắm dính chết vào bàn).
- **When:** Người chơi nhấp mở ngăn kéo.
- **Then:** Hộc ngăn kéo độc lập trượt mở mượt mà từ gầm bàn hiển thị 2 Tab: Seating Radar & Crew Roster mà không bị xung đột hay chồng đè đồ họa với mặt bàn.

### AC-3: Modal Sự Kiện Nổi Trung Tâm Có Khả Năng Thu Nhỏ
- Modal sự kiện có nút `[─ Minimize]` thu nhỏ thành huy hiệu nổi góc màn hình và có thể khôi phục lại bất kỳ lúc nào.

### AC-4: Chuẩn Kỹ Thuật Bắt Buộc & Thẩm Mỹ Eldritch Parchment
- 100% văn bản hiển thị bằng Tiếng Anh hàng hải (`en-US`), font Gothic `Pirata One` (tiêu đề) và `Cinzel` (nhãn).
- Tuyệt đối không dùng Unicode emoji (👑, 🔫, 🧭, ⚓, 💀...). 100% dùng asset đồ họa tự tạo hoặc SVG.
- Bảo toàn 100% Game Logic và realtime socket synchronization.

---

## 5. Lịch Sử Cập Nhật (History)
- **v1.0 (2026-08-29):** Khởi tạo bản đặc tả Dual-Pane Command Layout (Task T061).
- **v1.1 - v1.3 (2026-09-07 - 2026-09-08):** Bàn làm việc Thuyền trưởng, Central Stage xen kẽ, ngăn kéo non-sticky.
- **v1.4 (2026-09-14):** Tách nền khoang buồng thuyền và Bàn Thuyền trưởng container thu nhỏ.
- **v1.5 (2026-09-16):** Tinh gọn đặc tả: Loại bỏ hoàn toàn mô tả vi mô gò bó vị trí đạo cụ trang trí; chuẩn hóa triệt để góc nhìn vuông góc 90° phẳng (Orthographic Flat Lay); làm rõ cơ chế tách bạch tuyệt đối giữa mép phẳng mặt bàn và hộc ngăn kéo gầm bàn để tránh rập khuôn và xung đột khi ghép layer.
