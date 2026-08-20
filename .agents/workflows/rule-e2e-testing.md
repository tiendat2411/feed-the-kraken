---
description: # QUY TRÌNH KIỂM ĐỊNH TỰ ĐỘNG BẰNG TRÌNH DUYỆT & HEADLESS BOTS (E2E TESTING WORKFLOW)
---

## 🧭 MỤC TIÊU & TỔNG QUAN

Tài liệu này định nghĩa quy trình chuẩn để AI Agent tự động khởi chạy môi trường, mở trình duyệt web (Browser Subagent / Preview), tạo phòng chơi với tư cách là **Host (Human/Captain)**, sử dụng đàn **Headless Bots** để lấp đầy phòng, và tự động kiểm thử toàn diện luồng game từ Sảnh chờ (Phase 1-3), Bổ nhiệm Ban điều hướng & Bỏ phiếu Nổi loạn (Phase 4), đến **Bốc bài Điều hướng, Nhật ký bí mật, và Tự nhảy tàu (Phase 5 - BR-003)**.

---

## 🔄 QUY TRÌNH THỰC THI (END-TO-END WORKFLOW)

```mermaid
sequenceDiagram
    autonumber
    actor AI as AI Agent (Host/Captain)
    participant Srv as Backend & Frontend
    participant Browser as Browser Preview (UI)
    participant Bots as Headless Bots (Node.js)
    
    AI->>Srv: 1. Kiểm tra / Khởi chạy Server (Port 3001 & 5173)
    AI->>Browser: 2. Mở trình duyệt http://localhost:5173
    AI->>Browser: 3. Nhập Nickname, Avatar -> Bấm "Create Voyage"
    Browser-->>AI: 4. Đọc Room Code từ URL/giao diện (VD: "2370")
    AI->>Bots: 5. Chạy spawn.js --room 2370 --count 4 (chạy nền)
    Bots-->>Browser: 6. 4 Bots kết nối Socket.io -> UI cập nhật đủ 5/5
    AI->>Browser: 7. Bấm "START VOYAGE" -> Chuyển sang Phase Ban Đêm
    Note over Browser,Bots: Phase Ban Đêm: Role Reveal (20s Countdown)
    Browser->>Browser: 8. Hết 20s -> Bình minh lên (DAY_1_CREW_SELECTION)
    AI->>Browser: 9. Host (Captain) chọn Thuyền phó + Hoa tiêu -> Bấm "XÁC NHẬN"
    Browser->>Bots: 10. Chuyển sang LOYALTY_CHECK -> Bots tự động nộp súng ẩn
    Bots-->>Browser: 11. Đủ 4 phiếu -> Chuyển sang MUTINY_REVEALED (Lật bài)
    AI->>Browser: 12. Host quan sát kết quả súng -> Bấm nút Xác nhận của Captain
    Browser->>Browser: 13. Tiến vào Phase 5: Giao diện NavigationPhase.jsx
    AI->>Browser: 14. Lượt Captain: Xem 2 thẻ bài kín -> Chọn 1 lá bỏ vào Nhật Ký
    Browser->>Bots: 15. Lượt Lieutenant: Bot nhận 2 thẻ kín qua emitPrivate -> Tự chọn 1 lá
    Note over Srv: 16. Server xáo trộn bí mật 2 lá bài trong Nhật Ký (Logbook)
    Bots-->>Browser: 17. Lượt Navigator: Bot nhận 2 thẻ xáo trộn -> Chọn 1 thẻ điều hướng
    Browser->>Browser: 18. Chuyển sang EXECUTE_ACTIONS -> Trình diễn kết quả hải đồ
```

---

## 📋 CHI TIẾT CÁC BƯỚC KIỂM THỬ

### Bước 1: Khởi chạy môi trường dịch vụ (Service Bootstrap)
Trước khi mở trình duyệt, Agent kiểm tra xem Backend và Frontend đã chạy chưa. Nếu chưa, khởi chạy dưới dạng daemon background tasks:
- **Backend (Port 3001):** `npm run backend:start` hoặc `npm --prefix backend start` (`IsDaemon: true`)
- **Frontend (Port 5173):** `npm run frontend` (`IsDaemon: true`)

---

### Bước 2 & 3: Mở Browser Preview và Tạo Phòng (Host Creation)
Agent gọi tool `browser_subagent` để tương tác với giao diện Web:
1. **Truy cập:** `http://localhost:5173`
2. **Thao tác trên Form Tạo Phòng:**
   - Điền Nickname cho Host (ví dụ: `Captain_Agent` hoặc `TestHost`).
   - Chọn Avatar đại diện (ví dụ: 🧑‍✈️ hoặc 🏴‍☠️).
   - Chọn loại bản đồ (`QUICK_JOURNEY` hoặc `LONG_JOURNEY`).
   - Bấm nút **"Create Voyage"** (hoặc nút Tạo phòng).
3. **Chờ chuyển trang:** Đợi trang web điều hướng vào sảnh chờ `/room/:id`.

---

### Bước 4 & 5: Đọc Room Code và Kích hoạt Headless Bots
1. **Lấy Room Code:** Agent đọc text trên tiêu đề phòng hoặc URL hiện tại (ví dụ: mã phòng `4-6` ký tự như `2370` hoặc `661C`).
2. **Spawn Bots:** Agent gọi `run_command` chạy script bot ở chế độ nền:
   ```bash
   node scripts/bots/spawn.js --room <ROOM_CODE> --count 4
   ```
   *(Số lượng bot phụ thuộc vào kịch bản test, mặc định 4 bots + 1 Host Human = 5 người chơi).*

---

### Bước 6: Xác minh Sảnh chờ (Lobby State Verification)
Agent dùng `browser_subagent` quan sát màn hình sảnh chờ:
- **Số lượng người chơi:** Đảm bảo danh sách hiển thị đủ $5/5$ người chơi (`Captain_Agent` + 4 Bots).
- **Trạng thái kết nối:** Icon/Tên của 4 bots xuất hiện đầy đủ với avatar emoji tương ứng.
- **Kích hoạt nút Bắt đầu:** Nút **"START VOYAGE"** chuyển từ trạng thái `disabled` (bị mờ) sang trạng thái `active` (sáng lên và bấm được).

---

### Bước 7: Kiểm thử Giai đoạn Ban Đêm (Role Reveal & Pirates Gathering)
1. **Bấm "START VOYAGE":** Agent click nút bắt đầu trên Browser Preview.
2. **Xác minh Giao diện `RoleReveal.jsx`:**
   - Host nhìn thấy đúng vai trò bí mật của mình (`SAILOR`, `PIRATE` hoặc `CULT_LEADER`).
   - Nếu là `PIRATE`, hiển thị danh sách các đồng bọn hải tặc.
   - Timer đếm ngược 20s hoạt động đồng bộ. Sau khi hết 20s, màn hình tự động chuyển sang Giai đoạn Ban ngày.

---

### Bước 8: Kiểm thử Bổ nhiệm Ban điều hướng (Phase 4 - Appoint Team)
1. **Giao diện `MutinyBoard.jsx`:**
   - Host (Thuyền trưởng đương nhiệm 👑) thấy bảng chọn Thuyền phó (🎖️) và Hoa tiêu (🧭).
   - Kiểm tra **Smart Filtering**: Thuyền trưởng không thể chọn chính mình; không thể chọn 1 người cho cả 2 vị trí.
2. **Thao tác:**
   - Click chọn 1 Bot làm Thuyền phó (`selectedLt`).
   - Click chọn 1 Bot khác làm Hoa tiêu (`selectedNav`).
   - Nút **"XÁC NHẬN BAN ĐIỀU HƯỚNG"** sáng lên $\rightarrow$ Agent click xác nhận.

---

### Bước 9: Kiểm thử Biểu quyết Nổi loạn (Phase 4 - Loyalty Check / Mutiny Vote)
1. **Chuyển sang `LOYALTY_CHECK`:**
   - Giao diện hiển thị số súng cần thiết để lật đổ (VD: $3$ súng cho phòng 5 người).
   - Đàn Headless Bots qua `AutoResponder` tự động gửi lệnh `submit_mutiny_vote` (chọn ngẫu nhiên $0, 1, 2$ súng sau 0.6 - 1.8s).
   - Grid trạng thái thủy thủ đoàn cập nhật biểu tượng ✅ *"Đã nộp"* cho từng bot.
   - Thuyền trưởng không có quyền vote (hiển thị banner quan sát).

---

### Bước 10: Kiểm thử Lật bài & Xác nhận của Thuyền trưởng (Phase 4 - Mutiny Reveal & Game Pace)
1. **Chuyển sang `MUTINY_REVEALED`:**
   - Màn hình lật mở số súng từng người đã nộp và tổng số súng thu được.
   - Hệ thống **tạm dừng** (không tự động nhảy phase) để người chơi đọc kết quả.
   - Hiển thị Banner kết quả:
     - **Nổi loạn thành công:** Nếu tổng súng $\ge 3$ $\rightarrow$ Hiển thị Tân Thuyền trưởng.
     - **Nổi loạn thất bại:** Nếu tổng súng $< 3$ $\rightarrow$ Thuyền trưởng cũ giữ quyền.
2. **Thao tác của Thuyền trưởng (Hiến pháp Game Pace):**
   - Chỉ Thuyền trưởng (mới hoặc cũ) thấy nút *"TIẾP TỤC HÀNH TRÌNH ĐIỀU HƯỚNG"* hoặc *"BẮT ĐẦU BỔ NHIỆM BAN ĐIỀU HƯỚNG MỚI"*.
   - Agent bấm nút xác nhận $\rightarrow$ Phòng chuyển sang `NAVIGATION` (Giai đoạn Điều hướng).

---

### Bước 11: Kiểm thử Thuyền trưởng Bốc bài (Phase 5 - Captain Draw)
1. **Giao diện `NavigationPhase.jsx`:**
   - Header Bar hiển thị số bài còn lại trong cọc bốc (`drawPileCount`), cọc bỏ (`discardPileCount`) và Nhật ký (`logbookCount: 0/2`).
   - Thuyền trưởng (Host) nhìn thấy 2 lá bài hải đồ bí mật (phối màu Đỏ / Xanh / Vàng với các hiệu ứng `DRUNK`, `ARMED`, `DISARMED`, `MERMAID`, `TELESCOPE`, `CULT_UPRISING` hoặc `NONE`).
   - Các Bot và người xem khác chỉ thấy màn hình chờ: *"Thuyền trưởng đang xem xét hải đồ..."*.
2. **Thao tác của Thuyền trưởng:**
   - Click chọn 1 trong 2 lá bài $\rightarrow$ Lá bài được viền vàng nổi bật.
   - Bấm nút **"XÁC NHẬN BỎ VÀO NHẬT KÝ 📖"**.
   - Lá được chọn đưa vào `logbookCards`, lá còn lại bị hủy úp kín vào `discardPile`.
   - Giao diện chuyển sang lượt của Thuyền phó (`NAVIGATION_LIEUTENANT_DRAW`).

---

### Bước 12: Kiểm thử Thuyền phó Bốc bài (Phase 5 - Lieutenant Draw)
1. **Lượt Thuyền phó (Bot):**
   - Server gửi riêng 2 lá bài tiếp theo qua `emitPrivate(CARDS_DRAWN_SECRET)` chỉ cho Thuyền phó.
   - Bot Thuyền phó qua `AutoResponder.handleCardSelection` tự động chọn 1 lá sau $0.7 - 1.6s$ và gửi `lieutenant_select_card`.
   - Host (Captain) thấy màn hình chờ: *"Thuyền phó đang xem xét hải đồ..."*.
2. **Xáo trộn bí mật (Secret Logbook Shuffle):**
   - Khi Thuyền phó chốt xong lá thứ 2, Server tự động xáo trộn ngẫu nhiên vị trí của 2 lá bài trong `logbookCards`.
   - Chuyển sang lượt của Hoa tiêu (`NAVIGATION_NAVIGATOR_DECISION`).

---

### Bước 13: Kiểm thử Hoa tiêu Định đoạt Hướng đi (Phase 5 - Navigator Decision)
1. **Lượt Hoa tiêu (Bot hoặc Human):**
   - Hoa tiêu nhận thông tin 2 lá bài trong Nhật Ký.
   - **Trường hợp Bot:** `AutoResponder` tự động chọn 1 lá bài phù hợp với phe ẩn và gửi `navigator_select_card`.
   - **Trường hợp Human (nếu Host làm Navigator):**
     - Host thấy 2 lá bài trong Hộp Nhật Ký.
     - Có 2 nút: **"CHỐT ĐIỀU HƯỚNG TÀU 🧭"** hoặc **"TỰ NHẢY TÀU (JUMP OVERBOARD) 🌊"**.
2. **Trình diễn Thực thi (`EXECUTE_ACTIONS`):**
   - Giao diện toàn phòng chuyển sang màn hình thông báo: *"Con Tàu Đang Rẽ Sóng Tiến Về Phía Trước!"*.
   - Hiển thị thẻ bài màu sắc và hiệu ứng vừa được Hoa tiêu chọn.

---

### Bước 14: Kiểm thử Luồng Ngoại lệ: Nhảy Tàu & Bổ nhiệm Khẩn cấp (Phase 5 - Overboard & Emergency Navigator)
*(Áp dụng khi kiểm thử kịch bản nhánh rẽ UC-011):*
1. **Hoa tiêu bấm "TỰ NHẢY TÀU":**
   - Mở modal cảnh báo 2 bước: *"BẠN CÓ CHẮC CHẮN MUỐN NHẢY TÀU?"*.
   - Bấm xác nhận $\rightarrow$ Hoa tiêu chuyển sang `ELIMINATED`, súng về 0, toàn bộ bài Logbook bị hủy úp kín.
   - Phòng chuyển sang `EMERGENCY_NAVIGATOR_SELECTION`.
2. **Thuyền trưởng Bổ nhiệm Khẩn cấp:**
   - Host (Captain) thấy danh sách ứng viên còn lại (cho phép chọn cả người `OFF_DUTY`).
   - Click chọn 1 người $\rightarrow$ Bấm **"BỔ NHIỆM HOA TIÊU KHẨN CẤP 🚨"**.
   - Vòng bốc bài bắt đầu lại từ đầu (Thuyền trưởng bốc 2 lá mới).

---

### Bước 15: Quy trình Tự Sửa Lỗi (Self-Healing Loop) & Dọn dẹp
- Nếu phát hiện lỗi giao diện (CSS vỡ, component không render), lỗi console (`get_console_message`), hoặc lỗi socket:
  - Agent kiểm tra file mã nguồn liên quan (`frontend/src/...` hoặc `backend/src/...`).
  - Sử dụng `replace_file_content` sửa lỗi ngay lập tức.
  - Tải lại trang (F5) hoặc chạy lại luồng test để kiểm tra lại.
- **Dọn dẹp:** Sau khi kiểm thử thành công, Agent tắt tiến trình bot nền (`kill`).

---

## 🎯 TIÊU CHUẨN ĐÁNH GIÁ THÀNH CÔNG (PASS CRITERIA)
- [x] **Lobby (Phase 1-3):** Host tạo phòng, 4 bots vào đủ 5/5, Start Voyage hoạt động.
- [x] **Night Phase:** Lật mở vai trò bí mật và Pirates Gathering trong 20s.
- [x] **Appoint Team (Phase 4):** Captain chọn Thuyền phó và Hoa tiêu hợp lệ.
- [x] **Mutiny Vote (Phase 4):** Bots tự nộp súng ẩn qua `AutoResponder`, UI nhận đủ phiếu.
- [x] **Mutiny Resolution (Phase 4):** Lật bài súng chính xác, tạm dừng cho thảo luận.
- [x] **Game Pace (Phase 4):** Chỉ Captain bấm xác nhận mới chuyển tiếp phase.
- [x] **Captain Card Draw (Phase 5):** Thuyền trưởng bốc 2 lá bí mật, chọn 1 lá vào Logbook, hủy 1 lá.
- [x] **Lieutenant Card Draw (Phase 5):** Thuyền phó nhận 2 lá qua `emitPrivate`, chọn 1 lá vào Logbook.
- [x] **Secret Logbook Shuffle (Phase 5):** 2 lá Logbook được xáo ngẫu nhiên trước khi chuyển cho Hoa tiêu.
- [x] **Navigator Decision & Execution (Phase 5):** Hoa tiêu chốt 1 lá, giao diện chuyển sang `EXECUTE_ACTIONS`.
- [x] **Jump Overboard Handling (Phase 5):** Xử lý loại trừ người chơi, hủy logbook và chọn Emergency Navigator trơn tru.
- [x] **Console:** Không có lỗi Uncaught Exceptions đỏ trên Browser Preview.