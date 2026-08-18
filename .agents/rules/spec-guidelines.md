---
trigger: always_on
---

# QUY TẮC LÀM VIỆC VỚI TÀI LIỆU ĐẶC TẢ (SPECIFICATIONS)

## 1. Nguyên Tắc Cốt Lõi (Core Principles)
- **Chi tiết & Chuyên nghiệp:** Mọi tài liệu đặc tả (spec) phải được viết với văn phong kỹ thuật, mạch lạc, rõ ràng và không được mơ hồ. Tránh các từ ngữ chung chung không thể đo lường.
- **Phân tách file rõ ràng (Separation of Concerns):** Tuyệt đối KHÔNG được gộp chung nhiều loại tài liệu hoặc nhiều Use Case vào cùng một file duy nhất. Mỗi BR (Business Requirement), mỗi Use Case, mỗi Entity context phải nằm ở một file `.md` riêng biệt để dễ quản lý, theo dõi lịch sử và cô lập sự thay đổi.

## 2. Cấu Trúc 4 Tầng Yêu Cầu (The 4-Tier Structure)
Hệ thống tài liệu phải tuân thủ nghiêm ngặt hệ thống phân cấp từ trên xuống dưới như sau:
1. **Tầng 1 - Business Requirement (BR):** Giải thích "Vì sao làm tính năng này?". Mục tiêu kinh doanh, phạm vi dự án.
2. **Tầng 2 - Use Case (UC):** Giải thích "Ai làm gì với hệ thống?". Các luồng hành vi của người dùng và hệ thống.
3. **Tầng 3 - Entity Model:** Định nghĩa "Các danh từ, khái niệm nào đang được sử dụng?". Mô hình dữ liệu, vòng đời trạng thái của các thực thể.
4. **Tầng 4 - Acceptance Criteria (AC):** Nằm bên trong file Use Case. Trả lời câu hỏi "Làm sao biết code đã hoàn thành và đúng luật?".

---

## 3. Khuôn Mẫu Bắt Buộc (Mandatory Templates)

Khi AI hoặc Developer tạo mới file đặc tả, PHẢI sử dụng chính xác cấu trúc dưới đây.

### 3.1. Template cho Business Requirement (Lưu dạng: `BR-XXX-Tên.md`)
```markdown
# BR-XXX: <Tên business requirement>

## Metadata
- **ID:** BR-XXX
- **Status:** draft | approved | in-progress | done
- **Owner:** <PO/người nghiệp phụ trách vụ>
- **Stakeholders:** <Danh sách>
- **Target Quarter:** <Ví Q3-2026 dụ:>

## Background
<Vì context có doanh, feedback, kinh này: quy requirement sao định...>

## Goal
<Mục - Rõ chung chưa có cốt dùng không lõi metric nếu ràng, tiêu từ>

## Success Metrics
- <Metric 1>: <baseline> -> <target>
- <Metric 2>: <baseline> -> <target>

## In Scope
<Những làm này phạm requirement thứ trong vi>

## Out of Scope
<Những KHÔNG cố làm thứ ý>

## Related Use Cases
- UC-XXX: <Tên>
- UC-YYY: <Tên>

## Constraints
- **Technical:** <Ràng buộc công hệ nghệ, thống>
- **Regulatory:** <Quy bảo lý... mật, pháp định>
- **Timeline:** <Deadline có nếu>

## Open Questions
- [ ] <Câu chưa câu có hỏi lời nghiệp phía trả từ vụ>

## History
- v1 (YYYY-MM-DD, <author>): initial


### 3.2. Template cho Use Case (Lưu dạng: `UC-XXX-Tên.md`)
# UC-XXX: <Tên case gọn nghiệp ngôn ngắn ngữ theo use vụ>

## Metadata
- **ID:** UC-XXX
- **Bounded Context:** <vd: Auth, Room, Matchmaking...>
- **Liên quan tới BR:** BR-YYY
- **Status:** draft | reviewed | implemented | deprecated
- **Owner:** <Người chịu nhiệm trách>
- **Last updated:** YYYY-MM-DD

## Actor
<Ai Admin, Người System, Webhook... chơi, khởi tạo:>

## Trigger
<Hành Case Use hoạt kích nào này động>

## Preconditions
<Điều kiện bắt buộc phải có trước khi luồng chạy>

## Main Flow
1. <Bước 1>
2. <Bước 2>
3. <Bước 3>

## Alternative Flows
- **<N>a. <Tên biến thể>:** <Mô tả>

## Exceptions
- **E1. <Tên exception>:** <Mô + cách hệ lý thống tả xử>

## Postconditions
<Trạng Case Use chạy công của hệ khi sau thành thái thống>

## State Synchronization (Đồng bộ trạng thái)
<BẮT BUỘC VỚI GAME REALTIME: Liệt kê rõ các Event cần phát ra (emit/broadcast) cho những ai khi luồng này thành công>
- **Emit Event:** `<Tên Event, vd: PLAYER_JOINED>`
- **To:** `<Ai nhận? vd: Toàn bộ người trong Room, hoặc Chỉ người vừa join>`
- **Payload:** `<Dữ liệu mang theo là gì?>`

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
<BẮT BUỘC: Mô tả cách hệ thống xử lý khi các tình huống phi tiêu chuẩn xảy ra>
- **Trường hợp F5 / Tải lại trang:** <Hệ thống nhận diện lại user này bằng cách nào? (vd: LocalStorage token)>
- **Trường hợp mất kết nối mạng đột ngột (Socket disconnect):** <Có xóa user ngay không hay cho vào trạng thái 'Reconnecting' trong bao lâu?>

## Acceptance Criteria (Tầng 4)
### AC-1: <Tên gọn ngắn>
- **Given:** <bối cảnh>
- **When:** <hành động xảy ra>
- **Then:** <kết quả mong đợi 1>
- **And:** <kết quả mong đợi bổ sung>

### AC-2: <Tên gọn ngắn>
...

## Dependencies
- **Upstream UC:** <UC phải trước xong>
- **Downstream UC:** <UC UC này phụ thuộc vào>
- **External Systems:** <Hệ bên có ngoài nếu thống>

## Notes
<Context bổ do kiến lý nghiệp quyết sung: trúc, vụ định>

## History
- v1 (YYYY-MM-DD, <author>): initial


### 3.3. Template cho Entity Model (Lưu dạng: `ENT-XXX-Tên.md`)
# ENT-XXX: <Tên Thực Thể (Entity Name)>

## Metadata
- **ID:** ENT-XXX
- **Bounded Context:** <vd: GamePlay, Matchmaking, Identity...>
- **Status:** draft | approved | in-progress | done
- **Owner:** <Người chịu trách nhiệm>
- **Last updated:** YYYY-MM-DD

## 1. Description (Mô tả)
<Mô tả ngắn gọn thực thể này là gì trong bối cảnh của hệ thống/trò chơi. Vai trò của nó là gì?>

## 2. Attributes (Thuộc tính dữ liệu)
Danh sách các trường dữ liệu cốt lõi cấu thành nên thực thể này.

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc (Req) | Ràng buộc/Mặc định (Validation/Default) | Mô tả (Description) |
| :--- | :--- | :---: | :--- | :--- |
| `id` | UUID | Y | Tự động generate | Định danh duy nhất |
| `status` | Enum | Y | Default: `LOBBY` | Trạng thái hiện tại |
| `...` | ... | ... | ... | ... |

## 3. State Lifecycle (Vòng đời trạng thái)
<Mô tả máy trạng thái (State Machine) của thực thể nếu có. Rất quan trọng đối với logic game. Có thể dùng danh sách hoặc Mermaid.js diagram>

- **Trạng thái [A] -> Trạng thái [B]:** <Điều kiện hoặc Hành động kích hoạt (Trigger)>
  - *Ví dụ: `LOBBY` -> `PLAYING`: Khi host bấm start game và đủ số lượng người chơi.*
- **Trạng thái [B] -> Trạng thái [C]:** ...

## 4. Invariants (Ràng buộc bất biến / Domain Rules)
<Các quy tắc logic LUÔN LUÔN ĐÚNG đối với thực thể này, bất kể hoàn cảnh nào. Hệ thống sẽ quăng lỗi (throw exception) nếu vi phạm.>
- *Ví dụ 1: Một `Player` không thể cùng lúc thuộc hai `Faction` khác nhau.*
- *Ví dụ 2: `CabinBoy` (Cậu bé chạy việc) không bao giờ được chọn làm `Navigator` (Hoa tiêu).*

## 5. Relationships (Quan hệ với các Entity khác)
- **1-1 với [ENT-YYY]:** <Mô tả quan hệ>
- **1-N với [ENT-ZZZ]:** <Mô tả quan hệ, ví dụ: 1 Room có nhiều Players>

## 6. Related Use Cases
- Sử dụng trong: [UC-XXX], [UC-YYY]
- Thay đổi bởi: [UC-ZZZ]

## History
- v1 (YYYY-MM-DD, <author>): initial