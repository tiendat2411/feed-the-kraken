# UC-015: Nghi thức Giáo phái (Cult Uprising)

## Metadata
- **ID:** UC-015
- **Bounded Context:** GamePlay, Execution, Cult
- **Liên quan tới BR:** BR-004
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-17

## Actor
- Giáo chủ (Cult Leader)
- Hệ thống (System)

## Trigger
- Lá bài Điều hướng đang xử lý có thẻ Action là `CULT_UPRISING`.

## Preconditions
- Mảng `cult_ritual_deck` trong `MapBoard` không rỗng (length > 0). (Nếu đã xài hết 5 lá từ trước, sự kiện tự động bỏ qua).

## Main Flow
1. **Lật mở Nghi thức:** Giao diện hiển thị các lá bài trong `cult_ritual_deck` đang úp. Thuyền trưởng (Captain) chọn lật mở 1 lá bài ngẫu nhiên (Timeout 60s, hết giờ tự động random).
2. Hệ thống xóa lá bài đó khỏi `cult_ritual_deck` và công bố công khai hiệu ứng của lá bài (Guns Stash, Cult Cabin Search, hoặc Conversion) cho toàn bộ phòng cùng biết.
3. **Mù toàn cục (Blind Phase):** Sau khi công bố xong, hệ thống chuyển giao diện của TẤT CẢ người chơi sang màn hình nhắm mắt hoặc che giấu. Mọi thao tác chat/mic bị khóa.
4. Hệ thống chỉ cho phép duy nhất màn hình của Giáo chủ (`CULT_LEADER`) được mở mắt.
5. **Giáo chủ thực thi dựa theo thẻ đã lật mở:**
   - **`Guns Stash` (Phát súng):** Giao diện hiển thị danh sách toàn phòng. Cult Leader có quyền cấp tổng cộng 3 khẩu súng cho bất kỳ ai (kể cả chính mình, có thể dồn 3 súng cho 1 người). Sau khi xác nhận (Timeout 60s), súng lập tức được cộng ẩn.
   - **`Cult Cabin Search` (Soi phe Ban điều hướng):** Hệ thống tự động trích xuất phe thật (`faction`) của bộ ba: Captain, Lieutenant, và Navigator hiện tại. Dữ liệu này gửi lên màn hình Cult Leader trong 30 giây để họ nhìn lén.
   - **`Conversion` (Thu nạp giáo đồ):** 
     - Giao diện hiện danh sách những người thỏa mãn cờ `is_convertible == true`. (Bị ẩn Cult Leader và những người từng bị Cabin Search/Flogging).
     - Cult Leader chọn 1 mục tiêu thu nạp (Timeout 60s, hết giờ tự động random).
     - Người bị chọn bị hệ thống ghi đè `faction = CULTIST`.
     - Hệ thống gửi bí mật một thông báo mật `CULTIST_CONVERTED` cho **RIÊNG** màn hình của người bị chọn (Nạn nhân), KÈM THEO danh tính của Giáo chủ (Cult Leader). (Lưu ý: Nạn nhân KHÔNG được biết những Cultist khác là ai, và các Cultist cũ cũng KHÔNG được hệ thống thông báo về người vừa được thu nạp).
6. Khi Cult Leader hoàn tất hành động, hệ thống kết thúc phase mù toàn cục, giao diện toàn phòng sáng trở lại.
7. Kết thúc vòng (chuyển sang BR-005).

## Alternative Flows
- Không có.

## Exceptions
- **E1. Cult Leader rớt mạng (Offline) trong phase mù:** ĐÂY LÀ ĐIỂM CHẾT BẢO MẬT. Nếu hệ thống tự động chơi random sau 60s trong lúc màn đen kéo dài bất thường, người chơi sẽ phát hiện ra ai đang rớt mạng chính là Cult Leader. DO ĐÓ, luật Game Pace ép buộc trò chơi phải dừng đóng băng hoàn toàn chờ Cult Leader reconnect (hoặc Host giải tán phòng).

## Postconditions
- 1 thẻ bài nghi thức bị tiêu hao.
- Súng, phe phái hoặc tình báo của phe Cult được cập nhật âm thầm.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `CULT_RITUAL_REVEALED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ card_action }` (Công khai loại nghi thức để mọi người cùng biết).

- **Emit Event:** `CULT_UPRISING_STARTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{}` (Dùng để kích hoạt màn hình đen).

- **Emit Event:** `CULTIST_CONVERTED`
- **To:** Chỉ Client của Nạn nhân.
- **Payload:** `{ message: "You are now a Cultist", cult_leader_id: "uuid-of-leader" }` (Tuyệt đối không nhúng event này vào payload chung broadcast ra cả phòng).

- **Emit Event:** `CULT_UPRISING_ENDED`
- **To:** Toàn bộ phòng.
- **Payload:** `{}` (Tắt màn đen. Nếu là event phát súng, gửi kèm danh sách súng update của mọi người. Người chơi chỉ thấy súng trên bàn thay đổi mà không biết ai làm).

## Acceptance Criteria (Tầng 4)
### AC-1: Chống lộ danh tính Cult Leader (Anti-Sniffing)
- **Given:** Game ở trạng thái CULT_UPRISING.
- **When:** Hệ thống gửi lá bài và menu điều khiển cho Cult Leader.
- **Then:** Các Client khác (Sailor/Pirate) chỉ nhận gói tin `CULT_UPRISING_STARTED` và KHÔNG có bất kỳ ID, hint, hay data payload nào chứa socket/id của Cult Leader gửi xuống máy họ.

### AC-2: Cập nhật súng ẩn danh
- **Given:** CULT_UPRISING là thẻ Guns Stash. Cult Leader cấp 3 súng cho A.
- **When:** CULT_UPRISING kết thúc.
- **Then:** Toàn phòng nhận event update súng bình thường, A có thêm 3 súng, màn hình không có bất cứ dấu hiệu nào chỉ điểm Cult Leader là người thao tác.

### AC-3: Thông tin thu nạp một chiều
- **Given:** Cult Leader là A. B và C đã là Cultist. A vừa thu nạp thêm D.
- **When:** Hệ thống gửi thông báo `CULTIST_CONVERTED` cho D.
- **Then:** Payload của D có chứa ID của A. B và C tuyệt đối không nhận được gói tin nào báo D gia nhập. D cũng không nhận được ID của B và C trong gói tin.

## Dependencies
- **Upstream UC:** UC-014
- **Downstream UC:** BR-005.

## History
- v1 (2026-08-17, AI): initial
