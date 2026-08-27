# UC-021: Ngôn ngữ Thiết kế Chủ đề & Thanh Chỉ huy HUD (Thematic Design System & Command HUD)

## Metadata
- **ID:** UC-021
- **Bounded Context:** Presentation / GamePlayUI
- **Liên quan tới BR:** 007-frontend-ui-revamp
- **Status:** approved
- **Owner:** Frontend Team
- **Last updated:** 2026-08-27

## Actor
Người chơi (Player), Chủ phòng (Host), Khán giả quan sát.

## Trigger
Người chơi truy cập vào trang web hoặc đang tham gia trong một phòng chơi bất kỳ.

## Preconditions
Ứng dụng frontend đã tải thành công các tài nguyên CSS, Fonts và kết nối Socket.

## Main Flow
1. Hệ thống nạp bảng màu (Design Tokens), hệ thống font chữ Google Fonts (`Cinzel`, `Pirata One`, `Outfit`), và áp dụng giao diện nền đại dương sâu thẳm.
2. Khi người chơi ở trong phòng game (Game View), hệ thống render thanh điều khiển Game Header HUD cố định tại đỉnh trang:
   - Hiển thị Mã phòng (kèm nút copy nhanh).
   - Hiển thị Tên phòng / Vòng chơi hiện tại / Cột mốc Nghi thức Tà giáo.
   - Hiển thị Huy hiệu vai trò cá nhân (nút bật xem lại Thẻ vai trò).
   - Hiển thị Nút mở nhanh Bản đồ toàn cảnh và Nút Cài đặt / Rời phòng.
3. Khu vực sân khấu chính (Main Stage) tự động căn giữa và hiển thị linh kiện tương ứng với phase hiện tại của game.
4. Khu vực Thủy thủ đoàn (Crew Deck) hiển thị trực quan các thẻ thành viên gồm: Tên, Avatar, Huy hiệu chức danh (Captain/Lieutenant/Navigator/Off-duty), Số súng công khai và Trạng thái kết nối.

## Alternative Flows
- **2a. Chế độ Màn hình nhỏ (Mobile/Tablet View):** Thanh HUD tự động co gọn các thông tin ít quan trọng, danh sách Thủy thủ đoàn chuyển sang dạng thanh cuộn ngang hoặc thanh trượt bên hông (Drawer) để tối ưu không gian cho sân khấu chính.

## Exceptions
- **E1. Mạng chậm khiến font chưa tải kịp (Font loading latency):** Hệ thống lập tức sử dụng hệ thống font dự phòng chuẩn (Web-safe serif/sans-serif) và chuyển đổi mượt mà khi font tải xong mà không làm giật bố cục (FOUT prevention).

## Postconditions
Giao diện hiển thị nhất quán, sắc nét, cung cấp đầy đủ thông tin trạng thái ván chơi và đảm bảo mọi nút điều hướng dễ thao tác.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** N/A (Chỉ xử lý đồng bộ giao diện người dùng dựa trên event `room_state`).
- **To:** Client hiện tại.
- **Payload:** State của phòng chơi.

## Edge Cases & Network Resilience
- **Trường hợp F5 / Tải lại trang:** Thanh HUD và sân khấu chính khôi phục vị trí ngay lập tức dựa trên dữ liệu state nhận từ server.
- **Thay đổi kích thước cửa sổ trình duyệt (Window Resize):** Layout tự động tính toán lại kích thước hiển thị mà không bị vỡ bố cục.

## Acceptance Criteria (Tầng 4)
### AC-1: Thiết lập Typography & Theme Tokens
- **Given** người chơi mở bất kỳ trang nào của web,
- **When** trang web hiển thị,
- **Then** các tiêu đề sử dụng font nghệ thuật phong cách cổ điển, nội dung sử dụng font sans-serif dễ đọc, màu nền chủ đạo là sắc đại dương sâu và các panel có hiệu ứng glassmorphism mạ viền sáng.

### AC-2: Cố định và Hiển thị đầy đủ thông tin trên HUD
- **Given** người chơi đang trong một ván game ở bất kỳ phase nào,
- **When** người chơi cuộn trang hoặc thao tác,
- **Then** thanh Header HUD luôn cố định ở trên cùng, hiển thị đúng Round, Game Phase, nút xem Role bí mật và trạng thái kết nối của phòng.

## Dependencies
- **Upstream UC:** N/A
- **Downstream UC:** UC-022, UC-023

## Notes
- Toàn bộ thiết kế phải tối ưu hiệu năng CSS, không dùng các thư viện đồ họa nặng gây tụt FPS trên điện thoại di động.

## History
- v1 (2026-08-27, AI): initial đặc tả use case UC-021.
