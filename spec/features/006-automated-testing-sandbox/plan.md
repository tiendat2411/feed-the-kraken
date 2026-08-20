# Implementation Plan: BR-006 Automated Testing Sandbox & Headless Bots

**Branch**: `main` | **Date**: 2026-08-20 | **Spec**: [spec.md](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/spec/features/006-automated-testing-sandbox/spec.md)

**Input**: Feature specification from `spec/features/006-automated-testing-sandbox/spec.md` and Use Cases (`UC-018`, `UC-019`, `UC-020`).

---

## Summary

Xây dựng hệ thống kiểm thử tự động giả lập người chơi ảo (Headless Bots) và môi trường Sandbox độc lập chạy trên Node.js CLI runtime. Hệ thống sử dụng thư viện `socket.io-client` để thiết lập song song nhiều kết nối WebSocket độc lập hoàn toàn trong bộ nhớ (In-Memory Session), tích hợp động cơ phản hồi tự động (Auto-Responder Engine) theo máy trạng thái trò chơi, và cung cấp bảng điều khiển dòng lệnh tương tác (Interactive CLI Controller) qua Node.js `readline` để Tester có thể can thiệp, ghi đè hành động của bất kỳ bot nào trong quá trình kiểm thử.

---

## Technical Context

**Language/Version**: Node.js (v20+, ES Modules)  
**Primary Dependencies**: `socket.io-client` (^4.8.3), Node.js native `readline`, `crypto`  
**Storage**: In-Memory (Quản lý trạng thái bot, sessionTokens, sockets trong RAM của tiến trình script)  
**Testing**: CLI dry-run validation, unit tests cho logic ánh xạ sự kiện và luật phản hồi tự động  
**Target Platform**: Node.js Runtime (Cross-platform: Windows, macOS, Linux)  
**Project Type**: CLI Tool / Test Automation Sandbox Harness  
**Performance Goals**: 
- Khởi tạo và kết nối 10 bots vào phòng $< 3$ giây
- Mức tiêu thụ bộ nhớ RAM $< 100$MB cho toàn bộ 10 bots
- Tự động phản hồi sự kiện với độ trễ tự nhiên (500ms - 1500ms), 0% deadlock
**Constraints**: 
- Toàn bộ mã nguồn bot được cô lập hoàn toàn trong thư mục `scripts/bots/`, không xâm lấn mã nguồn logic chính của `backend/src/` hay `frontend/src/`.
- Sử dụng chính xác các định dạng sự kiện và payload WebSocket chuẩn của Server.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên Tắc / Tiêu Chuẩn | Trạng Thái | Đánh Giá Chi Tiết |
| :--- | :---: | :--- |
| **I. Pragmatic & Lightweight Code Quality** | ✅ PASS | Thiết kế module hóa đơn giản (`BotClient`, `AutoResponder`, `CLIController`, `spawn`), không lạm dụng over-engineering. |
| **II. Uncompromising Game Logic** | ✅ PASS | Bot tuân thủ 100% luật chơi và giao thức State Machine từ backend, hỗ trợ test các kịch bản rẽ nhánh và win conditions. |
| **III. Focused Testing Standards** | ✅ PASS | Đóng vai trò là công cụ kiểm thử cốt lõi, giải quyết bài toán cần 5-11 người chơi để test game logic. |
| **V. Real-Time Performance & Sync** | ✅ PASS | Kết nối trực tiếp qua Socket.io, đồng bộ tức thì với Server và các Client trình duyệt khác. |
| **VII. Documentation & Language Standards** | ✅ PASS | Headings bằng tiếng Anh, nội dung tiếng Việt chi tiết, code và biến chuẩn tiếng Anh. |

---

## Project Structure

### Documentation (`spec/features/006-automated-testing-sandbox/`)

```text
spec/features/006-automated-testing-sandbox/
├── spec.md                 # Business Requirement (BR-006)
├── plan.md                 # Implementation Plan (File này)
├── research.md             # Nghiên cứu kỹ thuật & Quyết định kiến trúc
├── data-model.md           # Mô hình thực thể In-Memory cho Bot & Sandbox
├── quickstart.md           # Hướng dẫn chạy và kiểm thử nhanh Sandbox
├── contracts/              # Đặc tả giao thức lệnh CLI và WebSocket
│   └── cli-contracts.md
├── checklists/
│   └── requirements.md    # Checklist chất lượng yêu cầu
└── use-cases/              # Danh sách Use Cases chi tiết
    ├── UC-018-Bot-Lifecycle-Sandbox-Connection.md
    ├── UC-019-Bot-Auto-Responder-Engine.md
    └── UC-020-Bot-CLI-Override-Controller.md
```

### Source Code (`scripts/bots/`)

```text
scripts/
└── bots/
    ├── BotClient.js       # Quản lý 1 kết nối WebSocket, sessionToken, role, guns và state của 1 bot
    ├── AutoResponder.js   # Động cơ tự động phân tích event từ Server và sinh payload hợp lệ
    ├── CLIController.js   # Giao diện dòng lệnh tương tác (Node.js readline) để ghi đè hành động
    ├── BotManager.js      # Điều phối vòng đời của nhóm N bots (spawn, leave, broadcast command)
    └── spawn.js           # Entrypoint CLI: nhận tham số --room, --count, --host...
```

---

## Complexity Tracking

*Không có vi phạm nguyên tắc kiến trúc nào cần biện minh.*
