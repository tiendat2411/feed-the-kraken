# ĐẶC TẢ KIẾN TRÚC BỐ CỤC BÀN CHƠI TRONG TRẬN (IN-GAME COMMAND LAYOUT SPECIFICATION)

## Metadata
- **Tài liệu:** In-Game Command Layout Architecture & Interaction Specification
- **Feature ID:** Feature 007 - Frontend UI Revamp (Phase 9.2 / Task T061)
- **Status:** approved
- **Author:** Antigravity AI & Product Owner
- **Last Updated:** 2026-08-29
- **Phạm vi áp dụng:** `frontend/src/pages/Game.jsx`, `MapBoardUI.jsx`, `MutinyBoard.jsx`, `NavigationPhase.jsx`, `GameHeader.jsx`, `CrewSeatingDrawer.jsx`

---

## 1. Bối Cảnh & Mục Tiêu Kiến Trúc (Background & Goals)

### 1.1 Vấn đề của Bố cục Cũ
- Trong cấu trúc cũ, `Game.jsx` hiển thị màn hình dạng đơn khối chuyển trang (exclusive full-screen switching): khi ở phase Bạo loạn (`MutinyBoard`) hoặc phase Rút bài (`NavigationPhase`), toàn bộ Bản đồ Hải đồ (`MapBoardUI`) bị ẩn hoàn toàn.
- **Hệ quả tiêu cực:** Thuyền trưởng, Thuyền phó, Hoa tiêu và Thủy thủ đoàn không thể quan sát vị trí thực tế của con tàu, khoảng cách đến bờ (Bluewater / Crimson / Kraken), hoặc tiến trình Cult Track khi đang biểu quyết nộp súng hay chọn thẻ điều hướng.
- Thiếu công cụ trực quan hóa **vị trí ghế ngồi bàn tròn (Circular Seating Order)**, khiến người chơi không nắm bắt được ai ngồi bên trái/phải mình để tính toán hiệu ứng như lá bài *Say Xỉn (Drunken Captain)* hoặc thứ tự kế vị Thuyền trưởng.

### 1.2 Mục Tiêu Thiết Kế Mới
1. **Hải Đồ Luôn Hiện Diện (Persistent Sea Chart - 60% Left/Center):** Bản đồ hải trình đại dương, vị trí tàu, đường ranh giới Supply Line và Cult Track luôn hiển thị 100% thời gian thi đấu.
2. **Bàn Thao Tác Sĩ Quan Linh Hoạt (Dynamic Action Desk - 40% Right):** Khu vực tương tác hành động theo từng Phase đặt song song bên phải.
3. **Modal Overlay Sự Kiện Trung Tâm (Minimizable Center Event Modal):** Hiển thị kết quả rút bài, sự kiện ô bản đồ, nghi thức tà giáo với khả năng Thu nhỏ / Mở lại linh hoạt để người chơi không bị che khuất bản đồ khi suy tính.
4. **Bảng Thủy Thủ & Bàn Tròn Vị Trí Trượt Kéo (Sliding Crew & Seating Drawer):** Tích hợp thanh đáy thu gọn, khi nhấp vào sẽ trượt lên Bàn Tròn Vị Trí Ngồi (Radar View) và Danh sách Thẻ Thuyền Viên.
5. **100% Tiếng Anh & Chuẩn Thẩm Mỹ "Eldritch Parchment":** Đồng bộ font `Pirata One`, texture gỗ sồi chạm viền đồng cổ verdigris và giấy da dê cổ.

---

## 2. Sơ Đồ Bố Cục Tổng Thể (Master Layout Blueprint)

```text
+=========================================================================================================+
| [ZONE 1: STICKY HUD HEADER]                                                                             |
| ROOM: [ID]  |  PHASE: [SECRET ROLES / MUTINY VOTE / CAPTAIN DRAW...]  |  VOYAGE MODE  |  SOUND  |  LEAVE|
+=========================================================================================================+
|                                        MAIN COMMAND STAGE                                               |
|                                                                                                         |
|  +----------------------------------------------------+  +-------------------------------------------+  |
|  | [ZONE 2: PERSISTENT SEA CHART (60% Desktop)]       |  | [ZONE 3: DYNAMIC ACTION DESK (40%)]       |  |
|  |                                                    |  |                                           |  |
|  |  🗺️ Interactive Hex Sea Chart (SVG)                |  |  ⚔️ Phase-Specific Interactive Panel:     |  |
|  |  ⛵ Real-Time Sailing Vessel Token                 |  |    - Phase 1: Appoint Lt & Nav            |  |
|  |  ⚔️ Supply Line Warning Boundary                  |  |    - Phase 2: Secret Gun Pledge & Vote    |  |
|  |  🐙 Kraken Cult Sacrifice Track                    |  |    - Phase 3: Draw / Discard / Steer Card |  |
|  |  📜 Collapsible Captain's Logbook Drawer           |  |    - Phase 4: Tie-Breaker Elimination Chain| |
|  +----------------------------------------------------+  +-------------------------------------------+  |
|                                                                                                         |
|  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  |
|  🌟 [ZONE 4: MINIMIZABLE CENTER EVENT MODAL OVERLAY]                                                    |
|     (Auto-pops on Waypoint Actions / Card Outcomes / Cult Uprisings — Minimizable to floating badge)    |
|     - Peeked Discard Deck / Telescope Top Deck Inspection                                               |
|     - Cabin Search / Flogging / Silence Tongue / Feed to Kraken                                         |
|     - Secret Cult Conversion & Guns Stash Allocation                                                    |
+=========================================================================================================+
| [ZONE 5: COLLAPSIBLE BOTTOM CREW DOCK & SLIDING SEATING DRAWER]                                         |
|  Collapsed Bar: [👑 Captain] [🎖️ Lt] [🧭 Nav] | 🔫 Armory: 3 | [▲ CREW QUARTERS & SEATING CHART]       |
|  Expanded Drawer:                                                                                       |
|    - [TAB A: CIRCULAR SEATING RADAR] Bàn tròn vị trí ngồi, chiều kim đồng hồ, kế cận trái/phải         |
|    - [TAB B: CREW GRID PLATES] Danh sách thẻ gỗ chi tiết 5-11 người chơi                                |
+=========================================================================================================+
```

---

## 3. Đặc Tả Chi Tiết 5 Phân Vùng Chức Năng (Detailed Zone Specifications)

### 3.1 Zone 1: Thanh Tiêu Đề HUD Cố Định (`GameHeader.jsx`)
- **Vị trí:** `sticky top-0 z-40`, dầm gỗ sồi ấm phong hóa tỷ lệ 14:1.
- **Dữ liệu hiển thị:**
  - **Trái:** Biển gỗ viền đồng `ROOM: [ID]` và Thẻ giấy da đóng 4 đinh sắt hiển thị Game Phase bằng tiếng Anh (ví dụ: `MUTINY VOTE`, `CAPTAIN DRAW`, `NAVIGATOR DECISION`...).
  - **Giữa:** Khung gỗ chạm khắc xúc tu hiển thị chế độ hải trình (`QUICK JOURNEY` / `LONG JOURNEY`) kẹp giữa 2 huy hiệu La Bàn Hoàng Kim và Thuyền Buồm.
  - **Phải:** Nút còi đồng bật/tắt âm thanh, nút `DISSOLVE` (Chủ phòng) và nút `LEAVE`.

---

### 3.2 Zone 2: Khu Vực Bản Đồ Hải Trình Cố Định (Persistent Sea Chart - 60% Left)
- **Vị trí:** Chiếm 58% - 62% chiều rộng màn hình trên Desktop.
- **Ràng buộc:** Luôn luôn render và hiển thị trực quan 100% thời gian thi đấu, không bị unmount khi chuyển đổi giữa các phase.
- **Linh kiện cốt lõi:** `MapBoardUI.jsx` đặt trong khung giấy da dê viền gỗ mục (`CardParchment` / `PanelWood`).
- **Các thành phần hiển thị:**
  1. **Bản đồ Hải đồ SVG:** Lưới các ô lục giác hải trình với 3 tuyến màu:
     - *Xanh dương (Bluewater Bay - Sailors)*
     - *Đỏ (Crimson Cove - Pirates)*
     - *Vàng (Maw of the Kraken - Cultists)*
  2. **Vị trí Tàu Thực tế:** Icon con tàu nổi bồng bềnh (`shipBob` animation) trên tọa độ hiện tại.
  3. **Ranh giới Tuyến Tiếp Tế (Supply Line):** Vạch cảnh báo màu vàng đồng / đỏ phát sáng ngăn cách 2 nửa hải đồ.
  4. **Kraken Cult Track:** Thước đo bậc thang dọc hoặc ngang hiển thị số bước tế thần đã tích lũy.
  5. **Quick Captain's Log:** Nút bấm mở nhanh danh sách lịch sử các lá bài đã được chọn đi tàu qua từng vòng.

---

### 3.3 Zone 3: Bàn Thao Tác Sĩ Quan Giai Đoạn (Dynamic Action Desk - 40% Right)
- **Vị trí:** Chiếm 38% - 42% chiều rộng màn hình trên Desktop.
- **Chức năng:** Tự động điều hướng và hiển thị giao diện tương tác phù hợp với vai trò của người chơi trong từng giai đoạn:
  - **Giai đoạn Bổ nhiệm (`DAY_1_CREW_SELECTION` / `APPOINT_TEAM`):**
    - *Đối với Thuyền trưởng:* Danh sách thuyền viên hợp lệ kèm nút `+ Lieutenant` và `+ Navigator`, nút `CONFIRM APPOINTMENTS`.
    - *Đối với Thủy thủ đoàn:* Hiển thị thông báo đang chờ Thuyền trưởng chỉ định và danh sách ứng viên được đề xuất.
  - **Giai đoạn Biểu quyết Bạo loạn (`LOYALTY_CHECK`):**
    - Bộ chọn số súng bí mật: `0 Guns (Loyal)`, `1 Gun (Mutiny)`, `2 Guns (Mutiny)`, `3 Guns (All-in)`.
    - Nút `SUBMIT MUTINY VOTE`, đồng hồ đếm ngược và bảng trạng thái nộp phiếu của toàn bộ thuyền viên.
  - **Giai đoạn Kết quả Bạo loạn & Hòa súng (`MUTINY_REVEALED` / `MUTINY_TIE_BREAKER`):**
    - Bảng công bố kết quả nổ súng lật đổ / giữ vững quyền lực.
    - Chuỗi loại trừ hòa súng (Tie-breaker Chain Elimination) cho người giữ quyền loại.
  - **Giai đoạn Điều hướng Rút bài (`NAVIGATION`):**
    - *Thuyền trưởng:* Rút 2 lá bài -> Chọn 1 lá giữ vào Logbook, 1 lá hủy úp kín.
    - *Thuyền phó:* Rút 2 lá bài -> Chọn 1 lá giữ vào Logbook, 1 lá hủy úp kín.
    - *Hoa tiêu:* Xem 2 lá trong Logbook -> Chọn 1 lá đi tàu, 1 lá hủy vĩnh viễn.

---

### 3.4 Zone 4: Modal Overlay Sự Kiện Nổi Trung Tâm (Minimizable Center Event Modal)
- **Mục đích:** Dành cho các sự kiện thông tin quan trọng hoặc hành động đặc biệt trên ô bản đồ và nghi thức tà giáo:
  - **Sự kiện ô bản đồ (Map Waypoint Actions):** `CABIN_SEARCH` (Khám xét cabin), `FLOGGING` (Tra khảo), `OFF_WITH_THE_TONGUE` (Cắt lưỡi), `FEED_THE_KRAKEN` (Cho Kraken ăn), `MERMAID_SONG` (Xem lại 3 lá bài hủy), `SPYGLASS` (Xem lá bài trên đỉnh bộ bài).
  - **Nghi thức Tà giáo (Cult Rituals):** `CULT_UPRISING` (Khởi nghĩa tà giáo), `CULT_GUNS_STASH` (Phân bổ súng ngầm), `SECRET_CONVERSION` (Thu nạp tín đồ bí mật).
- **Cơ chế Tương tác Bắt buộc:**
  1. **Tự Động Mở (Auto-Open):** Khi server phát sự kiện kích hoạt, modal tự động nổi lên ở trung tâm màn hình với backdrop tối mờ nhẹ.
  2. **Nút Thu Nhỏ / Tạm Ẩn (`[─ Minimize]` & `[✕ Close]`):** Người chơi có thể nhấp để tạm ẩn modal xuống góc màn hình thành một **Huy Hiệu Sự Kiện Nhấp Nháy (Blinking Event Badge)**.
  3. **Mục đích Thu Nhỏ:** Giúp Thuyền trưởng hoặc người thực thi mệnh lệnh có thể soi lại bản đồ, xem lại danh tính và vị trí ngồi của các thuyền viên khác trước khi đưa ra quyết định trừng phạt hay chọn mục tiêu.
  4. **Nút Mở Lại (`[+] Restore Modal]`):** Nhấp vào huy hiệu nhấp nháy để mở lại modal và hoàn tất hành động.

---

### 3.5 Zone 5: Thanh Đáy & Ngăn Kéo Thủy Thủ Đoàn (`CrewSeatingDrawer.jsx`)

#### A. Thanh Đáy Thu Gọn (Collapsed Bottom Bar)
- Cố định ở đáy viewport (`fixed bottom-0 left-0 right-0 z-30`).
- Chiều cao `~48px - 56px`, chất liệu dầm gỗ sồi chạm đinh tán.
- Hiển thị tóm tắt:
  - Avatar & Tên của 3 Sĩ quan đương nhiệm: Thuyền trưởng (👑), Thuyền phó (🎖️), Hoa tiêu (🧭).
  - Kho súng cá nhân của bạn: `🔫 Armory: [X]`.
  - Nút bấm trung tâm nổi bật kèm mũi tên: `⚓ CREW QUARTERS & SEATING (▲ CLICK TO EXPAND)`.

#### B. Ngăn Kéo Gỗ Trượt Lên (Expanded Sliding Drawer)
- Khi nhấp vào thanh đáy, một khung bảng gỗ sồi lớn trượt lên chiếm khoảng 50% - 70% chiều cao màn hình (có nút `[▼ Minimize]` để hạ xuống).
- Cung cấp 2 Tab chuyển đổi linh hoạt:

```text
+-----------------------------------------------------------------------------------------+
| [TAB A: CIRCULAR SEATING RADAR]             | [TAB B: CREW ROSTER GRID]                 |
+-----------------------------------------------------------------------------------------+
```

#### 🪑 TAB A: Bàn Tròn Vị Trí Ngồi (Circular Seating Chart - Radar View)
* **Ý nghĩa cơ chế game:** Phục vụ các luật chơi phụ thuộc vào vị trí vật lý / thứ tự bàn tròn:
  * **Hiệu ứng Say Xỉn (`Drunken Captain 🍺`):** Quyền Thuyền trưởng chuyển ngay sang người ngồi kế tiếp bên trái (Left Neighbor).
  * **Thứ tự thảo luận & chuyển giao chức vụ.**
* **Thiết kế Trực quan:**
  * Vẽ một **Bàn Tròn La Bàn Hải Tặc (Circular Compass Table)** ở trung tâm.
  * Ghế ngồi của **BẠN (YOU)** luôn được cố định ở góc đáy 6 giờ (`Bottom Center`) để tạo góc nhìn tự nhiên nhất.
  * Các người chơi khác được phân bố đều theo góc tọa độ vòng tròn theo đúng thứ tự mảng `room.players`.
  * Hiển thị mũi tên cong phát sáng chỉ **Chiều Kim Đồng Hồ (Clockwise Order / Turn Flow)**.
  * Trên mỗi vị trí ghế hiển thị: Avatar tròn viền đồng, Tên người chơi, Biểu tượng chức vụ (👑, 🎖️, 🧭), Số súng hiện có, Biểu tượng Cắt lưỡi (🔇) hoặc Nghỉ ca (🌊 Off-Duty).
  * Làm nổi bật rõ ràng người ngồi **KẾ BÊN TRÁI (Next Captain in Line)** và **KẾ BÊN PHẢI**.

#### 👥 TAB B: Danh Sách Thẻ Thủy Thủ (Crew Roster Grid)
* Hiển thị lưới thẻ gỗ `CrewPlate` của toàn bộ 5–11 người chơi với đầy đủ ngọc trạng thái kết nối (Emerald Online / Ruby Offline), avatar nhân vật Pirates of the Caribbean và huy hiệu vai trò.

---

## 4. Đặc Tả Khả Năng Thích Ứng Màn Hình (Responsive Layout Rules)

### 4.1 Màn hình Lớn (Desktop / Tablet Ngang: `width >= 1024px`)
- Bố cục 2 cột song song hiển thị đồng thời:
  - Cột trái (60% width): `SeaChart` cố định.
  - Cột phải (40% width): `ActionDesk` tương tác.
- Thanh đáy `CrewSeatingDrawer` nằm cố định ở đáy màn hình.

### 4.2 Màn hình Nhỏ (Mobile / Tablet Đứng: `width < 1024px`)
- Sử dụng thanh chuyển Tab nhanh ở đầu trang dưới Header:
  - `[🗺️ SEA CHART]` vs `[⚔️ ACTION DESK]` (Có chấm đỏ nhấp nháy thông báo khi đến lượt người chơi cần thao tác).
- Ngăn kéo Thủy thủ đoàn `CrewSeatingDrawer` trượt lên toàn màn hình (Full-screen overlay drawer) khi nhấp mở.

---

## 5. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria - AC)

### AC-1: Hiển thị Bản đồ Hải đồ Song Song Bàn Thao Tác
- **Given:** Người chơi đang ở trong trận đấu tại bất kỳ phase nào (`DAY_1_CREW_SELECTION`, `LOYALTY_CHECK`, `NAVIGATION`...).
- **When:** Màn hình trận đấu tải trên Desktop (`>= 1024px`).
- **Then:** Bản đồ Hải đồ (`MapBoardUI`) luôn hiển thị ở cột trái (60%) và Bàn thao tác (`ActionDesk`) hiển thị ở cột phải (40%).
- **And:** Người chơi có thể vừa quan sát vị trí con tàu vừa thực hiện các thao tác chọn chức vụ, bỏ phiếu súng, hoặc chọn bài điều hướng mà không bị ẩn bản đồ.

### AC-2: Modal Sự Kiện Nổi Trung Tâm Có Khả Năng Thu Nhỏ
- **Given:** Một sự kiện ô bản đồ (Khám xét, Cắt lưỡi, Cho Kraken ăn) hoặc Nghi thức tà giáo được kích hoạt.
- **When:** Modal sự kiện hiển thị ở trung tâm màn hình.
- **Then:** Modal có nút `[─ Minimize]` cho phép người chơi thu nhỏ thành huy hiệu nổi ở góc màn hình để soi bản đồ và vị trí ngồi.
- **And:** Người chơi có thể nhấp vào huy hiệu nổi để mở lại modal và hoàn tất hành động.

### AC-3: Bàn Tròn Vị Trí Ngồi (Circular Seating Radar)
- **Given:** Người chơi nhấp mở ngăn kéo `CrewSeatingDrawer` và chọn `Tab A: Seating Radar`.
- **When:** Bàn tròn vị trí ngồi hiển thị.
- **Then:** Vị trí của người chơi hiện tại (YOU) được neo ở góc đáy 6 giờ, các người chơi khác xếp theo đúng thứ tự vòng tròn quanh bàn.
- **And:** Chiều kim đồng hồ và người ngồi kế bên trái (ứng viên nhận Thuyền trưởng khi Say xỉn) được làm nổi bật trực quan.

### AC-4: Đồng Bộ 100% Tiếng Anh & Art Style
- **Given:** Mọi nhãn, tiêu đề, nút bấm, tooltip và modal trên giao diện in-game.
- **When:** Người chơi tương tác với giao diện.
- **Then:** 100% văn bản hiển thị bằng tiếng Anh cổ điển (`en-US`), font `Pirata One`, không có bất kỳ ký tự tiếng Việt nào trong UI.

---

## 6. Lịch Sử Cập Nhật (History)
- **v1.0 (2026-08-29):** Khởi tạo bản đặc tả kiến trúc bố cục In-Game Dual-Pane Command Layout cho Feature 007 (Task T061).
