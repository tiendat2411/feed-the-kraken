# UC-022: Linh kiện Thẻ bài Tương tác & Bảng Bỏ phiếu Lái tàu (Interactive Cards & Navigation Mutiny Boards)

## Metadata
- **ID:** UC-022
- **Bounded Context:** Presentation / GameComponents
- **Liên quan tới BR:** 007-frontend-ui-revamp
- **Status:** approved
- **Owner:** Frontend Team
- **Last updated:** 2026-08-27

## Actor
Người chơi (Player), Thuyền trưởng (Captain), Thuyền phó (Lieutenant), Hoa tiêu (Navigator), Giáo chủ (Cult Leader).

## Trigger
Ván game chuyển sang các phase: Chia vai (Role Reveal), Bỏ phiếu Nổi loạn (Mutiny), Lái tàu (Navigation), hoặc Nghi thức Tà giáo (Cult Uprising).

## Preconditions
Người chơi đang ở trong phòng chơi có trạng thái `PLAYING`.

## Main Flow
1. **Linh kiện Thẻ vai trò (Role Card) & Màn che ban đêm (Night Overlay):**
   - Khi ở phase `ROLE_REVEAL`, hiển thị thẻ vai trò kích thước chuẩn với hoa văn mặt sau.
   - Người chơi click vào thẻ để kích hoạt hiệu ứng xoay lật 3D 180 độ, mở ra thông tin phe phái, biểu tượng và mục tiêu chiến thắng.
   - Trong phase `PIRATES_GATHERING` hoặc `CULT_UPRISING_BLIND`, người chơi không thuộc đối tượng mở mắt sẽ nhìn thấy màn che bóng đêm phủ toàn màn hình kèm hiệu ứng đôi mắt/xúc tu Kraken phát quang và đồng hồ đếm ngược.
2. **Bảng Bỏ phiếu Nổi loạn (Mutiny Board):**
   - Người chơi thao tác chọn số súng muốn cược bằng các biểu tượng súng/đồng xu trực quan.
   - Sau khi bấm xác nhận, số súng được khóa vào hộp cược bí mật.
   - Khi hết giờ hoặc tất cả đã vote, kết quả hiển thị với hiệu ứng tia lửa/khói súng, xếp hạng súng của từng ứng viên và chỉ định rõ Thuyền trưởng mới hoặc Thuyền trưởng đương nhiệm tiếp tục nắm quyền.
3. **Khay Lái tàu (Navigation Cards Tray):**
   - Hiển thị các lá bài điều hướng với 3 tông màu rõ rệt (Xanh Hải quân, Đỏ Hải tặc, Vàng Tà giáo).
   - Thuyền trưởng chọn giữ 2 lá loại 1 lá, Thuyền phó chọn giữ 1 lá loại 1 lá, Hoa tiêu chọn đi hoặc nhảy tàu với các thao tác bấm chọn trực quan, có viền phát sáng khi chọn bài.

## Alternative Flows
- **3a. Hoa tiêu chọn Nhảy tàu (Jump Overboard):** Nút nhảy tàu hiển thị cảnh báo với biểu tượng đầu lâu/sóng nước biển sâu, sau khi xác nhận hiển thị trạng thái trôi dạt trên biển.

## Exceptions
- **E1. Thao tác quá nhanh hoặc mạng lag:** Nút bấm bị vô hiệu hóa ngay sau khi nhấn để tránh gửi đúp lệnh lên server.

## Postconditions
Người chơi hoàn thành thao tác tương tác thẻ bài hoặc bỏ phiếu một cách dễ dàng và mượt mà.

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** Phát các event nghiệp vụ tương ứng (`submit_mutiny_vote`, `captain_select_card`, v.v.).
- **To:** Server / Socket.
- **Payload:** Payload tương ứng của từng hành động.

## Acceptance Criteria (Tầng 4)
### AC-1: Hiệu ứng Lật Thẻ 3D và Màn Che Bí Mật
- **Given** người chơi nhận thẻ vai trò bí mật,
- **When** người chơi bấm vào thẻ,
- **Then** thẻ xoay lật mượt mà 3D, hiển thị màu sắc và con dấu phe phái rõ nét; khi đến lượt nhắm mắt, màn che sương mù bóng đêm xuất hiện che kín nội dung ván đấu.

### AC-2: Trực quan hóa Bỏ Phiếu và Rút Bài Điều Hướng
- **Given** người chơi tham gia bỏ phiếu Nổi loạn hoặc rút bài lái tàu,
- **When** chọn số súng hoặc chọn lá bài,
- **Then** các linh kiện phản hồi tức thì với viền sáng, hiệu ứng âm thanh/hình ảnh khói súng khi công bố kết quả và khay bài rút thể hiện rõ 3 màu sắc phe phái.

## Dependencies
- **Upstream UC:** UC-021
- **Downstream UC:** UC-023

## History
- v1 (2026-08-27, AI): initial đặc tả use case UC-022.
