# ⚓ FEED THE KRAKEN — SESSION HANDOFF CONTEXT & ROADMAP

> **Tài liệu lưu trữ ngữ cảnh chuyển giao phiên làm việc (Session Handoff Context)**  
> **Dự án:** Feed The Kraken (Real-time Multiplayer Hidden Role Game)  
> **Ngày cập nhật:** 2026-09-20  
> **Nhánh hiện tại:** `ui-revamp-rebase`  
> **Trạng thái:** **Task T063 ĐÃ HOÀN THÀNH VÀ PUSH GITHUB (Commit `245ac30`)** ✅. Sẵn sàng triển khai **Task T064 (Crew Appointment Phase)**.

---

## 1. 📋 TỔNG HỢP CÔNG VIỆC ĐÃ HOÀN THÀNH TRONG PHIÊN NÀY

### A. Hoàn Thành Toàn Diện Task T063: Captain's Tabletop Environment & Under-Drawer
1. **Bộ 6 Asset Nguyên Tử Chuẩn Thẩm Mỹ "Eldritch Parchment" (Góc nhìn vuông góc 90° Flat Lay):**
   - `frontend/src/assets/ui/backgrounds/cabin_room_bg.jpg`: Không gian khoang buồng thuyền trưởng chiều sâu điện ảnh nhìn ra biển đêm mù sương, vòm gỗ sồi, 2 đèn bão treo tường, rương kho báu ngập vàng, thùng rượu rum và cuộn dây thừng.
   - `frontend/src/assets/ui/backgrounds/tabletop_captain_desk.png`: Bàn gỗ làm việc Thuyền trưởng góc nhìn 90° phẳng, súng lục flintlock, dao găm, cốc bia gỗ, đĩa tiền vàng, nẹp kim loại đinh tán và khung đồng chạm hoa văn bao quanh Central Stage trung tâm.
   - `frontend/src/assets/ui/sprites/scroll_action_desk_trigger.png`: Cuộn giấy da hải trình niêm phong sáp đỏ tinh xảo gắn bên cánh phải bàn để kích hoạt mở/đóng Action Desk.
   - `frontend/src/assets/ui/frames/drawer_empty_shell.png`: Hộc ngăn kéo 2 khoang bằng gỗ sồi dày dặn, liền khối tay nắm mỏ neo đồng cổ, trượt mượt mà dưới gầm bàn.
   - `frontend/src/assets/ui/frames/drawer_radar_base.png`: Mâm đĩa la bàn hoa tiêu đồng cổ 16 cánh và các vạch khắc độ hàng hải cho Chamber 1 (Seating Radar).
   - `frontend/src/assets/ui/frames/card_crew_dossier.png`: Thẻ bài da dê nẹp đồng nứt nẻ cho Chamber 2 (Crew Dossier Cards).

2. **Kiến Trúc Phân Tầng Bàn Chỉ Huy & Central Stage (`Game.jsx`):**
   - **Central Stage tại chỗ (In-Place Alternate Hub):** Khung đồng chạm hoa văn trung tâm bàn luân chuyển mượt mà giữa Hải đồ toàn cảnh (`MapBoardUI.jsx`) và Bàn thao tác (`NavigationPhase.jsx` / `MutinyBoard.jsx`), loại bỏ hoàn toàn modal che kín màn hình kiểu cũ.
   - **Action Desk Trigger Scroll:** Tinh chỉnh cuộn giấy da bên cánh phải bàn: loại bỏ hiệu ứng nhấp nháy liên tục, bỏ chấm vàng ping, bỏ icon mũ thuyền trưởng thừa và bỏ chữ "ACT", luôn hiển thị rõ nét và trang nhã.
   - **Tỉ lệ kích thước:** Bàn tabletop thu nhỏ vừa vặn còn ~70% viewport (`w-[72%] max-w-[1160px]`), hộc ngăn kéo bằng ~75% chiều rộng bàn (`w-[55%] max-w-[880px]`), thẻ hồ sơ dossier thu nhỏ còn ~80% (`max-w-[340px]`).
   - **Dời bàn xuống thấp làm lộ cảnh nền:** Sử dụng padding đỉnh thích ứng responsive theo tỷ lệ màn hình (`pt-28 sm:pt-36 md:pt-[16vw] lg:pt-[19vw] xl:pt-[21vw]`), giúp giải phóng toàn bộ vòm kính caro, cảnh biển đêm và 2 đèn bão treo tường trong `cabin_room_bg.jpg` phía trên mặt bàn.

3. **Căn Chỉnh Đồng Tâm Tuyệt Đối Vòng Tròn Avatar Người Chơi (`CrewSeatingDrawer.jsx`):**
   - **Nguyên nhân lỗi cũ:** Trước đây cụm ghế người chơi dùng `flex flex-col` với `-translate-y-1/2` áp dụng lên toàn bộ cột (gồm avatar, mũ captain, nhãn NEXT, tên, súng), khiến avatar người chơi không có mũ bị tên phía dưới kéo lệch tâm lên trên ~14px; thông số tâm cũ `centerX = 49.0`, `centerY = 48.0` và bán kính `33.0%` bị kéo lệch lên góc trên và đè lên viền đồng.
   - **Giải pháp tách rời hình học (Decoupling):** Đặt khung tròn avatar porthole làm mỏ neo hình học duy nhất tại `(x, y)` với `-translate-x-1/2 -translate-y-1/2`. Mũ Thuyền trưởng và nhãn NEXT đặt `absolute` mép trên, tên và súng đặt `absolute` mép dưới.
   - **Tọa độ chuẩn:** Căn tâm chuẩn xác `centerX = 50.0`, `centerY = 50.0` và bán kính tối ưu `radiusPercent = 30.0%`, đảm bảo vòng tròn avatar đồng tâm 100% với mặt số la bàn và cách đều viền đồng ở mọi góc quay cho 5-11 người chơi.

4. **Triệt Tiêu Toàn Cục Thanh Cuộn Dọc (Scrollbar Suppression - `index.css`):**
   - Triệt tiêu hoàn toàn các thanh trượt màu nâu thô ráp trên toàn bộ các trình duyệt (Chrome, Safari, Firefox, Edge) qua các thuộc tính CSS toàn cục:
     ```css
     html, body, #root, * {
       scrollbar-width: none !important;
       -ms-overflow-style: none !important;
     }
     *::-webkit-scrollbar, ::-webkit-scrollbar, ... {
       display: none !important;
       width: 0 !important;
       height: 0 !important;
       background: transparent !important;
       opacity: 0 !important;
     }
     ```
   - Loại bỏ hoàn toàn các class thừa `.custom-scrollbar` trong [Game.jsx](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/frontend/src/pages/Game.jsx) và [CrewSeatingDrawer.jsx](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/frontend/src/components/game/CrewSeatingDrawer.jsx).
   - Bảo toàn 100% trải nghiệm cuộn tự nhiên và mượt mà bằng con lăn chuột, bàn rê cảm ứng và vuốt màn hình.

5. **Quy Chuẩn Ngôn Ngữ, Thẩm Mỹ & Git:**
   - 100% giao diện hiển thị tiếng Anh chuẩn hàng hải (`en-US`), đồng bộ font `Pirata One`.
   - Tuyệt đối không dùng Unicode emoji (sử dụng 100% sprite đồ họa của dự án).
   - Đã kiểm tra biên dịch `npm run build` thành công: 0 errors, 0 warnings.
   - Đã commit và push an toàn lên nhánh `ui-revamp-rebase` trên GitHub (Commit: `245ac30`).

---

## 2. 🗂️ CÁC ASSET & TÀI LIỆU CỐT LÕI HIỆN TẠI

### Asset Đồ Họa Đã Sẵn Sàng:
- `frontend/src/assets/ui/backgrounds/cabin_room_bg.jpg`: Cảnh nền khoang buồng thuyền trưởng (1792x2400).
- `frontend/src/assets/ui/backgrounds/tabletop_captain_desk.png`: Bàn Thuyền trưởng Flat Lay 90° (1920x1069).
- `frontend/src/assets/ui/sprites/scroll_action_desk_trigger.png`: Cuộn giấy da kích hoạt Action Desk (284x850).
- `frontend/src/assets/ui/frames/drawer_empty_shell.png`: Hộc ngăn kéo rỗng 2 khoang (1800x1024).
- `frontend/src/assets/ui/frames/drawer_radar_base.png`: Mâm đĩa la bàn hoa tiêu (1024x1024).
- `frontend/src/assets/ui/frames/card_crew_dossier.png`: Thẻ hồ sơ thủy thủ da dê nẹp đồng (1200x900).
- `frontend/src/assets/ui/sprites/badge_captain_hat.png`: Mũ Thuyền trưởng da thuộc cướp biển.
- `frontend/src/assets/ui/sprites/badge_lieutenant_medal.png`: Huy hiệu Phó thuyền trưởng.
- `frontend/src/assets/ui/sprites/badge_navigator_compass.png`: Huy hiệu Hoa tiêu la bàn.
- `frontend/src/assets/ui/sprites/gem_emerald_online.png` / `gem_ruby_offline.png`: Ngọc trạng thái mạng.
- `frontend/src/assets/ui/sprites/icon_flintlock_pistol.png`: Biểu tượng súng ngắn flintlock.
- `frontend/src/assets/ui/sprites/flog_not_sailor.png` / `flog_not_pirate.png` / `flog_not_cultist.png`: Vết chém quất roi máu tra khảo.

### Tài Liệu & Hệ Thống Rules Đã Cập Nhật:
- `task.md`: Đã đánh dấu hoàn thành `[x] T063`.
- `.agents/rules/root-rule.md`: Đã bổ sung Quy tắc 8 (Track B SOP 3 điểm dừng) và Quy tắc 9 (Quy trình tuần tự atomic asset loop).
- `.agents/rules/rule-ui-sop-t063-tabletop.md`: Quy trình chế tác tuần tự chuyên biệt từng asset nguyên tử.
- `spec/features/007-frontend-ui-revamp/ingame-command-layout-spec.md` (v1.4): Đặc tả chi tiết bố cục Bàn làm việc Thuyền trưởng, Central Stage xen kẽ tại chỗ và Hộc ngăn kéo gầm bàn.

---

## 3. 🎯 LỘ TRÌNH TIẾP THEO (NEXT TASKS ROADMAP)

Dự án tiếp tục bám sát lộ trình Phase 9.3 (Frontend UI Revamp) và Phase 10 (Backend Testing & Fixes):

### Danh Sách Nhiệm Vụ Giao Diện Phase 9.3 (Track 1 - UI Revamp)

| Task ID | Component / Màn hình | Trạng thái & Mô tả công việc |
| :--- | :--- | :--- |
| **T062** | `RoleReveal.jsx` | *(Đã hoàn thành ✅)* Thẻ Tarot cổ 3D Flip 180°, mặt sau da thuộc nứt + xúc tu la bàn đồng cổ, mặt trước giấy da dê + biểu tượng phe mực phai, Night overlay mắt Kraken tím eldritch-pulse. |
| **T063** | `Game.jsx`, `CrewSeatingDrawer.jsx` | *(Đã hoàn thành ✅ - Commit `245ac30`)* Không gian nền khoang buồng thuyền (`cabin_room_bg.jpg`), Bàn Thuyền trưởng Flat Lay 90° (`tabletop_captain_desk.png`), Central Stage xen kẽ tại chỗ MapBoard/Action Desk, Hộc ngăn kéo gầm bàn (`drawer_empty_shell.png`), Seating Radar đồng tâm 100%, triệt tiêu thanh cuộn dọc. |
| **T064** | `CrewAppointment` (`MutinyBoard.jsx`) | **(NHIỆM VỤ TIẾP THEO 🎯)** Giao diện Thuyền trưởng chỉ định Phó thuyền trưởng (Lieutenant) và Hoa tiêu (Navigator) phong cách Eldritch Parchment: thẻ thủy thủ trực quan (avatar, số lượng súng, trạng thái Off-duty), huy hiệu bổ nhiệm đồng cổ & la bàn, nút xác nhận đội ngũ điều hướng. |
| **T065** | `MutinyBoard.jsx` | *(Chờ thực hiện)* Bàn gỗ cược súng nổi loạn, đồng tiền vàng / flintlock SVG, rương gỗ bản lề gỉ, screen shake `gunShake` khi công bố, xếp hạng súng + trao Mũ Thuyền trưởng. |
| **T066** | `NavigationPhase.jsx` | *(Chờ thực hiện)* Bàn điều hướng hải trình, 3 thẻ bài da dê cổ mực phai (Blue Sailor, Red Pirate, Yellow Cult), hiệu ứng chọn viền vàng + firelight glow, loại thẻ trượt mờ. |
| **T067** | `MapBoardUI.jsx` | *(Chờ thực hiện)* Hoàn thiện toàn diện Hải đồ cổ da dê (gradient parchment-dim, vệt ố, mép rêu moss-dim), đường mực lông vũ SVG nét run, ô sự kiện SVG + popover, tàu buồm gỗ tối `shipBob`. |
| **T068** | `EndGame.jsx` | *(Chờ thực hiện)* Màn hình chiến thắng theo từng phe (Sailor = bình minh ấm, Pirate = lửa đỏ Jolly Roger, Cult = xúc tu tím bùng nổ), lật mở đồng loạt vai trò trên bàn gỗ mục, nút quay lại/rời phòng `ButtonWood`. |
| **T069** | **Polish & Verification** | *(Chờ thực hiện)* Kiểm tra responsive 375px-1920px+, 60 FPS performance, `prefers-reduced-motion`, WCAG AA contrast, chạy `npm run build` xác nhận không lỗi. |

---

## 4. 📌 CÁC NGUYÊN TẮC & LƯU Ý QUAN TRỌNG KHI BẮT ĐẦU TASK T064

Khi bắt tay vào thực hiện **Task T064** (Crew Appointment Phase), AI **BẮT BUỘC PHẢI TUÂN THỦ CÁC QUY TẮC SAU**:

1. **Tuân thủ SOP Track B & 3 Điểm Dừng Phê Duyệt:**
   - **Sau Bước B1 (Cổng chặn 1 🎯):** Phân tích phân tầng Z-Index & Ma trận Asset ➔ **DỪNG LẠI CHỜ USER DUYỆT KẾ HOẠCH**.
   - **Sau Bước B2 (Cổng chặn 2 🎯):** Sinh Mockup trực quan phối cảnh ➔ **DỪNG LẠI CHỜ USER DUYỆT THIẾT KẾ**.
   - **Sau Bước B3 (Kiểm duyệt Asset 🎯):** Khởi tạo độc lập từng asset nguyên tử (Clean Canvas sạch bóng prop, Standalone Props/Sprites trên nền trung tính) & tách nền PNG trong suốt 100% Alpha. **DỪNG LẠI XUẤT TRÌNH BỘ ASSET CHO USER ĐÁNH GIÁ**. Tuyệt đối không tự ý viết code JSX (Bước B5) khi chưa hoàn tất kiểm duyệt asset.

2. **Quy Chuẩn Góc Nhìn Vuông Góc 90° (Flat Lay Orthographic):**
   - Mọi asset tạo mới cho Task T064 bắt buộc phải có góc nhìn 90° từ trên xuống, không dùng góc nghiêng phối cảnh 3D để tránh làm méo hình học khi render trên Central Stage của bàn Thuyền trưởng.

3. **Tích Hợp Vào Central Stage Hiện Có:**
   - Component bổ nhiệm nhân sự `CrewAppointment` phải được render bên trong **Central Stage** (vùng khung đồng chạm hoa văn của bàn Thuyền trưởng đã hoàn thiện ở T063), không được tạo thêm cửa sổ modal hay lớp phủ ngoài bàn làm phá vỡ kiến trúc bàn làm việc.

4. **100% Tiếng Anh Hàng Hải (`en-US`):**
   - Mọi nhãn nút, danh hiệu (`CAPTAIN`, `LIEUTENANT`, `NAVIGATOR`, `OFF-DUTY`, `CONFIRM APPOINTMENT`...), thông báo trạng thái đều phải dùng 100% tiếng Anh, font `Pirata One`, không sót chuỗi tiếng Việt.

5. **Bảo Toàn Logic & Khả Năng Khôi Phục Kết Nối (State Invariants & Resilience):**
   - Bảo toàn 100% luật game: Thuyền trưởng chỉ được chọn 1 Lieutenant và 1 Navigator; không được chọn người chơi đang ở trạng thái `OFF_DUTY` hoặc `ELIMINATED`; có thể thay đổi lựa chọn trước khi bấm xác nhận.
   - Xử lý tốt các sự kiện WebSocket reconnect / F5 reload trang.
