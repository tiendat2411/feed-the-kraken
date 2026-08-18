# UC-008: Phân giải Kết quả Nổi loạn (Mutiny Resolution & Tie-breaker)

## Metadata
- **ID:** UC-008
- **Bounded Context:** GamePlay, Mutiny
- **Liên quan tới BR:** BR-002
- **Status:** draft
- **Owner:** Developer
- **Last updated:** 2026-08-14

## Actor
- Hệ thống (System)
- Thuyền trưởng cũ (Captain - trong trường hợp hòa)

## Trigger
- Sau khi UC-007 hoàn tất và các súng được công khai (`MUTINY_REVEALED`).

## Preconditions
- Hệ thống đã thu thập đủ danh sách `votes` của tất cả người tham gia.

## Main Flow (Nổi loạn thất bại)
1. Hệ thống tự động tính tổng số súng biểu quyết (`total_guns`).
2. So sánh với Ngưỡng thành công dựa trên quy mô phòng (5-7 người: $\ge 3$, 8-9: $\ge 4$, 10-11: $\ge 5$).
3. Nếu `total_guns < Ngưỡng`: Nổi loạn thất bại.
4. Không ai bị trừ súng. Ban điều hướng đề xuất (Lieutenant và Navigator) được chính thức nhậm chức.
5. Captain bấm nút "Sang giai đoạn Điều hướng".
6. Chuyển sang tính năng rút bài (BR-003).

## Alternative Flows
- **1a. Nổi loạn thành công (Luồng không hòa):** 
  1. Nếu `total_guns >= Ngưỡng`: Nổi loạn thành công.
  2. NHỮNG NGƯỜI nộp súng > 0 bị trừ số lượng súng tương ứng khỏi kho đồ cá nhân (`gun_count`). (Người nộp 0 súng không bị trừ).
  3. Hệ thống tìm những người nộp NHIỀU SÚNG NHẤT NHƯNG HỢP LỆ (Bỏ qua hoàn toàn những người bị `speech_restricted == true`, dù họ nộp nhiều súng nhất).
  4. Nếu chỉ có duy nhất 1 người cao nhất hợp lệ, người đó lập tức trở thành tân Thuyền trưởng (Captain mới).
  5. Captain mới bấm nút để làm lại luồng UC-006 (Chọn ban điều hướng mới).
  
- **1b. Nổi loạn thành công (Luồng Hòa - Chain Elimination):**
  1. Có từ 2 người hợp lệ trở lên cùng nộp số lượng súng CAO NHẤT BẰNG NHAU (Đã loại trừ người bị cắt lưỡi). 
  2. Kích hoạt chuỗi loại trừ. Thuyền trưởng CŨ (người vừa bị lật đổ) được quyền chọn 1 người trong nhóm hòa để LOẠI khỏi cuộc đua.
  3. Người vừa bị loại đó tiếp tục chọn loại 1 người khác trong nhóm hòa còn lại. 
  4. Quá trình chọn - loại này lặp lại liên tục cho đến khi danh sách hòa chỉ còn 1 người duy nhất.
  5. Người sống sót cuối cùng là tân Thuyền trưởng. (Mỗi lượt chọn loại trừ có 120s timeout cho người đang rớt mạng).

## Exceptions
- **E1. Người có quyền chọn (Tie-breaker) rớt mạng:** Time-out 120s sẽ chạy. Hết 120s, hệ thống chọn NGẪU NHIÊN một người bị loại thay cho họ để luồng game không bị đứng cứng.

## Postconditions
- Xác định được Thuyền trưởng mới (nếu thành công) hoặc giữ nguyên (thất bại).
- `gun_count` của các người chơi được trừ chính xác theo quy tắc game.
- `MutinySession` hoàn tất (`COMPLETED`).

## State Synchronization (Đồng bộ trạng thái)
- **Emit Event:** `MUTINY_RESULT`
- **To:** Toàn bộ phòng.
- **Payload:** `{ is_success, new_captain_id (nếu xong), tie_breaker_list (nếu hòa) }`

- **Emit Event:** `GUNS_DEDUCTED`
- **To:** Toàn bộ phòng.
- **Payload:** `{ deducted_players: [{ player_id, new_gun_count }] }`

## Edge Cases & Network Resilience (Góc khuất & Xử lý rớt mạng)
- **F5 trong lúc Tie-breaker:** UI phải phục hồi đúng lượt ai đang được quyền chọn loại người (`current_chooser`), và danh sách những ứng viên hòa còn sót lại chưa bị loại (`tie_candidates`).

## Acceptance Criteria (Tầng 4)
### AC-1: Trừ súng chính xác theo luật
- **Given:** Nổi loạn thành công (Ngưỡng 3), A nộp 2 súng, B nộp 1 súng, C nộp 0 súng.
- **When:** Hệ thống trừ súng.
- **Then:** Kho súng của A giảm 2, B giảm 1, C giảm 0.

### AC-2: Hoàn súng khi thất bại
- **Given:** Nổi loạn thất bại, C nộp 2 súng.
- **When:** Hệ thống phân giải.
- **Then:** Kho súng của C không hề thay đổi.

### AC-3: Xử lý Hòa liên hoàn đúng người
- **Given:** A, B, C hòa nhau ở vị trí cao nhất.
- **When:** Captain cũ chọn loại A.
- **Then:** Danh sách ứng viên hòa còn B, C. Quyền chuyển sang A. A phải chọn loại B hoặc C.

### AC-4: Người cắt lưỡi không được làm Captain
- **Given:** D bị cắt lưỡi (`speech_restricted = true`) nộp 3 súng, E nộp 2 súng (không bị cắt lưỡi).
- **When:** Nổi loạn thành công.
- **Then:** D bị trừ 3 súng nhưng hệ thống bỏ qua D, E trở thành Thuyền trưởng vì là người hợp lệ có số súng cao nhất.

## Dependencies
- **Upstream UC:** UC-007
- **Downstream UC:** Quay lại UC-006 (thành công) hoặc Tiến tới BR-003 (thất bại).

## Notes
- Tính năng Chain elimination (loại trừ dây chuyền) đòi hỏi giao diện hiển thị lượt rõ ràng để người chơi biết ai đang giữ quyền "Giết" ai.

## History
- v1 (2026-08-14, AI): initial
