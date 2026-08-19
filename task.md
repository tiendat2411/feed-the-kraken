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
- [ ] T008 Thiết lập giao diện Router React cơ bản (`frontend/src/App.jsx`), cấu trúc context cho Socket (`frontend/src/contexts/SocketContext.jsx`).

**Checkpoint**: Nền tảng Socket hoàn chỉnh, có thể kết nối từ Client lên Server và nhận Broadcast.

---

## Phase 3: BR-001 - Lập Phòng & Chia Vai (Priority: P1) 🎯 MVP 1

**Goal**: Host có thể tạo phòng, player join phòng, Host start game và hệ thống tự động chia vai trò ẩn cho người chơi.

### Implementation
- [ ] T009 [P] [BR-001] Tạo entity `Room` và `Player` trong `backend/src/models/`.
- [ ] T010 [P] [BR-001] Xây dựng màn hình Lobby (`frontend/src/pages/Lobby.jsx`) bao gồm chọn Avatar và Map (Quick/Long journey).
- [ ] T011 [BR-001] Bổ sung logic Kick Player và tự rời phòng vào `RoomManager.js`.
- [ ] T012 [BR-001] Implement `RoleDistributionService` (`backend/src/services/RoleDistribution.js`) xử lý logic chia phe, chọn Cult Leader dựa trên số lượng người chơi.
- [ ] T013 [BR-001] Cập nhật hàm `emitPrivate` để gửi thông tin vai trò cho từng client mà không bị rò rỉ.
- [ ] T014 [BR-001] Xây dựng UI thông báo vai trò bí mật và Màn hình nhắm mắt cho Pirate (`frontend/src/components/RoleReveal.jsx`).

**Checkpoint**: Sau Phase này, một nhóm bạn có thể vào phòng, bấm Start và ai cũng biết phe của mình.

---

## Phase 4: BR-002 - Bầu Thuyền Trưởng & Nổi Loạn (Priority: P2)

**Goal**: Vòng lặp bổ nhiệm đội bay và bỏ phiếu Mutiny (cùng các hiệu ứng đặc biệt như cắt lưỡi).

### Implementation
- [ ] T015 [P] [BR-002] Tạo entity `MutinySession` trong `backend/src/models/`.
- [ ] T016 [BR-002] Implement `MutinyService` (`backend/src/services/MutinyService.js`) xử lý luồng: Appoint Team -> Vote -> Resolution.
- [ ] T017 [BR-002] Thêm Timer Logic (không tự động nhảy state) với nút xác nhận của Captain.
- [ ] T018 [BR-002] Bổ sung logic "Cắt lưỡi" (Người bị cắt lưỡi mất quyền làm Captain vĩnh viễn) vào `MutinyService` và `RoomState`.
- [ ] T019 [BR-002] Xây dựng UI Bỏ phiếu Nổi loạn và UI Thể hiện kết quả súng (`frontend/src/components/MutinyBoard.jsx`).

**Checkpoint**: Hệ thống hỗ trợ chơi đến đoạn cãi nhau và Vote thành công, có người cầm súng nổi loạn.

---

## Phase 5: BR-003 - Khám Phá & Lái Tàu (Priority: P3)

**Goal**: Rút thẻ điều hướng, Captain chọn 2 đưa cho Lieutenant, Lieutenant chọn 1 để đi.

### Implementation
- [ ] T020 [P] [BR-003] Tạo entity `NavigationDeck` trong `backend/src/models/`.
- [ ] T021 [BR-003] Implement `NavigationService` (`backend/src/services/NavigationService.js`) xử lý rút bài, xáo bài khi hết.
- [ ] T022 [BR-003] Xử lý luồng Captain-Lieutenant Draw. Dùng `emitPrivate` để gửi đúng lá bài cho đúng người.
- [ ] T023 [BR-003] Bổ sung Action: Cult Leader có thể nhảy tàu.
- [ ] T024 [BR-003] Xây dựng UI Draw Cards cho Captain và Lieutenant (`frontend/src/components/NavigationPhase.jsx`).

**Checkpoint**: Tàu đã bắt đầu di chuyển dựa trên kết quả các thẻ mà Navigator chọn.

---

## Phase 6: BR-004 - Bản Đồ & Sự Kiện Hành Quyết (Priority: P4)

**Goal**: Tàu cập bến ô sự kiện, kích hoạt hiệu ứng thẻ và Cult Uprising.

### Implementation
- [ ] T025 [P] [BR-004] Tạo entity `MapBoard` trong `backend/src/models/`.
- [ ] T026 [BR-004] Tích hợp file JSON cấu hình map (Quick/Long) vào `ExecutionService.js` (`backend/src/services/ExecutionService.js`).
- [ ] T027 [BR-004] Xử lý sự kiện: Tra khảo (Search cabin), Chặt tay (Flogging), Lồng sắt, Cắt lưỡi.
- [ ] T028 [BR-004] Xử lý Cult Uprising: Captain lật mở bài Ritual, hệ thống ép nhắm mắt, Cult Leader nhặt giáo đồ, `emitPrivate` báo cho giáo đồ mới.
- [ ] T029 [BR-004] Xây dựng UI Bản đồ và Hiệu ứng (`frontend/src/components/MapBoardUI.jsx`).

**Checkpoint**: Gameplay gần như trọn vẹn, bao gồm kỹ năng và thu thập giáo đồ.

---

## Phase 7: BR-005 - Kết Thúc & Nghỉ Phép (Priority: P5)

**Goal**: Luân chuyển thẻ Off-duty và check điều kiện thắng để End game.

### Implementation
- [ ] T030 [P] [BR-005] Tạo entity `GameResult` trong `backend/src/models/`.
- [ ] T031 [BR-005] Xử lý luồng hoán đổi Off-duty shift sau mỗi lần tàu di chuyển (`backend/src/services/OffDutyService.js`).
- [ ] T032 [BR-005] Bổ sung ngầm `VictoryCheck` sau mỗi Mutiny hoặc Ship Movement: Check cán đích Sailor/Pirate/Cult, check Cult Leader chết/nhảy tàu.
- [ ] T033 [BR-005] Xử lý luồng End Game: Broadcast Event `GAME_OVER`, freeze trạng thái, lưu vào Database vật lý.
- [ ] T034 [BR-005] Xây dựng UI End Game, vinh danh và lật mở toàn bộ vai trò thật sự (`frontend/src/pages/EndGame.jsx`).

**Checkpoint**: Hệ thống Game hoàn thiện 100% Core Logic. Có thể chơi trọn vẹn từ đầu đến khi có phe thắng.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Hoàn thiện snapshot, testing và deploy.

- [ ] T035 Snapshot Integration: Lắp ráp cơ chế Snapshot Room State xuống Redis sau mỗi Action để fault-tolerance.
- [ ] T036 Thử nghiệm kịch bản ngắt kết nối mạng (Socket Disconnect) và reconnect để đảm bảo khôi phục UI tốt.
- [ ] T037 Đánh bóng UI: Thêm Animation khi lật bài, khi súng nổ, âm thanh.
- [ ] T038 Triển khai ứng dụng (Deploy frontend & backend).
