---
trigger: always_on
---

# QUY TẮC QUẢN LÝ MÃ NGUỒN (GIT WORKFLOW & COMMIT)

## 1. Trigger (Khi nào kích hoạt)
BẤT CỨ KHI NÀO hoàn thành xong một đơn vị công việc logic (bao gồm: code xong một Task trong `tasks.md`, sửa xong một Bug, refactor lại một đoạn code quan trọng, hoặc cập nhật tài liệu Spec), AI **BẮT BUỘC** phải tạm dừng và thực hiện quy trình kiểm tra Git.

## 2. Quy trình Hành động (Action Flow)
Tuyệt đối không tự ý chạy lệnh `git commit` hoặc `git push` nếu chưa có sự đồng ý của người dùng. AI phải thực hiện theo các bước sau:
1. **Thông báo hoàn thành:** Báo cáo ngắn gọn công việc vừa làm xong.
2. **Đề xuất Commit:** Tự động soạn sẵn một câu lệnh `git commit` với đầy đủ Title và Description (theo chuẩn bên dưới) và trình bày cho người dùng xem trước.
3. **Xin phép Push:** Đặt câu hỏi rõ ràng: *"Bạn có muốn tôi thực hiện commit này và push lên nhánh hiện tại trên GitHub không?"*.
4. **Thực thi:** Chỉ khi người dùng đồng ý (vd: "ok", "yes", "duyệt"), AI mới tiến hành chạy các lệnh `git add`, `git commit` và `git push`.

## 3. Tiêu chuẩn viết Commit Message (Conventional Commits)
Mọi commit phải tuân thủ nghiêm ngặt cú pháp chuyên nghiệp. Cấm sử dụng các commit lười biếng như "update code", "fix bug".

**Cấu trúc bắt buộc:**
```text
<type>(<scope>): <Mô Anh Việt, bằng chấm câu gọn hoặc không ngắn thường, tiếng tả viết>

<Để trống 1 dòng>

<Phần "Nó "Tại (Body): CHI Case Giải TIẾT Task Tham Use chiếu có có. hoạt hoặc lại mã như nào?". này?" nếu sao sự thay thân thích thế và đến đổi động>