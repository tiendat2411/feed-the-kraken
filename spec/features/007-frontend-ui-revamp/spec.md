# Feature Specification: Frontend UI/UX Revamp — "Eldritch Parchment" Art Direction

**Feature Branch**: `007-frontend-ui-revamp`

**Created**: 2026-08-27

**Status**: Approved

**Art Style**: "Eldritch Parchment" — Don't Starve Together × Lovecraftian Sea Horror × Gothic Sketchbook (Chi tiết tại [art-direction-guide.md](./art-direction-guide.md))

**Input**: Nâng cấp toàn diện giao diện frontend với phong cách "Eldritch Nautical Noir" kết hợp Don't Starve Together (Gothic hand-drawn, vintage parchment, ánh lửa vs bóng tối, bề mặt cũ kỹ phong hóa, xanh lá rêu verdigris). Tập trung nhập vai cốt truyện (Immersion/Lore).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Thematic Visual Design System & Atmospheric Art Direction (Priority: P1)

Người chơi khi truy cập vào bất kỳ màn hình nào sẽ cảm nhận ngay bầu không khí khoang tàu buồm cổ ánh nến chập chờn, giấy da dê ố vàng, gỗ mục phong hóa và bóng tối đại dương bao phủ. Giao diện sở hữu bảng màu "Candlelight in the Abyss" (nâu ấm cực hẹp: gỗ sồi sẫm, da thuộc ố, vàng đồng thau gỉ, kèm điểm nhấn xanh lá rêu verdigris), hệ thống font gothic 3 tầng (`Pirata One` → `Cinzel` → `Outfit`), hiệu ứng ánh lửa ấm vs bóng tối lạnh (Warm Firelight vs Cold Darkness), vignette tối viền toàn cục, và chất liệu bề mặt cũ kỹ phong hóa trên mọi panel (texture gỗ mục, giấy da dê nứt, đinh gỉ, vệt rêu xanh).

**Why this priority**: Thiết lập ngôn ngữ thiết kế "Eldritch Parchment" là điều kiện tiên quyết trước khi nâng cấp mọi component.

**Independent Test**: Mở trang Home hoặc Lobby, kiểm tra font chữ gothic, bảng màu nâu ấm, texture gỗ/da dê trên panel, vignette viền tối, và ánh sáng firelight nhất quán trên các độ phân giải khác nhau.

**Acceptance Scenarios**:

1. **Given** người chơi mở trình duyệt vào trang chủ hoặc sảnh chờ, **When** giao diện tải xong, **Then** toàn bộ tiêu đề hiển thị theo `Pirata One` / `Cinzel` gothic, nội dung theo `Outfit`, nền đại dương đen kịt (`--abyss`) với vignette tối viền, panel có texture gỗ mục phong hóa (`--hull-dark`), và mọi bề mặt có chất liệu sần sùi cũ kỹ (KHÔNG glassmorphism).
2. **Given** người chơi hover hoặc tương tác với panel, **When** di chuột hoặc nhấn chọn, **Then** panel phản hồi với viền sáng vàng đồng mờ (`--gold-dim`), ánh lửa ấm firelight glow lan tỏa mềm mại, và chuyển động chậm rãi nặng nề (200-250ms, `ease-out`).

---

### User Story 2 - Modern Game Command Tabletop Environment & Live HUD (Priority: P1)

Trong suốt trận đấu, người chơi trải nghiệm không gian chỉ huy trực quan với kiến trúc phân tầng rõ rệt: Bối cảnh không gian khoang buồng thuyền (`cabin_room_bg.jpg`) bao quát toàn trang tạo chiều sâu; Bàn làm việc Thuyền trưởng (`tabletop_captain_desk.png`) là một container độc lập đặt cân đối ở trung tâm (~80-85% viewport width) với góc nhìn thẳng góc 90° phẳng (Orthographic Flat Lay); Khu vực trung tâm bàn (Central Stage) chiếm diện tích chủ đạo (~70% - 80% mặt bàn), đóng vai trò trung tâm điều khiển xen kẽ tại chỗ giữa Hải đồ (`MapBoardUI.jsx`, mặc định) và khu vực thao tác (`Action Desk Overlay`, mở khi tương tác trigger hoặc đến lượt); Hộc ngăn kéo gầm bàn độc lập (`CrewSeatingDrawer` non-sticky under-drawer) nằm dưới mép đáy bàn làm việc, không cố định che khuất màn hình, trượt mở độc lập khi người chơi cuộn xuống mép bàn để hiển thị vị trí ngồi vòng tròn (Seating Radar) và danh sách thuyền viên (Crew Roster).

**Why this priority**: Bố cục không gian bàn làm việc thực tế tạo immersion đỉnh cao cho ván đấu, giải phóng tầm nhìn thông thoáng cho hải đồ trung tâm và cho phép thao tác nhập vai như đang ở cabin chỉ huy.

**Independent Test**: Trong ván game đang diễn ra, thay đổi kích thước từ Mobile (375px) đến Desktop 4K, xác nhận thanh HUD luôn cố định ở đỉnh, bàn làm việc thu nhỏ cân đối giữa phòng theo góc nhìn 90° phẳng, hải đồ chiếm 70-80% diện tích bàn ở trung tâm, trigger tác chiến mở đè Action Desk tại chỗ, và cuộn xuống mép đáy bàn mới thấy ngăn kéo gầm bàn mở ra Seating Radar & Crew Roster mà không xung đột đồ họa.

**Acceptance Scenarios**:

1. **Given** ván game đang chạy ở bất kỳ phase nào, **When** người chơi nhìn vào màn hình in-game, **Then** nền khoang buồng thuyền bao quát toàn trang, bàn làm việc Thuyền trưởng hiển thị trực quan theo góc nhìn 90° phẳng với Central Stage trung tâm hiển thị Hải đồ hoặc khu vực thao tác trải đè linh hoạt.
2. **Given** người chơi đang ở bàn làm việc phía trên, **When** chưa cuộn trang, **Then** đáy màn hình hoàn toàn thông thoáng không có thanh bar cố định che khuất; **When** cuộn xuống mép đáy bàn và kích hoạt ngăn kéo, **Then** hộc ngăn kéo độc lập trượt mở mượt mà hiển thị Seating Radar và Crew Roster mà không xung đột hay chồng đè đồ họa với mặt bàn.

---

### User Story 3 - Role Cards, 3D Card Flip & Secret Blindfold Overlays (Priority: P2)

Người chơi tương tác với Thẻ vai trò kiểu tarot cổ (da dê tối ố, viền vàng gỉ, xúc tu Kraken vàng ở mặt sau) và Màn che bí mật ban đêm (đen kịt + đôi mắt Kraken tím chập chờn + đếm ngược vòng tròn ember). Hiệu ứng lật thẻ 3D 600ms với ánh lửa hắt lên khi lật.

**Why this priority**: Cơ chế ẩn vai và nhắm mắt là linh hồn Social Deduction; thẻ bài kiểu tarot + night overlay tạo immersion sâu sắc.

**Independent Test**: Tại phase Role Reveal, bấm vào thẻ bài kiểm tra hiệu ứng lật 3D mượt mà, nhận diện rõ màu phe và biểu tượng; tại Night Phase, xác nhận màn che đen kịt phủ kín và đồng hồ đếm ngược hoạt động.

**Acceptance Scenarios**:

1. **Given** người chơi nhận vai trò bí mật, **When** bấm vào mặt sau thẻ bài (da dê tối + xúc tu Kraken vàng), **Then** thẻ lật sang mặt trước 3D perspective (600ms), hiển thị biểu tượng phe, tên vai trò (font `Cinzel`, màu phe), và điều kiện thắng trên nền giấy da dê cổ.
2. **Given** Night Phase (Pirates Gathering / Cult Uprising), **When** người chơi không thuộc nhóm mở mắt, **Then** màn đen kịt phủ toàn bộ, đôi mắt Kraken tím eldritch-pulse chập chờn, đồng hồ đếm ngược vòng tròn ember phát quang.

---

### User Story 4 - Mutiny Bidding & Navigation Command Interface Revamp (Priority: P2)

Người chơi tham gia cơ chế Bỏ phiếu Nổi loạn (Mutiny Bidding) và Lái tàu (Navigation) với phản hồi thị giác xúc giác rõ rệt: giao diện bỏ phiếu cược súng bí mật với hiệu ứng khóa cược an toàn và công bố kết quả kịch tính; khay rút bài điều hướng hiển thị rõ ràng 3 lá bài với nhận diện màu sắc phe phái trực quan, trạng thái chọn và loại bỏ dễ phân biệt.

**Why this priority**: Hai cơ chế lặp đi lặp lại nhiều nhất — nâng cấp UI tạo ảnh hưởng 80% cảm xúc game.

**Independent Test**: Trong vòng Mutiny, chọn số súng kiểm tra hiệu ứng khóa cược; trong Navigation, Thuyền trưởng/Thuyền phó rút bài kiểm tra khay 3 màu và thao tác chọn/loại.

**Acceptance Scenarios**:

1. **Given** phase Bỏ phiếu Nổi loạn, **When** chọn súng và xác nhận, **Then** số súng được chốt bảo mật cho đến khi hoàn tất, kết quả công bố với hiệu ứng rung màn hình và phân định thứ bậc rõ ràng.
2. **Given** rút bài điều hướng, **When** các lá bài xuất hiện, **Then** các thẻ mang sắc thái nhận diện 3 phe trực quan (bột màu cổ phai), dễ dàng thao tác chọn giữ hoặc loại bỏ.

---

### User Story 5 - Interactive Ocean Chart & Dynamic Flagship Piece (Priority: P2)

Bản đồ hải trình hiển thị mạng lưới lộ trình hàng hải cổ điển trên chất liệu giấy da dê cổ, nhận diện rõ ràng 3 vùng cập bến của 3 phe, vị trí con tàu di chuyển mượt mà giữa các ô sự kiện kèm bảng chú thích thông tin trực quan khi tương tác.

**Why this priority**: Bản đồ phản ánh tiến độ + chiến thuật 3 phe; hải đồ cổ tạo immersion.

**Independent Test**: Mở bản đồ bất kỳ thời điểm nào, kiểm tra mạng lưới ô rõ ràng, vị trí tàu phát sáng, popover khi bấm ô.

**Acceptance Scenarios**:

1. **Given** mở MapBoard, **When** quan sát hải trình, **Then** 3 vùng đích có màu sắc và nhận diện đặc trưng, ô sự kiện có biểu tượng rõ nét trên nền hải đồ phong hóa.
2. **Given** tàu di chuyển, **When** tọa độ cập nhật, **Then** con tàu lướt mượt theo lộ trình đến ô đích, ô đến phát sáng kích hoạt sự kiện.

---

### User Story 6 - Cinematic Lobby, Landing Page & Victory Celebration (Priority: P3)

Giao diện trang chủ và sảnh chờ truyền tải không khí hàng hải cổ kính qua bố cục mạch lạc: bảng điều khiển trung tâm, danh sách thuyền viên trực quan, bảng cài đặt phòng và nút lệnh bắt đầu hành trình nổi bật. Khi kết thúc ván đấu, màn hình vinh danh thể hiện rõ phe chiến thắng và lật mở công khai vai trò của từng người chơi.

**Why this priority**: First impression (Home) + Last impression (EndGame) = trải nghiệm trọn vẹn.

**Independent Test**: Tạo phòng ở Home, vào Lobby, kết thúc ván để kiểm tra luồng thị giác xuyên suốt.

**Acceptance Scenarios**:

1. **Given** vào sảnh Lobby, **When** đổi Avatar / đổi Map, **Then** giao diện cập nhật tức thì, danh sách thuyền viên và bảng cài đặt hiển thị mạch lạc, sắc nét.
2. **Given** ván đấu kết thúc, **When** End Game xuất hiện, **Then** hiệu ứng chiến thắng vinh danh phe thắng hoành tráng + lật mở đồng loạt toàn bộ vai trò với hiệu ứng card flip.

---

### Edge Cases

- **Mobile Viewports < 360px:** Tự động chuyển 1 cột, không overflow, nút bấm không bị che.
- **Ultra-wide > 2560px:** Giới hạn `max-w-7xl`, căn giữa trang trọng.
- **Rapid Clicks / Spam:** Nút vô hiệu hóa tức thì sau bấm, tránh duplicate action.
- **Reduced Motion Accessibility:** `prefers-reduced-motion` tắt animation phức tạp (shake, 3D flip, particles).
- **Reconnection Visual State:** Khôi phục tức thì phong cách đồ họa phase hiện tại, không FOUT.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST áp dụng bảng màu "Eldritch Parchment" (nâu ấm hẹp + xanh lá rêu verdigris + vàng đồng thau + 3 màu phe phái kiểu bột màu cổ) — KHÔNG glassmorphism, KHÔNG neon, KHÔNG gradient AI mặc định.
- **FR-002**: Hệ thống MUST tích hợp font gothic 3 tầng từ Google Fonts: `Pirata One` (display), `Cinzel` (heading), `Outfit` (body) với fallback serif/sans-serif.
- **FR-003**: Hệ thống MUST xây dựng Game Header cố định hiển thị thông tin phòng, phase hiện tại, Cult Track và các phím chức năng cốt lõi.
- **FR-004**: Tất cả thẻ bài (Role Cards, Navigation Cards, Ritual Cards) MUST mang phong cách tarot/da dê cổ, có hoa văn mặt sau, hiệu ứng 3D flip 600ms, màu phe kiểu mực phai.
- **FR-005**: Màn che bí mật MUST hiển thị lớp phủ đen kịt + đôi mắt Kraken tím eldritch-pulse + đồng hồ đếm ngược ember.
- **FR-006**: Mutiny Board MUST cung cấp giao diện cược số súng bí mật, khóa cược an toàn và công bố kết quả với hiệu ứng rung màn hình và phân định thứ bậc rõ ràng.
- **FR-007**: Navigation Tray MUST hiển thị rõ ràng 3 lá bài điều hướng với nhận diện màu sắc 3 phe và cơ chế chọn/loại trực quan.
- **FR-008**: MapBoardUI MUST hiển thị hải đồ hàng hải cổ điển, biểu tượng sự kiện rõ ràng, vị trí tàu nổi bật và popover giải thích sự kiện khi tương tác.
- **FR-009**: Hệ thống MUST responsive hoàn toàn từ 375px Mobile đến Desktop 1920px+.
- **FR-010**: End Game MUST vinh danh phe thắng hoành tráng + lật mở công khai toàn bộ vai trò trên nền bàn chơi.
- **FR-011**: Các tương tác quan trọng MUST có micro-animation nặng nề chậm rãi (shake, firelight glow, ship bob, card flip) — KHÔNG bounce/spring.
- **FR-012**: Mọi bề mặt panel/card MUST thể hiện chất liệu phong hóa cổ xưa (gỗ, da dê cổ, ánh sáng ấm) phù hợp ngôn ngữ "Eldritch Parchment" — tránh các bề mặt phẳng lì đơn điệu.
- **FR-013**: Vignette tối viền MUST áp dụng toàn cục trên mọi màn hình game.

### Key Entities

- **Design Tokens & Theme System (ENT-007)**: Bảng màu "Eldritch Parchment" (nâu + rêu xanh + vàng + 3 phe), font gothic 3 tầng, spacing, shadows/glows ấm, aging effects CSS.
- **HUD State Model**: Trạng thái thu gọn/mở rộng Crew Dock, modal bản đồ, nút chuyển phase.
- **Visual Card Component**: Thẻ bài tarot cổ 2 mặt (da dê + xúc tu mặt sau), 3D perspective, màu phe kiểu mực phai.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% các màn hình tuân thủ nhất quán bảng màu "Eldritch Parchment", font gothic 3 tầng, texture phong hóa, và vignette tối viền.
- **SC-002**: Tốc độ phản hồi giao diện duy trì 60 FPS trên thiết bị phổ thông, không giật lag.
- **SC-003**: 100% các thành phần tương tác hiển thị hoàn hảo trên 375px – 1920px+, zero horizontal overflow.
- **SC-004**: Người chơi mới nhận biết ngay vai trò và hành động cần làm trong vòng dưới 3 giây.

## Assumptions

- Toàn bộ Game Logic, State Machine, WebSocket Payload và Backend giữ nguyên 100%.
- Dự án sử dụng Tailwind CSS + CSS Custom Properties/Animations + Google Fonts nhúng HTML/CSS.
- Icons dùng Lucide React (strokeWidth 1.5) + SVG thủ công cho lore elements.
- Texture effects ưu tiên CSS thuần (gradients, noise, blend-modes) — hạn chế tối đa asset hình ảnh nặng.
- Trình duyệt hiện đại hỗ trợ CSS Grid, Flexbox, CSS 3D Transforms.
