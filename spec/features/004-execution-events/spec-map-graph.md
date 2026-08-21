# SPEC: Hexagonal Map Graph & Coordinate Architecture (Bản Đồ Lục Giác)

## 1. Metadata
- **Feature:** BR-004 - Map & Execution Events
- **Related Entities:** ENT-005 (MapBoard), ENT-001 (Room)
- **Related Use Cases:** UC-012 (Ship Movement), UC-013 (Map Actions), UC-014 (Card Effects), UC-015 (Cult Uprising)
- **Status:** approved
- **Last Updated:** 2026-08-21
- **Source Reference:** [quick-journey.jpeg](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/document/map/quick-journey.jpeg), [long-journey.jpeg](file:///d:/PersonaPropjects/Feed%20The%20Kurumeo/feed-the-kraken/document/map/long-journey.jpeg)

---

## 2. Hexagonal Grid Geometry & Coordinate System (Hình học Bản đồ)

### 2.1. Cấu trúc Hình học
Bản đồ Feed the Kraken sử dụng lưới **Pointy-topped Hexagon (Lục giác đỉnh nhọn hướng lên ⬡)**:
- **Trục tung (Y):** Tàu xuất phát từ đáy dưới cùng (`Y = 0`, Vịnh Crab Island) và di chuyển dần lên phía Bắc theo các tầng/hàng (Rows).
- **Trục hoành (X):** Hướng Tây (trái) là sào huyệt **Crimson Cove**, Hướng Đông (phải) là vịnh **Bluewater Bay**.

```
             [ KRAKEN_NEST (Cult) ]
                   ▲ (YELLOW)
      (RED) ◄      |      ► (BLUE)
 [CRIMSON_COVE]    |    [BLUEWATER_BAY]
 (Pirate Win)      |      (Sailor Win)
                   ▲
              [ Row N... ]
                   ▲
              [ Row 1... ]
                   ▲
            [ START (Crab) ]
```

### 2.2. Quy tắc Điều hướng 3 Hướng (3 Outgoing Directions)
Mỗi ô lục giác (Node) có tối đa 3 hướng chuyển dịch tương ứng với 3 màu hải đồ:
1. 🔴 **`RED` (Phe Hải Tặc / Pirate):** Di chuyển chéo lên phía **Tây Bắc (Upper-Left)** $\rightarrow$ Men theo bờ Tây hướng về **Crimson Cove**.
2. 🟡 **`YELLOW` (Phe Tà Giáo / Cultist):** Di chuyển thẳng lên phía **Bắc (Upper-Center)** $\rightarrow$ Hướng vào tâm bão **Kraken's Nest**.
3. 🔵 **`BLUE` (Phe Thủy Thủ / Sailor):** Di chuyển chéo lên phía **Đông Bắc (Upper-Right)** $\rightarrow$ Men theo bờ Đông hướng về **Bluewater Bay**.

---

## 3. Map Node Schema (Cấu trúc Dữ liệu Nút Bản đồ JSON)

Mỗi Node trên bản đồ được biểu diễn bằng một Object chuẩn với schema sau:

```typescript
interface MapNode {
  id: string;              // Định danh duy nhất (vd: 'START', 'Q_R1_C1', 'CRIMSON_COVE')
  name: string;            // Tên tiếng Việt hiển thị trên UI
  row: number;             // Thứ tự hàng từ dưới lên (0 = START)
  col: number;             // Thứ tự cột từ trái sang phải
  x: number;               // Tọa độ SVG X (phần trăm hoặc pixel chuẩn)
  y: number;               // Tọa độ SVG Y (phần trăm hoặc pixel chuẩn)
  mapAction: MapActionType;// 'NONE' | 'CABIN_SEARCH' | 'FLOGGING' | 'OFF_WITH_THE_TONGUE' | 'FEED_THE_KRAKEN'
  victoryZone: VictoryType;// null | 'SAILOR_VICTORY' | 'PIRATE_VICTORY' | 'CULT_VICTORY'
  transitions: {
    RED: string;           // Node ID khi đi theo lá bài Đỏ
    YELLOW: string;        // Node ID khi đi theo lá bài Vàng
    BLUE: string;          // Node ID khi đi theo lá bài Xanh
  };
  crossesSupplyLine?: boolean; // true nếu đường nối này cắt qua Tuyến tiếp tế (Map Long)
}
```

---

## 4. Danh mục Hành động Ô Bản Đồ (Map Actions)

| Ký hiệu Icon | Mã Action | Tên tiếng Việt | Quyền thực hiện | Mô tả chi tiết luật game |
| :---: | :--- | :--- | :---: | :--- |
| 🔍 | `CABIN_SEARCH` | Khám xét Cabin | Captain | Captain bí mật xem phe thật của 1 người (nếu là Cultist đã chuyển phe thì hiện Tentacle 🐙). Gán `is_convertible = false`. |
| 🩸 / 🗡️ | `FLOGGING` | Đánh roi / Tra khảo | Captain | Hệ thống phân tích phe thật của mục tiêu và công khai cho cả phòng 1 câu *"Người này không phải là [Phe X]"*. Gán `is_convertible = false`. |
| 🔒 / 🚫 | `OFF_WITH_THE_TONGUE` | Cắt lưỡi | Captain | Gán `speech_restricted = true`, khóa chat vĩnh viễn và tước quyền trở thành Captain của người bị chọn. |
| 🐙 | `FEED_THE_KRAKEN` | Tế thần Kraken | Captain | Người bị chọn nhận `status = ELIMINATED`, thu hồi toàn bộ súng. **Nếu người này là `CULT_LEADER` $\rightarrow$ Phe Cult lập tức thắng game!** |
| ⚓ | `NONE` | Vùng biển êm đềm | - | Không có hành động ô bản đồ, chuyển thẳng sang Card Actions. |

---

## 5. Quy tắc Ranh giới Tiếp tế (Supply Line Boundary - Long Journey)

- **Vị trí:** Vạch rào xích và 2 khẩu đại bác phân cách giữa tầng biển nông (Row 2-3) và tầng biển sâu (Row 4).
- **Cơ chế kích hoạt:**
  1. Khi tàu thực hiện di chuyển từ Node tầng dưới lên Node tầng trên có cờ `crossesSupplyLine: true`.
  2. Kiểm tra cờ `hasCrossedSupplyLine`:
     - Nếu `false`: Tự động nạp súng cho toàn bộ người chơi `status == ACTIVE` lên mức tối đa là 3 (`gun_count = Math.max(gun_count, 3)`). Bật cờ `hasCrossedSupplyLine = true`.
     - Nếu `true`: Đã từng kích hoạt trước đó $\rightarrow$ Bỏ qua, không nạp thêm.

---

## 6. Giao diện Người Dùng (UI Presentation / Dynamic SVG Engine)

1. **Vector Rendering (SVG):**
   - Dựng lưới lục giác bằng `<polygon>` với tỉ lệ chuẩn, bo góc mượt mà.
   - Các cạnh viền (Edges) giữa các Node hiển thị các mũi tên tam giác định hướng (🔴 Đỏ, 🟡 Vàng, 🔵 Xanh) tương ứng với bản đồ gốc.
   - Icon Action được vẽ chính giữa từng ô với tooltip chú giải khi hover.
2. **Animation Con Tàu Buồm:**
   - Tàu buồm (CSS / Framer Motion) neo đậu tại Node hiện tại (`shipPosition`).
   - Khi có event `SHIP_MOVED`, tàu trôi mượt mà theo đường nối tới Node mới kèm hiệu ứng gợn sóng đại dương.
3. **Modal Tương tác Map Action:**
   - Khi tàu cập bến ô có Action, hệ thống hiển thị Modal nổi bật trên bản đồ cho Captain chọn mục tiêu.
   - Hiển thị thông báo kết quả công khai / riêng tư rõ ràng.
   - Cung cấp nút **"XÁC NHẬN TIẾP TỤC ➡️"** cho Captain để đảm bảo Game Pace thảo luận trước khi chuyển sang Card Actions.

---

## 7. History
- v1 (2026-08-21, AI & User): Thống nhất thiết kế bản đồ lục giác chuẩn hóa từ bản đồ vật lý ngoài đời.
