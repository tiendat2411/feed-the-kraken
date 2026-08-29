import os
import re

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
        ("Thuyền Trưởng Đương Nhiệm", "Incumbent Captain"),
        ("Kho Súng", "Armory"),
        ("Vai Trò Ẩn", "Secret Role"),
        ("Bị cắt lưỡi", "Silenced (Tongue Cut)"),
        ("Thuyền Phó (Lieutenant)", "Lieutenant"),
        ("Hoa Tiêu (Navigator)", "Navigator"),
        ("(Đề xuất)", "(Nominated)"),
        ("Chưa chỉ định", "Not Appointed"),
        ("Phase 1: Bổ nhiệm ban điều hướng", "Phase 1: Navigation Team Appointment"),
        ("Lựa chọn Thuyền phó và Hoa tiêu", "Select Lieutenant and Navigator"),
        ("Thuyền trưởng đang cân nhắc lựa chọn...", "Captain is deliberating appointments..."),
        ("Chọn 1 Thuyền phó (sẽ rút 2 thẻ) và 1 Hoa tiêu (sẽ chọn 1 thẻ để đi tàu). Bạn không thể chọn chính mình.", "Select 1 Lieutenant (draws 2 cards) and 1 Navigator (steers 1 card). You cannot appoint yourself."),
        ("Hãy thảo luận, thuyết phục Thuyền trưởng trao chức vụ hoặc chuẩn bị sẵn súng nổi loạn!", "Debate, persuade the Captain for office, or ready your guns for Mutiny!"),
        ("Nghỉ ca (Off-duty)", "Off-duty"),
        ("Đã bị loại", "Eliminated"),
        (" súng", " guns"),
        ("+ Thuyền phó", "+ Lieutenant"),
        ("Thuyền phó ✓", "Lieutenant ✓"),
        ("+ Hoa tiêu", "+ Navigator"),
        ("Hoa tiêu ✓", "Navigator ✓"),
        ("XÁC NHẬN BỔ NHIỆM", "CONFIRM APPOINTMENTS"),
        ("Vui lòng chọn đủ Thuyền phó và Hoa tiêu", "Please appoint both Lieutenant and Navigator"),
        ("Phase 2: Biểu quyết Bạo loạn (Loyalty Check)", "Phase 2: Mutiny Vote (Loyalty Check)"),
        ("Toàn bộ thủy thủ đoàn nạp đạn bí mật!", "All crew members covertly commit their guns!"),
        ("Nếu tổng số súng của phe nổi loạn đạt tối thiểu", "If total mutiny guns reach at least"),
        ("súng, Thuyền trưởng sẽ bị phế truất!", "guns, the Captain will be overthrown!"),
        ("Súng bạn muốn cược:", "Guns to pledge:"),
        ("Số súng nổi loạn:", "Mutiny Guns:"),
        ("0 Súng (Trung thành)", "0 Guns (Loyal)"),
        ("1 Súng (Bạo loạn)", "1 Gun (Mutiny)"),
        ("2 Súng (Bạo loạn)", "2 Guns (Mutiny)"),
        ("3 Súng (Bạo loạn cực độ)", "3 Guns (All-in Mutiny)"),
        ("Bạn đã nộp phiếu bạo loạn bí mật!", "Your covert vote has been locked in!"),
        ("Đang chờ các thủy thủ đoàn khác bỏ phiếu...", "Waiting for other crew members to vote..."),
        ("Thời gian còn lại:", "Time remaining:"),
        ("NỘP PHIẾU BẠO LOẠN", "SUBMIT MUTINY VOTE"),
        ("Phase 3: Giải quyết Hòa Súng (Tie-breaker)", "Phase 3: Mutiny Tie-Breaker"),
        ("Bạo loạn Hòa súng!", "Mutinous Deadlock!"),
        ("đang nắm quyền quyết định loại bỏ 1 ứng viên nổi loạn:", "is choosing which mutineer candidate to eliminate:"),
        ("Hãy chọn 1 người để LOẠI BỎ khỏi cuộc đua giành quyền Thuyền trưởng:", "Choose 1 candidate to ELIMINATE from the Captaincy contest:"),
        ("Đang chờ quyết định giải quyết hòa súng từ", "Waiting for tie-breaker decision from"),
        ("LOẠI BỎ KHỎI ĐUA THUYỀN TRƯỞNG", "ELIMINATE FROM CONTEST"),
        ("KẾT QUẢ BIỂU QUYẾT BẠO LOẠN", "MUTINY VOTE RESULTS"),
        ("BẠO LOẠN THÀNH CÔNG! LẬT ĐỔ THUYỀN TRƯỞNG!", "MUTINY SUCCEEDED! CAPTAIN OVERTHROWN!"),
        ("BẠO LOẠN THẤT BẠI! THUYỀN TRƯỞNG GIỮ VỮNG QUYỀN LỰC!", "MUTINY FAILED! CAPTAIN RETAINS COMMAND!"),
        ("Tổng số súng nộp:", "Total guns committed:"),
        ("súng (Yêu cầu:", "guns (Required:"),
        ("súng)", "guns)"),
        ("Thuyền trưởng mới:", "New Captain:"),
        ("Số súng nộp nhiều nhất:", "Highest guns committed:"),
        ("súng", "guns"),
        ("TIẾP TỤC ĐIỀU HƯỚNG", "PROCEED TO NAVIGATION"),
        ("XÁC NHẬN KẾT QUẢ & TIẾP TỤC", "CONFIRM OUTCOME & PROCEED"),
        ("Đang chờ Thuyền trưởng xác nhận để tiếp tục...", "Waiting for Captain to confirm and proceed..."),
        ("Danh sách phiếu bầu chi tiết:", "Detailed Ballot Breakdown:"),
        ("Không nộp súng (Trung thành)", "0 Guns (Loyal)"),
        ("Đã nộp", "Committed"),
        ("Bạn", "YOU"),
    ]
    replace_in_file(mutiny_path, mutiny_replacements)

    # 2. NavigationPhase.jsx
    nav_path = os.path.join(frontend_src, "components", "NavigationPhase.jsx")
    nav_replacements = [
        ("BƯỚC 1: THUYỀN TRƯỞNG RÚT BÀI", "STEP 1: CAPTAIN DRAW"),
        ("BƯỚC 2: THUYỀN PHÓ RÚT BÀI", "STEP 2: LIEUTENANT DRAW"),
        ("BƯỚC 3: HOA TIÊU ĐIỀU HƯỚNG", "STEP 3: NAVIGATOR DECISION"),
        ("THỰC THI HIỆU ỨNG ĐIỀU HƯỚNG", "EXECUTING NAVIGATION ACTIONS"),
        ("BỔ NHIỆM HOA TIÊU KHẨN CẤP", "EMERGENCY NAVIGATOR APPOINTMENT"),
        ("Rút 2 thẻ hải trình bí mật từ kho thẻ", "Draw 2 secret navigation cards from the deck"),
        ("Loại bỏ 1 thẻ bí mật và chuyển thẻ còn lại cho Hoa tiêu", "Discard 1 card face-down and pass the rest to Navigator"),
        ("Chọn 1 thẻ duy nhất để con tàu di chuyển", "Choose 1 card to steer the ship forward"),
        ("Con tàu đang di chuyển theo hải trình đã chọn", "The ship is advancing along the selected course"),
        ("Thuyền trưởng đang chỉ định hoa tiêu mới", "Captain is appointing a replacement Navigator"),
        ("RÚT 2 THẺ HẢI TRÌNH", "DRAW 2 NAVIGATION CARDS"),
        ("CHUYỂN THẺ CHO HOA TIÊU", "PASS CARDS TO NAVIGATOR"),
        ("CHỌN THẺ ĐỂ ĐI TÀU", "STEER WITH THIS CARD"),
        ("LOẠI BỎ THẺ NÀY", "DISCARD THIS CARD"),
        ("ĐANG CHỜ...", "WAITING..."),
        ("Đang chờ Thuyền trưởng rút bài...", "Waiting for Captain to draw cards..."),
        ("Đang chờ Thuyền phó rút bài...", "Waiting for Lieutenant to draw cards..."),
        ("Đang chờ Hoa tiêu ra quyết định...", "Waiting for Navigator decision..."),
        ("HẢI HƯỚNG XANH DƯƠNG (BLUEWATER)", "BLUEWATER ROUTE (SAILORS)"),
        ("HẢI HƯỚNG ĐỎ (CRIMSON COVE)", "CRIMSON COVE ROUTE (PIRATES)"),
        ("HẢI HƯỚNG VÀNG (KRAKEN LAIR)", "KRAKEN LAIR ROUTE (CULT)"),
        ("CƠN THỊNH NỘ CỦA KRAKEN", "WRATH OF THE KRAKEN"),
        ("NGHI THỨC TẾ THẦN KRAKEN", "KRAKEN CULT RITUAL"),
        ("CẮT LƯỠI (SILENCE)", "CUT TONGUE (SILENCE)"),
        ("BẮN SÚNG (SHOOT)", "FIRE PISTOL (ATTACK)"),
        ("CHO KRAKEN ĂN (FEED KRAKEN)", "FEED TO KRAKEN"),
        ("BỎ PHIẾU KHẨN CẤP", "EMERGENCY VOTE"),
        ("XÁC NHẬN", "CONFIRM"),
        ("HỦY BỎ", "CANCEL"),
    ]
    replace_in_file(nav_path, nav_replacements)

    # 3. MapBoardUI.jsx
    map_path = os.path.join(frontend_src, "components", "MapBoardUI.jsx")
    map_replacements = [
        ("NHẬT KÝ HẢI TRÌNH", "CAPTAIN'S LOG"),
        ("BẢNG ĐIỀU KHIỂN HẢI TRÌNH", "NAVIGATION LOGBOOK"),
        ("VỊ TRÍ HIỆN TẠI", "CURRENT POSITION"),
        ("HẢI TRÌNH NHANH (19 THẺ)", "QUICK JOURNEY (19 CARDS)"),
        ("HẢI TRÌNH DÀI (23 THẺ)", "LONG JOURNEY (23 CARDS)"),
        ("CULT TRACK (TẾ THẦN)", "CULT RITUAL TRACK"),
        ("BƯỚC ĐI TIẾP THEO", "NEXT WAYPOINT"),
        ("KHU VỰC THẦN KRAKEN", "KRAKEN DOMAIN"),
        ("VỊNH NƯỚC XANH (BLUEWATER BAY)", "BLUEWATER BAY (SAILORS)"),
        ("HANG CƯỚP BIỂN (CRIMSON COVE)", "CRIMSON COVE (PIRATES)"),
        ("SÀO HUYỆT KRAKEN (MAW OF THE KRAKEN)", "KRAKEN LAIR (CULT)"),
        ("Đang tải bản đồ...", "Loading nautical chart..."),
        ("Thuyền trưởng", "Captain"),
        ("Thuyền phó", "Lieutenant"),
        ("Hoa tiêu", "Navigator"),
        ("Thủy thủ", "Sailor"),
        ("Hải tặc", "Pirate"),
        ("Giáo chủ", "Cult Leader"),
        ("Giáo đồ", "Cultist"),
    ]
    replace_in_file(map_path, map_replacements)

    # 4. Game.jsx
    game_path = os.path.join(frontend_src, "pages", "Game.jsx")
    game_replacements = [
        ("alert('Phòng đã bị chủ phòng giải tán.');", "alert('The room was dissolved by the host.');"),
        ("alert('Bạn đã bị chủ phòng kick.');", "alert('You have been kicked from the room by the host.');"),
        ("if (socket && window.confirm('Bạn có chắc chắn muốn rời khỏi phòng không?'))", "if (socket && window.confirm('Are you sure you want to leave the room?'))"),
        ("if (socket && window.confirm('Bạn có chắc chắn muốn giải tán phòng không? Tất cả người chơi sẽ bị đưa về trang chủ.'))", "if (socket && window.confirm('Are you sure you want to dissolve the room? All players will be returned to the title screen.'))"),
        ("if (socket && window.confirm('Bạn có chắc chắn muốn kick người chơi này không?'))", "if (socket && window.confirm('Are you sure you want to kick this player from the ship?'))"),
        ("Quay lại Trang Chủ", "Return to Title Screen"),
        ("Thử kết nối lại", "Retry Connection"),
        ("MẤT KẾT NỐI MẠNG", "CONNECTION LOST"),
        ("Đang thử kết nối lại với máy chủ...", "Attempting to reconnect to server..."),
        ("THU NẠP TÀ GIÁO BÍ MẬT", "SECRET CULT CONVERSION RITUAL"),
        ("Bạn vừa được Giáo Chủ trao thẻ Tín Đồ! Bạn đã gia nhập phe Tà Giáo Kraken!", "You have been touched by the Cult Leader! You now serve the Kraken Cult!"),
        ("BỊ CẮT LƯỠI!", "YOUR TONGUE HAS BEEN CUT!"),
        ("Bạn không được phép nói chuyện hoặc giao tiếp bằng bất kỳ hình thức nào cho đến hết trận!", "You are silenced and cannot speak or communicate for the rest of the voyage!"),
        ("Đang tải dữ liệu trận đấu...", "Loading voyage data..."),
    ]
    replace_in_file(game_path, game_replacements)

    # 5. EndGame.jsx
    endgame_path = os.path.join(frontend_src, "pages", "EndGame.jsx")
    endgame_replacements = [
        ("PHE THỦY THỦ CHIẾN THẮNG!", "SAILORS WIN THE VOYAGE!"),
        ("Con tàu đã cập bến an toàn tại vịnh Bluewater Bay!", "The vessel has safely anchored at Bluewater Bay!"),
        ("THỦY THỦ ĐOÀN (SAILORS)", "SAILORS"),
        ("PHE HẢI TẶC CHIẾN THẮNG!", "PIRATES CLAIM THE SHIP!"),
        ("Con tàu đã bị cướp và đưa về sào huyệt Crimson Cove!", "The ship was hijacked and steered into Crimson Cove!"),
        ("HẢI TẶC (PIRATES)", "PIRATES"),
        ("GIÁO PHÁI KRAKEN CHIẾN THẮNG!", "THE KRAKEN RISES! CULT VICTORY!"),
        ("Con tàu đã bị hiến tế cho Thần Quái Vật Kraken vĩ đại!", "The vessel and crew were sacrificed to the Great Kraken!"),
        ("GIÁO PHÁI KRAKEN (CULT)", "KRAKEN CULT"),
        ("CHIẾN THẮNG THUỘC VỀ", "VICTORY BELONGS TO"),
        ("DANH TÍNH BÍ MẬT CỦA THỦY THỦ ĐOÀN", "CREW SECRET IDENTITIES REVEALED"),
        ("ĐỒNG BỌN HẢI TẶC", "PIRATE CREW"),
        ("TÍN ĐỒ TÀ GIÁO", "CULT CONVERT"),
        ("ĐÃ BỊ LOẠI", "ELIMINATED"),
        ("NGHỈ CA", "OFF-DUTY"),
        ("QUAY LẠI SẢNH CHỜ", "RETURN TO LOBBY"),
        ("RỜI PHÒNG", "LEAVE ROOM"),
        ("Đang tải kết quả...", "Loading match results..."),
    ]
    replace_in_file(endgame_path, endgame_replacements)

if __name__ == "__main__":
    main()
