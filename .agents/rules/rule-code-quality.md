---
trigger: always_on
---

# QUY TẮC QUẢN LÝ CHẤT LƯỢNG MÃ NGUỒN (CODE QUALITY & SPEC ALIGNMENT)

## 1. Nguyên tắc Tiền Thực Thi (Pre-Implementation)
- **Không bao giờ code "mù":** Trước khi bắt tay vào code bất kỳ một Task nào, AI BẮT BUỘC phải tìm và đọc file Use Case (UC) và Entity (ENT) tương ứng.
- **Ánh xạ 1-1:** Nếu Task yêu cầu làm một tính năng, AI phải xác định được tính năng đó phục vụ cho Acceptance Criteria (AC) nào trong file Use Case.
- **Cấm tự biên tự diễn:** AI không được tự ý thêm thắt các luật chơi, tính năng ẩn, hay các luồng rẽ nhánh không có trong Spec. Nếu phát hiện thiếu logic, phải dừng lại và đề xuất cập nhật Spec trước.

## 2. Tiêu chuẩn trong quá trình Code (Implementation Standards)
- **Tách biệt Logic và UI (Separation of Concerns):** Game logic (luật chia phe, tính kết quả vote, điều hướng tàu) phải hoàn toàn tách biệt khỏi UI components và logic Network.
- **Lập trình phòng thủ (Defensive Programming):** Luôn kiểm tra tính hợp lệ của dữ liệu đầu vào dựa trên phần "Invariants" (Ràng buộc bất biến) của các Entity. Ví dụ: Nếu một hàm chuyển trạng thái phòng từ `LOBBY` sang `PLAYING`, phải code đoạn kiểm tra (check) số lượng người chơi có đạt mức tối thiểu chưa, nếu chưa thì `throw Error` ngay lập tức.
- **Không giấu lỗi (No Silent Failures):** Tuyệt đối không dùng các khối `try/catch` rỗng hoặc bỏ qua lỗi (swallow errors) đặc biệt là trong các sự kiện WebSocket. Mọi lỗi vi phạm game logic phải được log rõ ràng.

## 3. QUY TRÌNH TỰ ĐÁNH GIÁ BẮT BUỘC (Self-Review Process)
*Ngay sau khi viết xong code cho một Task và TRƯỚC KHI đề xuất commit, AI BẮT BUỘC phải tự thực hiện quy trình review nội bộ theo các bước sau:*

- **Bước 1 (Soi chiếu AC):** Mở lại file Use Case, đọc từng dòng Acceptance Criteria (Tầng 4). Xác nhận xem code vừa viết đã cover đủ Given-When-Then của AC đó chưa?
- **Bước 2 (Kiểm tra Ngoại lệ):** Code vừa viết đã xử lý các trường hợp rớt mạng (disconnect), tải lại trang (F5), hoặc thao tác trùng lặp (double-click) được định nghĩa trong mục Edge Cases của Spec chưa?
- **Bước 3 (Bảo vệ Invariants):** Code mới có vô tình phá vỡ bất kỳ quy tắc bất biến nào của các Entity liên quan không?
- **Bước 4 (Viết Unit Test - Tùy chọn nhưng khuyến nghị):** Đảm bảo mỗi AC cốt lõi của Game Logic đều có một Unit Test tương ứng để chứng minh code chạy đúng luật.

## 4. Hành động đầu ra (Output Action)
Sau khi hoàn thành tự review, AI phải báo cáo ngắn gọn kết quả cho người dùng theo format:
> **✅ Tự đánh giá Code (Self-Review Report):**
> - Code đã đối chiếu khớp với: `[Tên AC / Tên Use Case]`
> - Edge cases đã xử lý: `[Liệt kê ngắn gọn, vd: Đã chặn user vote 2 lần]`
> - Trạng thái: Sẵn sàng để test / Sẵn sàng commit.