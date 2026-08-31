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

    # 1. NavigationPhase.jsx
    nav_path = os.path.join(frontend_src, "components", "NavigationPhase.jsx")
    nav_replacements = [
        ("{isSelected ? '✓ SẼ GIỮ VÀO NHẬT KÝ' : 'Sẽ bị hủy'}", "{isSelected ? '✓ KEEP IN LOGBOOK' : 'Will be discarded'}"),
        ("<span>CONFIRM BỎ VÀO NHẬT KÝ</span>", "<span>CONFIRM LOGBOOK SELECTION</span>"),
        ("<span>CONFIRM CHỌN HẢI ĐỒ NÀY</span>", "<span>CONFIRM THIS COURSE</span>"),
        ("<h3 className=\"text-xl font-bold text-white mb-2\">Thuyền Trưởng Đang Xem Xét Hải Đồ</h3>", "<h3 className=\"text-xl font-bold text-white mb-2\">Captain is Inspecting the Charts</h3>"),
        ("Thuyền trưởng <span className=\"text-amber-300 font-semibold\">{captain?.nickname}</span> đang bí mật rút 2 thẻ hải đồ và chọn 1 cards để chuyển vào Nhật Ký Hành Trình.", "Captain <span className=\"text-amber-300 font-semibold\">{captain?.nickname}</span> is secretly drawing 2 navigation cards and keeping 1 in the Logbook."),
        ("<h2 className=\"text-2xl md:text-3xl font-extrabold text-white\">Hãy Chọn 1 Lá Bài Tiếp Theo Vào Nhật Ký</h2>", "<h2 className=\"text-2xl md:text-3xl font-extrabold text-white\">Select 1 More Card for the Logbook</h2>"),
        ("Thuyền trưởng đã bỏ 1 cards vào Nhật Ký. Bây giờ đến lượt bạn rút 2 cards mới và <span className=\"text-sky-300 font-semibold\">chọn 1 cards để giữ</span>. 2 cards trong Nhật Ký sẽ được xáo ngẫu nhiên trước khi chuyển cho Hoa tiêu.", "Captain kept 1 card in the Logbook. Now draw 2 cards and <span className=\"text-sky-300 font-semibold\">choose 1 to keep</span>. The 2 Logbook cards will be shuffled before passing to the Navigator."),
        ("<h3 className=\"text-xl font-bold text-white mb-2\">Thuyền Phó Đang Tiếp Tục Rút Bài</h3>", "<h3 className=\"text-xl font-bold text-white mb-2\">Lieutenant is Drawing Navigation Cards</h3>"),
        ("Thuyền phó <span className=\"text-sky-300 font-semibold\">{lieutenant?.nickname}</span> đang bí mật rút 2 thẻ hải đồ và chọn 1 cards tiếp theo vào Nhật Ký.", "Lieutenant <span className=\"text-sky-300 font-semibold\">{lieutenant?.nickname}</span> is secretly drawing 2 cards to complete the Logbook."),
        ("Hoa tiêu <span className=\"text-emerald-300 font-semibold\">{navigator?.nickname}</span> đang cân nhắc 2 lá bài trong Nhật Ký để đưa ra hướng đi cuối cùng cho con tàu.", "Navigator <span className=\"text-emerald-300 font-semibold\">{navigator?.nickname}</span> is reviewing the 2 Logbook cards to make the final steering decision."),
        ("Đang kích hoạt hành động đặc biệt trên hải đồ...", "Executing waypoint event on sea chart..."),
        ("<p className=\"text-sm text-slate-300 max-w-lg mb-6\">Bạn đang là <strong className=\"text-amber-300\">Thuyền trưởng</strong>. Hãy lựa chọn 1 thành viên trên tàu để thực thi hành động này:</p>", "<p className=\"text-sm text-slate-300 max-w-lg mb-6\">You are the <strong className=\"text-amber-300\">Captain</strong>. Select 1 crew member to execute this action:</p>"),
        ("Người được chọn:", "Selected Target:"),
        ("Thuyền trưởng đang cân nhắc chỉ định thuyền viên thi hành mệnh lệnh...", "Captain is selecting a crew member to carry out the order..."),
        ("Thuyền viên bị Nhảy Tàu (Off-duty):", "Overboard Crew Member (Off-Duty):"),
        ("sẽ không được bổ nhiệm hoặc bỏ phiếu ở vòng kế tiếp.", "cannot be appointed or vote during the next round."),
        ("Thuyền trưởng bấm xác nhận để tiếp tục hành trình sang vòng mới...", "Captain confirms to proceed to the next round..."),
        ("Đang đợi Thuyền trưởng (<strong className=\"text-white\">{captain?.nickname}</strong>) bấm xác nhận chuyển vòng...", "Waiting for Captain (<strong className=\"text-white\">{captain?.nickname}</strong>) to confirm next round..."),
    ]
    replace_in_file(nav_path, nav_replacements)

    # 2. MapBoardUI.jsx
    map_path = os.path.join(frontend_src, "components", "MapBoardUI.jsx")
    map_replacements = [
        ("Nghi thức: {room?.mapBoard?.cultRitualDeck?.length ?? 5} lá", "Rituals: {room?.mapBoard?.cultRitualDeck?.length ?? 5} cards"),
        ("Tuyến tiếp tế: {room?.mapBoard?.hasCrossedSupplyLine ? 'Đã kích hoạt' : 'Chưa cắt qua'}", "Supply Line: {room?.mapBoard?.hasCrossedSupplyLine ? 'Crossed' : 'Not Crossed'}"),
        ("⚔️ RANH GIỚI TUYẾN TIẾP TẾ (SUPPLY LINE) ⚔️", "⚔️ SUPPLY LINE BOUNDARY ⚔️"),
        ("VỊ TRÍ XUẤT PHÁT", "STARTING POSITION"),
        ("ĐANG Ở Ô NÀY", "CURRENT WAYPOINT"),
        ("NHẬT KÝ ĐIỀU HƯỚNG TÀU CHI TIẾT", "DETAILED NAVIGATION LOGBOOK"),
        ("Chưa có bước đi nào được ghi lại.", "No waypoints recorded yet."),
        ("Bản đồ:", "Chart:"),
        ("Bản đồ Hải Trình Dài (23 thẻ)", "Long Journey Chart (23 cards)"),
        ("Bản đồ Hải Trình Nhanh (19 thẻ)", "Quick Journey Chart (19 cards)"),
    ]
    replace_in_file(map_path, map_replacements)

if __name__ == "__main__":
    main()
