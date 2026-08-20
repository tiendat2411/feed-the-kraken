# BR-006: Automated Testing Sandbox & Headless Bots (Hệ thống Bot tự động và Môi trường Kiểm thử)

## Metadata
- **ID:** BR-006
- **Status:** draft
- **Owner:** Developer / QA Team
- **Stakeholders:** Developer, QA Engineer, Product Owner
- **Target Quarter:** Q3-2026

## Background
Do đặc thù trò chơi "Feed the Kraken" là boardgame ẩn vai yêu cầu số lượng người chơi tối thiểu từ 5 đến 11 người và sở hữu máy trạng thái (State Machine) phức tạp qua nhiều giai đoạn (Day Phase, Night Phase, Appoint Team, Loyalty Check, Navigation, Tile Actions...). Trong quá trình phát triển (Development) và kiểm thử (QA), việc mở thủ công 5-11 tab trình duyệt web hoặc cửa sổ ẩn danh tiêu tốn rất nhiều tài nguyên hệ thống (CPU, RAM) và mất nhiều thời gian thao tác thủ công, gây cản trở lớn đến tốc độ kiểm thử các kịch bản rẽ nhánh. Do đó, dự án cần một hệ thống giả lập người chơi ảo (Headless Bots) chạy trên môi trường Node.js để tự động hóa quá trình kiểm thử và tạo môi trường Sandbox linh hoạt.

## Goal
Cung cấp bộ công cụ Headless Bots chạy độc lập trên Node.js có khả năng tự động kết nối qua WebSocket, tham gia phòng chơi để lấp đầy số lượng người tối thiểu (5-11 người), tự động phản hồi các sự kiện trò chơi hoặc nhận lệnh điều khiển thủ công qua dòng lệnh (CLI), giúp Developer/QA dễ dàng kiểm thử toàn diện các luồng game mà không cần mở nhiều trình duyệt.

## Success Metrics
- **Metric 1 (Setup Latency):** Thời gian khởi tạo phòng và lấp đầy đủ 5 người chơi (1 người thật + 4 bots hoặc 5 bots) giảm xuống dưới 5 giây (`setup_time < 5s`).
- **Metric 2 (Resource Consumption & Concurrency):** Hỗ trợ khởi chạy đồng thời tối đa 10 bots trên cùng một máy tính với mức chiếm dụng RAM dưới 100MB (thay vì 1-2GB nếu mở 10 tab trình duyệt).
- **Metric 3 (Deadlock Prevention & Stability):** 100% các vòng bỏ phiếu (Voting/Mutiny) và ra quyết định không bị rơi vào trạng thái kẹt (Deadlock) do thiếu phản hồi từ phía Bot.

## In Scope
- **Quản lý định danh In-Memory (Session Bypass):** Quản lý độc lập mảng danh sách `sessionToken` và `socket` trong bộ nhớ Node.js (bỏ qua cơ chế LocalStorage của trình duyệt) để 1 tiến trình script duy nhất có thể khởi tạo đồng thời nhiều Bot với các phiên kết nối WebSocket riêng biệt.
- **Auto-Responder Engine:** Cơ chế tự động bắt các sự kiện từ Server (ví dụ: yêu cầu bỏ phiếu súng `REQUIRE_VOTE`, yêu cầu hành động chức danh `REQUIRE_ROLE_ACTION`, chọn bài điều hướng...) và tự động phản hồi dữ liệu ngẫu nhiên hoặc mặc định hợp lệ sau một khoảng trễ ngắn (Delay 500ms - 2000ms) để ván game diễn ra liên tục.
- **CLI Controller (Điều khiển thủ công qua Terminal):** Cung cấp giao diện dòng lệnh (CLI Console/Terminal Input) cho phép người kiểm thử có thể can thiệp, ghi đè (override) quyết định hoặc chỉ định hành động cụ thể cho bất kỳ Bot nào (ví dụ: ép Bot A nộp 3 súng, ép Bot B chọn hướng Red/Crimson Cove) nhằm kiểm thử các kịch bản đặc thù.

## Out of Scope
- Không xây dựng thuật toán Trí tuệ nhân tạo (AI/Machine Learning) thông minh (Bot không có khả năng suy luận tâm lý, suy đoán vai trò ẩn hoặc lừa lọc như người chơi thật; Bot chỉ phản hồi ngẫu nhiên hợp lệ hoặc theo lệnh chỉ định từ CLI).
- Không xây dựng giao diện đồ họa Web UI cho hệ thống quản lý Bot (Toàn bộ hoạt động của Headless Bots chỉ thực thi và điều khiển thông qua terminal/command line scripts).
- Không sử dụng Bot để thay thế người chơi thật trong các ván game Production công khai (Hệ thống này chỉ phục vụ mục đích Development, Testing và Sandbox).

## Related Use Cases
- UC-018: Quản lý vòng đời Bot và Kết nối Sandbox (Bot Lifecycle & Sandbox Connection)
- UC-019: Động cơ tự động phản hồi sự kiện của Bot (Bot Auto-Responder Engine)
- UC-020: Điều khiển ghi đè Bot qua dòng lệnh CLI (Bot CLI Override Controller)

## Constraints
- **Technical:**
  - Script Bot phải sử dụng cùng thư viện client (`socket.io-client`) và cùng phiên bản giao thức mạng (Event Names & Payloads) đồng bộ 100% với Frontend hiện tại.
  - Toàn bộ mã nguồn của hệ thống Headless Bots phải được lưu trữ độc lập trong thư mục `scripts/` (hoặc `scripts/bots/`), tuyệt đối không được trộn lẫn hay can thiệp vào logic lõi của `backend/src/` và `frontend/src/`.
- **Regulatory:** Chỉ kích hoạt và sử dụng trong môi trường phát triển (Development / Test environment).
- **Timeline:** Triển khai ngay để phục vụ kiểm thử cho các Phase tiếp theo (Phase 4: Bầu Thuyền Trưởng & Nổi Loạn, Phase 5: Điều Hướng & Sự Kiện).

## Open Questions
- [ ] Không có câu hỏi mở nào còn tồn đọng. Toàn bộ phạm vi và cơ chế vận hành của Headless Bots đã được làm rõ.

## History
- v1 (2026-08-20, AI): Khởi tạo tài liệu đặc tả Business Requirement cho BR-006 theo đúng template chuẩn Spec Kit và spec-guidelines.
