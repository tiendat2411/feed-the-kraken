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

### User Story 2 - Modern Game Command Table Layout & Live HUD (Priority: P1)

Trong suốt trận đấu, người chơi được trải nghiệm bố cục bàn chơi "khoang thuyền trưởng": Thanh gỗ sẫm phong hóa cố định ở đầu màn hình (HUD Header) chứa Mã phòng khắc vào gỗ, Round counter, Cult Track tím ẩn hiện, nút xem Role bí mật; Khu vực sân khấu chính (Main Stage) tự động co giãn theo phase; Thanh thuyền viên (Crew Dock) hiển thị thẻ gỗ mục từng người chơi — chức danh, súng, trạng thái (chấm verdigris).

**Why this priority**: Bố cục HUD là trung tâm điều khiển trong 100% thời gian ván đấu; layout gỗ cũ kỹ tạo immersion liên tục.

**Independent Test**: Trong ván game đang diễn ra, thay đổi kích thước từ Mobile (375px) đến Desktop 4K, xác nhận thanh HUD gỗ sẫm luôn cố định, Main Stage hiển thị đầy đủ, Crew Dock không bị tràn viền.

**Acceptance Scenarios**:

1. **Given** ván game đang chạy ở bất kỳ phase nào, **When** người chơi nhìn vào đỉnh màn hình, **Then** thanh HUD gỗ mục phong hóa hiển thị rõ ràng: Phase hiện tại (font `Cinzel`), huy hiệu chức vụ, Cult Track tím, nút bản đồ/cài đặt — tất cả trên nền gỗ sẫm có texture.
2. **Given** màn hình di động dọc hoặc thu nhỏ, **When** phase thay đổi, **Then** Crew Dock thu gọn thành thanh cuộn ngang hoặc drawer trượt, không che khuất nút hành động.

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

Nâng cấp Bảng Nổi loạn (Mutiny Board): đồng tiền vàng cổ / flintlock pistol trên bàn gỗ mục, rương gỗ cũ bản lề gỉ làm khay cược, kết quả công bố với screen shake + hiệu ứng kim loại cũ. Khay Lái tàu (Navigation Tray): 3 thẻ bài cổ mực phai (Blue Sailor, Red Pirate, Yellow Cult) trên bàn gỗ, chọn bài bằng viền vàng sáng lên.

**Why this priority**: Hai cơ chế lặp đi lặp lại nhiều nhất — nâng cấp UI tạo ảnh hưởng 80% cảm xúc game.

**Independent Test**: Trong vòng Mutiny, chọn số súng kiểm tra hiệu ứng khóa cược; trong Navigation, Thuyền trưởng/Thuyền phó rút bài kiểm tra khay 3 màu và thao tác chọn/loại.

**Acceptance Scenarios**:

1. **Given** phase Bỏ phiếu Nổi loạn, **When** chọn súng và xác nhận, **Then** số súng khóa vào rương gỗ bản lề gỉ, hiệu ứng bí mật cho đến khi toàn bộ hoàn tất.
2. **Given** kết quả bỏ phiếu công bố, **When** có Thuyền trưởng mới, **Then** vương miện vàng đồng gỉ trao tay + screen shake + tổng súng xếp hạng trực quan.
3. **Given** rút bài điều hướng, **When** 3 lá bài xuất hiện, **Then** thẻ bài kiểu giấy da dê cổ với mực phai 3 màu phe, dễ phân biệt, viền vàng khi chọn giữ.

---

### User Story 5 - Interactive Ocean Chart & Dynamic Flagship Piece (Priority: P2)

Bản đồ hải trình = hải đồ da dê cổ (giấy ố vàng, mép rách/cháy, vệt ố nâu, viền rêu xanh mờ ở góc), đường vẽ mực lông vũ nét run rẩy, biểu tượng sự kiện SVG, con tàu buồm gỗ tối dập dềnh, popover giải thích sự kiện. 3 điểm đích: Sailor Cove (xanh rêu), Crimson Cove (đỏ lửa), Kraken Sanctuary (tím).

**Why this priority**: Bản đồ phản ánh tiến độ + chiến thuật 3 phe; hải đồ cổ tạo immersion.

**Independent Test**: Mở bản đồ bất kỳ thời điểm nào, kiểm tra mạng lưới ô rõ ràng, vị trí tàu phát sáng, popover khi bấm ô.

**Acceptance Scenarios**:

1. **Given** mở MapBoard, **When** quan sát hải trình, **Then** 3 vùng đích có màu/hình đặc trưng, ô sự kiện có biểu tượng SVG, nền hải đồ da dê cổ có vệt ố và rêu xanh.
2. **Given** tàu di chuyển, **When** tọa độ cập nhật, **Then** tàu buồm gỗ tối lướt mượt theo đường mực, ô đến phát sáng firelight.

---

### User Story 6 - Cinematic Lobby, Landing Page & Victory Celebration (Priority: P3)

Trang chủ = đại dương đen kịt + panel giấy da dê trên khung gỗ mục + title gothic vàng đồng + tentacle ẩn hiện + nến chập chờn + hạt bụi + inputs thanh gỗ khắc + buttons gỗ embossed. Sảnh chờ = sàn gỗ phong hóa + thẻ gỗ mục đóng đinh gỉ + sổ da thuộc captain's journal + chọn avatar + START VOYAGE kiểu bánh lái. End Game = banner phe thắng (cờ xanh bình minh / Jolly Roger lửa đỏ / Kraken trồi tím) + lật mở toàn bộ vai trò trên bàn gỗ mục.

**Why this priority**: First impression (Home) + Last impression (EndGame) = trải nghiệm trọn vẹn.

**Independent Test**: Tạo phòng ở Home, vào Lobby, kết thúc ván để kiểm tra luồng thị giác xuyên suốt.

**Acceptance Scenarios**:

1. **Given** vào sảnh Lobby, **When** đổi Avatar / đổi Map, **Then** giao diện cập nhật tức thì, thẻ gỗ phong hóa, cuộn giấy hải đồ preview.
2. **Given** ván đấu kết thúc, **When** End Game xuất hiện, **Then** banner chiến thắng hoành tráng theo phe + lật mở đồng loạt toàn bộ vai trò với hiệu ứng card flip.

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
- **FR-003**: Hệ thống MUST xây dựng Game Table HUD gỗ phong hóa cố định: thanh gỗ sẫm Header (Room Info, Round, Cult Track, Quick Access), Main Stage linh hoạt theo Phase, Crew Dock thẻ gỗ mục.
- **FR-004**: Tất cả thẻ bài (Role Cards, Navigation Cards, Ritual Cards) MUST kiểu tarot/da dê cổ, có hoa văn mặt sau, hiệu ứng 3D flip 600ms, màu phe kiểu mực phai.
- **FR-005**: Màn che bí mật MUST hiển thị lớp phủ đen kịt + đôi mắt Kraken tím eldritch-pulse + đồng hồ đếm ngược ember.
- **FR-006**: Mutiny Board MUST hiển thị đồng tiền vàng cổ / flintlock trên bàn gỗ mục, rương cược gỗ bản lề gỉ, screen shake khi công bố.
- **FR-007**: Navigation Tray MUST hiển thị khay bài gỗ mục, 3 thẻ bài mực phai, viền vàng khi chọn giữ.
- **FR-008**: MapBoardUI MUST hiển thị hải đồ da dê cổ (giấy ố, mép rách, rêu xanh mờ), biểu tượng SVG sự kiện, tàu buồm gỗ dập dềnh, popover sự kiện.
- **FR-009**: Hệ thống MUST responsive hoàn toàn từ 375px Mobile đến Desktop 1920px+.
- **FR-010**: End Game MUST vinh danh phe thắng (banner hoành tráng) + lật mở công khai toàn bộ vai trò trên bàn gỗ mục.
- **FR-011**: Các tương tác quan trọng MUST có micro-animation nặng nề chậm rãi (shake, firelight glow, ship bob, card flip) — KHÔNG bounce/spring.
- **FR-012** (MỚI): Mọi bề mặt panel/card MUST có texture phong hóa (gỗ mục, giấy nứt, vệt ố, rêu xanh, đinh gỉ) — KHÔNG BAO GIỜ phẳng lì.
- **FR-013** (MỚI): Vignette tối viền MUST áp dụng toàn cục trên mọi màn hình game.

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
