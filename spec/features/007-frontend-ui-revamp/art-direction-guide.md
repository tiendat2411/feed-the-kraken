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

### 4.2 Panel / Card Style ("Tấm Gỗ Mục")

Mọi panel và card trong game phải cảm thấy như một tấm ván gỗ mục, bị nước biển ăn mòn, đóng đinh sắt gỉ lên vách tàu:

```css
.panel-wood {
  background: var(--hull-dark);
  border: 1px solid var(--hull-light);
  border-radius: 4px;                    /* Gỗ thô, cạnh gần vuông */
  box-shadow:
    inset 0 1px 0 rgba(212, 197, 160, 0.05),   /* Highlight mép trên nhẹ */
    inset 0 -2px 4px rgba(0, 0, 0, 0.3),        /* Bóng trong đáy — cảm giác lõm cũ */
    0 4px 16px rgba(0, 0, 0, 0.6);              /* Bóng đổ sâu phía dưới */
  position: relative;
}

.panel-wood::before {
  /* Lớp noise texture mô phỏng thớ gỗ phong hóa */
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textures/wood-grain-weathered.png');
  opacity: 0.08;
  mix-blend-mode: overlay;
  pointer-events: none;
  border-radius: inherit;
}

.panel-wood::after {
  /* Lớp vết ố, rêu nhẹ — cảm giác 200 năm dưới đáy biển */
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

### 4.3 Parchment Card Style ("Giấy Da Dê Cổ")

Dùng cho thẻ bài vai trò, thẻ điều hướng, tooltip lore. **Phải có vết ố, vết cháy mép, và texture sần sùi:**

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
    inset 0 0 30px rgba(0, 0, 0, 0.3),          /* Viền trong tối — cảm giác lõm */
    inset 0 0 60px rgba(0, 0, 0, 0.15),          /* Vệt ố thời gian */
    0 2px 8px rgba(0, 0, 0, 0.5);
}

.card-parchment::before {
  /* Lớp texture giấy cổ sần sùi */
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textures/parchment-cracked.png');
  opacity: 0.07;
  mix-blend-mode: soft-light;
  pointer-events: none;
  border-radius: inherit;
}

.card-parchment::after {
  /* Viền vàng trang trí nhẹ — đã bị thời gian làm mờ */
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: 4px;
  pointer-events: none;
}
```

### 4.4 Aging & Distress Effects (Hiệu Ứng Phong Hóa — v1.1)

Áp dụng các hiệu ứng CSS thuần để tạo cảm giác đồ vật cũ kỹ, không cần asset hình ảnh nặng:

```css
/* Vệt ố thời gian — Dùng cho mọi panel và card */
.aged-stain {
  background-image:
    radial-gradient(ellipse at 20% 80%, rgba(155, 142, 114, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 30%, rgba(139, 117, 53, 0.05) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 60%, rgba(74, 122, 106, 0.04) 0%, transparent 45%);
}

/* Mép cháy/rách — Dùng cho thẻ bài, thư từ, hải đồ */
.burnt-edges {
  mask-image: url('/textures/torn-edge-mask.svg');
  mask-size: cover;
  mask-repeat: no-repeat;
}

/* Đinh sắt gỉ — Decorative nail heads cho panel gỗ */
.nail-head::before,
.nail-head::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle, #5A4A3A 30%, #3D3228 70%);
  box-shadow: inset 0 -1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(212,197,160,0.1);
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
- ✅ `rounded` (4px) hoặc `rounded-sm` (2px) — Gỗ thô, cạnh gần vuông.
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
- SVG thủ công hoặc emoji Unicode cho lore: ⚓ 🏴‍☠️ 🐙 👑 ⚔️ 🗡️ 🔱 💀 🧭

### 7.2 Decorative Elements

| Element | Mô tả | Nơi sử dụng |
|---|---|---|
| **Compass Rose** | La bàn hoa gió SVG cổ điển | Trang chủ, góc bản đồ |
| **Rope Border** | Viền dây thừng xoắn | Divider giữa các section |
| **Anchor Divider** | Mỏ neo nhỏ làm separator | Giữa các panel |
| **Wax Seal** | Con dấu sáp tròn | Đánh dấu vai trò Captain |
| **Tentacle Corners** | Xúc tu cuộn ở góc | Frame cho sự kiện Cult |
| **Ink Splatter** | Vệt mực loang | Background accent nhẹ |
| **Rust Spots** | Vết gỉ sắt (MỚI v1.1) | Đinh, bản lề, chi tiết kim loại |
| **Moss Patches** | Vệt rêu xanh (MỚI v1.1) | Góc panel gỗ, mép bản đồ |

---

## 8. Application Per Screen (Áp Dụng Cho Từng Màn Hình)

### 8.1 Home (Trang Chủ)

- **Nền:** Đại dương đen kịt (`--abyss`) với sóng ngầm di chuyển rất chậm.
- **Trung tâm:** Panel giấy da dê cổ trên khung gỗ mục, viền vàng mờ đã ố, đinh sắt gỉ ở 4 góc.
- **Title:** "Feed the Kraken" bằng `Pirata One`, phát sáng vàng đồng mềm, tentacle ẩn hiện phía sau chữ.
- **Inputs:** Thanh gỗ khắc chìm, viền rêu nhẹ (`--verdigris`) khi focus.
- **Buttons:** Nút gỗ khắc nổi (embossed wood), hover phát sáng firelight, vệt rêu mờ ở mép.
- **Atmosphere:** Vignette nặng, hạt bụi bay nhẹ qua ánh nến.

### 8.2 Lobby (Sảnh Chờ)

- **Nền:** Sàn gỗ ván thuyền (`--hull-dark`) với texture wood-grain phong hóa.
- **Crew List:** Mỗi người chơi = tấm thẻ gỗ mục đóng đinh gỉ lên vách tàu, vệt rêu nhẹ ở góc.
- **Host Crown:** Vương miện vàng đồng gỉ xanh (`--verdigris-patina`).
- **Map Selection:** 2 cuộn giấy hải đồ cũ ố vàng.
- **Start Button:** Nút lớn kiểu bánh lái tàu (ship wheel) bằng gỗ tối, phát sáng firelight khi hover.
- **Online indicator:** Chấm xanh rêu (`--verdigris`) thay vì xanh lá neon.

### 8.3 Game HUD (Thanh Điều Khiển Trong Trận)

- **Top Bar:** Thanh gỗ sẫm phong hóa cố định, chứa: Mã phòng (khắc vào gỗ), Round counter, Cult Track (tím ẩn hiện), nút xem Role.
- **Main Stage:** Vùng trung tâm hiển thị nội dung phase hiện tại.
- **Crew Dock:** Thẻ gỗ mục của từng thuyền viên — chức danh, số súng, trạng thái (verdigris dot).

### 8.4 Role Reveal (Chia Vai Bí Mật)

- **Thẻ bài:** Mặt sau = xúc tu Kraken vàng trên da dê tối ố, viền vàng gỉ. Mặt trước = phe + biểu tượng + mục tiêu.
- **Hiệu ứng lật:** 3D flip 180° (600ms), ánh sáng lửa hắt lên khi lật.
- **Night Overlay:** Màn đen kịt + đôi mắt Kraken tím chập chờn + đếm ngược vòng tròn ember.

### 8.5 Mutiny Board (Bỏ Phiếu Nổi Loạn)

- **Súng cược:** Đồng tiền vàng cổ hoặc flintlock pistol đặt trên bàn gỗ mục.
- **Khay bỏ phiếu:** Rương gỗ cũ có bản lề gỉ.
- **Kết quả:** Rương mở ra + screen shake nhẹ, súng đổ ra với hiệu ứng kim loại cũ.

### 8.6 Navigation (Lái Tàu)

- **Khay bài:** 3 lá bài cổ nằm úp trên bàn gỗ mục.
- **3 màu bài:** Blue (`--sailor`), Red (`--pirate`), Yellow (`--cult`) — tất cả đều mờ đục kiểu mực cũ.
- **Chọn bài:** Bấm chọn → viền vàng + sáng lên. Loại → mờ đi + trượt ra ngoài.

### 8.7 MapBoard (Bản Đồ Hải Trình)

- **Nền:** Hải đồ da dê cổ — giấy ố vàng, vệt ố nâu, mép rách/cháy.
- **Đường vẽ:** Mực lông vũ, nét run rẩy không hoàn hảo.
- **Con tàu:** Tàu buồm nhỏ dập dềnh, gỗ tối ám khói.
- **3 điểm đích:** Sailor Cove (bến cảng xanh rêu), Crimson Cove (hang đá đỏ lửa), Kraken Sanctuary (vực xoáy tím).
- **Viền bản đồ:** Rêu xanh mờ nhẹ ở góc (`--moss-dim`).

### 8.8 End Game (Kết Thúc)

- **Sailor Win:** Banner hải quân, cờ xanh tung bay, ánh bình minh ấm.
- **Pirate Win:** Jolly Roger cháy rực lửa đỏ, khói lan tỏa.
- **Cult Win:** Xúc tu Kraken trồi lên, nuốt chửng tàu, hào quang tím bùng nổ.
- **Role Reveal:** Tất cả thẻ vai trò lật mở đồng loạt trên bàn gỗ mục.

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
