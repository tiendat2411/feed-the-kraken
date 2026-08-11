# Core Game Mechanics Specification (Feed the Kraken)

## 1. Glossary & Entity Model (Từ điển & Mô hình Thực thể)

Hệ thống quản lý trạng thái trò chơi (Game State) dựa trên các thực thể cốt lõi sau:

### 1.1. Player (Người chơi)
* **`id`**: Chuỗi định danh duy nhất (UUID) cho mỗi kết nối.
* **`nickname`**: Tên hiển thị của bạn chơi (nhập lúc vào phòng).
* **`faction`**: Phe ẩn thuộc 1 trong 4 loại: `SAILOR`, `PIRATE`, `CULT_LEADER`, `CULTIST`.
* **`current_badge`**: Chức danh ban điều hướng hiện tại: `CAPTAIN`, `LIEUTENANT`, `NAVIGATOR`, hoặc `NONE`.
* **`gun_count`**: Số lượng súng hiện có trên tay (Mặc định bắt đầu = 3)[cite: 77].
* **`status`**: Trạng thái vận hành: `ACTIVE` (đang trên tàu), `OFF_DUTY` (đang nghỉ phép), `ELIMINATED` (đã bị ném cho Kraken ăn hoặc tự nhảy tàu)[cite: 193, 297, 357].
* **`is_convertible`**: Cờ logic xác định người chơi có thể bị thu nạp vào giáo phái hay không (Mặc định = `true`)[cite: 401, 555].
* **`speech_restricted`**: Cờ xác định người chơi có bị dính hiệu ứng cấm chat chữ hay không (Mặc định = `false`)[cite: 334, 520].

### 1.2. Navigation Card Actions Detail (Chi tiết Hiệu ứng Lá bài Điều hướng chuẩn Rulebook)
Mỗi lá bài trong deck lưu trữ 2 thuộc tính: `color_direction` (Hướng đi) và `card_action` (Hiệu ứng)[cite: 32, 254]. Logic lập trình được định nghĩa chính xác theo trang 14 của luật chơi như sau:
* **`NONE`**: Không có hiệu ứng phụ, tàu chỉ di chuyển theo hướng màu của lá bài[cite: 254].
* **`DRUNK` (Say rượu)**: Thuyền trưởng đương nhiệm lập tức mất chức danh [cite: 376-377]. Chức danh Thuyền trưởng (`CAPTAIN`) tự động chuyển giao theo chiều kim đồng hồ đến người chơi kế tiếp đang sở hữu ít lá bài điều hướng tích lũy trước mặt (Official Résumés) nhất[cite: 377]. Nhật ký hành trình (Logbook) được bàn giao ngay cho Thuyền trưởng mới[cite: 378]. Người không có lưỡi (dính hiệu ứng `Off with the Tongue`) sẽ bị hệ thống bỏ qua không cho nhận chức danh này[cite: 337, 540].
* **`CULT_UPRISING` (Nghi thức Giáo phái)**: Kích hoạt một nghi thức giáo phái đặc biệt ở cuối giai đoạn điều hướng [cite: 368-369]. Thuyền trưởng bắt buộc phải chọn lật mở một lá bài Nghi thức Giáo phái (`Cult Ritual Card`) ngẫu nhiên đang úp trên bàn[cite: 370].
* **`ARMED` (Cấp súng)**: Hoa tiêu (Navigator) của lượt điều hướng hiện tại được hệ thống phát thêm +1 súng từ kho cung ứng chung [cite: 364-365]. *(Lưu ý: Chỉ kích hoạt hiệu ứng này khi chơi bản đồ Long Journey)*[cite: 365].
* **`DISARMED` (Tịch thu súng)**: Hoa tiêu (Navigator) của lượt điều hướng hiện tại bắt buộc phải giao nộp bỏ 1 súng từ nguồn cung cá nhân của mình về nguồn chung (nếu họ đang có súng) [cite: 366-367].
* **`MERMAID` (Nàng tiên cá)**: Thuyền trưởng chọn một người chơi bất kỳ [cite: 358-359]. Người chơi được chọn này sẽ tiến hành xáo trộn 3 lá bài điều hướng bị hủy gần nhất trong chồng bài bỏ (`discard_pile`) và bí mật xem chúng[cite: 359]. Họ có quyền thảo luận (thật hoặc dối) về những gì mình nhìn thấy[cite: 360].
* **`TELESCOPE` (Kính viễn vọng)**: Thuyền trưởng chọn một người chơi bất kỳ [cite: 361-362]. Người chơi được chọn này tiến hành xem bí mật lá bài điều hướng nằm trên cùng của chồng bài bốc (`draw_pile`)[cite: 362]. Họ có quyền lựa chọn đặt lá bài đó trả lại đỉnh chồng bốc hoặc hủy thẳng nó vào chồng bài bỏ (`discard_pile`) [cite: 363-364].

### 1.3. Cult Ritual Cards Detail (Chi tiết 5 lá bài Nghi thức Giáo phái)
Theo danh mục thành phần trò chơi, bộ bài Nghi thức gồm chính xác 5 lá bài tương ứng với các luồng logic số hóa sau [cite: 23-24]:
* **`The Cult's Guns Stash` (1 lá)**: Kích hoạt trạng thái phân phối súng bí mật[cite: 383]. Hệ thống bật giao diện nhắm mắt cho toàn phòng[cite: 386]. Thao tác dành riêng cho Giáo chủ (`CULT_LEADER`) mở mắt và phân bổ bí mật tổng cộng 3 khẩu súng từ kho cung ứng chung cho các player tùy ý (có thể dồn nhiều súng cho cùng một người hoặc tự cấp cho mình) [cite: 384, 388-389].
* **`Cult Cabin Search` (1 lá)**: Kích hoạt luồng soi phe Ban điều hướng[cite: 390]. Hệ thống tự động gom trạng thái phe ẩn (`faction`) hiện tại của cả 3 người chơi đang giữ badge Captain, Lieutenant, và Navigator vòng này và chỉ hiển thị duy nhất trên màn hình của Giáo chủ trong 30 giây [cite: 390-393]. Các player khác ở trạng thái màn hình chờ nhắm mắt[cite: 391].
* **`Conversion to Cult` (3 lá)**: Kích hoạt quy trình thu nạp giáo đồ bí mật[cite: 396, 400]. Hệ thống tự động lọc các player hợp lệ (`is_convertible == true`), hiển thị danh sách để Giáo chủ nhấn chọn mục tiêu [cite: 400-401, 555-556]. Người bị chọn sẽ lập tức bị hệ thống ghi đè thuộc tính `faction = CULTIST`, thay đổi win condition sang phe Giáo phái kể từ thời điểm đó[cite: 397, 409, 551, 561].

### 1.4. Global Game State & Chồng bài bốc (Draw Pile)
* **`ship_position`**: Tọa độ ô hiện tại của con tàu trên lưới bản đồ[cite: 57, 107].
* **`draw_pile`**: Mảng chứa danh sách các lá bài điều hướng còn lại trong hòm rút[cite: 45, 73, 112].
* **`discard_pile`**: Mảng chứa danh sách các lá bài đã bị hủy vào lòng đại dương[cite: 46, 227, 231].
* **`logbook_cards`**: Mảng chứa tối đa 2 lá bài nằm trong Nhật ký hành trình truyền cho Navigator[cite: 20, 228].

> 🔄 **Quy tắc làm mới bài bốc (Reshuffle Rule):** Khi `draw_pile` bị hết hoặc không đủ số lượng bài để thực hiện hành động rút (Draw), hệ thống lập tức lấy toàn bộ bài từ `discard_pile`, xáo trộn ngẫu nhiên (Shuffle) rồi nối vào **bên dưới** các lá bài còn sót lại của `draw_pile` để tạo thành chồng bài bốc mới [cite: 283-284]. 
> ⚠️ **Tuyệt đối bất biến:** Không được phép đưa các lá bài đang nằm trong Nhật ký hành trình (`logbook_cards`) hoặc lá bài vừa được chọn để điều hướng tàu ở vòng hiện tại vào lượt xáo bài này.

---

## 2. Core State Machine & Game Loop (Vòng lặp Trạng thái)

Hệ thống chuyển dịch tuần tự qua các trạng thái (States) theo mô hình máy trạng thái dưới đây:
Xem file Game_State_Loop_Diagram.drawio để có cái nhìn tổng quan về sơ đồ.

### Chi tiết hành vi xử lý của hệ thống tại các State cốt lõi:
1. **`ROLE_DISTRIBUTION`**: Dựa vào tổng số người trong phòng (5-11), server tự động chia bài phe phái ẩn[cite: 92, 147].
2. **`PIRATES_GATHERING`**: Server mở kênh hiển thị đặc biệt trong 20 giây[cite: 167]. Những client có `faction == PIRATE` sẽ nhìn thấy `id` và `nickname` của các Pirate khác [cite: 163-166]. Các phe khác hiển thị màn hình chờ mờ ẩn danh.
3. **`APPOINT_TEAM`**: Bật giao diện cho người có `current_badge == CAPTAIN` chọn 1 Lieutenant và 1 Navigator [cite: 189-190]. Danh sách ứng viên tự động áp dụng bộ lọc thông minh ở mục 3.3.
4. **`LOYALTY_CHECK`**: Chờ tất cả người chơi `status == ACTIVE` gửi số lượng súng muốn bỏ phiếu (`0` đến `current_gun_count`)[cite: 196, 200].
5. **`NAVIGATION`**: 
    * Captain rút 2 bài từ `draw_pile`, chọn hủy 1, giữ 1 bỏ vào `logbook_cards` [cite: 225, 227-228].
    * Lieutenant rút 2 bài kế tiếp, chọn hủy 1, giữ 1 bỏ vào `logbook_cards` [cite: 226-228].
    * Hệ thống xáo trộn (shuffle) mảng `logbook_cards` để Navigator không biết lá nào của ai[cite: 229].
    * Navigator chọn 1 lá để thực thi, 1 lá hủy vào `discard_pile`[cite: 231, 239].
6. **`EXECUTE_ACTIONS`**: Cập nhật dịch chuyển `ship_position` theo màu của lá bài được chọn[cite: 240, 254]. Kích hoạt tuần tự: **Hành động ô Bản đồ (Map Action)** -> **Hành động trên lá bài (Card Action)**[cite: 255, 257].
7. **`WIN_CONDITION_CHECK` (Kiểm tra Điều kiện Thắng)**: 
    * Hệ thống thực hiện quét kiểm tra toàn bộ dữ liệu bàn cờ theo thời gian thực dựa trên các ràng buộc bất biến tại mục 3.6.
    * **Rẽ nhánh luồng đi:** Nếu hệ thống xác nhận thỏa mãn bất kỳ điều kiện thắng nào (Tàu chạm vào một trong ba vùng đích `Bluewater Bay`, `Crimson Cove`, `Kraken` hoặc `CULT_LEADER` bị dính trạng thái `ELIMINATED`), trò chơi dừng lập tức và chuyển dịch sang trạng thái `[END_GAME]`. Nếu chưa có phe nào thắng, hệ thống tự động chuyển luồng sang bước 8.
8. **`OFF_DUTY_SHIFT` (Hoán đổi Thẻ nghỉ phép)**: Quy trình hoán đổi thiết lập như sau:
    * Bước 1: Hệ thống tự động lấy lại thẻ nghỉ phép của vòng trước bằng cách chuyển trạng thái của tất cả người chơi đang là `OFF_DUTY` về lại `ACTIVE`[cite: 281].
    * Bước 2: Phân loại những người chơi của lượt vừa thực hiện thành công sẽ bị `OFF_DUTY` dựa vào quy mô của lobby theo quy tắc sau[cite: 280]:
        * 5-6 người chơi: Chỉ có Hoa tiêu (Navigator) bị `OFF_DUTY`.
        * 7-8 người chơi: Hoa tiêu (Navigator) và Thuyền phó (Lieutenant) bị `OFF_DUTY`.
        * 9-11 người chơi: Thuyền trưởng (Captain), Thuyền phó (Lieutenant) và Hoa tiêu (Navigator) đều bị `OFF_DUTY`.
    * *(Quyền Thuyền trưởng CAPTAIN mặc định được giữ nguyên cho người cũ, không tự động thay đổi trừ khi bị lật đổ bởi Mutiny hoặc dính hiệu ứng lá bài DRUNK)* [cite: 213-214, 376-377]. Quay lại bước 3.

---

## 3. Invariant Rules (Quy tắc Bất biến Hệ thống)

### 3.1. Cấu hình phe phái theo Chế độ Bản đồ (Map Mode)
Chế độ bản đồ không cố định mà được cấu hình động dựa trên lựa chọn của Trưởng phòng (Host) tại sảnh chờ (`map_mode`: `QUICK_JOURNEY` hoặc `LONG_JOURNEY`) [cite: 16, 53-55, 106]. Cấu hình số lượng phe phái ẩn dựa theo số lượng người tham gia phòng chơi[cite: 92, 147]:

| Số người chơi | Phe Sailor (Thủy thủ) | Phe Pirate (Hải tặc) | Phe Cult Leader (Giáo chủ) | Phe Cultist (Giáo đồ) |
| :--- | :--- | :--- | :--- | :--- |
| **5 người** | Biến động: 3 hoặc 2 | Biến động: 1 hoặc 2 | 1 | 0 |
| **6 người** | 3 | 2 | 1 | 0 |
| **7 người** | 4 | 2 | 1 | 0 |
| **8 người** | 4 | 3 | 1 | 0 |
| **9 người** | 5 | 3 | 1 | 0 |
| **10 người** | 5 | 4 | 1 | 0 |
| **11 người** | 5 | 4 | 1 | 1 |

> ⚠️ **Quy tắc đặc biệt cho phòng 5 người:** Hệ thống phải trộn 3 Sailor và 2 Pirate vào bể chứa, rút bỏ ngẫu nhiên 1 thẻ ra khỏi game mà không ai được biết, sau đó mới thêm 1 Cult Leader vào rồi chia cho 5 người chơi [cite: 101-102].

### 3.2. Cấu hình bộ bài bốc theo Chế độ Bản đồ
Hệ thống sẽ khởi tạo mảng bài bốc (`draw_pile`) tương ứng với chế độ map được chọn:

* **Nếu chọn `QUICK_JOURNEY` (Tổng 19 lá):** [cite: 73]
    * 5 lá màu Vàng (Phe Cult): 100% mang hiệu ứng `CULT_UPRISING`[cite: 74].
    * 5 lá màu Xanh (Phe Sailor): Gồm 3 lá `DRUNK` và 2 lá `DISARMED`[cite: 74].
    * 9 lá màu Đỏ (Phe Pirate): Gồm 5 lá `DRUNK`, 2 lá `MERMAID`, và 2 lá `TELESCOPE`[cite: 74].

* **Nếu chọn `LONG_JOURNEY` (Tổng đầy đủ 23 lá):** [cite: 32, 112]
    * 6 lá màu Vàng (Phe Cult): 100% mang hiệu ứng `CULT_UPRISING`[cite: 32, 124].
    * 6 lá màu Xanh (Phe Sailor): Gồm 4 lá `DRUNK` và 2 lá `DISARMED`[cite: 32, 124].
    * 12 lá màu Đỏ (Phe Pirate): Gồm 5 lá `DRUNK`, 2 lá `MERMAID`, 2 lá `TELESCOPE`, và thêm 2 lá `ARMED`[cite: 32, 124].

### 3.3. Bộ lọc tự động trên Giao diện khi chọn Ban điều hướng (UI Smart Filtering)
Để tối ưu hóa trải nghiệm người dùng và triệt tiêu các thao tác bấm nhầm dẫn đến lỗi logic hệ thống, UI bắt buộc phải tự động ẩn các đối tượng sau [cite: 191-194]:
* **Bộ lọc khi chọn Lieutenant (Thuyền phó):** Hệ thống chỉ hiển thị những người chơi có trạng thái `status == ACTIVE`. Tự động **ẩn hoàn toàn** chính bản thân `CAPTAIN` và toàn bộ các player đang nghỉ phép `status == OFF_DUTY` khỏi danh sách nhấn chọn [cite: 192-193].
* **Bộ lọc khi chọn Navigator (Hoa tiêu):** Hệ thống lấy danh sách ở bước trên và **ẩn thêm** player vừa mới được chọn làm `LIEUTENANT`, đảm bảo hai chức danh không bao giờ bị trùng lặp trên cùng một người chơi[cite: 194].

### 3.4. Logic bạo loạn (Mutiny Resolution)
* **Ngưỡng súng tối thiểu để bạo loạn thành công:** Phòng 5-7 người cần $\ge 3$ súng; Phòng 8-9 người cần $\ge 4$ súng; Phòng 10-11 người cần $\ge 5$ súng[cite: 203].
* **Hình phạt mất súng:** Nếu bạo loạn thành công, *chỉ có những người tham gia bạo loạn* (người nộp súng > 0) mới bị trừ toàn bộ số súng họ đã chìa ra (`gun_count = gun_count - revealed_guns`)[cite: 232]. Nếu bạo loạn thất bại, không ai bị mất súng[cite: 237].
* **Ưu tiên hoán đổi quyền Captain:** Người chìa ra nhiều súng nhất lên làm tân Captain[cite: 214].
  * **Xử lý hòa (Tie-breaker - Chain Elimination):** Nếu có nhiều hơn 1 người cùng chìa ra số súng cao nhất, Thuyền trưởng đương nhiệm (người không bao giờ tham gia bạo loạn) sẽ được quyền chọn loại 1 người khỏi nhóm hòa. Tiếp theo, người vừa bị loại sẽ có quyền chọn loại 1 người khác trong số những người hòa còn lại. Chuỗi loại trừ này lặp lại liên tục cho đến khi nhóm hòa chỉ còn đúng 1 người duy nhất. Người sống sót cuối cùng này sẽ trở thành tân Thuyền trưởng.

### 3.5. Logic Thu nạp Giáo phái & Tính Miễn nhiễm (Conversion Logic)
Cơ chế biến đổi phe sang `CULTIST` khi có hiệu ứng bài điều hướng hoặc thẻ nghi thức hoạt động theo các ràng buộc sau[cite: 396, 400, 550, 554]:
* **Đối tượng miễn nhiễm tuyệt đối:** Chỉ có người chơi mang vai trò `CULT_LEADER` hoặc những người đang có cờ hiệu `is_convertible == false` mới không thể bị thu nạp [cite: 401, 555-556].
* **Đối tượng có thể bị chuyển phe:** Tất cả các người chơi thuộc phe `SAILOR` và cả phe `PIRATE` đều có thể bị biến đổi thành `CULTIST`[cite: 397, 409, 551, 561].
* **Xử lý trạng thái khi chuyển phe:** Khi một Pirate hoặc Sailor bị thu nạp thành công, trường `faction` của họ sẽ ghi đè thành `CULTIST`[cite: 397, 409, 551, 561]. Điều kiện thắng (Win condition) của họ lập tức chuyển dịch theo phe Cult, các thuộc tính vật lý khác không đổi [cite: 398, 414-415, 552, 575-576].

### 3.6. Điều kiện phân định thắng cuộc tuyệt đối (Victory Assertions)
Trò chơi lập tức dừng và kích hoạt màn hình End Game khi một trong các điều kiện sau thành hiện thực[cite: 319]:
* Thuyền chạm vào ô thuộc vùng `Bluewater Bay` -> `SAILOR` thắng[cite: 156].
* Thuyền chạm vào ô thuộc vùng `Crimson Cove` -> `PIRATE` thắng[cite: 158].
* Thuyền chạm vào ô vị trí `Kraken` ở phương Bắc -> `CULT` thắng[cite: 160].
* Trạng thái thực thi hành động bản đồ `Feed the Kraken` chọn trúng người chơi có `faction == CULT_LEADER` -> `CULT` lập tức thắng cuộc[cite: 372, 571].

### 3.7. Map Spaces & Tile Actions Logic (Logic xử lý các Ô chức năng trên Bản đồ)
Khi tàu di chuyển vào một ô có biểu tượng chức năng, hệ thống bắt buộc phải thực thi logic nghiệp vụ thời gian thực theo đúng các quy tắc sau [cite: 255, 323-324, 509-510]:

* **`CABIN SEARCH` (Khám xét Cabin):** [cite: 326, 511]
    * Thuyền trưởng đương nhiệm chọn một người chơi bất kỳ để khám xét[cite: 327, 512].
    * **Logic hiển thị:** Hệ thống bí mật kiểm tra giá trị thực thể của người chơi đó. Nếu mục tiêu là `faction == CULTIST` (được chuyển phe từ trước qua hiệu ứng bài), hệ thống **chỉ hiển thị duy nhất một biểu tượng vòi bạch tuộc (tentacle icon)** lên màn hình của Thuyền trưởng[cite: 331, 517]. Nếu là các phe gốc chưa chuyển, hệ thống hiển thị chính xác vai trò ẩn (`faction`)[cite: 328, 512].
    * Thuộc tính `is_convertible` của người chơi bị khám xét lập tức chuyển thành `false` (Miễn nhiễm thu nạp Giáo phái)[cite: 330, 516].
* **`FLOGGING` (Đánh roi):** [cite: 339, 542]
    * Thuyền trưởng đương nhiệm chọn một người chơi bất kỳ để tra khảo[cite: 342, 545].
    * **Logic hiển thị:** Để đơn giản hóa luồng bốc bài giấy, hệ thống tự động kiểm tra vai trò thực tế và sinh ra một câu khẳng định hoặc mã token **"I am not a..."** dựa trên 1 trong 2 phe mà player đó chắc chắn không thuộc về[cite: 348, 562]. *Thông tin này được hiển thị công khai (Public) cho toàn bộ phòng chơi nhìn thấy trên giao diện bàn cờ*[cite: 340, 352, 543, 564].
    * Thuộc tính `is_convertible` của người chơi bị đánh roi lập tức chuyển thành `false`[cite: 354, 566].
* **`OFF WITH THE TONGUE` (Cắt lưỡi):** [cite: 332, 518]
    * Thuyền trưởng đương nhiệm chọn một người chơi bất kỳ để cắt lưỡi[cite: 333, 519].
    * Hệ thống chuyển cờ `speech_restricted = true` của người chơi đó. 
    * **Ràng buộc hệ thống:** Khóa hoàn toàn tính năng chat chữ (hoặc mute micro room nếu có) của người chơi này[cite: 334, 520]. Họ chỉ được phép tương tác bằng cách bấm nút biểu quyết (Vote/Mutiny)[cite: 338, 541]. Hiệu ứng kéo dài vĩnh viễn[cite: 352, 564]. Người bị cắt lưỡi sẽ bị hệ thống tự động bỏ qua, không cho nhận chức danh Captain nếu lá bài `DRUNK` được kích hoạt[cite: 337, 540].
* **`FEED THE KRAKEN` (Tế thần Kraken):** [cite: 355, 567]
    * Thuyền trưởng đương nhiệm chọn một người chơi bất kỳ để hiến tế cho Kraken[cite: 356, 568].
    * Trạng thái của người chơi đó chuyển thành `status = ELIMINATED`. Hệ thống thu hồi toàn bộ súng (`gun_count = 0`), tước bỏ mọi chức danh ban điều hướng đang nắm giữ, và ngắt quyền tham gia các lượt biểu quyết tiếp theo[cite: 357, 569].
    * **Kiểm tra điều kiện thắng đặc biệt:** Nếu `faction == CULT_LEADER`, hệ thống chặn luồng game và kích hoạt `CULT` thắng cuộc lập tức (Theo mục 3.6)[cite: 372, 571].
* **`SUPPLY LINE` (Đường tiếp tế):**
    * **Cơ chế kích hoạt:** Khi tàu di chuyển thông qua một "đường nối" (path) có cờ `crosses_supply_line == true` và biến trạng thái toàn cục `has_crossed_supply_line == false`. *(Chỉ áp dụng ở map Long Journey).*
    * **Hiệu ứng:** Hệ thống tự động nạp lại súng cho toàn bộ người chơi đang ở trạng thái `ACTIVE`. Quy tắc nạp: Bất kỳ ai có `gun_count < 3` sẽ được cộng thêm súng cho đến khi đạt mức tối đa là 3 (Sử dụng phép tính: `gun_count = Math.max(gun_count, 3)`). Những người đang có từ 3 súng trở lên không được nhận thêm.
    * **Đóng cờ:** Sau khi hoàn tất nạp súng, hệ thống gán `has_crossed_supply_line = true` để đảm bảo sự kiện này không bao giờ lặp lại trong game.

---

## 4. Map Grid Layout Configuration (Cấu hình Tọa độ Lưới Bản đồ)
Để AI có thể vẽ được bàn cờ và tính toán đường đi của tàu, cấu hình hệ thống tọa độ của 2 bản đồ được số hóa dưới dạng mảng các nút (Nodes) với các thuộc tính nối tiếp: `tile_id`, `color_zone` (Vùng đích)[cite: 156, 158, 160], và `map_action`[cite: 255, 323, 509].

*(Nhóm phát triển sẽ nạp sơ đồ ma trận tọa độ dạng mảng JSON của hai bản đồ Quick Journey và Long Journey trực tiếp vào mã nguồn cấu hình tĩnh của hệ thống để AI tự động đối chiếu vị trí ship_position của tàu sau mỗi lượt đi).* 