# Tasks: Feed The Kraken System Implementation

**Input**: Design documents từ `spec/features/001` đến `005` và `implementation_plan.md`

**Prerequisites**: `implementation_plan.md`, `spec/features/*/spec.md`

**Organization**: Tasks được chia theo từng Phase, từ cài đặt nền tảng cho tới từng Business Requirement (BR). 

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể chạy song song (khác file, không có phụ thuộc)
- **[Story]**: Liên kết với BR/Use Case cụ thể.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Node.js backend trong thư mục `backend/` với các thư viện: express, socket.io, redis, pg (hoặc sqlite3).
- [x] T002 Initialize React (Vite) frontend trong thư mục `frontend/` với các thư viện: socket.io-client, tailwindcss.
- [x] T003 [P] Cấu hình Prettier & ESLint cho cả frontend và backend.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY game logic can be implemented.

- [x] T004 Setup kết nối Redis (`backend/src/config/redis.js`) để phục vụ lưu snapshot `room_state`.
- [x] T005 Setup kết nối Database vật lý (`backend/src/config/db.js`) cho GameResult và Cấu hình Map.
- [x] T006 Implement `SocketGateway` (`backend/src/socket/index.js`) để xử lý xác thực `sessionToken`, Connection, và Disconnection.
- [x] T007 Implement `RoomManager` (`backend/src/services/RoomManager.js`) để hỗ trợ Create Room, Join Room, Reconnect, và Broadcast cơ bản.
- [x] T008 Thiết lập giao diện Router React cơ bản (`frontend/src/App.jsx`), cấu trúc context cho Socket (`frontend/src/contexts/SocketContext.jsx`).

**Checkpoint**: Nền tảng Socket hoàn chỉnh, có thể kết nối từ Client lên Server và nhận Broadcast.

---

## Phase 3: BR-001 - Lập Phòng & Chia Vai (Priority: P1) 🎯 MVP 1

**Goal**: Host có thể tạo phòng, player join phòng, Host start game và hệ thống tự động chia vai trò ẩn cho người chơi.

### Implementation
- [x] T009 [P] [BR-001] Tạo entity `Room` và `Player` trong `backend/src/models/`.
- [x] T010 [P] [BR-001] Xây dựng màn hình Lobby (`frontend/src/pages/Lobby.jsx`) bao gồm chọn Avatar và Map. (Lưu ý: Nút Start Game phải bị disabled khi < 5 người chơi).
- [x] T011 [BR-001] Bổ sung logic Kick Player và tự rời phòng vào `RoomManager.js`.
- [x] T012 [BR-001] Implement `RoleDistributionService` (`backend/src/services/RoleDistribution.js`) xử lý logic chia phe, chọn Cult Leader dựa trên số lượng người chơi.
- [x] T013 [BR-001] Cập nhật hàm `emitPrivate` để gửi thông tin vai trò cho từng client mà không bị rò rỉ.
- [x] T014 [BR-001] Xây dựng UI thông báo vai trò bí mật và Màn hình nhắm mắt cho Pirate (`frontend/src/components/RoleReveal.jsx`). (Lưu ý: Phải có đồng hồ đếm ngược 20s và tự động chuyển giao diện khi hết giờ, không cần Host bấm Tiếp tục).

**Checkpoint**: Sau Phase này, một nhóm bạn có thể vào phòng, bấm Start và ai cũng biết phe của mình.

---

## Phase 3.5: BR-006 - Automated Testing Sandbox & Headless Bots (Priority: P1.5) 🤖

**Goal**: Xây dựng công cụ giả lập người chơi ảo (Headless Bots) trên Node.js để lấp đầy phòng 5-11 người và tự động hóa thao tác qua các phase game mà không cần mở nhiều trình duyệt.

### Implementation
- [x] T039 [P] [US1] [BR-006] Tạo `BotClient.js` trong `scripts/bots/BotClient.js` quản lý 1 kết nối WebSocket qua `socket.io-client`, sinh `sessionToken` độc lập in-memory và emit `join_room`.
- [x] T040 [US1] [BR-006] Tạo `BotManager.js` trong `scripts/bots/BotManager.js` để điều phối vòng đời spawn $N$ bots, lưu trữ danh sách bots trong Map, và xử lý graceful shutdown (`SIGINT`).
- [x] T041 [US1] [BR-006] Tạo CLI entrypoint `scripts/bots/spawn.js` nhận tham số `--room <ROOM_ID>` và `--count <N>` từ dòng lệnh.
- [x] T042 [P] [US2] [BR-006] Tạo `AutoResponder.js` trong `scripts/bots/AutoResponder.js` chứa dictionary các handlers cho các sự kiện Server yêu cầu hành động (`REQUIRE_VOTE`, `REQUIRE_TEAM_APPOINTMENT`, `REQUIRE_CARD_DISCARD`...) kèm random delay 500-1500ms.
- [x] T043 [US2] [BR-006] Tích hợp `AutoResponder` vào `BotClient.js` để tự động xử lý và gửi phản hồi hợp lệ về Server khi game chuyển phase.
- [x] T044 [P] [US3] [BR-006] Tạo `CLIController.js` trong `scripts/bots/CLIController.js` sử dụng Node.js `readline` để nhận lệnh từ `stdin`, parse các lệnh `status`, `bot <id> vote <guns>`, `bot <id> appoint ...`, `auto on/off`.
- [x] T045 [US3] [BR-006] Tích hợp `CLIController` vào `spawn.js` để mở prompt tương tác `ftk-sandbox > ` ngay sau khi đàn bot join phòng thành công.
- [x] T046 [BR-006] Thêm shortcut script `"bot:spawn": "node scripts/bots/spawn.js"` vào `package.json` và kiểm thử toàn bộ luồng tạo phòng, spawn 4 bots, start game và điều khiển qua CLI.

**Checkpoint**: Có thể dùng 1 dòng lệnh terminal để lấp đầy phòng chơi, tự động chạy qua các phase hoặc điều khiển từng bot theo ý muốn.

---

## Phase 4: BR-002 - Bầu Thuyền Trưởng & Nổi Loạn (Priority: P2)

**Goal**: Vòng lặp bổ nhiệm đội bay và bỏ phiếu Mutiny (cùng các hiệu ứng đặc biệt như cắt lưỡi).

### Implementation
- [x] T015 [P] [BR-002] Tạo entity `MutinySession` trong `backend/src/models/`.
- [x] T016 [BR-002] Implement `MutinyService` (`backend/src/services/MutinyService.js`) xử lý luồng: Appoint Team -> Vote -> Resolution.
- [x] T017 [BR-002] Thêm Timer Logic (không tự động nhảy state) với nút xác nhận của Captain.
- [x] T018 [BR-002] Bổ sung logic "Cắt lưỡi" (Người bị cắt lưỡi mất quyền làm Captain vĩnh viễn) vào `MutinyService` và `RoomState`.
- [x] T019 [BR-002] Xây dựng UI Bỏ phiếu Nổi loạn và UI Thể hiện kết quả súng (`frontend/src/components/MutinyBoard.jsx`).

**Checkpoint**: Hệ thống hỗ trợ chơi đến đoạn cãi nhau và Vote thành công, có người cầm súng nổi loạn.

---

## Phase 5: BR-003 - Khám Phá & Lái Tàu (Priority: P3)

**Goal**: Rút thẻ điều hướng, Captain chọn 2 đưa cho Lieutenant, Lieutenant chọn 1 để đi.

### Implementation
- [x] T020 [P] [BR-003] Tạo entity `NavigationDeck` trong `backend/src/models/`.
- [x] T021 [BR-003] Implement `NavigationService` (`backend/src/services/NavigationService.js`) xử lý rút bài, xáo bài khi hết.
- [x] T022 [BR-003] Xử lý luồng Captain-Lieutenant Draw. Dùng `emitPrivate` để gửi đúng lá bài cho đúng người.
- [x] T023 [BR-003] Bổ sung Action: Cult Leader có thể nhảy tàu.
- [x] T024 [BR-003] Xây dựng UI Draw Cards cho Captain và Lieutenant (`frontend/src/components/NavigationPhase.jsx`).

**Checkpoint**: Tàu đã bắt đầu di chuyển dựa trên kết quả các thẻ mà Navigator chọn (Phase 5 HOÀN THÀNH).

---

## Phase 6: BR-004 - Bản Đồ & Sự Kiện Hành Quyết (Priority: P4)

**Goal**: Tàu cập bến ô sự kiện, kích hoạt hành động ô bản đồ (Map Actions), hiệu ứng thẻ bài (Card Effects) và Nghi thức Tà giáo (Cult Uprising).

### Implementation
- [x] T025 [P] [BR-004] Tạo entity `MapBoard` trong `backend/src/models/`.
- [x] T026 [BR-004] [UC-012] Tích hợp file JSON cấu hình map (Quick/Long) vào `ExecutionService.js` (`backend/src/services/ExecutionService.js`) và xử lý logic điều hướng di chuyển tàu.
- [x] T027 [BR-004] [UC-013] Xử lý sự kiện Hành Động Ô Bản Đồ (Map Actions): Tra khảo (Search cabin), Chặt tay (Flogging), Cắt lưỡi (Off with the tongue), Cho Kraken ăn (Feed the Kraken), Tuyến tiếp tế súng (Supply line).
- [x] T028 [BR-004] [UC-014] Xử lý Hiệu Ứng Thẻ Bài (Card Effects): Say rượu (Drunk), Tiếp vũ khí (Armed), Tước khí (Disarmed), Tiếng hát tiên cá (Mermaid - Captain chỉ định 1 người bí mật xem 3 lá discard ngẫu nhiên), Kính viễn vọng (Telescope - Captain chỉ định 1 người bí mật xem đỉnh draw pile và chọn giữ/vứt).
- [x] T029 [BR-004] [UC-015] Xử lý Cult Uprising (Nghi thức Tà giáo): Captain lật mở bài Ritual, hệ thống ép nhắm mắt, Cult Leader nhặt giáo đồ, `emitPrivate` báo cho giáo đồ mới.
- [x] T030 [BR-004] Xây dựng UI Bản đồ và Hiệu ứng (`frontend/src/components/MapBoardUI.jsx`).

**Checkpoint**: Gameplay gần như trọn vẹn, bao gồm kỹ năng, hiệu ứng ô/thẻ và thu thập giáo đồ. Phase 6 hoàn tất!

---

## Phase 7: BR-005 - Kết Thúc & Nghỉ Phép (Priority: P5)

**Goal**: Luân chuyển thẻ Off-duty và check điều kiện thắng để End game.

### Implementation
- [x] T031 [P] [BR-005] Tạo entity `GameResult` trong `backend/src/models/`.
- [x] T032 [BR-005] Xử lý luồng hoán đổi Off-duty shift sau mỗi lần tàu di chuyển (`backend/src/services/OffDutyService.js`).
- [x] T033 [BR-005] Bổ sung ngầm `VictoryCheck` sau mỗi Mutiny hoặc Ship Movement: Check cán đích Sailor/Pirate/Cult, check Cult Leader chết/nhảy tàu.
- [x] T034 [BR-005] Xử lý luồng End Game: Broadcast Event `GAME_OVER`, freeze trạng thái, lưu vào Database vật lý.
- [x] T035 [BR-005] Xây dựng UI End Game, vinh danh và lật mở toàn bộ vai trò thật sự (`frontend/src/pages/EndGame.jsx`).

**Checkpoint**: Hệ thống Game hoàn thiện 100% Core Logic. Có thể chơi trọn vẹn từ đầu đến khi có phe thắng.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Hoàn thiện snapshot, testing và deploy.

- [x] T036 Snapshot Integration: Lắp ráp cơ chế Snapshot Room State xuống Redis sau mỗi Action để fault-tolerance.
- [x] T037 Thử nghiệm kịch bản ngắt kết nối mạng (Socket Disconnect) và reconnect để đảm bảo khôi phục UI tốt.
- [x] T038 Đánh bóng UI: Thêm Animation khi lật bài, khi súng nổ, âm thanh.
- [ ] T047 Triển khai ứng dụng (Deploy frontend & backend).

---

## Phase 9: BR-007 - Frontend UI Revamp "Eldritch Parchment" (Priority: P6) 🎨

**Goal**: Triển khai toàn diện art style **"Eldritch Parchment"** (Don't Starve Together × Lovecraftian Sea Horror × Gothic Sketchbook) lên frontend. Bảng màu nâu ấm + xanh lá rêu verdigris, font gothic 3 tầng, texture gỗ mục/da dê cổ, vignette tối viền, ánh sáng firelight. **Chỉ thay đổi tầng Presentation — KHÔNG đụng Game Logic/WebSocket/Backend.**

**Spec**: `spec/features/007-frontend-ui-revamp/spec.md` | **Art Guide**: `spec/features/007-frontend-ui-revamp/art-direction-guide.md`

### Phase 9.1: Design System Foundation & Shared Components (UC-021 / FR-001, FR-002, FR-012, FR-013)

**Purpose**: Thiết lập nền tảng Design Tokens + Tailwind Theme + Google Fonts + Shared UI Components — Mọi task sau phụ thuộc vào phase này.

- [x] T048 [P] [BR-007] Mở rộng `tailwind.config.js`: thêm toàn bộ bảng màu "Eldritch Parchment" (abyss, hull, parchment, verdigris, moss, seaweed, sailor, pirate, cult, gold, firelight, ember, blood, brine, bone), fontFamily 3 tầng (`Pirata One`, `Cinzel`, `Outfit`), override borderRadius (4px/2px/6px).
- [x] T049 [P] [BR-007] Cập nhật `index.html`: thêm Google Fonts preconnect + stylesheet link cho `Pirata One`, `Cinzel`, `Outfit`, meta SEO cơ bản.
- [x] T050 [BR-007] Overhaul `index.css`: CSS custom properties (`:root`) cho toàn bộ Design Tokens, body font `Outfit`/bg `#0A0A08`, cập nhật keyframes (`gunShake`, `eldritchPulse` màu mới, `shipBob`, thêm `candleFlicker`/`dustDrift`), thêm utility classes (`.panel-wood`, `.card-parchment`, `.firelight-glow`, `.eldritch-glow`, `.verdigris-glow`, `.aged-stain`, `.vignette-overlay`).
- [x] T051 [BR-007] Xóa toàn bộ `App.css` cũ (Vite boilerplate), thay bằng global styles "Eldritch Parchment".
- [x] T052 [P] [BR-007] Tạo `frontend/src/components/ui/PanelWood.jsx`: Panel gỗ mục phong hóa (nền hull-dark, texture pseudo-element, viền hull-light, bóng đổ sâu, vệt ố verdigris mờ, đinh sắt gỉ decorative).
- [x] T053 [P] [BR-007] Tạo `frontend/src/components/ui/CardParchment.jsx`: Card da dê cổ (gradient nâu, viền vàng gỉ, inner border, texture sần sùi, vết ố thời gian).
- [x] T054 [P] [BR-007] Tạo `frontend/src/components/ui/ButtonWood.jsx`: Nút gỗ embossed (hover firelight glow, active press-down, disabled mờ, font Outfit).
- [x] T055 [P] [BR-007] Tạo `frontend/src/components/ui/InputPlank.jsx`: Input thanh gỗ khắc chìm (nền hull, viền hull-light, focus viền verdigris glow, placeholder parchment-dim).
- [x] T056 [P] [BR-007] Tạo `frontend/src/components/ui/Vignette.jsx`: Lớp phủ vignette tối viền toàn cục (radial-gradient, pointer-events none, z-50).
- [x] T057 [P] [BR-007] Tạo `frontend/src/components/ui/DustParticles.jsx`: Hạt bụi/tro bay nhẹ qua ánh nến (CSS animation thuần, 5-8 particles, `prefers-reduced-motion` tắt).

**Checkpoint**: Tailwind theme + CSS Design System + 6 shared UI components sẵn sàng. Mở dev server thấy nền đen kịt, font gothic, KHÔNG còn style Vite cũ.

### Phase 9.2: Pages Revamp — Home, Lobby & Game HUD (UC-021, UC-023 / FR-003, FR-009, US2, US6)

**Purpose**: Áp dụng "Eldritch Parchment" lên 3 trang chính: Home (First impression), Lobby (Chờ đợi), Game HUD (Trong trận).

- [x] T058 [BR-007] Revamp `Home.jsx`: Nền abyss + Vignette + DustParticles, panel trung tâm PanelWood chứa CardParchment (form Nickname/RoomCode bằng InputPlank), title "Feed the Kraken" Pirata One vàng đồng + tentacle ẩn hiện, buttons ButtonWood. **Loại bỏ hoàn toàn**: glassmorphism, gradient blue-indigo, rounded-3xl, system-ui font.
- [x] T059 [BR-007] Revamp `Lobby.jsx`: Nền sàn gỗ phong hóa + vignette, crew list = grid PanelWood nhỏ (thẻ gỗ mục đinh gỉ, avatar, crown vàng gỉ, chấm verdigris online), settings = CardParchment sổ da thuộc (Room code Cinzel, cuộn giấy hải đồ Quick/Long, avatar grid), START VOYAGE = ButtonWood lớn kiểu bánh lái.
- [x] T061 [BR-007] Revamp `Game.jsx`: Bọc Vignette + DustParticles, Main Stage nền abyss, Dual-Pane Command Layout (Hải đồ 60% bên trái + Bàn thao tác 40% bên phải), EventModalOverlay, CrewSeatingDrawer (Bàn tròn vị trí ngồi Seating Radar + Lưới thủy thủ).

**Checkpoint**: Home → Lobby → Game HUD đều mang phong cách "Eldritch Parchment" nhất quán. Responsive 375px → 1920px+.

### Phase 9.3: Game Components Revamp — Cards, Mutiny, Navigation, Map & EndGame (UC-022, UC-023 / FR-004—FR-008, FR-010, FR-011, US3, US4, US5)

**Purpose**: Nâng cấp toàn bộ component game: thẻ bài, bỏ phiếu, lái tàu, bản đồ, kết thúc.

- [ ] T062 [BR-007] Revamp `RoleReveal.jsx`: Thẻ tarot cổ (mặt sau da dê tối + xúc tu Kraken vàng + viền vàng gỉ; mặt trước biểu tượng phe + tên Cinzel + điều kiện thắng trên card-parchment), 3D flip 600ms + ánh lửa hắt. Night overlay: đen kịt + mắt Kraken tím eldritch-pulse + đếm ngược ember vòng tròn.
- [ ] T063 [BR-007] Revamp `MutinyBoard.jsx`: Bàn gỗ mục texture, đồng tiền vàng cổ / flintlock SVG, rương gỗ bản lề gỉ cho khay cược, screen shake gunShake khi công bố, xếp hạng súng + vương miện vàng đồng gỉ trao tay.
- [ ] T064 [BR-007] Revamp `NavigationPhase.jsx`: Bàn gỗ mục, 3 thẻ bài da dê cổ mực phai (Blue sailor, Red pirate, Yellow cult kiểu bột màu), chọn = viền vàng + firelight glow, loại = mờ + trượt. Giữ nguyên logic Captain/Lieutenant/Navigator.
- [ ] T065 [BR-007] Revamp `MapBoardUI.jsx`: Nền hải đồ da dê cổ (gradient parchment-dim, vệt ố, mép rêu moss-dim), đường mực lông vũ SVG nét run, ô sự kiện biểu tượng SVG + popover (nền hull, viền gold-dim), tàu buồm gỗ tối shipBob, 3 vùng đích màu đặc trưng (Sailor Cove verdigris, Crimson Cove pirate, Kraken Sanctuary cult).
- [ ] T066 [BR-007] Revamp `EndGame.jsx`: Banner phe thắng hoành tráng (Sailor = bình minh ấm, Pirate = lửa đỏ Jolly Roger, Cult = xúc tu tím bùng nổ), lật mở đồng loạt vai trò trên bàn gỗ mục (card flip), nút quay lại/rời phòng ButtonWood.
- [ ] T067 [BR-007] Verification & Polish: Kiểm tra nhất quán Design System trên mọi màn hình, responsive 375px-1920px+ zero overflow, 60 FPS performance, `prefers-reduced-motion`, WCAG AA contrast. Chạy `npm run build` xác nhận không lỗi.

**Checkpoint**: Toàn bộ Frontend mang phong cách "Eldritch Parchment" nhất quán. Game có thể chơi trọn vẹn với giao diện mới từ Home → EndGame.
