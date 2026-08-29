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
        ("Bạo loạn hòa guns (Tie-breaker Chain Elimination)", "Mutiny Tie-Breaker (Chain Elimination)"),
        ("CHUỖI LOẠI TRỪ LIÊN HOÀN", "TIE-BREAKER ELIMINATION CHAIN"),
        ("Nhiều người nộp cùng số guns cao nhất! Người giữ quyền loại trừ sẽ chọn loại 1 người ra khỏi cuộc đua, người vừa bị loại sẽ tiếp tục loại người kế tiếp cho đến khi chỉ còn 1 người duy nhất!", "Multiple crew members tied with the highest guns! The decisive chooser eliminates 1 candidate from the race, who then eliminates the next until only 1 remains!"),
        ("Người đang giữ quyền loại: {currentChooser?.nickname || 'Đang xác định'}", "Decisive Chooser: {currentChooser?.nickname || 'Determining'}"),
        ("LOẠI ỨNG VIÊN NÀY", "ELIMINATE CANDIDATE"),
    ]
    replace_in_file(mutiny_path, mutiny_replacements)

    # 2. NavigationPhase.jsx
    nav_path = os.path.join(frontend_src, "components", "NavigationPhase.jsx")
    nav_replacements = [
        ("LƯỢT CỦA THUYỀN TRƯỞNG", "CAPTAIN'S TURN"),
        ("{activeCards.length > 0 ? 'Hãy Chọn 1 Lá Bài Để Bỏ Vào Nhật Ký' : 'Bắt Đầu Lượt Rút Hải Đồ Bí Mật'}", "{activeCards.length > 0 ? 'Select 1 Card to Keep in Logbook' : 'Draw Secret Navigation Cards'}"),
        ("? 'Bạn vừa rút 2 hải đồ bí mật. Hãy nhấp chọn 1 cards bạn muốn giữ để chuyển tiếp cho Hoa tiêu. Lá còn lại sẽ bị hủy úp kín.'", "? 'You drew 2 secret navigation cards. Click 1 card to pass to Navigator. The other card will be discarded face-down.'"),
        (": 'Nhấn nút bên dưới để rút 2 hải đồ đầu tiên từ đầu cọc bài bốc.'}", ": 'Click the button below to draw 2 navigation cards from the deck.'}"),
        ("<span>RÚT 2 HẢI ĐỒ BÍ MẬT</span>", "<span>DRAW 2 SECRET NAVIGATION CARDS</span>"),
        ("<span className=\"text-xs font-mono opacity-60\">Thẻ #{idx + 1}</span>", "<span className=\"text-xs font-mono opacity-60\">Card #{idx + 1}</span>"),
        ("<span className=\"text-slate-300\">Trạng thái:</span>", "<span className=\"text-slate-300\">Status:</span>"),
        ("LƯỢT CỦA THUYỀN PHÓ", "LIEUTENANT'S TURN"),
        ("? 'Bạn vừa rút thêm 2 hải đồ bí mật. Hãy nhấp chọn 1 cards bạn muốn giữ để chuyển tiếp cho Hoa tiêu. Lá còn lại sẽ bị hủy úp kín.'", "? 'You drew 2 secret navigation cards. Click 1 card to pass to Navigator. The other card will be discarded face-down.'"),
        ("LƯỢT CỦA HOA TIÊU", "NAVIGATOR'S TURN"),
        ("Hãy Chọn 1 Lá Bài Để Quyết Định Hướng Đi Cho Con Tàu", "Select 1 Card to Steer the Vessel"),
        ("Bạn đang nhận 2 hải đồ từ Thuyền trưởng và Thuyền phó. Hãy chọn 1 thẻ duy nhất để con tàu di chuyển theo hướng đó. Thẻ còn lại sẽ bị hủy vĩnh viễn.", "You hold 2 navigation cards from the Captain and Lieutenant. Choose 1 card to steer the ship. The other card will be discarded."),
        ("ĐIỀU HƯỚNG TÀU THEO LÁ BÀI NÀY", "STEER SHIP WITH THIS CARD"),
        ("BỔ NHIỆM HOA TIÊU MỚI", "APPOINT NEW NAVIGATOR"),
        ("Hoa tiêu hiện tại không thể tiếp tục nhiệm vụ. Thuyền trưởng hãy chỉ định 1 thành viên khác làm Hoa tiêu thay thế.", "The current Navigator cannot steer. Captain, appoint a replacement Navigator."),
        ("XÁC NHẬN CHỈ ĐỊNH HOA TIÊU", "CONFIRM NAVIGATOR APPOINTMENT"),
        ("THỰC THI HIỆU ỨNG ĐẶC BIỆT", "RESOLVING SPECIAL ACTION"),
        ("Con tàu vừa di chuyển vào ô có hiệu ứng đặc biệt:", "The ship arrived at a waypoint with a special event:"),
        ("Người thực hiện:", "Performer:"),
        ("Mục tiêu:", "Target:"),
        ("XÁC NHẬN HIỆU ỨNG", "CONFIRM EFFECT"),
        ("ĐANG CHỜ XÁC NHẬN HIỆU ỨNG TỪ THUYỀN TRƯỞNG...", "WAITING FOR CAPTAIN TO CONFIRM ACTION..."),
        ("LƯỢT ĐIỀU HƯỚNG HOÀN TẤT!", "NAVIGATION TURN COMPLETED!"),
        ("Con tàu đã di chuyển thành công theo hải trình đã chọn.", "The vessel has advanced along the chosen course."),
        ("TIẾP TỤC VÒNG ĐẤU MỚI", "PROCEED TO NEXT ROUND"),
        ("Đang chờ Thuyền trưởng chuyển tiếp vòng đấu...", "Waiting for Captain to advance to next round..."),
    ]
    replace_in_file(nav_path, nav_replacements)

    # 3. MapBoardUI.jsx
    map_path = os.path.join(frontend_src, "components", "MapBoardUI.jsx")
    map_replacements = [
        ("case 'CABIN_SEARCH': return 'Khám Xét Cabin';", "case 'CABIN_SEARCH': return 'Cabin Search';"),
        ("case 'FLOGGING': return 'Đánh Roi / Tra Khảo';", "case 'FLOGGING': return 'Interrogation (Flogging)';"),
        ("default: return 'Vùng Biển Êm Đềm';", "default: return 'Calm Waters';"),
        ("<div className=\"text-xs font-semibold uppercase tracking-widest text-slate-400\">Vị Trí Hiện Tại</div>", "<div className=\"text-xs font-semibold uppercase tracking-widest text-slate-400\">Current Waypoint</div>"),
        ("<div className=\"text-xs font-semibold uppercase tracking-widest text-slate-400\">Trạng Thái Vòng</div>", "<div className=\"text-xs font-semibold uppercase tracking-widest text-slate-400\">Round Status</div>"),
        ("<div className=\"text-xs font-semibold uppercase tracking-widest text-slate-400\">Hải Trình Đã Đi</div>", "<div className=\"text-xs font-semibold uppercase tracking-widest text-slate-400\">Plotted Course</div>"),
        ("HẢI ĐỒ HẢI TRÌNH ĐẠI DƯƠNG", "OCEAN NAVIGATION SEA CHART"),
        ("CULT TRACK: TIẾN TRÌNH TẾ THẦN KRAKEN", "CULT TRACK: KRAKEN SACRIFICE PROGRESS"),
        ("BẬC", "STAGE"),
        ("NHẬT KÝ HẢI TRÌNH CHI TIẾT", "DETAILED CAPTAIN'S LOG"),
        ("Chưa có sự kiện nào trong chuyến hải trình.", "No navigation events recorded yet."),
        ("Lá bài:", "Card:"),
        ("Hành động:", "Action:"),
        ("Bởi:", "By:"),
        ("Hải đồ:", "Chart:"),
        ("Giai đoạn:", "Phase:"),
        ("Tiến độ:", "Progress:"),
        ("Vòng đấu hiện tại:", "Current Round:"),
        ("Thuyền trưởng:", "Captain:"),
        ("Thuyền phó:", "Lieutenant:"),
        ("Hoa tiêu:", "Navigator:"),
        ("Súng còn lại:", "Armory:"),
        ("Trạng thái:", "Status:"),
    ]
    replace_in_file(map_path, map_replacements)

    # 4. EndGame.jsx
    endgame_path = os.path.join(frontend_src, "pages", "EndGame.jsx")
    endgame_replacements = [
        ("⏳ Tổng số vòng:", "⏳ Total Rounds:"),
        ("⏳ Thời gian thi đấu:", "⏳ Match Duration:"),
        ("phút", "mins"),
        ("giây", "secs"),
        ("CHIẾN CÔNG & LỊCH SỬ HẢI TRÌNH", "VOYAGE STATS & SUMMARY"),
    ]
    replace_in_file(endgame_path, endgame_replacements)

if __name__ == "__main__":
    main()
