# BR-004: Thực thi Di chuyển & Hiệu ứng (Map Actions & Card Effects)

## Metadata
- **ID:** BR-004
- **Status:** draft
- **Owner:** Developer
- **Stakeholders:** Developer, Customer

## Background
Sau khi Hoa tiêu (Navigator) lựa chọn được lá bài định hướng, trò chơi sẽ bước vào giai đoạn kịch tính nhất: Thực thi (Execution). Ở giai đoạn này, tàu sẽ tiến lên trên bản đồ, kích hoạt các sự kiện trên bàn cờ, và đặc biệt là giải quyết các kỹ năng bí mật trên thẻ bài. Mọi sai sót trong luồng thực thi này (sai thứ tự hoặc lộ thông tin) đều phá hỏng tính suy luận cốt lõi của game.

## Goal
Xây dựng luồng xử lý tự động và tuần tự tuyệt đối cho các sự kiện xảy ra khi lá bài được đánh xuống. Đồng thời, thiết lập hệ thống mật báo (local intelligence) hoàn hảo cho phe Cultist để đảm bảo tính giấu mặt.

## Success Metrics
- **Metric 1:** execution_ordering = 100% (Mọi tương tác bắt buộc tuân theo thứ tự: Di chuyển -> Hành động Bản đồ -> Hành động Thẻ bài -> Điều kiện kết thúc game).
- **Metric 2:** cultist_secrecy (Cựu Cultist tuyệt đối không nhận được gói tin mạng chứa định danh của Cult Leader và Tân Cultist, ngăn chặn hack/sniff package).
- **Metric 3:** ui_sync (Tất cả màn hình người chơi phải khóa/nhắm mắt đồng bộ trong giai đoạn Cult Uprising để không ai đoán được Cult Leader là ai).

## In Scope
- **Luồng Di chuyển Tàu (Ship Movement):**
  - Tàu thay đổi `ship_position` dựa trên màu lá bài (Đỏ, Xanh, Vàng).
- **Thực thi Hành động Bản đồ (Map Actions):**
  - **Cabin Search:** Captain khám xét 1 người. Nếu người đó là Cultist (do chuyển phe), UI chỉ hiện 1 "vòi bạch tuộc". Nếu là phe nguyên thủy, hiện phe đó. Gán cờ miễn nhiễm.
  - **Flogging:** Captain đánh roi 1 người. Hệ thống công khai tự động token "I am not a...". Gán cờ miễn nhiễm.
  - **Off with the tongue:** Mute vĩnh viễn 1 người. Người này mất vĩnh viễn quyền trở thành Captain trong phần còn lại của trò chơi.
  - **Feed the Kraken:** Loại bỏ hoàn toàn 1 người. Tước toàn bộ súng.
  - **Supply Line:** Sạc súng (Max = 3) cho tất cả mọi người (chỉ ở map Long Journey).
- **Thực thi Hành động Thẻ bài (Card Actions):**
  - **Drunk (Say xỉn):** Captain hiện tại nhường quyền Thuyền trưởng cho người kế tiếp theo chiều kim đồng hồ. Nếu người kế tiếp đang `OFF_DUTY`, họ vẫn giữ `OFF_DUTY` nhưng hoàn toàn được phép nhận chức Captain (vì cờ Off-duty không ảnh hưởng đến Captain).
  - **Armed / Disarmed:** Hoa tiêu (Navigator) đương nhiệm được nhận thêm 1 súng (Armed) hoặc bị mất 1 súng (Disarmed). Hiệu ứng này tác động trực tiếp lên Hoa tiêu, không phải Thuyền trưởng.
  - **Mermaid & Telescope:** Captain ra lệnh (chỉ định) một người chơi khác (bắt buộc không được chọn chính mình) để thực thi hiệu ứng.
    - *Mermaid:* Người được chỉ định sẽ được xem lén **3 lá bài nằm trên đỉnh** của Hộp bài bỏ (`discard_pile`), tuy nhiên 3 lá này sẽ được **hiển thị theo thứ tự ngẫu nhiên** (xáo trộn vị trí) để người xem không biết lá nào vừa mới bị vứt.
    - *Telescope:* Người được chỉ định sẽ được xem lén **lá bài đầu tiên** trên đỉnh Hộp bài rút (`draw_pile`), sau đó có 20 giây để đưa ra quyết định: Giữ nguyên lá bài trên đỉnh, hoặc Hủy vứt lá bài đó sang `discard_pile`.
  - **CULT UPRISING (Nghi thức Giáo phái):**
    - Kiểm tra `cult_ritual_deck` (bộ bài gồm 5 lá: 1 súng, 1 soi phe, 3 thu nạp). Nếu đã bốc hết 5 lá từ các vòng trước, sự kiện tự động hủy bỏ (không kích hoạt thêm trong suốt phần game còn lại).
    - Nếu còn bài, Thuyền trưởng (Captain) bắt buộc phải chọn lật mở ngẫu nhiên 1 lá bài Nghi thức Giáo phái (`Cult Ritual Card`) đang úp trên bàn.
    - Thông tin và hiệu ứng của lá bài này được hệ thống công bố công khai cho cả phòng cùng biết.
    - SAU ĐÓ, tất cả người chơi mới chuyển sang UI "Nhắm mắt". Chỉ duy nhất Giáo chủ (Cult Leader) được hệ thống cho mở mắt để thực hiện hiệu ứng của lá bài vừa lật.
    - (Chi tiết các luồng tham khảo ở UC-015).

## Out of Scope
- Quy trình bốc bài và Nhảy tàu -> **Thuộc BR-003**.
- Quy trình hoán đổi thẻ Off-duty sau khi hoàn tất vòng -> **Thuộc BR-005**.
- Thuật toán tìm đường chi tiết của Graph (Tọa độ X,Y) -> Sẽ nằm ở cấu trúc JSON của Map.

## Related Use Cases

## Constraints
- **Technical (Secrecy Protocol):** Khi Cult Leader chọn người, Backend KHÔNG ĐƯỢC Broadcast toàn phòng. Chỉ gửi riêng payload `cultist_converted` cho socket ID của Cult Leader và socket ID của Victim.

## Open Questions
*(Đã giải quyết dựa trên feedback thiết kế).*

## History
- v1 (2026-07-09, AI): initial structured
