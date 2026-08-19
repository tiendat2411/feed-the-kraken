# BR-002: Ban điều hướng & Cơ chế Nổi loạn (Navigation Team & Mutiny)

## Metadata
- **ID:** BR-002
- **Status:** draft
- **Owner:** Developer
- **Stakeholders:** Developer, Customer

## Background
Trong trò chơi Feed the Kraken, sau khi kết thúc thảo luận hoặc ngay khi bắt đầu một vòng chơi mới, Thuyền trưởng (Captain) phải chỉ định 2 người chơi khác làm Thuyền phó (Lieutenant) và Hoa tiêu (Navigator). Tuy nhiên, các Thủy thủ có quyền không đồng ý với quyết định này và tổ chức Nổi loạn (Mutiny) bằng cách dùng súng để lật đổ Thuyền trưởng. Quá trình này cần được số hóa minh bạch, chặt chẽ để đảm bảo trải nghiệm chơi mượt mà.

## Goal
Số hóa việc Captain chỉ định Thuyền phó/Hoa tiêu và luồng bỏ phiếu bằng súng công khai giữa các người chơi, tính toán tự động kết quả lật đổ để tiếp tục trận đấu một cách công bằng.

## Success Metrics
- **Metric 1:** ui_filtering_accuracy = 100% (Giao diện phải luôn tự động ẩn những người chơi không hợp lệ để tránh người dùng thao tác lỗi).
- **Metric 2:** mutiny_resolution_latency < 1s (Ngay khi tất cả người chơi hoàn tất đặt súng, hệ thống phải xử lý tính toán và công khai súng ngay lập tức).
- **Metric 3:** sync_realtime_consistency (Tất cả client hiển thị đồng bộ kết quả súng bị trừ và quyền Captain mới, không có độ trễ lệch nhau).

## Clarifications
### Session 2026-08-19
- Q: [BR-002 - Mutiny] Thuyền trưởng có được phép chỉ định người chơi đang mất kết nối (Offline/Reconnecting) làm Thuyền phó hoặc Hoa tiêu không? → A: Vẫn cho chọn, hệ thống sẽ auto-play/auto-pass nếu họ không phản hồi khi hết giờ.

## In Scope
- Giao diện Captain chọn Thuyền phó (Lieutenant) và Hoa tiêu (Navigator).
- Chặn các điều kiện lỗi tự động qua UI Smart Filtering (chọn trùng người, chọn người đang nghỉ phép Off-duty, hoặc chọn chính Captain).
- Luồng đặt súng ẩn trong tay (Mutiny Vote / Loyalty Check): Tất cả người chơi (kể cả `ACTIVE` và `OFF_DUTY`, kể cả người bị cắt lưỡi, **ngoại trừ Thuyền trưởng hiện tại**) giấu kín lượng súng muốn dùng và cùng lật mở công khai.
- Thuật toán tính tổng súng theo quy mô số người chơi để xác định bạo loạn thành công (Ngưỡng 5-7 người $\ge 3$, 8-9 người $\ge 4$, 10-11 người $\ge 5$).
- Tự động chuyển quyền Thuyền trưởng cho người nộp súng cao nhất hợp lệ nếu bạo loạn thành công, xử lý luồng hòa (Tie-breaker). **Tuyệt đối không chọn người đang bị cắt lưỡi (`speech_restricted == true`) làm Captain**.
- Khấu trừ súng công khai trên bàn: Trừ đúng số súng của những người tham gia biểu quyết nếu bạo loạn thành công; trả lại súng nếu thất bại.

## Out of Scope
- Quá trình Ban điều hướng bốc thẻ và chọn đường đi (Thuộc `BR-003: Navigation & Card Effects`).
- Tác động của các chức năng bản đồ (Cabin Search, Flogging...) (Thuộc không gian khác).

## Related Use Cases


## Constraints
- **Technical:** Phải sử dụng WebSocket để đồng bộ sự kiện theo thời gian thực.
- **Rule Constraints:** Tuân thủ tuyệt đối quy tắc bất biến 3.3 và 3.4 trong tài liệu `game-mechanics-v1.md`.
- **Timeout & Auto-resolve:** 
  - Bước Đặt súng (Mutiny Vote): Thời gian đếm ngược tối đa là 1 phút 30 giây (90s). Nếu người chơi treo máy không xác nhận, hệ thống tự động chốt là người đó nộp 0 súng.
  - Bước Xử lý hòa (Tie-breaker): Khi bạo loạn thành công mà có nhiều người nộp lượng súng cao nhất bằng nhau, Thuyền trưởng có 2 phút (120s) để quyết định. Hết giờ, hệ thống tự động chọn ngẫu nhiên 1 người trong nhóm hòa nhau làm Thuyền trưởng mới.

## Open Questions
*(Đã giải quyết hết các câu hỏi mở).*

## History
- v1 (2026-07-01, AI): initial structured
