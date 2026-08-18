# UC-007: Biểu quyết Nổi loạn bằng Súng (Mutiny Vote / Loyalty Check)

## Metadata
- **ID:** UC-007
- **Bounded Context:** GamePlay, Mutiny
- **Liên quan tới BR:** BR-002
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Người chơi (Players - ngoại trừ Captain)
- Hệ thống (System)

## Trigger
- Sau khi Captain hoàn tất đề xuất Ban điều hướng (UC-006).

## Preconditions
- Game ở trạng thái LOYALTY_CHECK.
- Hệ thống đã khởi tạo thực thể `MutinySession`.

## Main Flow
1. Giao diện toàn phòng hiển thị danh sách đề xuất. (Lưu ý: Captain không được phép bỏ phiếu và không hiển thị bảng chọn súng).
2. Tất cả người chơi `ACTIVE` và `OFF_DUTY` (ngoại trừ Captain và `ELIMINATED`) được yêu cầu nhập số súng muốn sử dụng. Số lượng giới hạn từ 0 đến `gun_count` tối đa của họ.
3. Người chơi chọn số súng và bấm "Xác nhận". (UI che giấu số lượng súng đã chọn của từng người so với những người khác).
4. Hệ thống đếm ngược tối đa 90 giây. Nếu tất cả đã xác nhận trước thời hạn, hệ thống lập tức bỏ qua phần đếm ngược còn lại.
5. Khi tất cả xác nhận hoặc hết 90s, hệ thống thu thập tổng số súng.
6. Hệ thống lật mở công khai (reveal) số lượng súng từng người bỏ ra lên màn hình toàn phòng.
7. Chuyển sang UC-008 để phân giải kết quả.

## Alternative Flows
- **1a. Không ai có súng:** Nếu kiểm tra kho đồ, ngoại trừ Captain, KHÔNG CÓ AI có súng (`gun_count > 0`), hệ thống tự động bỏ qua giai đoạn Mutiny Vote (auto-skip) và chuyển luôn sang giai đoạn Điều hướng chính thức.

## Exceptions
- **E1. Người chơi rớt mạng khi đang vote:** Theo nguyên tắc *Time-out logic*, nếu người chơi bị `socket_disconnect`, Time-out 90s VẪN tiếp tục chạy. Nếu hết 90s mà họ không kết nối lại, hệ thống tự động chốt số súng họ nộp là 0 (Auto-resolve).
- **E2. Hết giờ do người online cố tình không bấm:** Nếu người chơi ONLINE không xác nhận trong 90s (hoặc thời gian tự do, tùy thuộc vào cờ cấu hình hệ thống), có thể chuyển timeout nếu được áp dụng.

## Postconditions
- Số lượng súng biểu quyết của từng người được ghi nhận và công khai trên bàn chơi.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `MUTINY_VOTE_STARTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ duration: 90 }`

- **Emit Event:** `PLAYER_VOTED_READY`
- **To:** Toàn bộ phòng.
- **Payload:** `{ player_id }` (Chỉ dùng để hiển thị dấu tick xanh Ready, TUYỆT ĐỐI không lộ số súng).

- **Emit Event:** `MUTINY_REVEALED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ votes: [{ player_id, guns_placed }] }`

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- **F5 trong lúc 90s:** Nếu người chơi F5, server trả về trạng thái đang biểu quyết và thời gian đếm ngược còn lại (synced timer). Họ vẫn tiếp tục vote nếu chưa hết giờ và chưa confirm.

## Acceptance Criteria (Tầng 4)
### AC-1: Bỏ phiếu ẩn danh (Hidden Placement)
- **Given:** Đang trong giai đoạn Mutiny Vote.
- **When:** Người chơi A chọn 2 súng.
- **Then:** Các người chơi khác chỉ thấy A chuyển trạng thái sang "Đã chọn" chứ không lấy được số 2 qua packet mạng.

### AC-2: Giới hạn lượng súng hợp lệ
- **Given:** Người chơi B có 1 súng.
- **When:** Người chơi B cố tình gửi API đặt 2 súng (hack).
- **Then:** Hệ thống báo lỗi và gán lại (clamp) số súng đặt của B là 1 hoặc 0.

### AC-3: Auto-resolve Timeout
- **Given:** Có người đang rớt mạng chưa bấm xác nhận và hết 90s.
- **When:** Timer = 0.
- **Then:** Hệ thống tự động ghi nhận người đó bỏ 0 súng và đi tiếp luồng.

## Dependencies
- **Upstream UC:** UC-006
- **Downstream UC:** UC-008
