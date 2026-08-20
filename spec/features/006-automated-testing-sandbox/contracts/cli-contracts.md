# Contracts: BR-006 Sandbox CLI Commands & Socket Events

## 1. CLI Terminal Commands (User Input Schema)

Khi khởi chạy Sandbox, terminal sẽ mở chế độ interactive prompt: `ftk-sandbox > `. Người dùng có thể gõ các lệnh sau:

### 1.1. `status`
- **Cú pháp:** `status`
- **Mục đích:** Hiển thị bảng Dashboard thông tin toàn bộ các Bot trong phòng.
- **Output mẫu:**
  ```text
  ┌──────┬──────────┬─────────────┬─────────────┬──────┬─────────┬──────────────┐
  │ Bot# │ Nickname │ Socket ID   │ Secret Role │ Guns │ Titles  │ Auto Mode    │
  ├──────┼──────────┼─────────────┼─────────────┼──────┼─────────┼──────────────┤
  │ 1    │ Bot_1    │ x9J2k...    │ PIRATE      │ 3    │ -       │ ON           │
  │ 2    │ Bot_2    │ a8H1m...    │ SAILOR      │ 3    │ CAPTAIN │ ON           │
  │ 3    │ Bot_3    │ p3L9z...    │ CULT_LEADER │ 3    │ -       │ ON           │
  │ 4    │ Bot_4    │ q1W4x...    │ SAILOR      │ 3    │ -       │ ON           │
  └──────┴──────────┴─────────────┴─────────────┴──────┴─────────┴──────────────┘
  Current Room: ABCDEF | Phase: PIRATES_GATHERING | Total Players: 5
  ```

### 1.2. `bot <index> vote <guns>`
- **Cú pháp:** `bot <index> vote <number>` (Ví dụ: `bot 1 vote 2`)
- **Mục đích:** Ép Bot chỉ định bỏ số súng xác định trong giai đoạn Nổi loạn (Mutiny).

### 1.3. `bot <index> appoint <lt_index> <nav_index>`
- **Cú pháp:** `bot <index> appoint <lt_index> <nav_index>` (Ví dụ: `bot 2 appoint 3 4`)
- **Mục đích:** Ép Bot đang làm Thuyền trưởng bổ nhiệm Thuyền phó và Hoa tiêu.

### 1.4. `auto [on|off] [bot_index]`
- **Cú pháp:** 
  - `auto on` / `auto off`: Bật hoặc tắt chế độ tự động cho toàn bộ bots.
  - `auto off 1`: Tắt chế độ tự động riêng cho Bot 1 để điều khiển thủ công.

### 1.5. `help` & `exit`
- `help`: In danh sách các lệnh hỗ trợ.
- `exit`: Rời phòng an toàn và đóng tiến trình Sandbox.

---

## 2. WebSocket Protocol Payloads

### 2.1. Handshake & Join Room
- **Client Auth:** `{ sessionToken: string }`
- **Emit Event:** `join_room`
- **Payload:**
  ```json
  {
    "roomId": "ABCDEF",
    "nickname": "Bot_1",
    "avatar": "🤖"
  }
  ```

### 2.2. Listening Events (Server -> Bot)
- `room_state`: `{ id, status, gamePhase, players, myRole, knownPirates... }`
- `ROLE_ASSIGNED`: `{ role: "SAILOR" | "PIRATE" | "CULT_LEADER" | "CULTIST" }`
- `NIGHT_PHASE_STARTED`: `{ duration: 20, phaseDeadline: number }`
- `DAY_PHASE_STARTED`: `{ captainId: string }`
- `REQUIRE_VOTE`: `{ phase: "MUTINY_VOTING", deadline: number }`
