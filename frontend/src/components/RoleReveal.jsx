import React, { useState, useEffect } from 'react';
import { Shield, Skull, Eye, EyeOff, Flame, Clock, Users, Anchor } from 'lucide-react';

const FACTION_DETAILS = {
  SAILOR: {
    name: 'THỦY THỦ (SAILOR)',
    color: 'from-blue-600 to-cyan-500',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/20',
    icon: Anchor,
    tagline: 'Phe Trung Thành & Công Lý',
    goal: 'Lái con tàu cập bến an toàn tại vịnh Bluewater Bay (Hướng Xanh Dương) hoặc tiêu diệt toàn bộ Hải tặc & Giáo phái.',
    tips: 'Hãy cẩn trọng khi chọn Thuyền phó và Hoa tiêu. Đừng để Hải tặc kiểm soát bánh lái!'
  },
  PIRATE: {
    name: 'HẢI TẶC (PIRATE)',
    color: 'from-red-600 to-rose-700',
    border: 'border-red-500/50',
    glow: 'shadow-red-500/30',
    icon: Skull,
    tagline: 'Phe Cướp Biển & Nổi Loạn',
    goal: 'Đánh cướp con tàu và điều hướng thẳng vào hang ổ Crimson Cove (Hướng Đỏ) để chia kho báu.',
    tips: 'Phối hợp ngầm với đồng bọn! Sử dụng súng để Bạo Loạn (Mutiny) lật đổ Thuyền trưởng khi cần.'
  },
  CULT_LEADER: {
    name: 'GIÁO CHỦ (CULT LEADER)',
    color: 'from-amber-500 to-yellow-600',
    border: 'border-yellow-500/50',
    glow: 'shadow-yellow-500/30',
    icon: Flame,
    tagline: 'Lãnh Đạo Giáo Phái Kraken',
    goal: 'Dụ dỗ con tàu vào sào huyệt của Thần Quái Vật Kraken (Hướng Vàng) HOẶC bị Thuyền trưởng ném cho Kraken ăn!',
    tips: 'Sử dụng các thẻ Nghi Thức (Cult Rituals) để thu nạp thêm Giáo Đồ (Cultist) bí mật vào phe mình.'
  },
  CULTIST: {
    name: 'GIÁO ĐỒ (CULTIST)',
    color: 'from-purple-600 to-indigo-600',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/30',
    icon: Eye,
    tagline: 'Tín Đồ Tận Tụy',
    goal: 'Phụng sự Giáo Chủ và hướng con tàu về phía Thần Bạch Tuộc Kraken.',
    tips: 'Bảo vệ Giáo Chủ và tạo cơ hội để ngài thực hiện nghi thức tế thần.'
  }
};

const RoleReveal = ({ room, myRole, currentUserId }) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const faction = FACTION_DETAILS[myRole] || FACTION_DETAILS.SAILOR;
  const Icon = faction.icon;
  const isPirate = myRole === 'PIRATE';
  const knownPirates = room?.knownPirates || [];

  // Đồng bộ đếm ngược theo deadline từ server
  useEffect(() => {
    if (!room?.phaseDeadline) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.phaseDeadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [room?.phaseDeadline]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br ${faction.color} opacity-20 blur-3xl rounded-full pointer-events-none`}></div>
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br ${faction.color} opacity-20 blur-3xl rounded-full pointer-events-none`}></div>

      {/* Top Countdown Banner */}
      <div className="z-10 mb-6 flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-xl">
        <Clock className="text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} size={20} />
        <span className="font-semibold text-slate-300">GIAI ĐOẠN ĐÊM ĐẦU TIÊN:</span>
        <span className={`font-mono text-2xl font-black ${timeLeft <= 5 ? 'text-red-400 animate-ping' : 'text-yellow-400'}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Main Container */}
      <div className="z-10 max-w-2xl w-full space-y-6">
        
        {/* Role Identity Card */}
        <div className={`bg-slate-900/80 backdrop-blur-xl border ${faction.border} rounded-3xl p-6 sm:p-8 shadow-2xl ${faction.glow} transition duration-500`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${faction.color} flex items-center justify-center shadow-lg`}>
                <Icon size={32} className="text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">VAI TRÒ BÍ MẬT CỦA BẠN</span>
                <h1 className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${faction.color} bg-clip-text text-transparent`}>
                  {faction.name}
                </h1>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Trang bị</span>
              <div className="text-lg font-bold text-amber-400 flex items-center gap-1 justify-end">
                🔫 3 Súng
              </div>
            </div>
          </div>

          {/* Goal & Mission */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Shield size={16} className="text-blue-400" /> Nhiệm vụ phe
              </h3>
              <p className="text-slate-300 bg-white/5 p-4 rounded-xl border border-white/5 text-sm leading-relaxed">
                {faction.goal}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                💡 Lời khuyên
              </h3>
              <p className="text-xs text-slate-400 italic">
                {faction.tips}
              </p>
            </div>
          </div>
        </div>

        {/* Night Phase Actions Area */}
        {isPirate ? (
          /* Pirate Gathering Screen */
          <div className="bg-red-950/40 backdrop-blur-md border border-red-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Skull className="text-red-400 animate-bounce" size={24} />
              <div>
                <h2 className="text-xl font-bold text-red-200">HẢI TẶC HỘI TỤ (PIRATES GATHERING)</h2>
                <p className="text-xs text-red-300/80">Bạn và các đồng bọn dưới đây là những người thuộc phe Hải tặc:</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {knownPirates.map((pirate) => (
                <div 
                  key={pirate.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    pirate.id === currentUserId 
                      ? 'bg-red-500/20 border-red-500/60 shadow-lg shadow-red-500/10' 
                      : 'bg-black/40 border-red-500/20'
                  }`}
                >
                  <div className="text-2xl w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center border border-red-500/30">
                    {pirate.avatar || '🏴‍☠️'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-sm text-red-100 truncate flex items-center gap-1">
                      {pirate.nickname || pirate.name}
                      {pirate.id === currentUserId && <span className="text-[10px] bg-red-500 text-white px-1 rounded">Bạn</span>}
                    </div>
                    <span className="text-[11px] text-red-400">Đồng bọn Hải tặc</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Non-Pirate Eyes Closed Overlay */
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 animate-pulse">
              <EyeOff size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-200">TẤT CẢ ĐANG NHẮM MẮT... 🌙</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                Bóng đêm bao trùm con tàu. Các Hải tặc đang bí mật nhận diện đồng bọn. Hãy giữ im lặng tuyệt đối cho đến khi trời sáng!
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Trời sẽ sáng tự động sau {timeLeft} giây
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RoleReveal;
