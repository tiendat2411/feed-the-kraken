# Research & Technical Decisions: BR-006 Automated Testing Sandbox & Headless Bots

## 1. Context & Problem Statement
Game "Feed the Kraken" yêu cầu từ 5 đến 11 người chơi đồng thời. Trong quá trình phát triển và kiểm thử:
- Nếu mở 5-11 tab trình duyệt web bằng Playwright/Puppeteer/Chrome: Chiếm từ 1.5GB đến 3GB RAM, khởi động chậm (10-15s), nặng máy và dễ gây gián đoạn.
- Cần một giải pháp giả lập kết nối người chơi nhẹ (Lightweight), khởi chạy tức thì ($< 2$s), chiếm ít tài nguyên ($< 100$MB) và có khả năng tương tác linh hoạt qua terminal.

---

## 2. Technical Decisions & Rationale

### Decision 1: Sử dụng `socket.io-client` trực tiếp trong Node.js (Headless Socket Client)
- **Lựa chọn:** Khởi tạo các kết nối socket trực tiếp qua thư viện `socket.io-client` chạy trên Node.js runtime.
- **Lý do:** 
  - Mỗi kết nối socket chỉ là một TCP/WebSocket connection thuần túy, chiếm chưa đến 5MB RAM cho 10 kết nối song song.
  - Tốc độ handshake và gia nhập phòng dưới 100ms.
- **Giải pháp thay thế bị loại bỏ:**
  - *Browser Automation (Puppeteer / Playwright):* Bị loại bỏ vì tiêu tốn quá nhiều tài nguyên CPU/RAM và khó điều khiển tương tác luồng đồng thời theo thời gian thực.

### Decision 2: In-Memory Multi-Session Architecture (Bypass LocalStorage)
- **Lựa chọn:** Mỗi instance `BotClient` tự quản lý một `sessionToken` độc lập dạng UUID (`bot_session_${randomUUID()}`) và truyền trong `auth: { sessionToken }` khi gọi `io('http://localhost:3001', { ... })`.
- **Lý do:** Server backend xác thực người chơi dựa trên `sessionToken` trong auth payload. Khi chạy trên Node.js, không có đối tượng `window.localStorage`, nên mỗi socket độc lập hoàn toàn mà không bị ghi đè hay xung đột định danh.
- **Bảo mật & Tính nhất quán:** Backend đối xử với bot hệt như một client trình duyệt thật, hoàn toàn tuân thủ cơ chế sanitize dữ liệu và phân chia vai trò ẩn.

### Decision 3: Event-Driven Auto-Responder Engine
- **Lựa chọn:** Xây dựng module `AutoResponder.js` với mô hình đăng ký Handler theo từng sự kiện game (`EVENT_HANDLERS` dictionary).
- **Lý do:**
  - Khi Server phát sự kiện yêu cầu (ví dụ: `REQUIRE_VOTE`, `REQUIRE_TEAM_APPOINTMENT`), Auto-Responder tự động kiểm tra xem `bot.id` có khớp với đối tượng yêu cầu hay không.
  - Thêm khoảng trễ ngẫu nhiên (`setTimeout` ngẫu nhiên từ 500ms đến 1500ms) để tái hiện hành vi thực tế và tránh race condition trên server.
- **Xử lý ngoại lệ:** Tự động fallback về giá trị an toàn (ví dụ: nộp 0 súng) nếu xảy ra lỗi.

### Decision 4: Node.js Native `readline` cho Interactive CLI Controller
- **Lựa chọn:** Sử dụng module `readline` có sẵn của Node.js để tạo terminal prompt (`ftk-sandbox > `) nhận lệnh trực tiếp từ `process.stdin`.
- **Lý do:** Không cần cài thêm dependencies nặng nề; hỗ trợ bắt phím, phân tích chuỗi lệnh (command parsing) và in log màu sắc rõ ràng (ANSI colors).

---

## 3. Compatibility & Constraints Verification
- **Tương thích giao thức:** Socket.io client v4.8+ hoàn toàn tương thích với Socket.io server v4.8+ của backend.
- **Tách biệt mã nguồn:** Đặt toàn bộ trong `scripts/bots/`, có thể import chạy độc lập bằng lệnh `node scripts/bots/spawn.js`.
