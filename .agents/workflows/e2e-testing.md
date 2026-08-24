---
description: # QUY TRÌNH KIỂM ĐỊNH TỰ ĐỘNG BẰNG TRÌNH DUYỆT & HEADLESS BOTS (E2E TESTING WORKFLOW)
---

## 🧭 1. TỔNG QUAN & KIẾN TRÚC TEST
Quy trình E2E sử dụng **1 Host (Browser Preview)** phối hợp cùng **4 Headless Bots (`scripts/bots/spawn.js`)** để kiểm thử tự động toàn diện luồng game từ Phase 1 đến Phase 6:
- **Phase 1-3:** Tạo phòng, Sảnh chờ, Ban đêm (Role Reveal / Pirates Gathering).
- **Phase 4:** Bổ nhiệm Ban điều hướng & Biểu quyết Nổi loạn (Mutiny).
- **Phase 5:** Bốc bài 3 tầng, Nhật ký bí mật, Điều hướng & Nhảy tàu.
- **Phase 6:** Bản đồ lục giác SVG, Di chuyển tàu, Map Actions, Card Effects & Nghi thức Tà giáo (Cult Uprising).

---

## 🔄 2. SƠ ĐỒ TRÌNH TỰ TỔNG THỂ (MERMAID)

```mermaid
sequenceDiagram
    autonumber
    actor Host as Host (Browser Preview)
    participant Srv as Backend (Port 3001)
    participant Bots as 4 Headless Bots
    
    Host->>Srv: Tạo phòng (Nickname, Avatar, Map)
    Host->>Bots: Spawn bots vào phòng (node spawn.js --room <ID> --count 4)
    Host->>Srv: Bấm "START VOYAGE" -> Role Reveal (20s)
    Host->>Srv: Bổ nhiệm Lt & Nav -> LOYALTY_CHECK
    Bots->>Srv: Bots tự động vote súng -> MUTINY_REVEALED
    Host->>Srv: Captain xác nhận kết quả -> NAVIGATION
    Host->>Srv: Captain chọn 1 lá vào Logbook -> Lt (Bot) chọn 1 lá
    Note over Srv: Logbook bí mật xáo trộn 2 lá -> Nav (Bot) chốt bài
    Srv->>Host: Tàu di chuyển trên Bản đồ lục giác (MapBoardUI.jsx)
    Host->>Srv: Thực thi Map Action (Search/Flog/Tongue/Kraken) & Card Action
    Note over Host,Bots: Nếu lá bài là CULT_UPRISING -> Màn đêm mù toàn cục & Giáo chủ hành động
```

---

## 📋 3. CÁC BƯỚC KIỂM THỬ RÚT GỌN

### Bước 1: Khởi động Dịch vụ & Tạo Phòng (Bootstrap & Room Creation)
1. Chạy daemon Backend (Port 3001) và Frontend (Port 5173).
2. Mở trình duyệt `http://localhost:5173`, nhập Nickname, chọn Avatar, chọn Bản đồ $\rightarrow$ Bấm **"Create Voyage"**.
3. Đọc `Room Code` từ URL/Header.

### Bước 2: Spawn Bots & Bắt Đầu (Lobby & Night Phase)
1. Chạy bot nền: `node scripts/bots/spawn.js --room <ROOM_CODE> --count 4`.
2. Xác minh sảnh đủ 5/5 người $\rightarrow$ Bấm **"START VOYAGE"**.
3. Xác minh đếm ngược 20s `RoleReveal.jsx` hiển thị đúng vai trò và danh sách đồng bọn Pirate.

### Bước 3: Bổ Nhiệm & Nổi Loạn (Phase 4 - Mutiny Flow)
1. **Appoint Team:** Thuyền trưởng chọn Thuyền phó và Hoa tiêu $\rightarrow$ Bấm Xác nhận.
2. **Loyalty Check:** Đàn Bots tự nộp súng ẩn qua `AutoResponder`.
3. **Mutiny Reveal & Game Pace:** Màn hình lật mở súng. Thuyền trưởng bấm xác nhận để chuyển sang Điều hướng.

### Bước 4: Bốc Bài 3 Tầng & Điều Hướng (Phase 5 - Navigation Flow)
1. **Captain:** Xem 2 lá bài kín $\rightarrow$ Chọn 1 lá vào Nhật ký (`logbookCards`), hủy 1 lá.
2. **Lieutenant (Bot):** Nhận 2 lá tiếp theo qua `emitPrivate` $\rightarrow$ Tự động chọn 1 lá vào Nhật ký.
3. **Logbook Shuffle:** Server tự động xáo trộn 2 lá trong Nhật ký.
4. **Navigator (Bot/Host):** Chọn 1 lá cuối cùng để di chuyển tàu (hoặc thử nghiệm nhánh `JUMP_OVERBOARD` và bổ nhiệm khẩn cấp).

### Bước 5: Di Chuyển Tàu & Bản Đồ Lục Giác (Phase 6 - UC-012)
1. **MapBoardUI.jsx:** Hiển thị lưới lục giác SVG Pointy-topped, đường nối 3 màu (🔴 Đỏ Tây Bắc, 🟡 Vàng Bắc, 🔵 Xanh Đông Bắc), vệt sáng `visitedNodes` và con tàu ⛵ tại node mới.
2. **Supply Line (Map Long):** Tàu cắt qua ranh giới tiếp tế tự động sạc đầy 3 súng cho toàn bộ người chơi active.
3. **Victory Zones:** Cập bến `CRIMSON_COVE`, `KRAKEN_NEST`, hoặc `BLUEWATER_BAY` kích hoạt chiến thắng tương ứng.

### Bước 6: Hành Động Ô Bản Đồ (Phase 6 - UC-013 Map Actions)
1. **Modal `EXECUTE_MAP_ACTION`:** Thuyền trưởng chọn mục tiêu $\rightarrow$ Bấm **"THỰC THI HÀNH ĐỘNG"**:
   - `CABIN_SEARCH`: Thuyền trưởng xem phe thật (hoặc Tentacle 🐙 nếu là Cultist chuyển phe); gán `is_convertible = false`.
   - `FLOGGING`: Broadcast câu loại trừ *"Tôi không phải là [Phe X]"*; gán `is_convertible = false`.
   - `OFF_WITH_THE_TONGUE`: Gán `speech_restricted = true` (khóa chat và tước quyền làm Captain).
   - `FEED_THE_KRAKEN`: Loại bỏ người chơi khỏi tàu. Nếu là `CULT_LEADER` $\rightarrow$ Phe Cult lập tức thắng game!
2. **Game Pace:** Thuyền trưởng bấm **"XÁC NHẬN & TIẾP TỤC HẢI TRÌNH ➔"** (`confirm_map_action`).

### Bước 7: Hiệu Ứng Thẻ Bài (Phase 6 - UC-014 Card Effects)
1. **`DRUNK`:** Chuyển chức Thuyền trưởng theo chiều kim đồng hồ, tự động bỏ qua người bị cắt lưỡi/chết, nhận người `OFF_DUTY`.
2. **`ARMED` / `DISARMED`:** Cộng $+1$ / trừ $-1$ súng của Hoa tiêu đương nhiệm.
3. **`MERMAID`:** Thuyền trưởng chỉ định 1 người $\rightarrow$ Người đó nhận popup riêng xem 3 lá bài hòm bỏ ngẫu nhiên.
4. **`TELESCOPE`:** Thuyền trưởng chỉ định 1 người $\rightarrow$ Người đó nhận popup soi đỉnh Chồng Rút và chọn `KEEP` hoặc `DISCARD`.

### Bước 8: Nghi Thức Tà Giáo (Phase 6 - UC-015 Cult Uprising)
1. Khi lá bài là `CULT_UPRISING`, Thuyền trưởng bấm **"LẬT MỞ BÀI NGHI THỨC"** (rút từ cọc 5 lá `cultRitualDeck`).
2. **`CULT_UPRISING_BLIND`:** Màn đêm toàn cục (Anti-sniffing: không lộ danh tính Giáo chủ).
3. **Quyền Năng Giáo Chủ (`CULT_LEADER`):**
   - `GUNS_STASH`: Cấp 3 súng ẩn danh cho thủy thủ đoàn.
   - `CULT_CABIN_SEARCH`: Thị kiến danh tính thật của Bộ ba Ban điều hướng.
   - `CONVERSION`: Thu nạp 1 người có `is_convertible == true` $\rightarrow$ Nạn nhân nhận thông báo mật `CULTIST_CONVERTED` kèm ID Giáo chủ.

---

## 🎯 4. TIÊU CHUẨN NGHIỆM THU (PASS CRITERIA)
- [x] **Lobby & Night (Phase 1-3):** 5/5 người chơi kết nối, hiển thị vai trò bí mật 20s.
- [x] **Mutiny (Phase 4):** Bổ nhiệm hợp lệ, nộp súng ẩn danh, hiển thị kết quả và Game Pace hoạt động chuẩn.
- [x] **Navigation (Phase 5):** Bốc bài 3 tầng, bảo mật `emitPrivate`, xáo trộn Logbook, chốt bài điều hướng thành công.
- [x] **Map & Execution (Phase 6):** Tàu di chuyển đúng hướng, Map Actions, Card Effects và Cult Uprising blind phase chạy trơn tru.
- [x] **Quality & Tests:** 87/87 Unit Tests passed; 0 lỗi Uncaught Exceptions trên Browser Preview.