# ⚓ FEED THE KRAKEN — SESSION HANDOFF CONTEXT & ROADMAP

> **Tài liệu lưu trữ ngữ cảnh chuyển giao phiên làm việc (Session Handoff Context)**  
> **Dự án:** Feed The Kraken (Real-time Multiplayer Hidden Role Game)  
> **Ngày cập nhật:** 2026-09-14  
> **Nhánh hiện tại:** `backend-testing-and-fix` & `ui-revamp` (Hợp nhất song song 2 luồng)  
> **Trạng thái:** Vận hành đồng thời **Phase 9.3 (UI Revamp Track B)** và **Phase 10 (Backend Testing & Fixes)**.  
> ⚠️ **LƯU Ý ĐẶC BIỆT:** **Task T063 CHƯA HOÀN THÀNH** — Sẽ được thực hiện lại từ đầu trong conversation mới theo bộ quy chuẩn đã thiết lập.

---

## 1. 📋 TỔNG HỢP CÔNG VIỆC ĐÃ HOÀN THÀNH

### A. Giao diện & Kiến trúc Command In-Game (Phase 9.1, 9.2 & T062)
1. **Design System "Eldritch Parchment" & Typography:**
   - Đồng bộ 100% theme hàng hải huyền bí: gỗ sồi phong hóa, kim loại đồng thau xước, viền đinh rỉ sét, ngọc trạng thái verdigris/ruby.
   - Typography tuân thủ 100% font Gothic hàng hải `Pirata One` (tiêu đề) và `Cinzel` (nhãn/text phụ).
   - Ngôn ngữ hiển thị trên UI Frontend đạt **100% Tiếng Anh hàng hải (`en-US`)** (Rule 7), tuyệt đối không dùng stock emoji.
2. **Trang Chủ (`Home.jsx` - Task T058):**
   - Background đại dương huyền bí kết hợp Vignette + DustParticles bay nhẹ.
   - Khung gỗ trung tâm `PanelWood` chứa `CardParchment`, các nút bấm `ButtonWood` đổ bóng 3D.
3. **Trang Phòng Chờ (`Lobby.jsx` - Task T059):**
   - Bố cục 12 cột cân xứng: 7 cột danh sách thủy thủ (`CrewPlate.jsx`) + 5 cột Sổ hải đồ (`CardParchment.jsx`) + Bộ chọn Avatar cướp biển + Nút Bánh lái `START VOYAGE`.
   - Bảng Room Code bằng đồng khắc gỉ với tính năng bấm sao chép mã phòng.
4. **Kiến Trúc In-Game Command Layout Ban Đầu (`Game.jsx`, `GameHeader.jsx`, `CrewSeatingDrawer.jsx` - Task T061):**
   - **Dual-Pane Layout:** 60% Bản đồ hải trình bên trái + 40% Bàn điều khiển thao tác bên phải.
   - **Thanh Header gỗ sồi (`GameHeader.jsx`):** Căn giữa Map Board HUD, tích hợp ngọc online/offline, nút âm thanh hàng hải, nút Dissolve/Leave room.
   - **HUD Tracker Badges:** Huy hiệu theo dõi trực quan số lượng bài thời gian thực trên Map: `Deck: X 🎴`, `Discard: X 🗑️`, `Logbook: X/2 📖`, `Rituals: X 🔮`, `Supply Line: Crossed/Not Crossed 📦`.
   - **Khắc Vết Roi Máu Tra Khảo Flogging (`CrewPlate.jsx`):**
     - Tích hợp 3 sprite vết chém đẫm máu được căn chính giữa phiến gỗ sồi: `NOT A SAILOR` (`flog_not_sailor.png`), `NOT A PIRATE` (`flog_not_pirate.png`), `NOT A CULTIST` (`flog_not_cultist.png`).
     - Tăng **+30% kích thước** các icon chức vụ & trạng thái bên góc phải thẻ gỗ.
     - **Loại bỏ icon Room Host** khỏi thẻ người chơi trong game để tránh nhầm lẫn với Thuyền trưởng.
5. **Thẻ Bài Vai Trò Bí Mật (`RoleReveal.jsx` - Task T062):**
   - Thẻ Tarot cổ 3D Flip 180° mượt mà (600ms), mặt sau da thuộc nứt nẻ + xúc tu la bàn đồng cổ, mặt trước giấy da dê + biểu tượng phe phái mực phai.
   - Night overlay: phông đen huyền bí + ánh mắt Kraken tím eldritch-pulse + đếm ngược ember vòng tròn.

---

### B. Sửa Lỗi Logic Game, Đồng Bộ Realtime & Vận Hành (Phase 10)
1. **Lỗi Đồng Bộ Thẻ Bài Hoa Tiêu (Navigator Stale Cards Bug - UC-009, UC-010):**
   - *Nguyên nhân:* State `privateCards` cũ của lượt Thuyền phó chiếm quyền ưu tiên hơn `room.myNavigationCards`.
   - *Khắc phục:* `NavigationPhase.jsx` ưu tiên đọc dữ liệu `room.myNavigationCards` từ server; `Game.jsx` đăng ký listener `NAVIGATOR_CARDS_SECRET` và `NAVIGATION_CARD_EXECUTED`; Backend phát song song sự kiện tới socket riêng của Hoa tiêu.
2. **Sự Kiện Thu Nạp Tà Giáo Khi Hết Mục Tiêu (Cult Conversion Fallback - UC-015 AC-3):**
   - Khi không còn người chơi hợp lệ để thu nạp (`convertibleCrew.length === 0`), Cult Leader nhận thông báo và nút `END RITUAL & BRING DAWN ➔`, gửi `targetPlayerId = null` để kết thúc đêm êm đẹp mà không bị kẹt state game.
3. **Hiển Thị Kết Quả Soi Phòng Cabin Search (UC-013 AC-1):**
   - Thuyền trưởng nhận modal thông báo riêng phe phái của người bị soi (Cultist hiển thị xúc tu bí mật `CULTIST_TENTACLE`).
4. **Thông Báo Công Khai Khi Bốc Thẻ Cult Uprising (UC-015):**
   - Cả phòng nhận thông báo về loại nghi thức trước khi bắt đầu giai đoạn nhắm mắt ban đêm.
5. **Thông Báo Người Bị Thu Nạp & Nhận Mặt Cult Leader (UC-015):**
   - Người chơi bị thu nạp nhận thông báo riêng và nhìn thấy ID của Cult Leader.
6. **Bổ Sung Súng Khi Vượt Tuyến Tiếp Tế (`T070 [FIX/BUG]`):**
   - Bổ sung đạn súng lên tối đa 3 cho toàn bộ người chơi chưa bị loại (`player.status !== 'ELIMINATED'`), bao gồm cả người chơi đang ở trạng thái nghỉ phép `OFF_DUTY`.
7. **Thu Nạp Tà Giáo Cho Người Nghỉ Phép (`T071 [FIX/BUG]`):**
   - Cho phép Cult Leader thu nạp người chơi ở trạng thái `OFF_DUTY` trên cả Frontend (`MapBoardUI.jsx`), Backend (`ExecutionService.js`) và Bots (`AutoResponder.js`), chỉ loại trừ người bị `ELIMINATED`.
8. **Chuẩn Hóa Vòng Đời Trạng Thái Người Chơi (`T072 [AUDIT/FIX]`):**
   - Rà soát và phân định rạch ròi 3 trạng thái `ACTIVE`, `OFF_DUTY`, `ELIMINATED` trên toàn hệ thống. `OFF_DUTY` chỉ đóng vai trò chặn bổ nhiệm ban điều hướng thông thường; tất cả quyền hạn khác đều hoạt động bình thường.

---

## 2. 🗂️ CÁC TÀI LIỆU & ASSET ĐÃ THIẾT LẬP

### Asset Đồ Họa Đã Sẵn Sàng:
- `frontend/src/assets/ui/sprites/badge_captain_hat.png`: Mũ Thuyền trưởng da thuộc cướp biển.
- `frontend/src/assets/ui/sprites/flog_not_sailor.png`: Vết chém quất roi máu "NOT A SAILOR".
- `frontend/src/assets/ui/sprites/flog_not_pirate.png`: Vết chém quất roi máu "NOT A PIRATE".
- `frontend/src/assets/ui/sprites/flog_not_cultist.png`: Vết chém quất roi máu "NOT A CULTIST".
- `frontend/src/assets/ui/frames/input_wood_slot_clean.png`: Khung rãnh gỗ đục tinh xảo cho tab Radar / Roster.

### Tài Liệu & Hệ Thống Rules Đã Chuẩn Hóa:
- `spec/features/007-frontend-ui-revamp/ingame-command-layout-spec.md` (v1.3): Đặc tả chi tiết bố cục Bàn làm việc Thuyền trưởng, Central Stage xen kẽ tại chỗ (In-Place Alternate Hub) giữa `MapBoardUI.jsx` và `Action Desk Overlay`, cuộn giấy da trigger góc phải và Hộc ngăn kéo gầm bàn 2 tab.
- [`.agents/rules/rule-ui-sop-track-b.md`](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/.agents/rules/rule-ui-sop-track-b.md): Quy trình chuẩn 7 bước Track B, đã được tinh gọn xuống **7.515 bytes** (nằm an toàn dưới giới hạn 12.000 bytes) với đầy đủ 3 điểm dừng kiểm duyệt bắt buộc.
- [`.agents/rules/root-rule.md`](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/.agents/rules/root-rule.md): Hiến pháp điều phối, quy định bắt buộc tuân thủ SOP Track B, 3 điểm dừng kiểm duyệt và chuẩn hiển thị 100% tiếng Anh.

---

## 3. 🎯 LỘ TRÌNH THỰC HIỆN SONG SONG: PHASE 9.3 & PHASE 10

Dự án vận hành đồng thời 2 luồng công việc:
- **Track 1 (Frontend UI Revamp - Phase 9.3):** Hoàn thiện các component giao diện T063 - T069 theo phong cách "Eldritch Parchment" và quy trình Track B 7 bước SOP.
- **Track 2 (Backend Logic, Real-Time Sync & Ops - Phase 10 Dynamic Track):** Kiểm thử thực tế backend, game logic và vận hành website bằng người chơi thật / headless bots. Xử lý bugfix trực tiếp theo dạng backlog động ngay khi phát hiện.

### A. Danh Sách Nhiệm Vụ Giao Diện Phase 9.3 (Track 1 - UI Revamp)

| Task ID | Component / Màn hình | Trạng thái & Mô tả công việc |
| :--- | :--- | :--- |
| **T062** | `RoleReveal.jsx` | *(Đã hoàn thành ✅)* Thẻ Tarot cổ 3D Flip 180°, mặt sau da thuộc nứt + xúc tu la bàn đồng cổ, mặt trước giấy da dê + biểu tượng phe mực phai, Night overlay mắt Kraken tím eldritch-pulse. |
| **T063** | `Game.jsx`, `CrewSeatingDrawer.jsx` | **(CHƯA HOÀN THÀNH 🔄 - LÀM LẠI Ở CONVERSATION MỚI)** Khởi tạo không gian nền khoang buồng thuyền hải tặc (`cabin_room_bg.jpg`) phủ toàn màn hình; Bàn gỗ làm việc Thuyền trưởng (`tabletop_captain_desk.png`) đặt giữa khoang buồng cabin với kích thước thu nhỏ vừa vặn (~80-85% viewport) tạo chiều sâu không gian chân thực; Central Stage 70-80% diện tích mặt bàn render xen kẽ tại chỗ giữa `MapBoardUI` và `Action Desk`, Cuộn giấy da góc phải trượt đè tại chỗ, Hộc ngăn kéo gầm bàn độc lập Full Under-Drawer với 2 Tab: Tab 1 Seating Radar đĩa mâm la bàn động (5-11 người) & Tab 2 Khay thẻ hồ sơ thủy thủ đoàn Crew Dossier, 100% Tiếng Anh, cấm stock emoji. |
| **T064** | `CrewAppointment` (`MutinyBoard.jsx`) | *(Chờ thực hiện)* Bàn chỉ định nhân sự Thuyền trưởng chọn Lieutenant & Navigator, thẻ chân dung thủy thủ nền gỗ mục/da dê, huy hiệu bổ nhiệm đồng cổ & la bàn, trạng thái Off-duty xiềng xích phong ấn, nút xác nhận `CONFIRM NAVIGATION TEAM`. |
| **T065** | `MutinyBoard.jsx` | *(Chờ thực hiện)* Bàn gỗ cược súng nổi loạn, đồng tiền vàng / flintlock SVG, rương gỗ bản lề gỉ, screen shake `gunShake` khi công bố, xếp hạng súng + trao Mũ Thuyền trưởng. |
| **T066** | `NavigationPhase.jsx` | *(Chờ thực hiện)* Bàn điều hướng hải trình, 3 thẻ bài da dê cổ mực phai (Blue Sailor, Red Pirate, Yellow Cult), hiệu ứng chọn viền vàng + firelight glow, loại thẻ trượt mờ. |
| **T067** | `MapBoardUI.jsx` | *(Chờ thực hiện)* Hoàn thiện toàn diện Hải đồ cổ da dê (gradient parchment-dim, vệt ố, mép rêu moss-dim), đường mực lông vũ SVG nét run, ô sự kiện SVG + popover, tàu buồm gỗ tối `shipBob`. |
| **T068** | `EndGame.jsx` | *(Chờ thực hiện)* Màn hình chiến thắng theo từng phe (Sailor = bình minh ấm, Pirate = lửa đỏ Jolly Roger, Cult = xúc tu tím bùng nổ), lật mở đồng loạt vai trò trên bàn gỗ mục, nút quay lại/rời phòng `ButtonWood`. |
| **T069** | **Polish & Verification** | *(Chờ thực hiện)* Kiểm tra responsive 375px-1920px+, 60 FPS performance, `prefers-reduced-motion`, WCAG AA contrast, chạy `npm run build` xác nhận không lỗi. |

---

### B. Quy Trình Kiểm Thử Backend & Vận Hành Thực Tế (Track 2 - Phase 10 Dynamic Track)

1. **Chạy thử nghiệm:** Thực hiện chơi thử trên website (người dùng thật hoặc phối hợp headless bots).
2. **Ghi nhận lỗi:** Ngay khi phát hiện bug/lỗi logic/sai lệch trạng thái, ghi nhận task mới vào Phase 10 của `task.md`.
3. **Phân tích & Khắc phục:** Điều tra nguyên nhân gốc rễ, sửa code backend/frontend tương ứng, bảo toàn tính toàn vẹn (invariants) và viết test nếu cần.
4. **Xác nhận:** Đánh dấu hoàn thành trên `task.md` và commit.

**Các lỗi đã khắc phục trong Phase 10:**
- `T070 [FIX/BUG]`: Bổ sung súng lên 3 cho người chơi `OFF_DUTY` khi vượt Tuyến tiếp tế (Supply Line).
- `T071 [FIX/BUG]`: Cho phép thu nạp Tà giáo (Cult Conversion) đối với người chơi `OFF_DUTY`.
- `T072 [AUDIT/FIX]`: Chuẩn hóa phân định vòng đời `ACTIVE`, `OFF_DUTY`, `ELIMINATED` toàn diện.

---

## 4. 📌 TỔNG HỢP QUY TẮC & THIẾT LẬP BẮT BUỘC KHI LÀM LẠI TASK T063

Khi khởi động conversation mới để làm lại **Task T063**, AI **BẮT BUỘC PHẢI ĐỌC VÀ TUÂN THỦ 100% CÁC THIẾT LẬP SAU**:

### 1. Quy Trình Track B 7 Bước với 3 Điểm Dừng Kiểm Duyệt Bắt Buộc:
- **Cổng chặn 1 🎯 (Sau Bước B1):** Phân tích cấu trúc phân tầng Z-Index & Ma trận Asset ➔ **DỪNG LẠI CHỜ USER DUYỆT**.
- **Cổng chặn 2 🎯 (Sau Bước B2):** Sinh Mockup trực quan phối cảnh ➔ **DỪNG LẠI CHỜ USER DUYỆT**.
- **Điểm dừng kiểm duyệt Asset 🎯 (Sau Bước B3):** Nghiệm thu bộ asset nguyên tử độc lập (100% Alpha, sạch bóng prop) ➔ **DỪNG LẠI XUẤT TRÌNH BỘ ASSET CHO USER DUYỆT**. Tuyệt đối không tự ý viết code JSX (Bước B5) khi chưa hoàn tất kiểm duyệt asset.

### 2. Quy Chuẩn Góc Máy Chính Thức (Orthographic Top-Down):
- Toàn bộ asset chính thức ở Bước B3 (mặt bàn gỗ, hộc ngăn kéo, đĩa mâm la bàn, thẻ bài hồ sơ) **BẮT BUỘC PHẢI CÓ GÓC NHÌN TỪ TRÊN XUỐNG VUÔNG GÓC 90 ĐỘ (`perpendicular 90° flat lay / bird's-eye view`)**.
- Không sử dụng góc nghiêng phối cảnh 3D (perspective tilt) để tránh làm méo hình học khi xếp chồng các thẻ và avatar bằng React JSX/CSS.

### 3. Đảm Bảo Đẳng Cấp Thẩm Mỹ "Eldritch Parchment" & Chiều Sâu Điện Ảnh:
- Khi sinh ảnh góc nhìn vuông góc 90 độ, **TUYỆT ĐỐI KHÔNG ĐỂ NÉT VẼ BIẾN THÀNH HOẠT HÌNH 2D PHẲNG LÌ / CLIP-ART RẺ TIỀN**.
- Bắt buộc duy trì ánh sáng điện ảnh chiaroscuro, quầng sáng nến vàng ấm lung linh (`firelight-glow`), bóng đổ mềm tự nhiên, thớ gỗ sồi phong hóa nứt nẻ và kim loại đồng thau xước gỉ patina.

### 4. Kiến Trúc Phân Tầng Nền & Bàn Thuyền Trưởng (v1.4 Mới):
- **Background chính toàn trang:** Nền khoang buồng thuyền hải tặc (`cabin_room_bg.jpg`) thể hiện vách gỗ sồi, đèn lồng dầu treo, dây thừng, cửa sổ tròn porthole.
- **Mặt bàn Thuyền trưởng:** Container asset độc lập (`tabletop_captain_desk.png`), kích thước thu nhỏ vừa vặn (~80-85% viewport) đặt giữa buồng cabin, không kéo giãn tràn màn hình.

### 5. Hai Phân Loại Asset Độc Lập — Nghiêm Cấm Cắt Cúp Lười Biếng (Strict Ban on Lazy Cropping):
- **CẤM TUYỆT ĐỐI** hành vi dùng bounding box crop các chi tiết (súng, cuộn giấy, tay nắm, đĩa la bàn) trực tiếp từ tấm ảnh phẳng của mockup.
- **Nhóm Clean Canvases:**
  * `cabin_room_bg.jpg`: Nền khoang buồng thuyền hải tặc toàn cảnh bao quát.
  * `tabletop_captain_desk.png`: Bàn gỗ sồi phong hóa độc lập, đặt cân đối giữa khoang buồng cabin, lòng trong khung trung tâm để trống/sạch sẽ hoàn toàn để render `MapBoardUI` và `Action Desk`.
  * `drawer_empty_shell.png`: Hộc ngăn kéo rỗng dày dặn, liền khối tay nắm mỏ neo đồng cổ, ruột chia 2 khoang trống không dính thẻ bài/mâm đĩa.
- **Nhóm Standalone Sprites (Tách phông 100% Alpha Channel):**
  * `scroll_action_desk_trigger.png`: Cuộn giấy da tác chiến cuộn dọc buộc dây thừng niêm phong sáp đỏ.
  * `drawer_radar_base.png`: Mâm đĩa la bàn hoa tiêu đồng cổ 16 cánh, lòng trong để trống sạch sẽ để React JSX tính góc chia độ `(360° / N * i)` cho 5-11 người chơi.
  * `card_crew_dossier.png`: Thẻ bài da dê nẹp đồng nứt nẻ, ruột để trống cho React JSX render avatar, chức vụ, vũ khí và ấn ký trạng thái.

### 6. Chuẩn Ngôn Ngữ & Kỹ Thuật:
- Giao diện người dùng: **100% Tiếng Anh hàng hải (`en-US`)**, font Gothic `Pirata One` (tiêu đề) và `Cinzel` (nhãn phụ), nghiêm cấm stock emoji.
- Code JSX: Bảo toàn 100% Game Logic, Socket.io event listeners và state quản lý phòng chơi.
- Biên dịch: Chạy lệnh `npm run build` xác nhận 0 lỗi trước khi bàn giao.
