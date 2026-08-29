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
        ("Số guns bạn muốn nộp bí mật", "Guns to Commit Covertly"),
        ("Súng của bạn chỉ bị trừ nếu bạo loạn thành công. Số lượng chọn sẽ được giữ kín hoàn toàn.", "Your guns are only spent if the mutiny succeeds. Your pledge remains strictly confidential."),
        ("XÁC NHẬN NỘP {gunVote} SÚNG", "CONFIRM PLEDGE OF {gunVote} GUNS"),
        ("YOU đã gửi {gunVote} guns bí mật!", "You have covertly pledged {gunVote} guns!"),
        ("Đang chờ các thuyền viên khác hoàn tất bỏ phiếu...", "Waiting for fellow crew members to cast their votes..."),
        ("YOU là Thuyền trưởng", "You are the Captain"),
        ("YOU không được phép tham gia bỏ phiếu nổi loạn. Hãy quan sát lòng trung thành của thủy thủ đoàn!", "As Captain, you cannot vote in a mutiny against yourself. Observe the loyalty of your crew!"),
        ("Trạng thái biểu quyết thủy thủ đoàn", "Crew Ballot Status"),
        ("đã bỏ phiếu", "Voted"),
        ("đang suy nghĩ", "Deliberating"),
        ("ĐANG CHỜ TỔNG HỢP PHIẾU BẦU...", "TALLYING BALLOTS..."),
        ("Đang kiểm phiếu bạo loạn...", "Auditing mutiny votes..."),
        ("người đã nộp", "players pledged"),
        ("Súng của người bị loại sẽ được trả về kho.", "The eliminated candidate's guns return to their armory."),
    ]
    replace_in_file(mutiny_path, mutiny_replacements)

    # 2. NavigationPhase.jsx
    nav_path = os.path.join(frontend_src, "components", "NavigationPhase.jsx")
    nav_replacements = [
        ("Tiếng Hát Tiên Cá 🧜‍♀️', desc: 'Thuyền trưởng chỉ định 1 người chơi bí mật xem lại 3 lá bài bị hủy gần nhất.'", "Mermaid Song 🧜‍♀️', desc: 'Captain appoints 1 player to secretly examine the last 3 discarded cards.'"),
        ("Kính Viễn Vọng 🔭', desc: 'Thuyền trưởng chỉ định 1 người chơi bí mật nhìn lá bài trên đỉnh bộ bài bốc (chọn giữ lại hoặc hủy).'", "Spyglass 🔭', desc: 'Captain appoints 1 player to inspect the top card of the navigation deck.'"),
        ("Thuận Buồm Xuôi Gió ⛵', desc: 'Con tàu di chuyển êm đềm theo hướng hải đồ, không có tác động phụ.'", "Fair Winds ⛵', desc: 'The vessel glides smoothly along the plotted course with no extra incident.'"),
        ("GIAI ĐOẠN ĐIỀU HƯỚNG TÀU", "NAVIGATION PHASE"),
        ("Phòng:", "Room:"),
        ("Chế độ:", "Mode:"),
        ("Chồng bài bốc:", "Deck:"),
        ("Đã hủy:", "Discard:"),
        ("lá", "cards"),
        ("HIỆN TẠI ĐANG LÀM THUYỀN TRƯỞNG", "CURRENTLY CAPTAIN"),
        ("HIỆN TẠI ĐANG LÀM THUYỀN PHÓ", "CURRENTLY LIEUTENANT"),
        ("HIỆN TẠI ĐANG LÀM HOA TIÊU", "CURRENTLY NAVIGATOR"),
        ("THUYỀN VIÊN TỰ DO", "CREW MEMBER"),
        ("Thuyền trưởng rút bài", "Captain draws cards"),
        ("Thuyền phó rút bài", "Lieutenant draws cards"),
        ("Hoa tiêu điều hướng", "Navigator steers ship"),
        ("Thực thi hiệu ứng", "Execute effects"),
        ("Bạn đang là Thuyền trưởng! Hãy rút 2 thẻ hải trình đầu tiên từ boong bài.", "You are the Captain! Draw the first 2 navigation cards from the deck."),
        ("Bạn đang là Thuyền phó! Hãy rút thêm 2 thẻ hải trình để tiếp tục hải trình.", "You are the Lieutenant! Draw 2 more navigation cards to continue the voyage."),
        ("Thuyền trưởng và Thuyền phó đã rút bài. Đang chuẩn bị chuyển thẻ cho Hoa tiêu.", "Captain and Lieutenant have drawn cards. Preparing to pass cards to Navigator."),
        ("RÚT BÀI ĐIỀU HƯỚNG (2 THẺ)", "DRAW 2 NAVIGATION CARDS"),
        ("Chỉ định người ngắm", "Appoint Lookout"),
        ("Chỉ định người nghe", "Appoint Listener"),
        ("Chọn 1 người chơi:", "Select 1 Player:"),
        ("Thực hiện hành động", "Execute Action"),
        ("Xác nhận chọn", "Confirm Selection"),
        ("Hành Động Đặc Biệt:", "Special Action:"),
        ("Tác Vụ:", "Task:"),
        ("Đang kích hoạt hiệu ứng...", "Resolving action effect..."),
        ("HOÀN TẤT ĐIỀU HƯỚNG", "COMPLETE NAVIGATION"),
        ("HẢI ĐỒ ĐƯỢC CHỌN", "SELECTED COURSE"),
        ("BÀI BỊ HỦY", "DISCARDED CARD"),
    ]
    replace_in_file(nav_path, nav_replacements)

    # 3. MapBoardUI.jsx
    map_path = os.path.join(frontend_src, "components", "MapBoardUI.jsx")
    map_replacements = [
        ("case 'OFF_WITH_THE_TONGUE': return 'Cắt Lưỡi';", "case 'OFF_WITH_THE_TONGUE': return 'Silence (Cut Tongue)';"),
        ("case 'FEED_THE_KRAKEN': return 'Tế Thần Kraken';", "case 'FEED_THE_KRAKEN': return 'Feed to Kraken';"),
        ("case 'CABIN_SEARCH': return 'Lục Soát Cabin';", "case 'CABIN_SEARCH': return 'Cabin Search';"),
        ("case 'SECRET_CULT_RITUAL': return 'Nghi Thức Tà Giáo';", "case 'SECRET_CULT_RITUAL': return 'Secret Cult Ritual';"),
        ("case 'CULT_GATHERING': return 'Hội Tụ Tà Giáo';", "case 'CULT_GATHERING': return 'Cult Gathering';"),
        ("case 'MERMAID_SONG': return 'Tiếng Hát Tiên Cá';", "case 'MERMAID_SONG': return 'Mermaid Song';"),
        ("case 'SPYGLASS': return 'Kính Viễn Vọng';", "case 'SPYGLASS': return 'Spyglass';"),
        ("case 'MUTINY_CALL': return 'Kêu Gọi Nổi Loạn';", "case 'MUTINY_CALL': return 'Call to Mutiny';"),
        ("case 'PEACEFUL_SEA': return 'Biển Lặng';", "case 'PEACEFUL_SEA': return 'Calm Seas';"),
        ("Hải Trình Đi:", "Course Steered:"),
        ("Vòng", "Round"),
        ("Bước đi:", "Step:"),
        ("Tọa độ:", "Coord:"),
        ("Tàu cập bến an toàn!", "Ship anchored safely!"),
        ("Tàu bị cướp!", "Ship hijacked!"),
        ("Kraken trỗi dậy!", "Kraken awakened!"),
        ("Hải đồ hải trình", "Nautical Sea Chart"),
        ("Nhật ký điều hướng", "Navigation Log"),
    ]
    replace_in_file(map_path, map_replacements)

    # 4. EndGame.jsx
    endgame_path = os.path.join(frontend_src, "pages", "EndGame.jsx")
    endgame_replacements = [
        ("GIÁO CHỦ (CULT LEADER)", "CULT LEADER"),
        ("CULTIST (ĐÃ CẢI ĐẠO)", "CULTIST (CONVERTED)"),
        ("HẢI TẶC (PIRATE)", "PIRATE"),
        ("THỦY THỦ (SAILOR)", "SAILOR"),
        ("NGƯỜI CHIẾN THẮNG", "VICTORS"),
        ("NGƯỜI THUA CUỘC", "DEFEATED"),
        ("CHỦ PHÒNG", "HOST"),
        ("BẠN", "YOU"),
        ("SỐNG SÓT", "SURVIVED"),
        ("BỊ NÉM CHO KRAKEN", "FED TO KRAKEN"),
        ("BỊ BẮN HẠ", "SHOT DOWN"),
        ("ĐÃ RỜI PHÒNG", "LEFT SHIP"),
    ]
    replace_in_file(endgame_path, endgame_replacements)

if __name__ == "__main__":
    main()
