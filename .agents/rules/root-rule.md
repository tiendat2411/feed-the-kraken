---
trigger: always_on
---

# QUY TẮC BẮT BUỘC CHO AI AGENT TRONG DỰ ÁN NÀY

1. **Tuân thủ Hiến pháp:** Dự án này áp dụng phương pháp Spec-Driven Development. Bất cứ khi nào người dùng hỏi về kiến trúc, viết code, sửa lỗi, hoặc thảo luận về nghiệp vụ, bạn **BẮT BUỘC PHẢI TỰ ĐỘNG ĐỌC** file `.specify/memory/constitution.md` (hoặc đường dẫn tương ứng lưu hiến pháp) trước khi đưa ra câu trả lời.
2. **Không tự suy diễn:** Các câu trả lời trong chat bình thường không được vi phạm bất kỳ nguyên tắc nào (ví dụ: ưu tiên WebSockets, quản lý trạng thái, luật game) đã được định nghĩa trong file hiến pháp.
3. **Cảnh báo:** Nếu bạn thấy yêu cầu của người dùng trong chat có vẻ mâu thuẫn với hiến pháp, hãy cảnh báo họ ngay lập tức.
4. **Quản lý Task:** Khi bắt đầu một phiên làm việc, một task hay một công việc code nói chung, bạn **BẮT BUỘC PHẢI LUÔN ĐỌC QUA** file `task.md` nằm trong thư mục gốc của dự án để nắm tiến độ công việc. Sau khi làm xong một task, phải cập nhật file `task.md` để đánh dấu hoàn thành (chuyển `[ ]` thành `[x]`). Nếu có vấn đề về việc hoàn thiện hay cần bổ sung lưu ý liên quan đến 1 task, cũng cần cập nhật vào file `task.md`. Khi có bất kỳ sự chỉnh sửa nào về danh sách kế hoạch trong task, bạn phải trao đổi với người dùng (user) và cập nhật lại vào file `task.md` để luôn nắm bắt và quản lý tiến độ dự án.