# Specification: Off-Duty Shift & Win Conditions

## Metadata
- **ID:** BR-005
- **Status:** draft
- **Owner:** Developer
- **Stakeholders:** Developer, Customer

## Background
Sau mỗi vòng điều hướng thành công (tàu thực hiện di chuyển), hệ thống sẽ tiến hành xoay tua người chơi thông qua cơ chế Off-duty. Điều này đảm bảo tính công bằng và tạo cơ hội cho mọi người chơi tham gia vào Ban điều hướng. Song song đó, hệ thống liên tục kiểm tra các điều kiện thắng cuộc để kết thúc trò chơi ngay khi mục tiêu của một phe được hoàn thành.

## Goal
1. Tự động hóa quy trình phân bổ và thu hồi thẻ Off-duty dựa trên quy mô người chơi và kết quả vòng điều hướng.
2. Thiết lập bộ lọc điều kiện thắng cuộc (Victory Conditions) chạy ngầm sau mỗi hành động thay đổi trạng thái game.

## Success Metrics
- **Metric 1:** off_duty_accuracy = 100% (Số lượng người nghỉ phép luôn đúng theo quy mô phòng: 1 người cho 5-6p, 2 người cho 7-8p, 3 người cho 9-11p).
- **Metric 2:** victory_detection_latency < 100ms (Hệ thống phát hiện thắng cuộc ngay khi điều kiện thỏa mãn).
- **Metric 3:** rotation_integrity (Chỉ những người thực hiện điều hướng thành công mới bị Off-duty).

## In Scope
- **Cơ chế Off-Duty (Off-Duty Shift):**
  - **Điều kiện kích hoạt:** Chỉ xảy ra khi một vòng điều hướng kết thúc THÀNH CÔNG (tàu thực hiện di chuyển). Nếu vòng điều hướng bị hủy (do Mutiny thành công) hoặc thất bại (Navigator nhảy tàu mà không có người thay thế), cơ chế Off-duty không kích hoạt cho Ban điều hướng đó.
  - **Công thức phân bổ theo quy mô phòng:**
    - **Phòng 5-6 người:** Chỉ có Hoa tiêu (Navigator) bị `OFF_DUTY`.
    - **Phòng 7-8 người:** Hoa tiêu (Navigator) và Thuyền phó (Lieutenant) bị `OFF_DUTY`.
    - **Phòng 9-11 người:** Thuyền trưởng (Captain), Thuyền phó (Lieutenant) và Hoa tiêu (Navigator) bị `OFF_DUTY`.
  - **Thời gian nghỉ:** Thẻ Off-duty có hiệu lực trong đúng 1 vòng điều hướng kế tiếp.
  - **Quy trình hoán đổi (Rotation Flow):**
    - Bước 1: `CLEAR_OLD`: Thu hồi TOÀN BỘ thẻ Off-duty của vòng trước. Chuyển trạng thái `status` của các player này từ `OFF_DUTY` về `ACTIVE`.
    - Bước 2: `ASSIGN_NEW`: Gán trạng thái `OFF_DUTY` cho những người chơi thuộc Ban điều hướng vừa thực hiện lượt đi thành công (dựa theo công thức ở trên).
- **Điều kiện Thắng cuộc (Win Conditions):**
  - **Sailor Victory:** Tàu di chuyển vào ô thuộc vùng `Bluewater Bay`.
  - **Pirate Victory:** Tàu di chuyển vào ô thuộc vùng `Crimson Cove`.
  - **Cult Victory:**
    - Tàu di chuyển vào ô `Kraken`.
    - `Cult Leader` bị loại khỏi trò chơi (`status == ELIMINATED`) thông qua hành động **Feed the Kraken** (Bị hiến tế). *(Lưu ý: Tự ý nhảy tàu Jump Overboard không kích hoạt thắng cuộc cho phe Cult).*
- **Luồng Kết thúc Game (End Game Flow):**
  - Kích hoạt ngay khi Win Condition thỏa mãn.
  - Ngắt mọi Timer và Event đang chờ (ví dụ: đang chờ Mutiny hoặc chờ chọn bài).
  - Hiển thị bảng tổng kết: Phe thắng, vai trò thực của từng người, các chỉ số chính.

## Out of Scope
- Chi tiết logic bốc bài (BR-003).
- Chi tiết logic Mutiny (BR-002).
- Entity Model chi tiết (Sẽ được viết ở file riêng `BR-005-entity-model.md`).

## Related Use Cases

## Constraints
- **Order of Operations:** Off-duty shift chỉ được thực hiện SAU KHI đã kiểm tra Win Condition và xác định game chưa kết thúc.
- **Success Dependency:** Nếu một Ban điều hướng bị lật đổ bởi Mutiny, họ không bị tính là đã thực hiện nhiệm vụ và không bị Off-duty.
- **Emergency Handling:** Trong trường hợp Navigator nhảy tàu và được thay thế bởi Emergency Navigator:
    - Người được bầu làm **Emergency Navigator** và thực hiện thành công việc di chuyển sẽ bị tính `OFF_DUTY`.
    - Việc **Captain** và **Lieutenant** có bị `OFF_DUTY` hay không vẫn phải tuân thủ nghiêm ngặt theo **quy tắc quy mô phòng (lobby size)**, không được miễn trừ.

## Assumptions
- Trạng thái `OFF_DUTY` ngăn cản người chơi được chọn vào Ban điều hướng ở vòng kế tiếp (đã được định nghĩa trong Smart Filtering ở BR-001/002).
- Mọi thay đổi về `ship_position` hoặc `player.status` đều kích hoạt kiểm tra Win Condition.

## Open Questions
*(Tất cả các câu hỏi đã được giải quyết dựa trên logic game cập nhật).*
