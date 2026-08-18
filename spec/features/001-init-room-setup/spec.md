# BR-001: Init Room & Role Distribution

## Metadata
- **ID:** BR-001
- **Status:** draft
- **Owner:** Developer
- **Stakeholders:** Developer, Customer

## Background
Nhóm bạn đang cần một website online để chơi boardgame Feed the Kraken chung với nhau

## Goal
Cho phép nhóm bạn tạo phòng nhanh và tham gia qua Code/Link chia sẻ và tự động phân chia phe ẩn danh sau khi bắt đầu trận đấu

## Success Metrics
- **Metric 1:** lobby_creation_latency < 2s (đo từ lúc user bấm "Tạo phòng" đến khi sảnh chờ hiển thị thành công, tính ở phân vị p95)
- **Metric 2:** room_ccu_capacity >= 11 (đảm bảo 100% không crash hoặc mất kết nối websocket khi phòng có đủ từ 5 đến 11 người chơi cùng lúc)
- **Metric 3:** match_completion_rate = 100% (Không bị kẹt logic Game State giữa chừng)

## In Scope
- Tạo phòng chơi nhanh (không cần đăng ký tài khoản, chỉ cần nhập tên Nickname)
- Tự động tính toán số lượng role Sailor, Pirate, Cult Leader và Cultist dựa theo số người trong phòng (5-11 bạn chơi) và phân chia map thành Q
- Giai đoạn "Hội tụ bí mật của Hải tặc" (Pirates Secret Gathering): Hiện danh sách Hải tặc bí mật xem với nhau trong 20 giây đầu trận trên màn hình 
- Cấp thẻ Thuyền trưởng (Captain) ngẫu nhiên ban đầu và bàn giao Nhật ký hành trình 

## Out of Scope
- Hệ thống tìm trận công khai (Matchmaking), Đăng nhập bằng Google/Facebook, Bảng xếp hạng, và Hệ thống kỹ năng của 22 nhân vật ẩn (mọi người chơi đều là nhân vật thường, trừ Captain).

## Related Use Cases


## Constraints
- **Technical:** <vd: phải tương thích với hệ thống X>
- **Regulatory:** <vd: tuân thủ GDPR, PCI-DSS>
- **Timeline:** <deadline cứng nếu có>

## Open Questions
- [ ] <Câu hỏi chưa có câu trả lời từ phía nghiệp vụ>

## History
- v1 (2026-06-19, Đoàn Tiến Đạt): initial
- v2 (2026-06-24, AI): Cập nhật UC-012 với cơ chế giữ chỗ khi rớt mạng, quyền đóng phòng của Host và auto-clean 2 giờ.
