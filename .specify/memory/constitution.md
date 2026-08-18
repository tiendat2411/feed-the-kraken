<!--
Sync Impact Report:
- Version change: 1.2.0 → 1.2.1
- Added sections: Architecture & Networking Standards (under Technical Constraints)
- Modified principles: Uncompromising Game Logic updated to include game-mechanics link and clarification rule. Added Time-out & Game Pace Logic to Technical Constraints.
- Removed sections: N/A
- Templates requiring updates: 
  - ✅ .specify/templates/plan-template.md (already generic)
  - ✅ .specify/templates/spec-template.md (already generic)
  - ✅ .specify/templates/tasks-template.md (already generic)
- Follow-up TODOs: None
-->
# Feed the Kraken Web App Constitution

## Core Principles

### I. Pragmatic & Lightweight Code Quality
Mã nguồn MUST sạch sẽ, dễ đọc và có tính modular cao. Chúng ta MUST tránh over-engineering và các kiến trúc enterprise phức tạp (như microservices) không cần thiết cho một dự án cá nhân. Sự đơn giản và tính thực dụng được ưu tiên hàng đầu so với các abstract design patterns.

### II. Uncompromising Game Logic (Source of Truth)
Ứng dụng MUST tuân thủ tuyệt đối các quy tắc, cơ chế hidden roles, và lore của "Feed the Kraken" (tham khảo tài liệu chi tiết tại [game-mechanics-v1.md](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/document/game-mechanics-v1.md)). Core game logic MUST đóng vai trò là "source of truth" tuyệt đối và MUST được tách biệt hoàn toàn (decoupled) khỏi User Interface (UI). Nếu có bất kỳ vấn đề hoặc logic nghiệp vụ nào chưa rõ ràng, AI/Developer MUST hỏi trực tiếp người dùng để được giải đáp, tuyệt đối không tự suy diễn.

### III. Focused Testing Standards (Unit Tests First)
Unit Tests là MANDATORY cho tất cả các thành phần core game logic (chia phe/faction assignment, kỹ năng nhân vật/character skills, kết quả bỏ phiếu/voting outcomes, điều hướng tàu/ship navigation). Điều này đảm bảo tính chính xác của luật chơi và bảo vệ trải nghiệm game khỏi các lỗi ngắt đoạn. Các quy trình kiểm thử End-to-End (E2E) rườm rà SHOULD được bỏ qua để tối ưu sự linh hoạt (agility).

### IV. Player-Centric User Experience (UX)
Giao diện MUST nhất quán và thân thiện với thiết bị di động (mobile-friendly), đảm bảo trải nghiệm mượt mà cho nhóm bạn cùng chơi. Các thao tác (nhắm mắt, bỏ phiếu, xem bản đồ) MUST trực quan. Trạng thái game (game state) hiện tại MUST luôn được hiển thị rõ ràng cho người chơi.

### V. Real-Time Performance & Sync
Ứng dụng MUST được tối ưu hóa cho trải nghiệm chơi thời gian thực (real-time multiplayer). Đồng bộ trạng thái (state synchronization) giữa các client MUST mượt mà và tức thì, ưu tiên sử dụng WebSockets làm lớp truyền tải (transport layer).

### VI. Graceful Resilience & Reconnection
Hệ thống MUST có cơ chế xử lý sự cố ngắt kết nối mạng (network disconnects) mạnh mẽ. Người chơi MUST có thể kết nối lại (reconnect) vào đúng phòng chơi và trạng thái trước đó một cách mượt mà, không làm gián đoạn ván game của những người chơi khác.

### VII. Documentation & Language Standards
Toàn bộ tài liệu dành cho người đọc trong dự án (như specs, plans, guides, README) MUST được viết bằng tiếng Việt. Tuy nhiên:
- Tất cả các đề mục và tiêu đề (headings/titles) trong tài liệu MUST được viết bằng tiếng Anh.
- Các từ ngữ chuyên ngành hoặc thuật ngữ đặc biệt (technical terms/domain terms) được phép giữ nguyên bằng tiếng Anh.
- Tất cả mã nguồn (source code), bao gồm tên biến, tên hàm, class, comments trong code, commit messages, và API endpoints MUST được viết bằng tiếng Anh.

## Technical Constraints

Các lựa chọn công nghệ MUST phù hợp với tính chất thực dụng và thời gian thực của các nguyên tắc. Kiến trúc frontend và backend SHOULD hỗ trợ tích hợp WebSockets mượt mà và thực thi nghiêm ngặt việc tách biệt game logic khỏi giao diện hiển thị (presentation).

### Architecture & Networking Standards
Để đảm bảo trải nghiệm Real-time liền mạch, hệ thống MUST tuân thủ các tiêu chuẩn sau:
- **Session Persistence & Identity Control:** Khi khởi tạo hoặc tham gia phòng, server MUST cấp một `sessionToken` duy nhất lưu tại LocalStorage của client. Trạng thái người chơi được khôi phục dựa trên token này, đồng thời hệ thống MUST ngăn chặn việc đăng nhập trùng lặp (nhiều tab) từ cùng một định danh.
- **Event Broadcasting:** Mọi thay đổi về trạng thái phòng (người chơi vào/ra, rớt mạng, thay đổi cài đặt...) BẮT BUỘC phải được phát (broadcast) kèm payload đầy đủ tới TẤT CẢ các client đang active để cập nhật UI đồng bộ.
- **State Recovery:** Khi người chơi reconnect (do rớt mạng hoặc F5), server MUST gửi lại toàn bộ `room_state` hiện tại để client có thể hiển thị chính xác trạng thái game ngay lập tức.
- **Disconnect Handling:** Cần phân biệt rõ sự kiện `socket_disconnect` (rớt mạng tạm thời, giữ chỗ và báo hiệu reconnect) và `player_leave` (chủ động rời phòng, xóa khỏi phòng).
- **Time-out & Game Pace Logic:** Chỉ kích hoạt bộ đếm thời gian (time-out) để tự động hóa khi trạng thái của người chơi liên quan trực tiếp đến việc rớt mạng. Nếu người chơi đang trực tuyến, họ MUST có thời gian tự do không giới hạn để đưa ra quyết định. Thêm vào đó, trò chơi KHÔNG ĐƯỢC tự động chuyển đổi liên tục giữa các state; sau mỗi state, Captain (hoặc người có quyền) MUST có một nút bấm để xác nhận chuyển sang state tiếp theo, nhằm đảm bảo người chơi có đủ thời gian thảo luận.
- **Host Authority:** Host nắm quyền tối thượng trong phòng, bao gồm quyền giải tán phòng (Dissolve Room) ở bất kỳ giai đoạn nào, buộc tất cả client phải xóa data và quay về trang chủ.

## Governance

Hiến pháp này có hiệu lực cao nhất, thay thế mọi thực thi và tài liệu khác trong dự án. Mọi quyết định về kiến trúc hoặc thiết kế MUST được đối chiếu và xác minh theo các nguyên tắc này.
- Các quy tắc (rules) được người dùng chỉ định có hiệu lực ngang hàng với hiến pháp này (`.specify/memory/constitution.md`). Bất cứ khi nào có tranh chấp hay xung đột hiệu lực, bắt buộc phải hỏi trực tiếp người dùng để ra quyết định.
- Các sửa đổi đối với các nguyên tắc này yêu cầu tăng phiên bản của constitution (version bump).
- Tất cả Pull Requests, tài liệu thiết kế và triển khai tính năng MUST xác minh tính tuân thủ với các nguyên tắc "Uncompromising Game Logic", "Focused Testing Standards", và "Documentation & Language Standards".

**Version**: 1.2.1 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-14
