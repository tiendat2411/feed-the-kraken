# Quickstart Guide: Automated Testing Sandbox & Headless Bots

Tài liệu này hướng dẫn cách chạy và sử dụng công cụ Sandbox để kiểm thử nhanh trò chơi "Feed the Kraken" với người chơi ảo.

---

## 1. Yêu Cầu Tiên Quyết (Prerequisites)
1. Đã cài đặt Node.js v20 trở lên.
2. Thư viện `socket.io-client` đã được cài đặt trong dependencies của `backend/package.json` hoặc root package.

---

## 2. Kịch Bản Kiểm Thử Nhanh (Step-by-Step Scenarios)

### Kịch bản 1: Lấp đầy phòng chờ cho 1 người chơi thật (1 Human + 4 Bots)
1. **Khởi động Backend:**
   ```powershell
   cd backend
   npm run dev
   ```
2. **Mở trình duyệt (Người thật tạo phòng):**
   - Truy cập `http://localhost:5173/`.
   - Nhập tên "Thuyền Trưởng Thật", chọn Avatar và bấm **CREATE NEW ROOM**.
   - Lưu lại mã phòng 6 ký tự hiển thị trên màn hình (Ví dụ: `ABCDEF`).
3. **Chạy Sandbox để spawn 4 Bots:**
   ```powershell
   node scripts/bots/spawn.js --room ABCDEF --count 4
   ```
4. **Quan sát:**
   - Trên trình duyệt web: Phòng chờ lập tức hiển thị 5/11 thành viên (1 người thật + Bot_1, Bot_2, Bot_3, Bot_4).
   - Nút **START VOYAGE** trên web sáng lên (kích hoạt).
   - Người thật bấm **START VOYAGE** -> Trò chơi bắt đầu ngay lập tức!
   - Cả 4 Bot nhận vai trò ẩn và tự động hoàn thành phase ban đêm 20s.

---

### Kịch bản 2: Tự động chạy toàn bộ bằng Bots (Headless Sandbox 5 Bots)
Nếu muốn test server thuần túy mà không cần mở trình duyệt:
```powershell
node scripts/bots/spawn.js --create-room --count 5
```
- Bot 1 sẽ tự động đóng vai trò Host, tạo phòng mới và bấm Start Game.
- Các Bot còn lại tham gia và cùng chạy ván game.

---

### Kịch bản 3: Can thiệp và điều khiển thủ công qua CLI (Interactive Override)
Trong cửa sổ terminal đang chạy script spawn bot:
1. Gõ `status` để xem danh sách role bí mật của các bot và số súng.
2. Gõ `auto off` để chuyển sang chế độ điều khiển thủ công.
3. Khi đến lượt Nổi loạn (Mutiny), ép Bot 1 nộp 3 súng:
   ```text
   ftk-sandbox > bot 1 vote 3
   ```
4. Quan sát kết quả tính điểm súng trên Server và Web.
5. Gõ `exit` để giải tán đàn Bot và kết thúc.
