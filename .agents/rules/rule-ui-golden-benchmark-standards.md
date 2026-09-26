# QUY CHUẨN NGHỆ THUẬT VÀ PHƯƠNG PHÁP CHẾ TÁC ASSET CHUẨN VÀNG (GOLDEN BENCHMARK STANDARDS)

> **Mục tiêu:** Hệ thống hóa toàn bộ kinh nghiệm, quy trình phối hợp, tư duy công thái học và các tiêu chuẩn nghệ thuật thành công từ Task T063 & T064 thành bộ quy chuẩn chuẩn vàng (Golden Benchmark). Mọi công việc thiết kế giao diện và chế tác asset cho các phase tiếp theo (T065 - T068) BẮT BUỘC phải lấy các asset và quy trình này làm mốc tham chiếu nền tảng (Ground Truth Anchor).

---

## 1. Bộ Asset Mẫu Chuẩn Vàng (Golden Benchmark Reference Assets)

Khi khởi tạo prompt hoặc kiểm duyệt asset đồ họa mới, AI BẮT BUỘC phải đối chiếu với các asset mẫu chuẩn đã được nghiệm thu tại thư mục `frontend/src/assets/ui/`:

| STT | Thành phần / Vai trò | Asset Mẫu Tham Chiếu | Đặc điểm Thẩm Mỹ & Kỹ Thuật Bắt Buộc |
| :---: | :--- | :--- | :--- |
| 1 | **Sân Khấu Bàn Làm Việc (Tabletop Stage)** | `backgrounds/tabletop_captain_desk.png` | - Góc nhìn phẳng vuông góc 90° từ trên xuống (`perpendicular 90° flat lay`).<br>- Khoang trung tâm kích thước chuẩn **1466 × 700 px** (tỷ lệ vàng **2.094 : 1**).<br>- Ánh sáng nến vàng ấm (`firelight`), bóng đổ nhẹ chiaroscuro. |
| 2 | **Khay Thao Tác Chuyên Dụng (Command Vessel / Tray)** | `frames/tray_captain_command.png` | - Khớp chính xác 1:1 với khoang bàn (`1466 × 700 px`).<br>- **Gờ viền siêu mỏng (< 25px)** bằng kim loại phong hóa đồng xanh (verdigris) kết hợp gỗ mun, tối đa hóa diện tích tương tác lòng khay.<br>- Lòng khay bọc da thuộc cao cấp xanh rêu khâu chỉ đôi viền tay. |
| 3 | **Bục Trưng Bày Đạo Cụ (Officers Dais)** | `frames/dais_officers_cradle.png` | - Khung gỗ mun nẹp đồng cổ đúc đinh tán.<br>- Các khoang lót nhung sâu thẳm mang sắc thái faction (Nhung đen Thuyền trưởng, Nhung lam Lieutenant, Nhung ngọc Navigator). |
| 4 | **Phiến Thẻ Thủy Thủ (Crew Plank Tablet)** | `frames/tablet_crew_plank.png` | - Gỗ sồi phong hóa nứt nẻ tự nhiên, mép vát vát góc 45° nẹp kim loại.<br>- Cửa sổ Porthole tròn rỗng xuyên thấu viền đồng đinh tán.<br>- Bảng tên gỗ mun chìm và các ổ cắm chốt kim loại chuyên dụng. |
| 5 | **Đạo Cụ Bảo Vật (Sacred Regalia Tokens)** | `sprites/token_admiralty_key.png`<br>`sprites/token_brass_helm.png` | - Vàng đồng thau xỉn, đồng đúc ăn mòn patina sần sùi.<br>- Hoa văn lọng rỗng xuyên thấu 100% Alpha, bóng đổ nội khối nổi bật trên nền nhung. |
| 6 | **Nút Chốt Đồng Tròn (Bespoke Peg Buttons)** | `buttons/btn_peg_lt.png`<br>`buttons/btn_peg_nav.png` | - Khối đồng thau đúc viền đinh tán, lòng tráng men màu đặc trưng (Navy Blue / Emerald Green).<br>- Khớp hình học 1:1 với kích thước và góc phối cảnh của ổ cắm trên thẻ thủy thủ. |
| 7 | **Thanh Lệnh Tinh Gọn (Low-Profile Action Bar)** | `buttons/btn_ratify_command.png` | - Tỷ lệ siêu ngang (**~6.2 : 1**), không choáng ngợp hay che khuất các linh kiện chính.<br>- Thanh đồng thau chải xước, chữ Pirata One khắc nổi, điểm xuyết triện sáp đỏ đúc sọ người. |
| 8 | **Xiềng Xích Vô Hiệu Hóa (Stigma Chains)** | `sprites/stigma_iron_chain.png` | - Xích sắt rỉ chéo đan hình chữ X ôm khít phiến thẻ.<br>- Ổ khóa đồng rỉ vảy kèm thẻ đồng "OFF-DUTY" đung đưa. |

---

## 2. Các Nguyên Tắc Thiết Kế & Công Thái Học Cốt Lõi (Ergonomic Principles)

### 2.1. Nguyên Tắc Ổ Cắm & Chốt (Socket & Peg Principle)
- Khi thiết kế thẻ nhân vật hoặc bảng điều khiển có các ổ cắm trạng thái/bổ nhiệm (Sockets):
  - **Tuyệt đối không nhồi nhét đạo cụ lớn/dài không đồng dạng** vào các lỗ chốt tròn hoặc khe rãnh (ví dụ: không đặt chìa khóa dài hay bánh lái lớn vào lỗ tròn).
  - BẮT BUỘC chế tác các **chốt ấn chuyên biệt (Peg Coins/Seals)** có hình dáng hình học tương thích tuyệt đối với ổ cắm (hình tròn đúc đồng, men màu faction, biểu tượng thu nhỏ dập nổi).

### 2.2. Phân Cấp: Đạo Cụ Trưng Bày vs Đạo Cụ Kích Hoạt (Display Regalia vs Active Pegs)
- **Đạo cụ Trưng Bày (Sacred Regalia):** Là các bảo vật kích thước đầy đủ (Chìa khóa hải quân, Bánh lái lớn, Súng kíp, Hải đồ cổ) ngự trị trên bục Dais hoặc khay trưng bày trung tâm để tạo tính thẩm mỹ và kể chuyện.
- **Đạo cụ Kích Hoạt (Interactive Pegs):** Là các token/chốt/con dấu cầm tay được cấp cho người chơi để thao tác cắm/đóng dấu vào vị trí tương tác.

### 2.3. Tối Ưu Diện Tích Thao Tác (Slim Borders & Low-Profile Action Bar)
- Mọi khay thao tác trung tâm phải có **gờ viền mảnh**, tránh gờ dày cộm chiếm diện tích lòng khay.
- Nút bấm hành động xác nhận phải là dạng **thanh ray ngang dẹt (low-profile bar)** nằm gọn ở đáy khay, tỷ lệ từ `5:1` đến `7:1`, tuyệt đối không dùng nút khối chữ nhật to cao làm chật chội không gian hiển thị thẻ bài.

---

## 3. Quy Trình Chế Tác & Kiểm Nghiệm Ghép Thử 1:1 (Pre-Composite Loop)

Để đảm bảo chất lượng hình ảnh không bị sai lệch tỉ lệ hay vỡ layout khi sang bước code JSX:

1. **Sinh Asset Đơn Lập (Clean & Standalone):**
   - Tạo độc lập trên nền đen/đơn sắc tương phản.
   - Tách nền Alpha sạch 100% bằng script xử lý chuyên dụng (loại bỏ hoàn toàn viền halo, răng cưa).
2. **Ghép Thử Nghiệm Tự Động (Iterative Pre-Composite Testing):**
   - Ngay sau khi tách phông một asset mới, **BẮT BUỘC chạy script Python ghép thử asset đó vào bối cảnh thật**:
     - Ghép Khay vào Bàn (`tabletop_captain_desk.png`) để đo khớp từng pixel.
     - Ghép Bục/Thẻ lên Khay để kiểm tra mật độ hiển thị (density & padding).
     - Ghép Chốt/Xiềng xích lên Thẻ để xác minh độ ăn khớp hình học 1:1.
   - Xuất trình ảnh ghép thử nghiệm (Composite Previews) cho User đánh giá trực quan trước khi chốt.

---

## 4. Công Thức Prompt Chuẩn Vàng (Golden Prompting Formula)

Khi sử dụng công cụ sinh ảnh cho phong cách "Eldritch Parchment":

- **Cụm từ bắt buộc (Positive Mandates):**
  `"Orthographic 90-degree perpendicular flat lay top-down view"`, `"isolated standalone UI game asset on pure pitch black background"`, `"hand-inked illustration style, slight organic ink tremor, Darkest Dungeon and Don't Starve aesthetic"`, `"weathered antique materials: aged oak wood grain, verdigris brass, tarnished copper patina, cracked enamel, hand-stitched moss-green leather"`, `"warm candlelight chiaroscuro lighting, soft directional shadows"`.
- **Cụm từ cấm kỵ (Negative Constraints):**
  `"NO isometric perspective"`, `"NO tilted 3D angle"`, `"NO modern glossy bevel"`, `"NO neon gradients"`, `"NO floating disconnected props"`, `"NO white flat digital borders"`.

---

## 5. Bản Đồ Áp Dụng Cho Các Phase Tiếp Theo

| Task ID | Tên Phase / Màn Hình | Khay Thao Tác Chuyên Biệt | Thẻ Tương Tác | Đạo Cụ / Chốt / Nút Độc Bản |
| :---: | :--- | :--- | :--- | :--- |
| **T065** | **Navigation Phase** (Quyết định hải trình) | Khay hải đồ da dê viền đồng cổ | Thẻ bài hải đồ (Navigation Cards: Vàng/Đỏ/Xanh) | La bàn dẫn hướng, khay rút 3 lá & hòm hủy bài bí mật |
| **T066** | **Mutiny Phase** (Bỏ phiếu nổi loạn) | Thảm nỉ cược súng đỏ thẫm viền sắt rỉ | Thẻ bài nổi loạn của từng thủy thủ | Súng kíp đặt cược, hòm đạn, nút chốt cược súng |
| **T067** | **Gun Duel / Execution** (Đấu súng & Tử hình) | Khay gỗ phong xám, dấu máu khô | Thẻ mục tiêu / Thẻ can thiệp | Súng ngắn lên đạn, đạn chì, nút bấm bóp cò |
| **T068** | **Cult Ritual** (Nghi thức Tà giáo) | Bàn thờ tế đá khắc ký tự rêu phong | Thẻ tín đồ / Thẻ nghi lễ | Xúc tu bạch tuộc đồng, huy hiệu Cultist, triện mực tím |
