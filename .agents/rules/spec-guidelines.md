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

## 3. Khuôn Mẫu Chuẩn (Standard Templates)

Khi tạo mới file đặc tả, PHẢI tuân thủ cấu trúc chuẩn sau:

### 3.1 Template Business Requirement (`BR-XXX-Tên.md`)
```markdown
# BR-XXX: <Tên Business Requirement>

## Metadata
- **ID:** BR-XXX
- **Status:** draft | approved | in-progress | done
- **Owner:** <Người phụ trách nghiệp vụ>
- **Target:** <Mục tiêu phát hành / Milestone>

## Background & Goal
- **Bối cảnh:** <Lý do nghiệp vụ, phản hồi người dùng hoặc quy định thúc đẩy yêu cầu này>
- **Mục tiêu cốt lõi:** <Kết quả định lượng hoặc định tính cần đạt được>

## Scope & Constraints
- **In Scope:** <Những phần nằm trong phạm vi thực hiện>
- **Out of Scope:** <Những phần cố ý không làm hoặc để giai đoạn sau>
- **Constraints:** <Ràng buộc kỹ thuật, thời gian, quy định>

## Related Use Cases
- UC-XXX: <Tên Use Case 1>
- UC-YYY: <Tên Use Case 2>
```

### 3.2 Template Use Case (`UC-XXX-Tên.md`)
```markdown
# UC-XXX: <Tên Use Case>

## Metadata
- **ID:** UC-XXX
- **Bounded Context:** <vd: Auth, Room, Matchmaking, GamePlay...>
- **Liên quan tới BR:** BR-YYY
- **Status:** draft | reviewed | implemented | deprecated

## Context & Flow
- **Actor:** <Người chơi, Host, System, Webhook...>
- **Trigger:** <Hành động kích hoạt Use Case>
- **Preconditions:** <Điều kiện tiên quyết>
- **Main Flow:**
  1. <Bước 1>
  2. <Bước 2>
  3. <Bước 3>
- **Alternative / Exception Flows:**
  - E1: <Lỗi hoặc ngoại lệ + cách xử lý>
- **Postconditions:** <Trạng thái hệ thống sau khi hoàn thành>

## Realtime & Network Resilience (Bắt buộc cho Game Realtime)
- **State Synchronization:** Emit event gì, gửi cho ai, mang payload gì?
- **Disconnect / F5 Handling:** Cách hệ thống khôi phục session người chơi khi rớt mạng hoặc reload trang.

## Acceptance Criteria (Tầng 4)
### AC-1: <Tên tiêu chí>
- **Given:** <Bối cảnh ban đầu>
- **When:** <Hành động xảy ra>
- **Then:** <Kết quả mong đợi>
```

### 3.3 Template Entity Model (`ENT-XXX-Tên.md`)
```markdown
# ENT-XXX: <Tên Thực Thể>

## Metadata
- **ID:** ENT-XXX
- **Bounded Context:** <vd: GamePlay, Matchmaking...>
- **Status:** draft | approved | in-progress | done

## 1. Description & Attributes
<Mô tả ngắn gọn vai trò của thực thể>

| Field | Type | Required | Default / Validation | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | UUID/String | Y | Auto-generated | Định danh duy nhất |
| `status` | Enum | Y | Default state | Trạng thái vòng đời |

## 2. State Lifecycle & Invariants
- **Vòng đời trạng thái:** `STATE_A` ➔ `STATE_B` (Trigger / Điều kiện).
- **Ràng buộc bất biến (Invariants):** Các quy tắc nghiệp vụ LUÔN LUÔN ĐÚNG, nếu vi phạm sẽ throw exception ngay lập tức (vd: Một người chơi không thể thuộc 2 phe cùng lúc).

## 3. Relationships & Related Use Cases
- Quan hệ với các Entity khác (1-1, 1-N).
- Danh sách Use Cases đọc hoặc sửa đổi Entity này.
```