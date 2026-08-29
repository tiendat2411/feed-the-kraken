import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    for old_str, new_str in replacements:
        content = content.replace(old_str, new_str)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated: {filepath}")

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frontend_src = os.path.join(base_dir, "frontend", "src")

    # 1. MutinyBoard.jsx
    mutiny_path = os.path.join(frontend_src, "components", "MutinyBoard.jsx")
    mutiny_replacements = [
        ("|| 'Thủy thủ'}", "|| 'Sailor'}"),
        ("<Award size={13} /> Thuyền Phó", "<Award size={13} /> Lieutenant"),
        ("<Compass size={13} /> Hoa Tiêu", "<Compass size={13} /> Navigator"),
        ("XÁC NHẬN BAN ĐIỀU HƯỚNG", "CONFIRM NAVIGATION TEAM"),
        ("<Flame size={14} className=\"text-red-400\" /> Biểu quyết lòng trung thành (Loyalty Check)", "<Flame size={14} className=\"text-red-400\" /> Loyalty Check Vote"),
        ("<h3 className=\"text-3xl font-extrabold text-red-100\">CÓ NỔI LOẠN LẬT ĐỔ THUYỀN TRƯỞNG?</h3>", "<h3 className=\"text-3xl font-extrabold text-red-100\">WILL YOU MUTINY AGAINST THE CAPTAIN?</h3>"),
        ("Cần tối thiểu <strong className=\"text-red-400 font-extrabold text-base\">{totalRequiredGuns} Khẩu Súng</strong> từ toàn bộ thủy thủ đoàn để lật đổ Thuyền trưởng! Nếu bạo loạn thành công, người nộp nhiều guns nhất sẽ lên làm Thuyền trưởng mới.", "At least <strong className=\"text-red-400 font-extrabold text-base\">{totalRequiredGuns} Guns</strong> are required to overthrow the Captain! If mutiny succeeds, the highest gun committer claims the Captaincy."),
        ("<Clock size={16} /> Thời gian chờ người mất kết nối: <strong>{timeLeft}s</strong>", "<Clock size={16} /> Disconnect grace period: <strong>{timeLeft}s</strong>"),
        ("Số súng của bạn:", "Your Armory:"),
        ("chọn số súng bí mật", "covertly select guns"),
        ("phiếu kín", "covert vote"),
        ("Phiếu của bạn: {gunVote} súng", "Your vote: {gunVote} guns"),
        ("Phiếu của bạn: 0 súng (Trung thành)", "Your vote: 0 guns (Loyal)"),
        ("đã nộp phiếu kín", "has committed vote"),
        ("đang cân nhắc...", "deliberating..."),
        ("Người nộp súng nhiều nhất sẽ trở thành Thuyền Trưởng mới thay thế.", "The highest gun committer will assume Captaincy of the vessel."),
        ("Nếu hòa súng, Thuyền trưởng cũ hoặc người ra lệnh sẽ chỉ định người bị loại.", "In a tie, the incumbent Captain decides which mutineer candidate is eliminated."),
    ]
    replace_in_file(mutiny_path, mutiny_replacements)

    # 2. NavigationPhase.jsx
    nav_path = os.path.join(frontend_src, "components", "NavigationPhase.jsx")
    nav_replacements = [
        ("return { label: 'SAILOR (THỦY THỦ)',", "return { label: 'SAILOR',"),
        ("return { label: 'PIRATE (HẢI TẶC)',", "return { label: 'PIRATE',"),
        ("return { label: 'CULT (TÀ GIÁO)',", "return { label: 'CULT',"),
        ("return { title: 'Say Xỉn 🍺', desc: 'Thuyền trưởng say rượu! Quyền Thuyền trưởng sẽ chuyển sang người kế tiếp bên trái.' };", "return { title: 'Drunken Stupor 🍺', desc: 'Captain is intoxicated! Captaincy passes to the player on the left.' };"),
        ("return { title: 'Khởi Nghĩa Tà Giáo 👁️', desc: 'Triệu hồi sức mạnh bóng tối! Tăng cường tín đồ và chuyển biến lòng trung thành.' };", "return { title: 'Cult Uprising 👁️', desc: 'Dark powers summon the Deep! Secret conversions may occur.' };"),
        ("return { title: 'Tiếp Vũ Khí 🔫', desc: 'Cung cấp thêm 1 khẩu súng mới cho Hoa tiêu đương nhiệm.' };", "return { title: 'Arms Cache 🔫', desc: 'Grants +1 pistol to the incumbent Navigator.' };"),
        ("return { title: 'Tước Khí 🚫', desc: 'Hoa tiêu bị tịch thu 1 khẩu súng vào kho vũ khí chung.' };", "return { title: 'Disarm 🚫', desc: 'Navigator loses 1 pistol to the common armory.' };"),
        ("return { title: 'Kính Viễn Vọng 🔭', desc: 'Hoa tiêu được xem trước 1 thẻ hải trình bí mật trên cùng của chồng bài rút.' };", "return { title: 'Spyglass 🔭', desc: 'Navigator peeks at the top card of the navigation deck.' };"),
        ("return { title: 'Tế Thần Kraken 🐙', desc: 'Triệu hồi xúc tu Kraken! Tăng 1 nấc trên Cult Track.' };", "return { title: 'Kraken Sacrifice 🐙', desc: 'Summons the Kraken! Advances 1 step on the Cult Track.' };"),
        ("return { title: 'Nhảy Tàu 🌊', desc: 'Một thuyền viên bị đẩy xuống biển! Mất quyền tham gia các hoạt động vòng này.' };", "return { title: 'Overboard 🌊', desc: 'A crew member is thrown overboard and sent Off-Duty.' };"),
        ("return { title: 'Hải Trình Bình Yên ⛵', desc: 'Gió thuận buồm xuôi, không có hiệu ứng phụ nào xảy ra.' };", "return { title: 'Fair Winds ⛵', desc: 'Smooth sailing, no additional event triggered.' };"),
        ("BƯỚC 1: THUYỀN TRƯỞNG RÚT 2 THẺ", "STEP 1: CAPTAIN DRAWS 2 CARDS"),
        ("BƯỚC 2: THUYỀN PHÓ RÚT 2 THẺ", "STEP 2: LIEUTENANT DRAWS 2 CARDS"),
        ("BƯỚC 3: HOA TIÊU ĐIỀU HƯỚNG TÀU", "STEP 3: NAVIGATOR STEERS SHIP"),
        ("THỰC THI HIỆU ỨNG HẢI TRÌNH", "EXECUTING NAVIGATION ACTIONS"),
        ("ĐANG RÚT BÀI...", "DRAWING CARDS..."),
        ("ĐANG ĐIỀU HƯỚNG...", "STEERING SHIP..."),
        ("ĐÃ CHỌN XONG", "CARD SELECTED"),
        ("BẠN ĐANG LÀM HOA TIÊU", "YOU ARE THE NAVIGATOR"),
        ("BẠN ĐANG LÀM THUYỀN PHÓ", "YOU ARE THE LIEUTENANT"),
        ("BẠN ĐANG LÀM THUYỀN TRƯỞNG", "YOU ARE THE CAPTAIN"),
        ("Chọn 1 thẻ bạn muốn giữ lại cho Hoa tiêu:", "Select 1 card to pass to Navigator:"),
        ("Chọn 1 thẻ điều hướng để cho tàu chạy:", "Select 1 card to steer the ship:"),
        ("Thẻ bị loại bỏ:", "Discarded Card:"),
        ("Thẻ được chọn đi tàu:", "Steered Course:"),
        ("Xem trước thẻ tiếp theo", "Peek next card"),
        ("Đã hoàn thành bước điều hướng", "Navigation step completed"),
        ("Đang chờ Hoa tiêu chọn thẻ...", "Waiting for Navigator to choose a card..."),
        ("Đang chờ Thuyền phó chọn thẻ...", "Waiting for Lieutenant to select cards..."),
        ("Đang chờ Thuyền trưởng chọn thẻ...", "Waiting for Captain to draw cards..."),
    ]
    replace_in_file(nav_path, nav_replacements)

    # 3. Game.jsx
    game_path = os.path.join(frontend_src, "pages", "Game.jsx")
    game_replacements = [
        ("Giáo chủ của bạn: <span className=\"font-black\">{conversionNotification.cult_leader_name}</span>", "Your Cult Leader: <span className=\"font-black\">{conversionNotification.cult_leader_name}</span>"),
        ("ĐÃ HIỂU", "UNDERSTOOD"),
    ]
    replace_in_file(game_path, game_replacements)

    # 4. EndGame.jsx
    endgame_path = os.path.join(frontend_src, "pages", "EndGame.jsx")
    endgame_replacements = [
        ("badge: 'BĂNG PIRATES',", "badge: 'PIRATE CREW',"),
        ("badge: 'THỦY THỦ ĐOÀN',", "badge: 'SAILOR CREW',"),
        ("title: 'PHE TÀ GIÁO CHIẾN THẮNG!',", "title: 'KRAKEN CULT VICTORY!',"),
        ("? 'Giáo chủ đã được hiến tế thành công! Thần Kraken trỗi dậy nuốt chửng tất cả!'", "? 'The Cult Leader was successfully sacrificed! The Kraken rises to devour all!'"),
        (": 'Con tàu đã bị dẫn dắt thẳng vào Hang ổ của Thần Kraken vĩ đại!',", ": 'The ship was steered directly into the Maw of the Great Kraken!',"),
        ("badge: 'HỘI TÀ GIÁO (CULT OF KRAKEN)',", "badge: 'KRAKEN CULT',"),
        ("subtitle: 'Thuyền trưởng đã ném Giáo chủ cho Kraken ăn, giải phóng cơn thịnh nộ cổ xưa!'", "subtitle: 'The Captain fed the Cult Leader to the Kraken, unleashing ancient wrath!'"),
        ("subtitle: 'Toàn bộ thủy thủ đoàn bị nhấn chìm vào bóng tối vĩnh hằng!'", "subtitle: 'The vessel is pulled down into the eternal abyss!'"),
        ("THẮNG CUỘC", "VICTORIOUS"),
        ("THẤT BẠI", "DEFEATED"),
        ("DANH SÁCH THỦY THỦ ĐOÀN", "CREW ROSTER & IDENTITIES"),
        ("VAI TRÒ THỰC SỰ", "TRUE ROLE"),
        ("TRẠNG THÁI", "STATUS"),
        ("SỐ SÚNG CÒN LẠI", "GUNS REMAINING"),
        ("SỐNG SÓT", "SURVIVED"),
        ("BỊ LOẠI", "ELIMINATED"),
        ("SẴN SÀNG", "READY"),
        ("CHỦ PHÒNG", "HOST"),
    ]
    replace_in_file(endgame_path, endgame_replacements)

if __name__ == "__main__":
    main()
