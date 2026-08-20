# UC-020: Điều khiển ghi đè Bot qua dòng lệnh CLI (Bot CLI Override Controller)

## Metadata
- **ID:** UC-020
- **Bounded Context:** Testing / Sandbox
- **Liên quan tới BR:** BR-006
- **Status:** draft
- **Owner:** Developer / QA Team
- **Last updated:** 2026-08-20

## Actor
- Tester / Developer thao tác trực tiếp qua giao diện dòng lệnh (CLI Terminal).

## Trigger
- Người kiểm thử gõ lệnh điều khiển trong cửa sổ terminal đang chạy script spawn bot.

## Preconditions
- Tiến trình script bot đang chạy và duy trì kết nối với phòng chơi.
- Console interface (sử dụng Node.js `readline`) đang ở trạng thái sẵn sàng nhận lệnh từ `stdin`.

## Main Flow
1. Tester muốn ép một Bot thực hiện một hành động cụ thể để kiểm thử một kịch bản rẽ nhánh đặc thù (ví dụ: Ép `Bot_1` nộp tối đa 3 súng trong cuộc Nổi loạn để lật đổ Thuyền trưởng; hoặc Ép `Bot_2` chọn hướng Crimson Cove).
2. Tester gõ lệnh tương tác vào terminal, ví dụ:
   - `bot 1 vote 3` (Chỉ định Bot 1 nộp 3 súng).
   - `bot 2 appoint 3 4` (Chỉ định Bot 2 chọn Bot 3 làm Lieutenant, Bot 4 làm Navigator).
   - `bot 3 choose RED` (Chỉ định Bot 3 chọn thẻ bài màu Đỏ).
   - `status` (Xem thông tin danh sách các bot, role bí mật hiện tại, số súng và phase game).
   - `auto on` / `auto off` (Bật / Tắt chế độ tự động cho tất cả hoặc 1 bot cụ thể).
3. CLI Controller phân tích cú pháp (parse) lệnh, xác định Bot mục tiêu và nội dung hành động.
4. CLI Controller gửi trực tiếp sự kiện qua socket của Bot chỉ định tới Server.
5. Server xử lý hành động và broadcast cập nhật.
6. Terminal hiển thị kết quả xác nhận: `[CLI Override] Đã thực hiện lệnh cho [Bot_X] thành công!`.

## Alternative Flows
- **2a. Lệnh xem trạng thái (Status Command):** Tester gõ `status` -> CLI Controller in ra bảng tổng quan trạng thái (Bot Index, Nickname, Role bí mật, Guns, Online Status, Game Phase hiện tại).

## Exceptions
- **E1. Sai cú pháp lệnh:** Tester gõ sai định dạng -> CLI in hướng dẫn cú pháp (Help guide) kèm danh sách các lệnh hợp lệ.
- **E2. Chỉ định Bot không tồn tại:** Nhập chỉ số bot vượt quá số lượng bot đang chạy -> Báo lỗi `[CLI] Bot index không hợp lệ (Chỉ có từ Bot 1 đến Bot N)`.
- **E3. Hành động không phù hợp với Game Phase:** Gõ lệnh bỏ phiếu khi game đang ở phase ban đêm -> Server từ chối và CLI in cảnh báo `[Error] Hành động không hợp lệ ở giai đoạn hiện tại`.

## Postconditions
- Hành động chỉ định của Tester được thực thi chính xác trên Server thông qua định danh của Bot.
- Tester có thể tái hiện chính xác các kịch bản test biên (edge cases) hoặc các tình huống đặc biệt theo ý muốn.

## Acceptance Criteria (Tầng 4)
### AC-1: Ghi đè hành động bỏ phiếu của Bot chỉ định
- **Given:** Game đang ở giai đoạn `MUTINY_VOTING` và `Bot_1` đang có 3 súng.
- **When:** Tester gõ lệnh `bot 1 vote 3`.
- **Then:** `Bot_1` phát sự kiện bỏ phiếu với 3 súng lên Server.
- **And:** Hành vi tự động random của `Bot_1` trong lượt đó bị vô hiệu hóa để ưu tiên lệnh của Tester.

### AC-2: Hiển thị bảng trạng thái Sandbox (Status Dashboard)
- **Given:** 4 bot đang tham gia trong một ván game đã bắt đầu.
- **When:** Tester gõ lệnh `status`.
- **Then:** CLI in ra bảng thông tin chi tiết của 4 bot (Nickname, Role bí mật, Số súng còn lại, Trạng thái socket).

### AC-3: Chuyển đổi linh hoạt giữa Auto Mode và Manual Mode
- **Given:** Hệ thống đang chạy ở chế độ Auto-Responder.
- **When:** Tester gõ lệnh `auto off`.
- **Then:** Tất cả các Bot tạm dừng tự động gửi phản hồi và chuyển sang trạng thái chờ lệnh thủ công từ CLI.

## Dependencies
- **Upstream UC:** UC-018 (Bot Lifecycle & Sandbox Connection), UC-019 (Bot Auto-Responder Engine).
- **Downstream UC:** Không có.
- **External Systems:** Node.js `readline` interface.

## Notes
- CLI Controller là công cụ hỗ trợ đắc lực giúp Tester kiểm tra được các điều kiện thắng/thua (Win conditions) và các thẻ sự kiện mà không phải phụ thuộc vào yếu tố may rủi khi chơi cùng người thật.

## History
- v1 (2026-08-20, AI): initial đặc tả use case UC-020 cho BR-006.
