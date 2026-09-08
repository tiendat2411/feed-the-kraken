# QUY TRÌNH THỰC HIỆN TASK GIAO DIỆN & KÍCH HOẠT SKILLS (UI REVAMP SOP & SKILLS MAPPING)

Tài liệu này định nghĩa quy trình chuẩn (SOP) phân loại 2 luồng thực thi (Track A & Track B) cho toàn bộ các Task giao diện trong dự án Feed The Kraken, kèm ma trận kích hoạt Kỹ năng (Skills Mapping) tương ứng cho từng bước.

```mermaid
flowchart TD
    subgraph Track_A["Track A: Task Nền tảng & Hạ tầng Theme (T048 - T051, T056 - T057)"]
        A1["Bước A1: Báo cáo Đề xuất Tokens & Art Style<br/><i>[stitch-design-taste, high-end-visual-design, gpt-taste]</i>"] --> A2["Bước A2: Trao đổi & Chốt với User 🎯<br/><i>[Human Gatekeeper]</i>"]
        A2 --> A3["Bước A3: Cập nhật Code Nền tảng<br/><i>[full-output-enforcement, stitch-design-taste]</i>"]
        A3 --> A4["Bước A4: Kiểm tra Compilation & Font Loading<br/><i>[design-taste-frontend]</i>"]
        A4 --> A5["Bước A5: Cập nhật task.md & Đề xuất Git Commit<br/><i>[speckit-implement, rule-git-workflow]</i>"]
    end

```mermaid
flowchart TD
    subgraph Track_A["Track A: Task Nền tảng & Hạ tầng Theme (T048 - T051, T056 - T057)"]
        A1["Bước A1: Báo cáo Đề xuất Tokens & Art Style<br/><i>[stitch-design-taste, high-end-visual-design, gpt-taste]</i>"] --> A2["Bước A2: Trao đổi & Chốt với User 🎯<br/><i>[Human Gatekeeper]</i>"]
        A2 --> A3["Bước A3: Cập nhật Code Nền tảng<br/><i>[full-output-enforcement, stitch-design-taste]</i>"]
        A3 --> A4["Bước A4: Kiểm tra Compilation & Font Loading<br/><i>[design-taste-frontend]</i>"]
        A4 --> A5["Bước A5: Cập nhật task.md & Đề xuất Git Commit<br/><i>[speckit-implement, rule-git-workflow]</i>"]
    end

    subgraph Track_B["Track B: Task Trang & Linh kiện UI Cụ thể (T052 - T055, T058 - T068)"]
        B1["Bước B1: Phân tích Cấu trúc Phân tầng & Lập Kế hoạch Layer/Asset 🎯<br/><i>[image-to-code, stitch-design-taste, high-end-visual-design]</i><br/><b>(CỔNG CHẶN 1: Chờ User Chốt Kế Hoạch)</b>"] --> B2["Bước B2: Khởi tạo Mockup (Toàn cảnh / Phân tầng) & Chốt Thiết kế 🎯<br/><i>[imagegen-frontend-web, imagegen-frontend-mobile, image-to-code, brandkit]</i><br/><b>(CỔNG CHẶN 2: Chờ User Duyệt Mockup)</b>"]
        B2 --> B3["Bước B3: Bóc tách, Tách Phông & Sinh Bộ Asset Đồ họa Nguyên tử<br/><i>[image-to-code, brandkit, scripts/remove_background.py]</i>"]
        B3 --> B4["Bước B4: Lưu trữ & Tổ chức Asset Khoa học<br/><i>[frontend/src/assets/ui/]</i>"]
        B4 --> B5["Bước B5: Code Component & Kỹ thuật Ghép Layer<br/><i>[image-to-code, redesign-existing-projects, gpt-taste, full-output-enforcement]</i>"]
        B5 --> B6["Bước B6: Thẩm định Trực quan 1:1 & Build Check<br/><i>[design-taste-frontend, image-to-code]</i>"]
        B6 --> B7["Bước B7: Cập nhật task.md & Đề xuất Git Commit<br/><i>[speckit-implement, rule-code-quality, rule-git-workflow]</i>"]
    end
```

---

## 🅰️ TRACK A: Dành cho Task Nền tảng / Hạ tầng Theme (T048 - T051, T056 - T057)

### 1. Bước A1 - Báo cáo Đề xuất Hệ thống Tokens & Art Style
- **Skills kích hoạt:**
  - `stitch-design-taste`: Thiết kế bảng Design Tokens ngữ nghĩa (Semantic Tokens), phân bổ bảng màu HSL/HEX cổ điển (`--abyss`, `--hull`, `--parchment`, `--verdigris`, `--sailor`, `--pirate`, `--cult`), xây dựng hệ thống Typography đồng bộ font `'Pirata One'`.
  - `high-end-visual-design`: Thiết lập tiêu chuẩn thẩm mỹ cao cấp (chống giao diện generic AI, định nghĩa độ sâu `boxShadow.wood`, `boxShadow.parchment`, quy chuẩn bo góc sắc cạnh thô mộc `rounded-sm` / `rounded`).
  - `gpt-taste`: Định nghĩa các keyframes chuyển động vật lý có sức nặng (`candleFlicker`, `gunShake`, `shipBob`, `eldritchPulse`, `dustDrift`).
- **Hành động:** Trình bày chi tiết bảng thông số Tokens & Typography vào chat cho User đánh giá.

### 2. Bước A2 - Trao đổi & Chốt với User (CỔNG CHẶN 🎯)
- **Hành động:** Lắng nghe góp ý của User về màu sắc/font chữ. **CHỈ KHI USER CHÍNH THỨC DUYỆT** mới chuyển sang Bước A3.

### 3. Bước A3 - Cập nhật Code Nền tảng (Implementation)
- **Skills kích hoạt:**
  - `full-output-enforcement`: Đảm bảo viết đầy đủ 100% tokens, keyframes, font preconnects và utilities trong `tailwind.config.js`, `index.html`, `index.css`, `App.css`, không dùng comment rút gọn hay placeholder.
- **Hành động:** Thực hiện cập nhật mã nguồn theo đúng các tokens đã duyệt.

### 4. Bước A4 - Kiểm tra Build & Font Loading
- **Skills kích hoạt:**
  - `design-taste-frontend` (Pre-flight Audit): Kiểm tra hệ thống tokens CSS biên dịch sạch, fonts load mượt mà, `npm run build` thành công 0 lỗi.

### 5. Bước A5 - Cập nhật task.md & Git Workflow
- **Skills/Rules kích hoạt:**
  - `speckit-implement`: Cập nhật `[x]` trong `task.md`.
  - `rule-git-workflow.md`: Soạn commit message chuẩn Conventional Commits và xin phép User trước khi commit/push.

---

## 🅱️ TRACK B: Dành cho Task Trang & Linh kiện UI Cụ thể (T052 - T055, T058 - T068)

### 1. Bước B1 - Phân tích Cấu trúc Phân tầng & Lập Kế hoạch Layer/Asset (CỔNG CHẶN 1 🎯)
- **Mục tiêu:** Đối với các màn hình giao diện phức tạp (như trang Game In-Game Tabletop Desk, HUD, Seating Drawer, Mutiny, Navigation, Map...), trước khi bắt tay vào tạo bất kỳ hình ảnh Mockup nào, AI **BẮT BUỘC** phải phân tích kiến trúc phân tầng không gian và lập ma trận phân rã component/asset.
- **Skills kích hoạt:**
  - `image-to-code` (Mental Model Decomposition): Phân rã cấu trúc giao diện thành các tầng layer độc lập, nhận diện các ranh giới giữa asset hình ảnh và mã React JSX.
  - `stitch-design-taste` (Semantic Layout Hierarchy): Thiết lập phân cấp thị giác theo chiều sâu không gian, tỷ lệ kích thước các khối chính/phụ.
  - `high-end-visual-design` (Spatial Depth & Z-Index Layering): Định hình thứ tự xếp lớp, đổ bóng đa tầng (`box-shadow`), quầng sáng cục bộ và phối cảnh không gian hàng hải.
- **Hành động Bắt Buộc Cần Thực Hiện:**
  1. **Bản đồ Cấu trúc Phân tầng (Spatial Layer Hierarchy & Z-Index Ordering):**
     Phân tích và phân chia rõ ràng các tầng giao diện từ nền đáy lên đến đỉnh:
     - *Layer 0 (Canvas / Environment Background):* Mặt bàn gỗ sồi phong hóa, ánh sáng môi trường, quầng lửa nến, hạt bụi bay `dustDrift`, lớp phủ vignette.
     - *Layer 1 (Static Elements & Anchored Props):* Các vật phẩm cố định trên mặt bàn (vết nến cháy nung chảy, dao găm cắm bàn, đinh sắt gỉ...).
     - *Layer 2 (Central Interactive Workspaces):* Tấm hải đồ giấy da dê trung tâm (`MapBoardUI`), thước đo Cult Track, vạch Supply Line.
     - *Layer 3 (Dynamic Props & Floating Controls):* Súng lục flintlock, đồng tiền vàng, cốc bia gỗ, cuộn giấy da trigger góc phải (`Action Desk Trigger`).
     - *Layer 4 (Sliding Action Desk Overlay):* Khung hồ sơ thao tác trượt đè lên mặt hải đồ khi kích hoạt.
     - *Layer 5 (Under-Desk Drawers & Panels):* Hộc ngăn kéo gầm bàn không cố định trượt mở ra Seating Radar & Crew Roster.
     - *Layer 6 (Modal Overlays / Notifications):* Center Event Modal (có thể thu nhỏ thành huy hiệu nổi), Ban đêm Tà giáo, Tooltips hệ thống.
  2. **Ma Trận Phân Rã Component & Danh Mục Asset Đồ Họa (Component & Asset Decomposition Matrix):**
     Trình bày bảng ma trận chuẩn hóa gồm các cột:
     | Tên Layer / Component | Render Type (JSX / PNG / JPG / SVG) | File Asset Dự Kiến | Z-Index | Kích Thước / Tỷ Lệ / Anchor | Yêu Cầu Tách Phông (Alpha Channel) |
     | :--- | :--- | :--- | :--- | :--- | :--- |
     | *Ví dụ: Tabletop Canvas* | *JPG Texture Nền* | `game_tabletop_desk_bg.jpg` | `z-0` | `w-full h-full object-cover` | Opaque (Không tách nền) |
     | *Ví dụ: Sea Chart Paper* | *React JSX + SVG Mesh* | `MapBoardUI.jsx` | `z-10` | 75% chiều rộng bàn, căn giữa | JSX kết hợp texture biên mỏng |
     | *Ví dụ: Drawer Pull Handle* | *PNG Trong suốt* | `drawer_handle_wood.png` | `z-30` | 160x40px, gắn mép gầm bàn | **Bắt buộc Transparent PNG sạch** |
  3. **Xác Định Chiến Lược Tạo Mockup Đầu Ra Cho Bước B2:**
     Xác định rõ ở Bước B2 sẽ tạo:
     - 1 ảnh Mockup tổng thể (Master View) để soi chiếu bố cục toàn cảnh, HOẶC
     - Bộ ảnh Mockup phân tầng độc lập (State-specific / Layer-specific Mockups) nếu màn hình có nhiều trạng thái chuyển đổi phức tạp (ví dụ: trạng thái Hải đồ bình thường vs trạng thái Action Desk trượt đè lên vs trạng thái Mở hộc ngăn kéo gầm bàn).
  4. **Báo Cáo & Chốt với User (Human Gatekeeper 1 🎯):**
     - Xuất trình bản đồ phân tầng (kèm sơ đồ Mermaid) và bảng ma trận Layer/Asset chi tiết vào chat cho User đánh giá.
     - **DỪNG LẠI CHỜ USER PHÊ DUYỆT.** Tuyệt đối không tự ý dùng lệnh `generate_image` tạo Mockup khi User chưa chốt bản kế hoạch này!

---

### 2. Bước B2 - Khởi tạo Mockup (Toàn cảnh / Phân tầng) & Trao đổi Chốt Thiết kế (CỔNG CHẶN 2 🎯)
- **Skills kích hoạt:**
  - `imagegen-frontend-web` / `imagegen-frontend-mobile`: Tạo hình ảnh Mockup chi tiết theo đúng cấu trúc phân tầng và danh mục asset đã được chốt ở Bước B1; thể hiện tương phản ánh sáng firelight vs abyss, chất liệu gỗ phong hóa và da dê mép rách.
  - `image-to-code` (Mockup Reference & Layout Verification): Đảm bảo hình ảnh render ở tỷ lệ chuẩn (16:9 cho desktop, 9:16 cho mobile), độ phân giải cao, rõ ràng từng chi tiết để phục vụ bóc tách.
  - `brandkit`: Duy trì tính đồng bộ nhận diện thương hiệu game (logo gothic, hoa tiêu la bàn, ấn ký Tà thần Kraken).
- **Hành động:** Xuất trình hình ảnh Mockup cho User xem, đối chiếu với bản kế hoạch Bước B1 và nhận feedback chỉnh sửa. **CHỈ KHI USER CHÍNH THỨC DUYỆT BẢN MOCKUP** mới chuyển sang Bước B3.

---

### 3. Bước B3 - Bóc tách, Tách Phông & Sinh Bộ Asset Đồ họa Nguyên tử (Atomic Asset Generation & Decomposition)
- **Quy trình Sinh Asset Dựa Trên Ma Trận Bước B1 (BẮT BUỘC):**
  Thực hiện sinh hoặc cắt các asset đồ họa độc lập theo đúng danh sách đã được xác định tại Bảng ma trận Bước B1:
  - *Khối nền / Khung chứa:* Bệ gỗ sồi trơn (`PanelWood`), Tấm cuộn da dê trơn (`CardParchment`), Mặt bàn làm việc (`game_tabletop_desk_bg.jpg`).
  - *Linh kiện con nguyên tử (Atomic Elements):* Khay rãnh gỗ input (`input_wood_slot_clean.png`), Nhãn tag da dê (`tag_parchment_label.png`), Nút bấm kim loại/gỗ (`button_gold.png`, `button_wood.png`), Đạo cụ rời (`flintlock_prop.png`, `candle_prop.png`, `drawer_handle_wood.png`).
- **NGHIÊM CẤM TẠO ẢNH GỘP NƯỚNG CHẾT (STRICT BAN ON PRE-BAKED MONOLITHIC ASSETS):**
  - **TUYỆT ĐỐI CẤM** hành vi tạo một tấm ảnh lớn chứa sẵn tiêu đề, ô nhập liệu, tên nhãn, nút bấm hay nến cháy nướng chết chung vào một hình để dùng cho nhanh.
  - Mọi chữ viết (Game Title, Heading, Subtitle, Labels, Button text) **BẮT BUỘC PHẢI RENDER BẰNG CODE REACT/HTML THẬT** với font `Pirata One`.
  - Mọi ô input và button phải được ghép từ các component độc lập (`<InputPlank>`, `<ButtonWood>`).
- **QUY ĐỊNH BẮT BUỘC VỀ XÓA PHÔNG (TRANSPARENT PNG):**
  - Mọi file asset đồ họa UI dạng props/sprites/frames sau khi sinh **BẮT BUỘC PHẢI ĐƯỢC TÁCH NỀN THÀNH PNG TRONG SUỐT (Transparent PNG với kênh Alpha sạch)** bằng script `scripts/remove_background.py` trước khi nạp vào mã nguồn. Tuyệt đối không để lại viền đen/hộp đen bao quanh.
- **Skills kích hoạt:**
  - `image-to-code` (Asset Decomposition & Slicing).
  - `brandkit`: Chuẩn hóa chất liệu và tone màu giữa các asset để đảm bảo tính đồng bộ nhận diện.

---

### 4. Bước B4 - Lưu trữ & Tổ chức Asset Khoa học
- **Hành động:** Xuất và lưu trữ toàn bộ file PNG nguyên tử trong suốt vào đúng phân mục:
  `frontend/src/assets/ui/` (`backgrounds/`, `frames/`, `buttons/`, `sprites/`, `cards/`).

---

### 5. Bước B5 - Code Component & Kỹ thuật Ghép Layer (Component Layering & State Integration)
- **Skills kích hoạt:**
  - `image-to-code` (Deep Image Translation): Phân tích sâu các chi tiết trong Mockup đã chốt (khoảng cách padding/margin, font scale, độ nổi khối) và chuyển ngữ sang React JSX + CSS layered textures theo đúng thứ tự Z-Index của Bước B1.
  - `redesign-existing-projects`: Nâng cấp giao diện component hiện có mà **KHÔNG PHÁ VỠ GAME LOGIC**, bảo toàn 100% state React, Socket.io event listeners và props interface.
  - `gpt-taste`: Tích hợp micro-interactions, hiệu ứng hover button nổi khối, animation ánh nến chập chờn (`candleFlicker`), bụi tro bay (`dustDrift`).
  - `full-output-enforcement`: Xuất toàn bộ mã nguồn component hoàn chỉnh, tuyệt đối không dùng placeholder `/* ... */`.

---

### 6. Bước B6 - Thẩm định Trực quan 1:1 & Build Check
- **Skills kích hoạt:**
  - `image-to-code` (Visual Fidelity Audit): Soi chiếu 1:1 giữa giao diện web thực tế và bản Mockup đã chốt ở Bước B2 (đảm bảo mép giấy rách, vân gỗ nứt và quầng sáng nến hiển thị sống động).
  - `design-taste-frontend` (Pre-flight Audit): Kiểm tra responsive trên mọi kích thước (Mobile 375px đến Desktop 1920px+), zero horizontal overflow, hiệu năng đạt 60 FPS, độ tương phản văn bản đạt chuẩn WCAG AA.
- **Hành động:** Chạy `npm run build` trong `frontend/` xác nhận 0 lỗi compile.

---

### 7. Bước B7 - Cập nhật Tiến độ task.md & Đề xuất Git Workflow
- **Skills/Rules kích hoạt:**
  - `speckit-implement`: Đánh dấu hoàn thành task trong `task.md`.
  - `rule-code-quality.md`: Xuất báo cáo Self-Review Report.
  - `rule-git-workflow.md`: Soạn commit message chuẩn Conventional Commits và xin phép User trước khi commit/push.
