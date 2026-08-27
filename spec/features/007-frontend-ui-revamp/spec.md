# Feature Specification: Frontend UI/UX Revamp & Thematic Art Direction

**Feature Branch**: `007-frontend-ui-revamp`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "chúng ta đã hoàn thành xây dựng xong các chức năng hệ thống phía backend cũng như các ui cơ bản của frontend để game có thể chạy được , tuy nhiên tôi muốn thực hiện một quá trình nâng cấp toàn diện cho giao diện phía frontend với xây dựng lại phần layout, art style của game, font chữ, ui cho cho các component ..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Thematic Visual Design System & Atmospheric Art Direction (Priority: P1)

Người chơi khi truy cập vào bất kỳ màn hình nào của ứng dụng sẽ cảm nhận ngay bầu không khí hải trình kỳ bí và căng thẳng của boardgame "Feed the Kraken". Giao diện sở hữu bảng màu hải tặc/biển sâu chuyên nghiệp (Deep Ocean Navy, Aged Parchment, Antique Brass/Gold, Pirate Crimson, Cultist Eldritch Purple, Sailor Sapphire Blue), hệ thống font chữ cổ điển huyền bí kết hợp hiện đại rõ nét, hiệu ứng đổ bóng/phát sáng mờ (Glassmorphism & Glow), cùng các họa tiết hoa văn sóng biển và xúc tu đặc trưng.

**Why this priority**: Thiết lập ngôn ngữ thiết kế chung và bộ quy tắc thẩm mỹ nền tảng là điều kiện tiên quyết trước khi đồng bộ giao diện cho toàn bộ các màn hình và linh kiện tương tác trong game.

**Independent Test**: Có thể kiểm tra độc lập bằng cách mở trang Home hoặc Lobby, kiểm tra tính đồng nhất của font chữ, màu sắc, bóng đổ, typography hierarchy và hiệu ứng nền không bị vỡ hoặc lệch phong cách trên các độ phân giải màn hình khác nhau.

**Acceptance Scenarios**:

1. **Given** người chơi mở trình duyệt vào trang chủ hoặc sảnh chờ, **When** giao diện tải xong, **Then** toàn bộ văn bản tiêu đề hiển thị theo bộ font cổ điển huyền bí (thematic serif/display font), văn bản nội dung hiển thị theo font sans-serif sắc nét, độ tương phản màu đạt chuẩn WCAG AA và nền web có hiệu ứng đại dương chuyển động nhẹ nhàng.
2. **Given** người chơi quan sát các panel giao diện (Thẻ bài, Bảng điều khiển, Hộp thoại), **When** tương tác di chuột (hover) hoặc nhấn chọn, **Then** các panel phản hồi với viền sáng mạ vàng kim/hào quang tím ma thuật, hiệu ứng bóng đổ chiều sâu và chuyển động chuyển cảnh mượt mà (dưới 250ms).

---

### User Story 2 - Modern Game Command Table Layout & Live HUD (Priority: P1)

Trong suốt trận đấu, người chơi được trải nghiệm bố cục bàn chơi trung tâm (Game Table HUD) khoa học và trực quan: Thanh trạng thái cố định ở đầu màn hình (Hiển thị Mã phòng, Vòng chơi hiện tại, Cột mốc Nghi thức Tà giáo, Vai trò đang nắm giữ và Nhật ký hành động gần nhất), Khu vực sân khấu chính (Main Stage) tự động co giãn và hiển thị mượt mà linh kiện của phase hiện tại (Bản đồ / Bỏ phiếu Nổi loạn / Rút bài / Hành quyết), và Thanh danh sách thủy thủ đoàn (Crew Roster) hiển thị trực quan chức danh (Captain, Lieutenant, Navigator, Off-duty), số súng, và trạng thái kết nối.

**Why this priority**: Bố cục bàn chơi là trung tâm điều khiển nơi người chơi tương tác liên tục trong suốt 100% thời gian ván đấu; việc tái cấu trúc layout giúp loại bỏ cảm giác chắp vá, tăng tính tiện dụng và tối ưu không gian hiển thị trên cả máy tính lẫn điện thoại.

**Independent Test**: Có thể kiểm tra độc lập trong một ván game đang diễn ra: thay đổi kích thước cửa sổ từ Mobile (375px) đến 4K Desktop để xác nhận thanh HUD luôn cố định, sân khấu chính hiển thị đầy đủ linh kiện của từng phase không bị tràn viền và danh sách người chơi luôn dễ tra cứu.

**Acceptance Scenarios**:

1. **Given** một ván game đang chạy ở bất kỳ phase nào, **When** người chơi nhìn vào đỉnh màn hình, **Then** thanh trạng thái HUD hiển thị rõ ràng: Phase hiện tại, huy hiệu chức vụ cá nhân (kèm nút xem lại vai trò bí mật), tiến trình Cult Uprising track và nút truy cập bản đồ/cài đặt.
2. **Given** người chơi sử dụng màn hình di động màn hình dọc hoặc thu nhỏ cửa sổ, **When** phase thay đổi, **Then** nội dung chính tự động điều chỉnh tỷ lệ khung nhìn, danh sách người chơi thu gọn thành danh sách dạng thanh cuộn ngang hoặc drawer trượt mà không che khuất các nút hành động cốt lõi.

---

### User Story 3 - Role Cards, 3D Card Flip & Secret Blindfold Overlays (Priority: P2)

Người chơi tương tác với hệ thống Thẻ vai trò (Role Cards) và Màn che bí mật với trải nghiệm thị giác cao cấp: Thẻ nhân vật có khung viền hoa văn sắc nét, con dấu phe phái (Hải quân, Hải tặc, Tà giáo), hiệu ứng lật thẻ 3D chân thực khi mở vai trò; đồng thời trong các giai đoạn nhắm mắt ban đêm (Pirates Gathering, Cult Blindfold), màn hình chuyển sang lớp phủ bóng đêm ma mị với xúc tu Kraken gợn sóng và đếm ngược thời gian trực quan.

**Why this priority**: Cơ chế ẩn vai và nhắm mắt bí mật là linh hồn của thể loại Social Deduction; việc nâng cấp đồ họa cho thẻ bài và lớp phủ bóng đêm tạo ra cảm xúc nhập vai sâu sắc và hồi hộp cho người chơi.

**Independent Test**: Có thể kiểm tra độc lập tại phase Chia vai (Role Reveal) và Nghi thức Nhắm mắt: người chơi nhấn vào thẻ bài để quan sát hiệu ứng xoay lật 3D 180 độ mượt mà, thấy rõ màu sắc và biểu tượng của phe mình, cùng đồng hồ đếm ngược viền lửa/phát sáng trong đêm tối.

**Acceptance Scenarios**:

1. **Given** người chơi nhận được vai trò bí mật ở đầu trận, **When** nhấn vào mặt sau thẻ bài, **Then** thẻ lật sang mặt trước với hiệu ứng 3D perspective chân thực, hiển thị đầy đủ hình minh họa đại diện, tên phe phái, điều kiện thắng vắn tắt và dấu triện đặc trưng.
2. **Given** bước vào giai đoạn Night Phase (Hải tặc hội tụ hoặc Giáo chủ chọn giáo đồ), **When** người chơi không thuộc nhóm được phép mở mắt, **Then** toàn màn hình bị che phủ bởi lớp sương mù đen kịt với đôi mắt Kraken phát sáng chập chờn và đồng hồ đếm ngược vòng tròn phát quang.

---

### User Story 4 - Mutiny Bidding & Navigation Command Interface Revamp (Priority: P2)

Nâng cấp toàn diện giao diện Bỏ phiếu nổi loạn (Mutiny Board) và Lái tàu (Navigation Cards Tray):
- Bảng Nổi loạn hiển thị trực quan các đồng súng (Guns) dạng đồng xu vàng hoặc khẩu súng lục hải tặc kèm khay đặt cược sinh động; khi công bố kết quả có hiệu ứng khói súng và tia lửa bùng nổ.
- Khay lái tàu hiển thị hải đồ thu nhỏ, các thẻ bài điều hướng mang sắc thái 3 màu (Xanh Hải quân, Đỏ Hải tặc, Vàng Tà giáo) với minh họa bánh lái, la bàn cổ và hiệu ứng kéo/chọn bài sắc nét.

**Why this priority**: Hai cơ chế cốt lõi lặp đi lặp lại nhiều nhất trong trò chơi là Bầu thuyền trưởng/Nổi loạn và Lái tàu; nâng cấp giao diện của hai phần này sẽ ngay lập tức cải thiện 80% cảm xúc của người chơi trong game.

**Independent Test**: Có thể kiểm tra độc lập trong vòng Mutiny và Navigation: thao tác chọn số súng cược hiển thị âm thanh/hiệu ứng đặt súng vào khay; Thuyền trưởng và Thuyền phó nhìn thấy khay bài rút với giao diện hải trình cổ điển sang trọng.

**Acceptance Scenarios**:

1. **Given** người chơi đang trong phase Bỏ phiếu Nổi loạn, **When** chọn số lượng súng muốn đặt cược và nhấn xác nhận, **Then** số súng cá nhân trên khay đổi trạng thái đã cược và hiển thị hiệu ứng khóa bí mật cho đến khi toàn bộ thủy thủ đoàn hoàn tất.
2. **Given** kết quả bỏ phiếu được công bố, **When** có người giành được quyền Thuyền trưởng mới, **Then** hệ thống hiển thị vương miện Thuyền trưởng trao tay kèm hiệu ứng rung nhẹ (screen shake) và tổng số súng của từng ứng viên được xếp hạng trực quan.
3. **Given** Thuyền trưởng/Thuyền phó thực hiện rút bài điều hướng, **When** các lá bài xuất hiện, **Then** người chơi nhìn thấy 3 lá bài dạng thẻ bài cổ với hoa văn hải đồ sắc nét, dễ dàng phân biệt rõ 3 hướng (Blue, Red, Yellow) và các biểu tượng hiệu ứng đi kèm.

---

### User Story 5 - Interactive Ocean Chart & Dynamic Flagship Piece (Priority: P2)

Bản đồ hải trình (MapBoard) cho cả hai chế độ Quick Journey và Long Journey được thiết kế lại thành tấm hải đồ da dê cổ (Vintage Nautical Chart) sống động: Các hải trình nối liền nhau với đường kẻ hải đồ cổ điển, các ô sự kiện (Tra khảo, Chặt tay, Cho Kraken ăn, Say rượu, Kính viễn vọng...) có biểu tượng riêng biệt dễ hiểu kèm chú thích tức thì (Tooltip/Popover khi bấm vào), và quân cờ Tàu buồm (Flagship) có hiệu ứng nổi dập dềnh trên sóng nước.

**Why this priority**: Bản đồ là nơi phản ánh toàn bộ tiến độ và chiến thuật của 3 phe; một tấm bản đồ đẹp mắt và rõ ràng giúp người chơi dễ dàng theo dõi đường đi và tính toán các nước cờ tiếp theo.

**Independent Test**: Có thể kiểm tra độc lập bằng cách mở bản đồ ở bất kỳ thời điểm nào: bản đồ hiển thị rõ ràng toàn bộ mạng lưới các ô, vị trí con tàu hiện tại phát sáng nổi bật, nhấn vào bất kỳ ô nào đều hiện popover giải thích ý nghĩa sự kiện mà không che khuất màn hình.

**Acceptance Scenarios**:

1. **Given** người chơi mở giao diện Bản đồ hải trình, **When** quan sát hải trình từ điểm xuất phát đến các vùng biển đích, **Then** 3 vùng biển đích (Sailor Cove, Crimson Cove, Kraken Sanctuary) được thể hiện bằng hình ảnh và màu sắc đại diện đặc trưng, các ô sự kiện có ký hiệu trực quan.
2. **Given** tàu di chuyển sang một ô mới, **When** tọa độ tàu cập nhật, **Then** mô hình tàu buồm di chuyển theo quỹ đạo mượt mà (smooth path animation) và ô vừa đến phát ra luồng sáng báo hiệu sự kiện kích hoạt.

---

### User Story 6 - Cinematic Lobby, Landing Page & Victory Celebration (Priority: P3)

Trang chủ (Home Landing), Sảnh chờ (Lobby), và Màn hình Tổng kết chiến thắng (End Game) được khoác lên diện mạo hoàn toàn mới:
- Trang chủ mang phong cách biển khơi huyền bí, hỗ trợ nhập mã phòng/tên người chơi với các nút bấm chạm nổi (embossed nautical buttons).
- Sảnh chờ hiển thị thuyền viên dưới dạng các thẻ thủy thủ xếp quanh bàn gỗ tròn hoặc danh sách hải đoàn trang nhã kèm bộ chọn Avatar phong phú.
- Màn hình kết thúc hiển thị đại cảnh vinh danh phe chiến thắng (Cờ hải tặc rực lửa, Hải quân uy nghiêm hoặc Kraken trỗi dậy nuốt chửng con tàu) cùng bảng lật mở toàn bộ danh tính thật của tất cả người chơi.

**Why this priority**: Tạo ấn tượng mở đầu mạnh mẽ (First Impression) khi người chơi bước vào game và cảm xúc thỏa mãn, bùng nổ khi ván đấu kết thúc.

**Independent Test**: Có thể kiểm tra độc lập bằng cách tạo phòng ở trang Home, mời người chơi vào Lobby và kết thúc một ván đấu để kiểm tra toàn bộ luồng thị giác từ đầu đến cuối.

**Acceptance Scenarios**:

1. **Given** người chơi vào sảnh Lobby, **When** thay đổi Avatar hoặc Host đổi chế độ bản đồ, **Then** giao diện cập nhật ngay lập tức với hình ảnh minh họa chân thực của bản đồ và thẻ đại diện của người chơi.
2. **Given** ván đấu kết thúc với một phe chiến thắng, **When** màn hình End Game xuất hiện, **Then** toàn bộ vai trò thật của từng người chơi được lật mở đồng loạt với hiệu ứng âm thanh/hình ảnh chiến thắng theo đúng phong cách của phe thắng cuộc.

---

### Edge Cases

- **Màn hình siêu nhỏ / Thiết bị di động màn hình hẹp (Mobile Viewports < 360px):** Các thành phần giao diện dạng bảng hoặc danh sách nhiều người chơi tự động chuyển sang bố cục 1 cột hoặc dạng thẻ cuộn, không để chữ bị tràn (overflow) hoặc nút bấm bị che khuất.
- **Màn hình siêu rộng / Màn hình 4K (Ultra-wide Displays > 2560px):** Giao diện tự động giới hạn độ rộng tối đa hợp lý (`max-w-7xl` hoặc container tương đương) và căn giữa trang trọng, tránh việc kéo giãn nội dung quá mức gây khó quan sát.
- **Người chơi thao tác nhanh / Click liên tục (Rapid Clicks / Spam):** Các nút bấm và hiệu ứng chuyển cảnh (transitions/animations) có cơ chế vô hiệu hóa tức thì sau khi bấm lần đầu để ngăn ngừa tình trạng kích hoạt nhiều lần hoặc giật lag giao diện.
- **Chế độ giảm tải chuyển động (Reduced Motion Accessibility):** Người dùng có thiết lập hệ điều hành `prefers-reduced-motion` sẽ được tự động làm mượt hoặc bỏ qua các hoạt cảnh chuyển động phức tạp (như rung lắc màn hình hay xoay 3D) để đảm bảo không gây chóng mặt.
- **Rớt mạng và kết nối lại (Reconnection Visual State):** Khi mất kết nối hoặc tải lại trang F5, giao diện khôi phục tức thì toàn bộ phong cách đồ họa của phase hiện tại mà không bị chớp giật (flash of unstyled content) hay mất vị trí thanh HUD.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST áp dụng một bảng màu chủ đạo (Color Palette) đồng nhất theo phong cách Dark Nautical & Eldritch Fantasy (bao gồm màu đại dương sâu thẳm, gỗ cổ, vàng đồng thau, đỏ hải tặc, tím tà giáo và xanh hải quân).
- **FR-002**: Hệ thống MUST tích hợp bộ font chữ chuyên nghiệp từ Google Fonts (font phong cách cổ điển/display cho các tiêu đề và font sans-serif hiện đại cho các thông tin trạng thái/nội dung thao tác) đảm bảo độ tương phản rõ ràng và dễ đọc.
- **FR-003**: Hệ thống MUST xây dựng một cấu trúc Game Table HUD cố định và trực quan, bao gồm: Thanh thông tin đỉnh (Room Info, Round, Cult Track, Quick Access), Sân khấu chính (Main Stage) tương thích linh hoạt cho từng Phase, và Khu vực Thủy thủ đoàn (Crew Deck).
- **FR-004**: Tất cả các thẻ bài trong game (Role Cards, Navigation Cards, Cult Ritual Cards) MUST có định dạng thiết kế thống nhất, có hoa văn mặt sau, hiệu ứng xoay lật 3D (3D Flip Animation) và màu sắc nhận diện đặc trưng cho từng loại.
- **FR-005**: Màn hình nhắm mắt và màn che bí mật (Blindfold / Secret Gathering Overlay) MUST hiển thị lớp phủ thẩm mỹ cao với hình ảnh xúc tu hoặc sương mù bóng đêm cùng đồng hồ đếm ngược phát sáng.
- **FR-006**: Bảng Bỏ phiếu Nổi loạn (Mutiny Board) MUST hiển thị trực quan các đồng tiền vàng / khẩu súng cược, thanh xếp hạng súng của từng ứng viên và hiệu ứng công bố kết quả sinh động.
- **FR-007**: Giao diện Lái tàu (Navigation Tray) MUST hiển thị khay bài rút trực quan cho Thuyền trưởng, Thuyền phó và Hoa tiêu, hỗ trợ đánh dấu rõ ràng trạng thái lá bài được giữ lại hoặc bị loại bỏ.
- **FR-008**: Bản đồ hải trình (MapBoardUI) MUST hiển thị đầy đủ mạng lưới ô cho cả Quick Journey và Long Journey dưới dạng hải đồ cổ điển, với biểu tượng sự kiện rõ ràng, mô hình tàu buồm có chuyển động dập dềnh và popover giải thích ô sự kiện khi bấm vào.
- **FR-009**: Hệ thống MUST tối ưu hóa giao diện hoàn toàn tương thích (Responsive) trên cả thiết bị di động (Mobile), máy tính bảng (Tablet) và máy tính để bàn (Desktop).
- **FR-010**: Màn hình Kết thúc game (End Game) MUST vinh danh phe chiến thắng với hình ảnh đại cảnh sống động và lật mở công khai toàn bộ vai trò bí mật của tất cả người chơi trong phòng.
- **FR-011**: Các tương tác quan trọng (Nổ súng, Di chuyển tàu, Biến đổi Tà giáo, Lật bài) MUST đi kèm hiệu ứng vi hoạt cảnh (Micro-animations: rung lắc, lóe sáng, sóng lượn, phát quang) mượt mà và nhẹ nhàng.

### Key Entities *(include if feature involves data)*

- **Design Tokens & Theme System**: Định nghĩa bảng màu (Colors), biến typography (Fonts), khoảng cách (Spacing), bóng đổ (Shadows/Glows) và các mẫu khung viền (Borders/Cards).
- **HUD State Model**: Lưu trữ trạng thái thu gọn/mở rộng của danh sách người chơi, trạng thái mở modal bản đồ, và thông báo chuyển đổi vai trò tạm thời trên giao diện người dùng.
- **Visual Card Component**: Mô hình đại diện cho linh kiện thẻ bài có thể lật mở 2 mặt (Front/Back face), kích thước chuẩn hóa, hiệu ứng 3D perspective và nhãn phân loại.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% các màn hình và linh kiện trong toàn bộ ứng dụng (Home, Lobby, Day Phase, Night Phase, Mutiny, Navigation, Map, Execution, End Game) tuân thủ nhất quán theo cùng một bộ ngôn ngữ thiết kế (Design System) và font chữ chủ đạo.
- **SC-002**: Tốc độ phản hồi giao diện và hiệu ứng chuyển cảnh duy trì khung hình ổn định ở mức 60 FPS trên các thiết bị phổ thông mà không gây giật lag.
- **SC-003**: 100% các thành phần tương tác (nút bấm, ô cược, chọn bài, xem bản đồ) hiển thị hoàn hảo và không bị tràn viền (zero horizontal scrollbar / overflow) trên các kích thước màn hình từ 375px (Mobile) đến 1920px+ (Desktop).
- **SC-004**: Điểm số đánh giá trải nghiệm người dùng về tính trực quan và thẩm mỹ tăng rõ rệt, người chơi mới có thể nhận biết ngay vai trò cá nhân và hành động cần làm trong vòng dưới 3 giây sau khi nhìn vào màn hình.

## Assumptions

- Toàn bộ Game Logic, State Machine, cấu trúc WebSocket Payload và các Endpoint phía Backend đã hoàn thiện và giữ nguyên 100%, đợt nâng cấp này tập trung toàn bộ vào lớp giao diện hiển thị (Presentation Layer & Styling).
- Dự án sử dụng Tailwind CSS kết hợp với CSS Custom Utilities / Animations và Google Fonts được nhúng trực tiếp thông qua HTML/CSS.
- Các biểu tượng và huy hiệu đại diện (La bàn, Thuyền buồm, Khẩu súng, Xúc tu Kraken, Vương miện, Mỏ neo) được thể hiện bằng Lucide Icons phối hợp với SVG và CSS nghệ thuật để đảm bảo độ nét cao và dung lượng nhẹ.
- Người dùng có trình duyệt hiện đại hỗ trợ CSS Grid, Flexbox, và CSS 3D Transforms.
