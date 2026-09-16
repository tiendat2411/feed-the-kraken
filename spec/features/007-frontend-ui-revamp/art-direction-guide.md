# 🎨 Art Direction Guide: Feed the Kraken

> **Codename:** *"Eldritch Parchment"*
> **Visual DNA:** Don't Starve Together × Lovecraftian Sea Horror × Gothic Sketchbook
> **Status:** Approved (v1.1 — Tinh chỉnh: +Xanh Lá Rêu, +Cũ Kỹ Tăng Cường)

---

## 1. Design Philosophy (Triết Lý Thiết Kế)

### Core Mood: "Candlelight in the Abyss"

Giao diện Feed the Kraken phải gợi lên cảm giác bạn đang ngồi trong khoang thuyền trưởng tối tăm của một con tàu buồm cổ, ánh nến chập chờn chiếu lên những trang giấy da dê ố vàng ghi chép đầy ẩn ý, trong khi bên ngoài đại dương đen kịt ẩn chứa thứ gì đó đang quan sát.

**3 trụ cột cảm xúc:**
1. **Paranoia & Tension** — Ai là đồng minh? Ai là kẻ phản bội? UI phải liên tục gợi nhắc sự bất an.
2. **Tactile Antiquity** — Mọi thứ phải cảm thấy cũ kỹ, sờ được, như đang chạm vào da thuộc, giấy cổ và gỗ mục. *Bề mặt phải có dấu vết thời gian: vết nứt, vệt ố, gỉ sét, mốc xanh.*
3. **Warm Light vs Cold Darkness** — Ánh lửa/nến là vùng an toàn, bóng tối ngoài rìa là mối đe dọa không ngừng.

### Inspiration Sources
| Nguồn | Lấy gì |
|---|---|
| **Don't Starve Together** | Bảng màu nâu ấm hẹp, nét vẽ tay run rẩy, texture gỗ ván thuyền, ánh lửa vs bóng tối, vignette viền đen, cảm giác thủ công cũ kỹ |
| **Sunless Sea / Fallen London** | Lore text gothic, bản đồ biển huyền bí, atmosphere đại dương vô tận đen kịt |
| **Darkest Dungeon** | Typography gothic sắc nét trên nền tối, stress/tension UI, narrator tone |
| **Return of the Obra Dinn** | Cảm giác phá án trên tàu buồm, sổ nhật ký điều tra |
| **Tim Burton illustration** | Nét vẽ không hoàn hảo, tỷ lệ phóng đại, gothic whimsy |

---

## 2. Color Palette (Bảng Màu)

### 2.1 Foundation Colors (Màu Nền Tảng)

> Gam nâu ấm cực hẹp + xanh lá rêu phong hóa — như gỗ cũ mọc rêu dưới lòng tàu đắm.

| Tên Token | Hex | Vai trò |
|---|---|---|
| `--abyss` | `#0A0A08` | Nền chính sâu nhất — Đại dương/Bóng tối bao phủ |
| `--hull-dark` | `#1A1510` | Nền panel chính — Gỗ thuyền tối |
| `--hull` | `#2A2118` | Nền panel phụ / Card background — Gỗ sồi sẫm |
| `--hull-light` | `#3D3228` | Viền panel nổi / Hover state — Gỗ sáng hơn |
| `--parchment` | `#D4C5A0` | Văn bản nội dung / Giấy da dê cổ |
| `--parchment-dim` | `#9B8E72` | Văn bản phụ / Placeholder — Da dê ố mờ |
| `--parchment-bright` | `#F0E6CC` | Tiêu đề nổi bật / Highlighted text |

### 2.2 Verdigris & Moss Colors (Xanh Lá Rêu — MỚI v1.1)

> Xanh lá rêu phong hóa gợi cảm giác đồng thau gỉ sét, rêu biển bám trên vách tàu cũ, tảo phát sáng dưới đáy đại dương.

| Tên Token | Hex | Vai trò |
|---|---|---|
| `--verdigris` | `#4A7A6A` | Xanh rêu đồng thau gỉ — Accent chính, viền trang trí, indicator trạng thái "safe/online" |
| `--verdigris-glow` | `#6BA89A` | Xanh rêu sáng — Hover state, glow effect cho yếu tố liên quan biển |
| `--moss` | `#3A5A3A` | Rêu tối — Background nhấn phụ, badge "connected", thanh thông tin |
| `--moss-dim` | `#2A3D2A` | Rêu cực tối — Subtle background, phân vùng nhẹ |
| `--seaweed` | `#5A8A5A` | Rong biển — Tooltips, popover background, highlight text phụ |

### 2.3 Faction Colors (Màu Phe Phái)

> Không được bão hòa quá mức. Mọi màu phe phải cảm thấy như sắc tố cổ xưa, bột màu nghiền tay, không phải neon hiện đại.

| Phe | Tên Token | Hex | Mô tả cảm xúc |
|---|---|---|---|
| **Sailor (Thủy thủ)** | `--sailor` | `#4A7A8C` | Xanh biển bạc đã phai — Mực xanh cổ trên hải đồ |
| **Sailor glow** | `--sailor-glow` | `#6BA3B8` | Phiên bản sáng hơn cho viền phát sáng |
| **Pirate (Hải tặc)** | `--pirate` | `#A83B2A` | Đỏ sẫm cháy — Máu khô trên dao cướp biển |
| **Pirate glow** | `--pirate-glow` | `#D14B35` | Ánh lửa đỏ khi nổ súng |
| **Cult (Tà giáo)** | `--cult` | `#6B3FA0` | Tím thẫm huyền bí — Mực bạch tuộc |
| **Cult glow** | `--cult-glow` | `#9B6DD7` | Hào quang phát sáng xúc tu Kraken |

### 2.4 Accent & Utility Colors (Màu Nhấn & Tiện Ích)

| Tên Token | Hex | Vai trò |
|---|---|---|
| `--gold` | `#C9A84C` | Vàng đồng thau cổ — Vương miện Captain, huy hiệu, viền card quan trọng |
| `--gold-dim` | `#8B7535` | Vàng xỉn — Viền mờ, chi tiết trang trí |
| `--firelight` | `#E8A63E` | Ánh lửa ấm — Nguồn sáng chính, glow effect ấm |
| `--ember` | `#D4622A` | Than hồng — Cảnh báo, timer gấp |
| `--blood` | `#8B1A1A` | Máu thẫm — Lỗi nghiêm trọng, sự kiện nguy hiểm |
| `--brine` | `#2A4A4A` | Xanh biển đen — Nước biển, vùng chưa khám phá |
| `--bone` | `#C8BFA8` | Xương trắng ngà — Dividers, borders nhẹ |

### 2.5 Nguyên tắc màu sắc tuyệt đối

- ❌ **KHÔNG BAO GIỜ** dùng màu bão hòa cao (saturated neon). Mọi màu phải cảm thấy như bột màu cổ, đã bị thời gian làm phai.
- ❌ **KHÔNG BAO GIỜ** dùng gradient AI-purple/blue mặc định. Gradient chỉ được dùng dưới dạng ánh lửa lan tỏa hoặc sương mù.
- ❌ **KHÔNG BAO GIỜ** dùng glassmorphism kiểu Apple / Linear. Panel phải có chất liệu gỗ/da/giấy cũ.
- ✅ Mọi hiệu ứng phát sáng (glow) phải mềm mại, mờ ảo, như ánh nến hắt qua giấy mỏng — KHÔNG BAO GIỜ cứng và sắc nét.
- ✅ Vignette (viền tối dần) áp dụng toàn cục trên mọi màn hình để tạo cảm giác nhìn qua khung cửa khoang tàu.
- ✅ Xanh lá rêu (`--verdigris`, `--moss`) dùng TIẾT CHẾ cho các chi tiết phong hóa, trạng thái kết nối, và accent trang trí — KHÔNG BAO GIỜ dùng làm màu chủ đạo.

---

## 3. Typography (Kiểu Chữ)

### Hệ thống font 3 tầng

| Tầng | Font | Vai trò | Cảm xúc |
|---|---|---|---|
| **Display** | `'Pirata One'` (Google Fonts) | Tên game, tên phe phái, sự kiện đặc biệt | Gothic hải tặc — như dòng chữ khắc trên mũi tàu |
| **Heading** | `'Cinzel'` (Google Fonts) | Tiêu đề phase, tên vai trò, nhãn panel | Cổ điển La Mã — trang trọng, uy nghi, như khắc trên đá |
| **Body** | `'Outfit'` (Google Fonts) | Nội dung, nút bấm, thông số, trạng thái | Hiện đại sắc nét — đảm bảo đọc rõ ở mọi kích thước |

### Quy tắc Typography

```
Game Title ("Feed the Kraken"):
  font: 'Pirata One'
  size: 2.5rem – 4rem (responsive)
  color: var(--gold)
  text-shadow: 0 0 20px rgba(201, 168, 76, 0.3)
  letter-spacing: 0.05em

Phase/Event Names ("MUTINY VOTE", "NAVIGATION"):
  font: 'Cinzel'
  size: 1.25rem – 1.75rem
  color: var(--parchment-bright)
  text-transform: uppercase
  letter-spacing: 0.12em

Role Names ("CAPTAIN", "CULT LEADER"):
  font: 'Cinzel'
  size: 1rem – 1.25rem
  color: [faction color tương ứng]
  font-weight: 700

Body Text / Status / Buttons:
  font: 'Outfit'
  size: 0.875rem – 1rem
  color: var(--parchment) hoặc var(--parchment-dim)
  line-height: 1.5
```

- ❌ **KHÔNG** dùng Inter, Roboto, Arial, system-ui. Quá sạch sẽ, phá vỡ thẩm mỹ cổ xưa.
- ✅ Font dự phòng (fallback): `'Georgia', 'Times New Roman', serif` cho Display/Heading, `sans-serif` cho Body.

---

## 4. Surface & Texture Language (Ngôn Ngữ Bề Mặt & Chất Liệu)

> Lấy trực tiếp từ Don't Starve: Mọi bề mặt phải có chất liệu, không bao giờ phẳng lì.
> **v1.1 — Tăng cường "Aged/Weathered":** Mọi texture phải cảm thấy bị phong hóa, cũ kỹ, bụi bặm, có vết nứt/ố — như đồ vật đã 200 năm tuổi dưới đáy biển.

### 4.1 Các lớp bề mặt (Layer Stack)

```
[Lớp 1 - Deepest]  Đại dương đen: var(--abyss) + subtle ocean wave pattern
[Lớp 2 - Panels]   Gỗ ván thuyền MỤC: var(--hull-dark) + CSS wood-grain texture + vệt rêu xanh nhẹ
[Lớp 3 - Cards]    Da thuộc ố VÀNG: var(--hull) + parchment noise + vết ố + vết cháy mép
[Lớp 4 - Overlays] Sương mù / Bụi: backdrop-blur nhẹ + dark vignette + particle bụi
[Lớp 5 - Glow]     Ánh lửa / Phát quang: box-shadow + radial gradient warm
```

### 4.2 Panel / Card Style ("Tấm Gỗ Phong Hóa")

Mọi panel và container chính trong game gợi cảm giác chất liệu gỗ tối màu phong hóa, viền nổi nhẹ với độ tương phản chiaroscuro:

```css
.panel-wood {
  background: var(--hull-dark);
  border: 1px solid var(--hull-light);
  border-radius: 4px;                    /* Gỗ thô, cạnh gần vuông */
  box-shadow:
    inset 0 1px 0 rgba(212, 197, 160, 0.05),   /* Highlight mép trên nhẹ */
    inset 0 -2px 4px rgba(0, 0, 0, 0.3),        /* Bóng trong đáy — cảm giác lõm */
    0 4px 16px rgba(0, 0, 0, 0.6);              /* Bóng đổ sâu phía dưới */
  position: relative;
}

.panel-wood::after {
  /* Hiệu ứng phong hóa nhẹ bằng CSS gradient */
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 15% 85%, rgba(74, 122, 106, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(155, 142, 114, 0.06) 0%, transparent 50%);
  pointer-events: none;
  border-radius: inherit;
}
```

### 4.3 Parchment Card Style ("Chất Liệu Giấy Da Dê Cổ")

Dùng cho thẻ bài, tài liệu, bảng thông tin nội dung:

```css
.card-parchment {
  background: linear-gradient(
    145deg,
    #3D3228 0%,
    #2A2118 50%,
    #1A1510 100%
  );
  border: 1px solid var(--gold-dim);
  border-radius: 6px;
  box-shadow:
    inset 0 0 30px rgba(0, 0, 0, 0.3),          /* Viền trong tối */
    inset 0 0 60px rgba(0, 0, 0, 0.15),          /* Vệt ố thời gian */
    0 2px 8px rgba(0, 0, 0, 0.5);
  position: relative;
}

.card-parchment::after {
  /* Viền trang trí nhẹ */
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: 4px;
  pointer-events: none;
}
```

### 4.4 Aging & Distress Effects (Hiệu Ứng Phong Hóa)

Áp dụng các hiệu ứng CSS thuần để tạo cảm giác thời gian và dấu ấn hàng hải mà không cần phụ thuộc asset hình ảnh nặng:

```css
/* Vệt ố thời gian — Dùng điểm xuyết trên panel hoặc card */
.aged-stain {
  background-image:
    radial-gradient(ellipse at 20% 80%, rgba(155, 142, 114, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 30%, rgba(139, 117, 53, 0.05) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 60%, rgba(74, 122, 106, 0.04) 0%, transparent 45%);
}

/* Gỉ đồng xanh — Verdigris patina cho các chi tiết kim loại */
.verdigris-patina {
  background: linear-gradient(135deg, var(--gold-dim) 30%, var(--verdigris) 70%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 4.5 Corner Radius Philosophy

- ❌ **KHÔNG** dùng `rounded-2xl`, `rounded-3xl`, `rounded-full` cho panel/card.
- ✅ `rounded` (4px) hoặc `rounded-sm` (2px) — Cạnh vuông vức, cổ kính.
- ✅ Ngoại lệ duy nhất: Nút bấm hành động có thể dùng `rounded-md` (6px).

---

## 5. Lighting System (Hệ Thống Ánh Sáng)

### 5.1 Global Vignette

```css
.game-viewport::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 40%,
    rgba(10, 10, 8, 0.4) 70%,
    rgba(10, 10, 8, 0.8) 100%
  );
  pointer-events: none;
  z-index: 50;
}
```

### 5.2 Firelight Glow (Hào Quang Lửa)

```css
.firelight-glow {
  box-shadow:
    0 0 15px rgba(232, 166, 62, 0.15),
    0 0 40px rgba(232, 166, 62, 0.08);
}
```

### 5.3 Eldritch Glow (Hào Quang Tà Giáo)

```css
.eldritch-glow {
  box-shadow:
    0 0 20px rgba(107, 63, 160, 0.25),
    0 0 60px rgba(107, 63, 160, 0.1);
  animation: eldritch-pulse 3s ease-in-out infinite;
}

@keyframes eldritch-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(107, 63, 160, 0.25); }
  50%      { box-shadow: 0 0 35px rgba(155, 109, 215, 0.35); }
}
```

### 5.4 Verdigris Glow (Hào Quang Rêu — MỚI v1.1)

Dùng cho indicator trạng thái "online", tooltip biển, và chi tiết phong hóa:

```css
.verdigris-glow {
  box-shadow:
    0 0 10px rgba(74, 122, 106, 0.2),
    0 0 30px rgba(74, 122, 106, 0.08);
}
```

### 5.5 Quy tắc ánh sáng

- Nguồn sáng chính luôn là **ấm** (vàng/cam lửa) — KHÔNG BAO GIỜ là trắng lạnh.
- Bóng đổ luôn **sâu và tối** — không bao giờ mờ nhạt kiểu `shadow-sm`.
- Eldritch glow (tím) chỉ xuất hiện trong ngữ cảnh Cult — KHÔNG dùng tràn lan.
- Verdigris glow (xanh rêu) dùng tiết chế cho các chi tiết biển và trạng thái — KHÔNG thay thế firelight.

---

## 6. Motion & Animation Philosophy (Triết Lý Chuyển Động)

### 6.1 Nguyên tắc chung

> Chuyển động phải **nặng nề, chậm rãi, đầy trọng lượng** — như sóng biển dập dềnh, đồ vật cũ kỹ nặng nề.

| Loại | Timing | Easing |
|---|---|---|
| Card flip / Reveal | 600-800ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Panel slide in | 400-500ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Glow pulse | 2.5-4s loop | `ease-in-out` |
| Ship bobbing | 3-5s loop | `ease-in-out` |
| Hover feedback | 200-250ms | `ease-out` |
| Screen shake (gun) | 300-400ms | `ease-out` + decay |
| Dust particle drift | 8-15s loop | `linear` |

### 6.2 Don't Starve-Inspired Motion

- **Lửa chập chờn (Candle Flicker):** Opacity nhấp nháy nhẹ (0.85 → 1.0) trên các nguồn sáng.
- **Sương mù trôi (Fog Drift):** Lớp phủ sương mù di chuyển rất chậm ngang qua màn hình.
- **Xúc tu gợn sóng (Tentacle Writhe):** SVG xúc tu di chuyển chậm ở rìa màn hình (chỉ sự kiện Cult).
- **Hạt bụi trôi (Dust Particles — MỚI v1.1):** Vài hạt bụi/tro bay nhẹ qua ánh nến, tăng cảm giác cũ kỹ và hoang phế.

### 6.3 Cấm

- ❌ Bounce / Spring nảy lò xo
- ❌ Linear easing (chuyển động máy móc)
- ❌ Hoạt cảnh liên tục không mục đích
- ✅ `prefers-reduced-motion` PHẢI được tôn trọng

---

## 7. Iconography & Visual Elements

### 7.1 Icon Style

- Dùng **Lucide React** với `strokeWidth={1.5}` — nét mảnh, thanh lịch.
- Biểu tượng hàng hải và lore dùng SVG thủ công hoặc custom asset đồ họa — **TUYỆT ĐỐI KHÔNG dùng emoji Unicode** (tuân thủ Rule 7).

### 7.2 Decorative Motifs & Atmosphere (Tham Khảo Linh Hoạt)

Các chi tiết trang trí đóng vai trò bồi đắp bầu không khí hàng hải cổ kính, được sử dụng linh hoạt phù hợp với từng layout và thiết bị, không bắt buộc hay gò bó vị trí cố định:
- Họa tiết la bàn hoa gió, hoa văn sóng biển hoặc xúc tu cách điệu.
- Đường kẻ phân cách phong cách hàng hải (divider nhẹ, đường nét chạm khắc cổ).
- Điểm xuyết phong hóa: dấu vết thời gian, vệt rêu mờ hoặc ánh kim loại đồng thau phong hóa.

---

## 8. Application Per Screen (Định Hướng Không Gian Cho Từng Màn Hình)

### 8.1 Home (Trang Chủ)

- **Không gian & Cảm xúc:** Đại dương đen kịt (`--abyss`), ánh sáng ấm chập chờn, chiều sâu tĩnh lặng đầy bí ẩn.
- **Thành phần cốt lõi:** Bảng thao tác trung tâm (chất liệu giấy da dê cổ trên nền khung gỗ phong hóa), tiêu đề game gothic `Pirata One` phát sáng vàng đồng ấm áp, form nhập liệu và nút bấm hành động có độ tương phản cao và xúc giác rõ nét.
- **Bầu không khí:** Vignette tối viền, hạt bụi bay nhẹ qua ánh sáng ấm.

### 8.2 Lobby (Sảnh Chờ)

- **Không gian & Cảm xúc:** Buồng chỉ huy hoặc boong tàu tập hợp thuyền viên trước giờ xuất phát.
- **Thành phần cốt lõi:**
  - Danh sách thuyền viên (Crew Roster): Thẻ người chơi chất liệu gỗ phong hóa, phân định rõ trạng thái trực tuyến (ngọc verdigris) và vai trò Chủ phòng (Host).
  - Bảng cài đặt hành trình (Voyage Settings): Mã phòng trực quan kèm thao tác sao chép, bộ chọn hải đồ (Quick/Long Journey) và avatar thuyền viên.
  - Nút xuất phát (`START VOYAGE`): Nổi bật, trang trọng, chỉ kích hoạt khi đủ điều kiện nhân sự.

### 8.3 In-Game Command Layout & HUD (Giao Diện Bàn Chỉ Huy Trong Trận)

- **Kiến trúc phân tầng cốt lõi (Xem chi tiết tại [ingame-command-layout-spec.md](./ingame-command-layout-spec.md)):**
  1. **Nền không gian bao quát (Ambient Canvas):** Buồng thuyền trưởng (`cabin_room_bg.jpg`) bao quát toàn trang, mang lại chiều sâu không gian điện ảnh chiaroscuro.
  2. **Bàn Thuyền Trưởng (Work Desk Container):** Container độc lập đặt cân đối ở trung tâm (~80-85% viewport), tuân thủ nghiêm ngặt **góc nhìn vuông góc 90° phẳng (Orthographic Flat Lay)**. Mép đáy bàn kết thúc phẳng, không vẽ mặt đứng ngăn kéo hay chân bàn để tránh xung đột xếp lớp.
  3. **Central Stage (Khu vực trung tâm bàn):** Chiếm 70% - 80% diện tích mặt bàn, là trung tâm điều khiển xen kẽ tại chỗ:
     - *Mặc định:* Hiển thị Hải đồ trung tâm (`MapBoardUI.jsx`).
     - *Thao tác:* Trải đè Action Desk tại chỗ khi tương tác trigger hoặc tới lượt hành động.
  4. **Action Desk Trigger:** Điểm kích hoạt thao tác trực quan bố trí trên mặt bàn.
  5. **Tactile Under-Drawer (Hộc ngăn kéo gầm bàn độc lập):** Nằm dưới mép đáy bàn (non-sticky), trượt mở độc lập để hiển thị Seating Radar (vị trí ngồi la bàn) và Crew Roster (danh sách thủy thủ đoàn).
  6. **HUD Header Cố Định:** Hiển thị thông tin phòng, vòng chơi, tiến trình Cult Track và các nút điều hướng cơ bản.

### 8.4 Role Reveal (Chia Vai Bí Mật)

- **Thẻ bài vai trò:** Thẻ phong cách tarot cổ — mặt sau da dê tối có hoa văn nhận diện, mặt trước hiển thị phe phái, biểu tượng và mục tiêu chiến thắng. Hiệu ứng lật thẻ 3D trang trọng (600ms) kèm ánh sáng ấm.
- **Màn che bóng đêm (Night Overlay):** Phông đen huyền bí kết hợp ánh mắt Kraken tím eldritch-pulse chập chờn và đếm ngược thời gian.

### 8.5 Mutiny Board (Bỏ Phiếu Nổi Loạn)

- Giao diện đặt cược súng bí mật với phản hồi trực quan khi chọn số súng.
- Khi công bố kết quả: Hiệu ứng rung màn hình nhẹ, hiển thị rõ ràng thứ bậc số súng cược và vinh danh Thuyền trưởng mới.

### 8.6 Navigation (Điều Hướng Lái Tàu)

- Hiển thị 3 lá bài điều hướng với nhận diện màu sắc đặc trưng của 3 phe (Sailor xanh biển bạc, Pirate đỏ sẫm, Cult tím thẫm).
- Thao tác chọn giữ và loại bỏ bài trực quan, tương phản rõ rệt.

### 8.7 MapBoard (Bản Đồ Hải Trình)

- Bản đồ hàng hải cổ điển trên nền giấy da dê phong hóa, đường nét lộ trình rõ ràng.
- 3 vùng cập bến của 3 phe phân biệt rõ nét; con tàu di chuyển theo từng chặng; các ô sự kiện có biểu tượng sắc nét kèm popover giải thích.

### 8.8 End Game (Vinh Danh Chiến Thắng)

- Banner chiến thắng hoành tráng theo phe thắng cuộc (Sailor / Pirate / Cult).
- Lật mở đồng loạt vai trò thật sự của toàn bộ người chơi trên bàn, kèm các nút điều hướng trở về sảnh hoặc rời phòng.

---

## 9. Do's and Don'ts (Nên và Không Nên)

### ✅ Nên (DO)
- Dùng texture (wood grain, parchment noise, ink splatter) trên mọi bề mặt
- Thêm hiệu ứng phong hóa: vệt ố, rêu xanh, gỉ sét, cháy mép, bụi
- Giữ gam màu ấm, tối, hẹp — như trong khoang tàu ánh nến
- Xanh lá rêu (`--verdigris`) dùng tiết chế cho chi tiết biển và trạng thái
- Tạo tương phản sáng/tối cực mạnh
- Mọi chuyển động phải nặng nề, chậm rãi, có trọng lượng
- Luôn có vignette tối viền
- Mobile-first

### ❌ Không Nên (DON'T)
- Glassmorphism / backdrop-blur trong suốt kiểu Apple
- Gradient neon AI-purple mặc định
- Rounded-2xl trở lên
- Font sạch sẽ kiểu Inter/Roboto/Helvetica
- Bóng đổ nhẹ nhàng (`shadow-sm`)
- Màu trắng tinh khiết (`#FFFFFF`) — Sáng nhất là `--parchment-bright`
- Bề mặt hoàn toàn phẳng lì không texture
- Animation nhanh và nảy (bouncy spring)
- Xanh lá neon cho online indicator — dùng `--verdigris` thay thế

---

## 10. Tailwind Theme Extension

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        abyss: '#0A0A08',
        hull: { dark: '#1A1510', DEFAULT: '#2A2118', light: '#3D3228' },
        parchment: { dim: '#9B8E72', DEFAULT: '#D4C5A0', bright: '#F0E6CC' },
        // Verdigris & Moss (MỚI v1.1)
        verdigris: { DEFAULT: '#4A7A6A', glow: '#6BA89A' },
        moss: { dim: '#2A3D2A', DEFAULT: '#3A5A3A' },
        seaweed: '#5A8A5A',
        // Faction
        sailor: { DEFAULT: '#4A7A8C', glow: '#6BA3B8' },
        pirate: { DEFAULT: '#A83B2A', glow: '#D14B35' },
        cult: { DEFAULT: '#6B3FA0', glow: '#9B6DD7' },
        // Accent & Utility
        gold: { dim: '#8B7535', DEFAULT: '#C9A84C' },
        firelight: '#E8A63E',
        ember: '#D4622A',
        blood: '#8B1A1A',
        brine: '#2A4A4A',
        bone: '#C8BFA8',
      },
      fontFamily: {
        display: ['"Pirata One"', 'Georgia', 'serif'],
        heading: ['"Cinzel"', '"Times New Roman"', 'serif'],
        body: ['"Outfit"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '6px',
      },
    },
  },
}
```

---

> **Version:** 1.1 | **Approved:** 2026-08-27 | **Changes:** Thêm gam xanh lá rêu (Verdigris/Moss), tăng cường hiệu ứng phong hóa/cũ kỹ (aging/weathering/distress), loại bỏ glassmorphism, thêm hạt bụi, đinh gỉ, rêu xanh, vết ố.
