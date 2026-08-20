# UC-019: Động cơ tự động phản hồi sự kiện của Bot (Bot Auto-Responder Engine)

## Metadata
- **ID:** UC-019
- **Bounded Context:** Testing / Sandbox
- **Liên quan tới BR:** BR-006
- **Status:** draft
- **Owner:** Developer / QA Team
- **Last updated:** 2026-08-20

## Actor
- Động cơ phản hồi tự động (Bot Auto-Responder Engine) tích hợp trong mỗi Bot client.
- Máy chủ WebSocket backend.

## Trigger
- Máy chủ backend phát ra các sự kiện yêu cầu người chơi hành động hoặc biểu quyết theo diễn biến của Game State Machine.
- Ví dụ: `REQUIRE_VOTE` (Bỏ phiếu Nổi loạn/Mutiny), `REQUIRE_TEAM_APPOINTMENT` (Thuyền trưởng bổ nhiệm Thuyền phó/Hoa tiêu), `REQUIRE_CARD_DISCARD` (Thuyền trưởng/Thuyền phó/Hoa tiêu rút/chọn thẻ điều hướng), `REQUIRE_ROLE_ACTION` (Nghi thức Cult, Khám xét Cabin...).

## Preconditions
- Bot đã kết nối thành công vào phòng chơi và ván game đang ở trạng thái `IN_GAME`.
- Chế độ tự động phản hồi (Auto-Responder) của Bot đang ở trạng thái kích hoạt (`autoMode: true`).

## Main Flow
1. Server phát ra một sự kiện yêu cầu hành động kèm danh sách ứng viên hoặc các lựa chọn hợp lệ (`options`).
2. Bot lắng nghe sự kiện, đối chiếu định danh `playerId` của mình để xác định xem bản thân có phải là người cần thực hiện hành động này hay không.
3. Nếu Bot là đối tượng cần phản hồi:
   - Bot tạo ra một khoảng trễ tự nhiên (Random delay từ 500ms đến 1500ms) để mô phỏng thời gian suy nghĩ, tránh phản hồi 0ms gây nghẽn socket hoặc lỗi race condition.
   - Bot tự động chọn một hành động hợp lệ từ danh sách các lựa chọn được Server cho phép (ví dụ: Chọn ngẫu nhiên nộp 0, 1 hoặc 2 súng trong lượt bỏ phiếu Mutiny; Chọn ngẫu nhiên 1 người làm Thuyền phó).
4. Bot phát sự kiện phản hồi tương ứng về Server với payload hợp lệ.
5. Server ghi nhận hành động của Bot và tiếp tục tiến trình game mà không bị gián đoạn hay kẹt trạng thái (Deadlock).
6. Script in log ra terminal theo định dạng: `[Auto-Responder] [Bot_X] Phản hồi <EVENT_NAME> với dữ liệu: <PAYLOAD>`.

## Alternative Flows
- **3a. Bot bị tắt Auto-Mode (Chuyển sang chế độ Manual Override):** Nếu Tester đã chỉ định điều khiển thủ công cho Bot này qua UC-020, Bot sẽ bỏ qua việc tự động phản hồi và chờ lệnh từ CLI.

## Exceptions
- **E1. Payload không hợp lệ theo luật:** Nếu Server từ chối payload của bot (ví dụ: nộp nhiều súng hơn số súng bot đang có) -> Bot tự động bắt lỗi từ callback/event error, điều chỉnh lại giá trị fallback tối thiểu an toàn (ví dụ: nộp 0 súng) và gửi lại 1 lần duy nhất.

## Postconditions
- Mọi giai đoạn yêu cầu tương tác đều nhận đủ phản hồi từ tất cả các Bot tham gia.
- Ván game tự động chuyển tiếp qua các phase mượt mà.

## State Synchronization (Đồng bộ trạng thái)
- **Supported Action Events (Client -> Server):**
  - Bỏ phiếu Mutiny: `submit_vote` với `{ guns: number }`
  - Bổ nhiệm nhân sự: `appoint_crew` với `{ lieutenantId: string, navigatorId: string }`
  - Điều hướng: `select_navigation_card` với `{ cardId: string }`
  - Nhận diện ban đêm: Tự động ghi nhận `PIRATES_GATHERING` mà không làm nghẽn luồng.

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- **Trường hợp Server gửi liên tiếp nhiều sự kiện:** Bot sử dụng hàng đợi xử lý sự kiện (Queue) để phản hồi tuần tự theo đúng thứ tự thời gian, không gửi đè các gói tin cùng một lúc.

## Acceptance Criteria (Tầng 4)
### AC-1: Tự động hoàn thành biểu quyết Nổi loạn (Mutiny Voting)
- **Given:** Một phòng chơi gồm 1 người thật và 4 bots đang ở giai đoạn `MUTINY_VOTING`.
- **When:** Server phát sự kiện yêu cầu bỏ phiếu.
- **Then:** Cả 4 bots tự động gửi quyết định bỏ phiếu hợp lệ (số súng từ 0 đến số súng hiện có) trong vòng 2 giây.
- **And:** Server tổng hợp kết quả bỏ phiếu thành công mà không bị treo ván đấu.

### AC-2: Tự động xử lý khi Bot được chỉ định làm Thuyền trưởng / Hoa tiêu
- **Given:** Một Bot ngẫu nhiên được chọn làm Thuyền trưởng (Captain) hoặc Hoa tiêu (Navigator).
- **When:** Đến lượt Bot phải chọn Thuyền phó hoặc chọn hướng tàu.
- **Then:** Bot tự động lựa chọn ngẫu nhiên từ danh sách hợp lệ và gửi về Server.
- **And:** Tiến trình chuyển sang bước tiếp theo của hải trình.

## Dependencies
- **Upstream UC:** UC-018 (Bot Lifecycle & Sandbox Connection).
- **Downstream UC:** UC-020 (Bot CLI Override Controller).
- **External Systems:** Game State Machine của Backend.

## Notes
- Các lựa chọn của Bot ở UC này chỉ mang tính ngẫu nhiên hợp lệ để phục vụ thông luồng test, không áp dụng AI phán đoán.

## History
- v1 (2026-08-20, AI): initial đặc tả use case UC-019 cho BR-006.
