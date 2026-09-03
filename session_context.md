# ⚓ FEED THE KRAKEN — SESSION HANDOFF CONTEXT & ROADMAP

> **Tài liệu lưu trữ ngữ cảnh chuyển giao phiên làm việc (Session Handoff Context)**  
> **Dự án:** Feed The Kraken (Real-time Multiplayer Hidden Role Game)  
> **Ngày cập nhật:** 2026-09-01  
> **Nhánh hiện tại:** `ui-revamp-rebase` (đã merge đồng bộ vào `master`)  
> **Trạng thái:** Hoàn thành toàn bộ **Phase 9.1** & **Phase 9.2**. Sẵn sàng cho **Phase 9.3**.

---

## 1. 📋 TỔNG HỢP CÔNG VIỆC ĐÃ HOÀN THÀNH

### A. Giao diện & Kiến trúc Command In-Game (Phase 9.1 & 9.2)
1. **Design System "Eldritch Parchment" & Typography:**
   - Đồng bộ 100% theme hàng hải huyền bí, gỗ sồi phong hóa, kim loại đồng thau, viền đinh rỉ, ngọc trạng thái verdigris/ruby.
   - Typography tuân thủ 100% font Gothic hàng hải `Pirata One` (tiêu đề) và `Cinzel` (nhãn/text phụ).
   - Ngôn ngữ hiển thị trên UI Frontend đạt **100% Tiếng Anh hàng hải** (Rule 7).
2. **Trang Chủ (`Home.jsx` - Task T058):**
   - Background đại dương huyền bí kết hợp Vignette + DustParticles bay nhẹ.
   - Khung gỗ trung tâm `PanelWood` chứa `CardParchment`, các nút bấm `ButtonWood` đổ bóng 3D.
3. **Trang Phòng Chờ (`Lobby.jsx` - Task T059):**
   - Bố cục 12 cột cân xứng: 7 cột danh sách thủy thủ (`CrewPlate.jsx`) + 5 cột Sổ hải đồ (`CardParchment.jsx`) + Bộ chọn Avatar cướp biển + Nút Bánh lái `START VOYAGE`.
   - Bảng Room Code bằng đồng khắc gỉ với tính năng bấm sao chép mã phòng.
4. **Kiến Trúc In-Game Command Layout (`Game.jsx`, `GameHeader.jsx`, `CrewSeatingDrawer.jsx` - Task T061):**
   - **Dual-Pane Layout:** 60% Bản đồ hải trình bên trái + 40% Bàn điều khiển thao tác bên phải.
   - **Thanh Header gỗ sồi (`GameHeader.jsx`):** Căn giữa Map Board HUD, tích hợp ngọc online/offline, nút âm thanh hàng hải, nút Dissolve/Leave room.
   - **HUD Tracker Badges:** Huy hiệu theo dõi trực quan số lượng bài thời gian thực trên Map: `Deck: X 🎴`, `Discard: X 🗑️`, `Logbook: X/2 📖`, `Rituals: X 🔮`, `Supply Line: Crossed/Not Crossed 📦`.
   - **Drawer Kéo Thông Minh (`CrewSeatingDrawer.jsx`):**
     - Đáy thanh bottom bar trở thành chính Header của ngăn kéo, đóng/mở qua **Tay nắm Bạch tuộc bằng đồng (`handle_drawer_brass.png`)**.
     - **Tab A (Seating Radar):** Bàn tròn la bàn 11 người chơi, **tăng kích thước avatar thêm +30%**, hiển thị chiều quay kim đồng hồ, mũ Thuyền trưởng, huy chương Thuyền phó, la bàn Hoa tiêu, súng `🔫 X`, cảnh báo say rượu và Tà giáo bí mật.
     - **Tab B (Crew Roster):** Lưới **2 cột** với các tấm thẻ gỗ sồi lớn (`CrewPlate.jsx`).
   - **Khắc Vết Roi Máu Tra Khảo Flogging (`CrewPlate.jsx`):**
     - Tích hợp 3 sprite vết chém đẫm máu được căn chính giữa phiến gỗ sồi: `NOT A SAILOR` (`flog_not_sailor.png`), `NOT A PIRATE` (`flog_not_pirate.png`), `NOT A CULTIST` (`flog_not_cultist.png`).
     - Tăng **+30% kích thước** các icon chức vụ & trạng thái bên góc phải thẻ gỗ.
     - **Loại bỏ icon Room Host** khỏi thẻ người chơi trong game để tránh nhầm lẫn với Thuyền trưởng.

---

### B. Sửa Lỗi Logic Game & Đồng Bộ Trạng Thái Realtime
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

---

## 2. 🗂️ CÁC TÀI LIỆU & ASSET MỚI ĐÃ TẠO

### Asset Sprites & Frames Mới:
- `frontend/src/assets/ui/sprites/badge_captain_hat.png`: Mũ Thuyền trưởng da thuộc cướp biển.
- `frontend/src/assets/ui/frames/wood_bottom_bar.png`: Thanh đáy gỗ sồi 14:1 với góc kim loại verdigris.
- `frontend/src/assets/ui/frames/input_wood_slot_clean.png`: Khung rãnh gỗ đục tinh xảo cho 2 tab Radar / Roster.
- `frontend/src/assets/ui/sprites/flog_not_sailor.png`: Vết chém quất roi máu "NOT A SAILOR".
- `frontend/src/assets/ui/sprites/flog_not_pirate.png`: Vết chém quất roi máu "NOT A PIRATE".
- `frontend/src/assets/ui/sprites/flog_not_cultist.png`: Vết chém quất roi máu "NOT A CULTIST".

### Tài Liệu & Metadata:
- `README.md`: Trang tài liệu giới thiệu GitHub chuyên nghiệp, đầy đủ lore, luật chơi, kiến trúc, tech stack và hướng dẫn chạy.
- `spec/features/007-frontend-ui-revamp/`: Bộ đặc tả Feature 007, Art Direction Guide, Theme Tokens và Use Cases (UC-021, UC-022, UC-023).

---

## 3. 🎯 LỘ TRÌNH TIẾP THEO (NEXT ROADMAP): PHASE 9.3

Khi mở conversation mới, tiếp tục triển khai các task còn lại của **Phase 9.3: Game Components Revamp** theo thứ tự:

| Task ID | Component | Mô tả công việc cần làm |
| :--- | :--- | :--- |
| **T062** | `RoleReveal.jsx` | *(Đã hoàn thành ✅)* Thẻ Tarot cổ 3D Flip 180°, mặt sau da thuộc nứt + xúc tu la bàn đồng cổ, mặt trước giấy da dê + biểu tượng phe mực phai, Night overlay mắt Kraken tím eldritch-pulse. |
| **T063** | `MutinyBoard.jsx` | Bàn gỗ cược súng nổi loạn, đồng tiền vàng / flintlock SVG, rương gỗ bản lề gỉ, screen shake `gunShake` khi công bố, xếp hạng súng + trao Mũ Thuyền trưởng. |
| **T064** | `NavigationPhase.jsx` | Bàn điều hướng hải trình, 3 thẻ bài da dê cổ mực phai (Blue Sailor, Red Pirate, Yellow Cult), hiệu ứng chọn viền vàng + firelight glow, loại thẻ trượt mờ. |
| **T065** | `MapBoardUI.jsx` | Hoàn thiện toàn diện Hải đồ cổ da dê (gradient parchment-dim, vệt ố, mép rêu moss-dim), đường mực lông vũ SVG nét run, ô sự kiện SVG + popover, tàu buồm gỗ tối `shipBob`. |
| **T066** | `EndGame.jsx` | Màn hình chiến thắng theo từng phe (Sailor = bình minh ấm, Pirate = lửa đỏ Jolly Roger, Cult = xúc tu tím bùng nổ), lật mở đồng loạt vai trò trên bàn gỗ mục, nút quay lại/rời phòng `ButtonWood`. |
| **T067** | **Polish & Verification** | Kiểm tra responsive 375px-1920px+, 60 FPS performance, `prefers-reduced-motion`, WCAG AA contrast, chạy `npm run build` xác nhận không lỗi. |

---

## 4. 📌 QUY TRÌNH THỰC HIỆN BẮT BUỘC: TRACK B 6 BƯỚC (THEO RULE-UI-REVAMP-SOP.MD)

Đối với **TẤT CẢ CÁC TASK GIAO DIỆN (T062 -> T066)**, AI **TUYỆT ĐỐI KHÔNG ĐƯỢC NHẢY VÀO CODE NGAY**. Phải tuân thủ nghiêm ngặt 6 bước:

```text
[Bước B1: Generate Mockup & Trình Bày Bố Cục] ➔ [CỔNG CHẶN: Chờ User Duyệt 🎯]
   ↓ (Sau khi User duyệt)
[Bước B2: Bóc Tách & Tách Phông PNG Trong Suốt (Atomic Sprites)] (Nghiêm cấm nướng chết text)
   ↓
[Bước B3: Lưu Trữ Vào frontend/src/assets/ui/]
   ↓
[Bước B4: Code Component & Layering] (Bảo toàn 100% Game Logic & State)
   ↓
[Bước B5: Thẩm Định Trực Quan 1:1 & Build Check (npm run build)]
   ↓
[Bước B6: Cập Nhật task.md & Đề Xuất Git Commit]
```

### Hướng Dẫn Mở Đầu Cho Conversation Mới:
Khi bắt đầu conversation mới, người dùng sẽ yêu cầu làm **Task T062 (`RoleReveal.jsx`)**.  
AI **BẮT BUỘC** phải:
1. Đọc `.agents/rules/rule-ui-revamp-sop.md` và `spec/features/007-frontend-ui-revamp/art-direction-guide.md`.
2. Bắt đầu bằng **Bước B1**: Sử dụng công cụ `generate_image` để tạo bản vẽ Mockup Thẻ bài Tarot cổ (`RoleReveal`), trình bày chi tiết bố cục/hiệu ứng lật 3D/quầng sáng lửa cho người dùng xem và **DỪNG LẠI CHỜ NGƯỜI DÙNG DUYỆT**.
3. Tuyệt đối không tự ý sửa file `RoleReveal.jsx` hay đánh dấu `[x] T062` khi chưa hoàn thành Bước B1, B2 và B3!
