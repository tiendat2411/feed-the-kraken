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
        ("<Clock size={12} /> Đang chọn", "<Clock size={12} /> Deliberating"),
        ("{session.isSuccess ? '🔥 BẠO LOẠN THÀNH CÔNG' : '🛡️ BẠO LOẠN THẤT BẠI'}", "{session.isSuccess ? '🔥 MUTINY SUCCEEDED' : '🛡️ MUTINY FAILED'}"),
        ("{session.isSuccess ? 'THUYỀN TRƯỞNG ĐÃ BỊ LẬT ĐỔ!' : 'THUYỀN TRƯỞNG ĐÃ BẢO VỆ ĐƯỢC QUYỀN LỰC!'}", "{session.isSuccess ? 'CAPTAIN HAS BEEN OVERTHROWN!' : 'CAPTAIN RETAINS POWER!'}"),
        ("Tổng số guns: <span className=\"text-red-400\">{session.totalGuns || 0}</span> / <span className=\"text-slate-400\">{session.requiredGuns} guns cần thiết</span>", "Total guns: <span className=\"text-red-400\">{session.totalGuns || 0}</span> / <span className=\"text-slate-400\">{session.requiredGuns} guns required</span>"),
        ("? 'YOU là Tân Thuyền Trưởng! Hãy bấm nút bên dưới để bắt đầu lựa chọn Ban điều hướng mới.'", "? 'You are the New Captain! Click below to appoint your Navigation Team.'"),
        (": 'Nổi loạn đã bị dẹp tan. Hãy bấm nút bên dưới để chính thức đưa Ban điều hướng vào buồng lái tàu.'}", ": 'Mutiny was crushed. Click below to confirm the Navigation Team at the helm.'}"),
        ("{session.isSuccess ? 'BẮT ĐẦU BỔ NHIỆM BAN ĐIỀU HƯỚNG MỚI' : 'TIẾP TỤC HÀNH TRÌNH ĐIỀU HƯỚNG'}", "{session.isSuccess ? 'APPOINT NEW NAVIGATION TEAM' : 'PROCEED WITH NAVIGATION'}"),
        ("<Clock size={16} /> Đang đợi Thuyền trưởng (<strong className=\"text-white\">{captainPlayer.nickname}</strong>) bấm xác nhận chuyển tiếp...", "<Clock size={16} /> Waiting for Captain (<strong className=\"text-white\">{captainPlayer.nickname}</strong>) to confirm and proceed..."),
        ("<Check size={14} className=\"text-emerald-400\" /> Đã bỏ phiếu", "<Check size={14} className=\"text-emerald-400\" /> Voted"),
        ("<Clock size={14} className=\"text-amber-400 animate-spin\" /> Đang cân nhắc", "<Clock size={14} className=\"text-amber-400 animate-spin\" /> Deliberating"),
        ("<Check size={14} className=\"text-emerald-400\" /> Đã chọn", "<Check size={14} className=\"text-emerald-400\" /> Appointed"),
    ]
    replace_in_file(mutiny_path, mutiny_replacements)

    # 2. NavigationPhase.jsx
    nav_path = os.path.join(frontend_src, "components", "NavigationPhase.jsx")
    nav_replacements = [
        ("<span className=\"text-slate-400\">Nhật ký:</span>", "<span className=\"text-slate-400\">Logbook:</span>"),
        ("<div className=\"text-xs text-amber-400/90 font-bold uppercase tracking-wider\">Thuyền Trưởng {isCaptain && '(BẠN)'}</div>", "<div className=\"text-xs text-amber-400/90 font-bold uppercase tracking-wider\">Captain {isCaptain && '(YOU)'}</div>"),
        ("<div className=\"text-sm font-semibold truncate text-white\">{captain?.nickname || 'Chưa chỉ định'}</div>", "<div className=\"text-sm font-semibold truncate text-white\">{captain?.nickname || 'Unassigned'}</div>"),
        ("<div className=\"text-xs text-sky-400/90 font-bold uppercase tracking-wider\">Thuyền Phó {isLieutenant && '(BẠN)'}</div>", "<div className=\"text-xs text-sky-400/90 font-bold uppercase tracking-wider\">Lieutenant {isLieutenant && '(YOU)'}</div>"),
        ("<div className=\"text-sm font-semibold truncate text-white\">{lieutenant?.nickname || 'Chưa chỉ định'}</div>", "<div className=\"text-sm font-semibold truncate text-white\">{lieutenant?.nickname || 'Unassigned'}</div>"),
        ("<div className=\"text-xs text-emerald-400/90 font-bold uppercase tracking-wider\">Hoa Tiêu {isNavigator && '(BẠN)'}</div>", "<div className=\"text-xs text-emerald-400/90 font-bold uppercase tracking-wider\">Navigator {isNavigator && '(YOU)'}</div>"),
        ("<div className=\"text-sm font-semibold truncate text-white\">{navigator?.nickname || 'Chưa chỉ định'}</div>", "<div className=\"text-sm font-semibold truncate text-white\">{navigator?.nickname || 'Unassigned'}</div>"),
        ("Bạn đang là Thuyền trưởng! Hãy rút 2 thẻ hải trình đầu tiên từ boong bài.", "You are the Captain! Draw the first 2 navigation cards from the deck."),
        ("Bạn đang là Thuyền phó! Hãy rút thêm 2 thẻ hải trình để tiếp tục hải trình.", "You are the Lieutenant! Draw 2 more navigation cards to continue the voyage."),
        ("Thuyền trưởng và Thuyền phó đã rút bài. Đang chuẩn bị chuyển thẻ cho Hoa tiêu.", "Captain and Lieutenant have drawn cards. Preparing to pass cards to Navigator."),
        ("RÚT BÀI ĐIỀU HƯỚNG (2 THẺ)", "DRAW 2 NAVIGATION CARDS"),
        ("CHỌN 1 THẺ ĐỂ CHUYỂN CHO HOA TIÊU (LÁ CÒN LẠI SẼ BỊ HỦY ẨN)", "PASS 1 CARD TO NAVIGATOR (OTHER CARD WILL BE DISCARDED FACE-DOWN)"),
        ("CHỌN 1 THẺ ĐIỀU HƯỚNG CHO CON TÀU (LÁ CÒN LẠI SẼ BỊ HỦY ẨN)", "STEER THE SHIP WITH 1 CARD (OTHER CARD WILL BE DISCARDED FACE-DOWN)"),
        ("ĐANG CHỜ HOA TIÊU RA QUYẾT ĐỊNH ĐIỀU HƯỚNG TÀU...", "WAITING FOR NAVIGATOR TO STEER THE SHIP..."),
        ("ĐANG CHỜ THUYỀN PHÓ RÚT VÀ CHUYỂN BÀI...", "WAITING FOR LIEUTENANT TO DRAW AND PASS CARDS..."),
        ("ĐANG CHỜ THUYỀN TRƯỞNG RÚT BÀI...", "WAITING FOR CAPTAIN TO DRAW CARDS..."),
        ("Hiệu ứng trên lá bài:", "Card Effect:"),
        ("Hải trình:", "Course:"),
        ("Lá bài điều hướng được chọn:", "Selected Navigation Card:"),
        ("Lá bài bị loại bỏ:", "Discarded Card:"),
        ("Người chơi bị đẩy xuống biển (Off-Duty):", "Cast Overboard (Off-Duty):"),
        ("ĐANG THỰC THI HIỆU ỨNG HẢI TRÌNH...", "EXECUTING NAVIGATION ACTIONS..."),
        ("XÁC NHẬN CHỌN THẺ NÀY", "CONFIRM THIS CARD"),
        ("CHỌN THẺ NÀY ĐỂ ĐI TÀU", "STEER WITH THIS CARD"),
        ("CHỌN THẺ NÀY CHO HOA TIÊU", "PASS THIS CARD TO NAVIGATOR"),
    ]
    replace_in_file(nav_path, nav_replacements)

    # 3. MapBoardUI.jsx
    map_path = os.path.join(frontend_src, "components", "MapBoardUI.jsx")
    map_replacements = [
        ("Vị trí tàu:", "Ship Position:"),
        ("Cung đường:", "Route:"),
        ("Mã phòng:", "Room:"),
        ("Số thẻ đã đi:", "Cards Steered:"),
        ("Số thẻ còn lại:", "Cards Remaining:"),
        ("Giai đoạn:", "Phase:"),
        ("Bản đồ:", "Map:"),
        ("Nhật ký hành trình:", "Captain's Log:"),
        ("Chưa có hành trình nào được ghi nhận.", "No navigation recorded yet."),
        ("Vòng đấu:", "Round:"),
        ("Hướng đi:", "Heading:"),
        ("Tác động:", "Effect:"),
    ]
    replace_in_file(map_path, map_replacements)

    # 4. EndGame.jsx
    endgame_path = os.path.join(frontend_src, "pages", "EndGame.jsx")
    endgame_replacements = [
        ("🗺️ Bản đồ:", "🗺️ Sea Chart:"),
        ("🏁 Điểm kết thúc:", "🏁 Destination:"),
        ("🔥 Số lượt Bạo loạn:", "🔥 Mutiny Attempts:"),
        ("lượt", "times"),
        ("⚓ Tổng số hải trình:", "⚓ Waypoints Traversed:"),
        ("bước", "steps"),
        ("DANH SÁCH THỦY THỦ ĐOÀN & VAI TRÒ", "CREW ROSTER & TRUE IDENTITIES"),
        ("CHỦ PHÒNG", "HOST"),
        ("BẠN", "YOU"),
        ("TÍN ĐỒ TÀ GIÁO (CẢI ĐẠO)", "CULT CONVERT"),
        ("NGƯỜI CHƠI", "PLAYER"),
        ("VAI TRÒ", "ROLE"),
        ("KHO SÚNG", "ARMORY"),
        ("KẾT QUẢ", "RESULT"),
        ("THẮNG CUỘC", "VICTORIOUS"),
        ("THẤT BẠI", "DEFEATED"),
        ("VỀ TRANG CHỦ", "RETURN TO TITLE"),
        ("SẴN SÀNG CHƠI LẠI", "PLAY AGAIN"),
    ]
    replace_in_file(endgame_path, endgame_replacements)

if __name__ == "__main__":
    main()
