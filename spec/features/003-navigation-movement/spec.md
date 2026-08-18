# BR-003: Luồng rút bài & Nhảy tàu (Navigation Draw & Overboard)

## Metadata
- **ID:** BR-003
- **Status:** draft
- **Owner:** Developer
- **Stakeholders:** Developer, Customer

## Background
Giai đoạn Điều hướng (Navigation) là cốt lõi của trò chơi, nơi Ban điều hướng (Captain, Lieutenant, Navigator) lần lượt bốc, lọc và chốt lá bài định đoạt hướng đi của tàu. Trong trường hợp Hoa tiêu (Navigator) nhận được 2 lá bài không mong muốn từ cấp trên, họ có quyền quyết định "Tự nhảy tàu" (Jump Overboard) để phản đối thay vì miễn cưỡng chọn bài.

## Goal
Kiểm soát chặt chẽ quy trình bốc, hủy bài một cách bảo mật, đảm bảo thuật toán xáo bài hoạt động chuẩn xác, và xử lý mượt mà luồng ngoại lệ khi Navigator quyết định nhảy tàu.

## Success Metrics
- **Metric 1:** navigation_privacy = 100% (Client của các người chơi khác tuyệt đối không thể can thiệp, đánh hơi (sniff) qua WebSocket hoặc nhìn thấy giá trị của lá bài đang được Captain/Lieutenant bốc).
- **Metric 2:** reshuffle_consistency (Hệ thống tự động xáo trộn lại `discard_pile` vào `draw_pile` khi hết bài theo đúng luật bất biến, không làm lộ số lượng bài).
- **Metric 3:** overboard_resolution (Xử lý dứt điểm state khi Navigator nhảy tàu mà không làm treo game).

## In Scope
- Giao diện bốc 2 lá bài cho Captain: Chọn 1 bỏ vào Hộp Nhật ký (Logbook), hủy 1 vào `discard_pile`.
- Giao diện bốc 2 lá bài cho Lieutenant: Chọn 1 bỏ vào Hộp Nhật ký, hủy 1 vào `discard_pile`.
- Thuật toán xáo trộn (Shuffle) bí mật 2 lá bài trong Hộp Nhật ký trên Server trước khi gửi về cho Navigator.
- Giao diện thao tác cho Navigator: Xem 2 lá bài.
  - **Lựa chọn 1:** Chọn 1 lá để đánh, hủy 1 lá. (Chuyển sang BR-004).
  - **Lựa chọn 2:** Kích hoạt chức năng "Tự nhảy tàu" (Overboard) từ chối chọn bài.
- Xử lý luồng Nhảy tàu (Overboard):
  - Cập nhật trạng thái của Navigator thành `ELIMINATED` (Mất hết súng, quyền tham gia trò chơi).
  - 2 lá bài đang nằm trong Nhật ký (Logbook) bị hủy thẳng vào chồng bài bỏ `discard_pile`.
  - Thuyền trưởng (Captain) phải chọn 1 Hoa tiêu khẩn cấp ("Emergency Navigator") thay thế. Người này có thể được chọn từ những người rảnh (ACTIVE) hoặc kể cả những người đang nghỉ phép (OFF_DUTY). Thuyền phó (Lieutenant) cũ được giữ nguyên.
  - Vòng rút bài mới sẽ được khởi động lại ngay lập tức (Captain bốc lại bài mới -> Lieut bốc -> Nav) mà KHÔNG thông qua bước bỏ phiếu Nổi loạn (Mutiny).
  - Nếu Emergency Navigator mới lại tiếp tục Nhảy tàu, quy trình chọn thay thế sẽ lặp lại cho đến khi có một Navigator đồng ý chọn bài để tàu đi tiếp.
- Xử lý Auto-Reshuffle (Tự động trộn bài bỏ khi `draw_pile` không đủ bài bốc) tuân thủ quy tắc bất biến.

## Out of Scope
- Dịch chuyển tàu, thực thi Hành động bản đồ (Map Action) và Hành động thẻ bài (Card Action) -> **Thuộc BR-004**.
- Nghi thức Giáo phái (Cult Uprising, Cabin Search, Cấp súng...) -> **Thuộc BR-004**.
- Hoán đổi thẻ nghỉ phép (Off-duty) và Kiểm tra điều kiện thắng -> **Thuộc BR-005**.

## Related Use Cases

## Constraints
- **Technical:** Dữ liệu thẻ bài gửi về các Client phải được mã hóa hoặc ẩn hoàn toàn đối với những người không có quyền xem. Hộp Nhật ký (`logbook_cards`) trên Server phải xáo trộn bằng thuật toán ngẫu nhiên an toàn.
- **Rule Constraints:** Tuân thủ luồng Bốc bài trong `game-mechanics-v1.md`.
- **Timeout & Auto-resolve:** Thời gian tối đa để Captain, Lieutenant, hoặc Navigator đưa ra quyết định chọn bài là 60 giây (mỗi người). Nếu hết giờ đếm ngược, hệ thống tự động chọn ngẫu nhiên bài cho họ để tránh treo game (Auto-play thay vì Auto-nhảy-tàu).

## Open Questions
*(Đã giải quyết hết các câu hỏi mở).*

## History
- v1 (2026-07-08, AI): initial
- v2 (2026-07-09, AI): Tách scope theo yêu cầu, tập trung vào Rút bài & Nhảy tàu.
