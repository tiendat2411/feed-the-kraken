import React from 'react';

/**
 * EndGame Page / Component (BR-005 / UC-018)
 * Màn hình vinh danh phe thắng cuộc, công bố kết quả trận đấu,
 * phơi bày 100% danh tính thật sự của tất cả người chơi và cung cấp nút quay lại sảnh chờ cho Host.
 */
const EndGame = ({ room, currentUserId, onReturnToLobby, onLeaveRoom }) => {
  const isHost = room?.hostId === currentUserId;
  const gameResult = room?.gameResult || {};
  const winningFaction = gameResult.winningFaction || room?.winnerFaction || 'SAILOR';
  const winReason = gameResult.winReason || room?.winReason || 'REACHED_DESTINATION';
  const playersSnapshot = gameResult.playersSnapshot || room?.players || [];
  const terminalNode = gameResult.terminalNode || room?.mapBoard?.currentNode || null;
  const totalRounds = gameResult.totalRounds ?? 0;

  // Cấu hình chủ đề theo phe thắng cuộc
  const factionThemes = {
    SAILOR: {
      title: 'PHE THỦY THỦ CHIẾN THẮNG!',
      subtitle: 'Con tàu đã cập bến an toàn tại vịnh Bluewater Bay!',
      badge: 'THỦY THỦ ĐOÀN (SAILORS)',
      icon: '⛵',
      bgGradient: 'from-blue-950 via-slate-900 to-cyan-950',
      heroGradient: 'from-cyan-400 via-blue-400 to-indigo-400',
      borderGlow: 'border-cyan-500/50 shadow-[0_0_80px_rgba(6,182,212,0.3)]',
      cardWinnerBg: 'bg-gradient-to-b from-cyan-950/70 to-blue-900/40 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.2)]',
      accentColor: 'text-cyan-300'
    },
    PIRATE: {
      title: 'PHE HẢI TẶC CHIẾN THẮNG!',
      subtitle: 'Con tàu đã bị cướp và đưa về sào huyệt Crimson Cove!',
      badge: 'BĂNG HẢI TẶC (PIRATES)',
      icon: '🏴‍☠️',
      bgGradient: 'from-red-950 via-slate-900 to-amber-950',
      heroGradient: 'from-red-400 via-amber-400 to-yellow-300',
      borderGlow: 'border-red-500/50 shadow-[0_0_80px_rgba(239,68,68,0.3)]',
      cardWinnerBg: 'bg-gradient-to-b from-red-950/70 to-amber-900/40 border-red-400/60 shadow-[0_0_25px_rgba(239,68,68,0.2)]',
      accentColor: 'text-red-400'
    },
    CULT: {
      title: 'PHE TÀ GIÁO CHIẾN THẮNG!',
      subtitle: winReason.includes('SACRIFICED')
        ? 'Giáo chủ đã được hiến tế thành công! Thần Kraken trỗi dậy nuốt chửng tất cả!'
        : 'Con tàu đã bị dẫn dắt thẳng vào Hang ổ của Thần Kraken vĩ đại!',
      badge: 'HỘI TÀ GIÁO (CULT OF KRAKEN)',
      icon: '🐙',
      bgGradient: 'from-purple-950 via-slate-900 to-pink-950',
      heroGradient: 'from-purple-400 via-pink-400 to-indigo-300',
      borderGlow: 'border-purple-500/60 shadow-[0_0_90px_rgba(168,85,247,0.4)]',
      cardWinnerBg: 'bg-gradient-to-b from-purple-950/80 to-pink-900/40 border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.3)]',
      accentColor: 'text-purple-300'
    }
  };

  const theme = factionThemes[winningFaction] || factionThemes.SAILOR;

  // Phân chia danh sách người chơi thắng / thua
  const winners = playersSnapshot.filter(p => p.isWinner);
  const losers = playersSnapshot.filter(p => !p.isWinner);

  // Helper hiển thị badge vai trò chi tiết
  const renderRoleBadge = (player) => {
    const isCultLeader = player.isCultLeader || player.originalFaction === 'CULT_LEADER';
    const isCultist = player.isCultist || player.currentFaction === 'CULTIST';
    const wasConverted = isCultist && !isCultLeader && player.originalFaction !== 'CULTIST';

    if (isCultLeader) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-600/40 text-purple-200 border border-purple-400/60 flex items-center gap-1">
          <span>👑</span> GIÁO CHỦ (CULT LEADER)
        </span>
      );
    }

    if (wasConverted) {
      return (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/60 text-slate-300 line-through">
            {player.originalFaction}
          </span>
          <span className="text-purple-400 font-bold text-xs">➔</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-600/40 text-pink-200 border border-purple-400/60 flex items-center gap-1 animate-pulse">
            <span>🐙</span> CULTIST (ĐÃ CẢI ĐẠO)
          </span>
        </div>
      );
    }

    if (player.currentFaction === 'PIRATE' || player.originalFaction === 'PIRATE') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-200 border border-red-400/40 flex items-center gap-1">
          <span>🏴‍☠️</span> HẢI TẶC (PIRATE)
        </span>
      );
    }

    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600/30 text-blue-200 border border-blue-400/40 flex items-center gap-1">
        <span>⛵</span> THỦY THỦ (SAILOR)
      </span>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bgGradient} text-white p-4 md:p-8 flex flex-col items-center justify-between`}>
      <div className="w-full max-w-5xl space-y-8 animate-fadeIn">
        {/* ========================================================================= */}
        {/* 1. HERO BANNER: VINH DANH PHE CHIẾN THẮNG */}
        {/* ========================================================================= */}
        <div className={`p-8 rounded-3xl bg-slate-900/90 border ${theme.borderGlow} text-center space-y-4 backdrop-blur-xl relative overflow-hidden`}>
          <div className="text-6xl md:text-7xl animate-bounce mb-2">
            {theme.icon}
          </div>
          
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-xs font-black uppercase tracking-widest text-slate-300">
            {theme.badge}
          </div>

          <h1 className={`text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r ${theme.heroGradient} bg-clip-text text-transparent`}>
            {theme.title}
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            {theme.subtitle}
          </p>

          {/* Quick Match Statistics */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              🗺️ Bản đồ: <span className="font-bold text-white">{room?.mapType === 'LONG_JOURNEY' ? 'Long Journey' : 'Quick Journey'}</span>
            </div>
            {terminalNode && (
              <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                🏁 Điểm kết thúc: <span className="font-bold text-amber-300">{terminalNode.name || terminalNode.id}</span>
              </div>
            )}
            <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              ⏳ Tổng số vòng: <span className="font-bold text-white">{totalRounds}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BẢNG VINH DANH & TIẾT LỘ 100% DANH TÍNH (HALL OF FAME) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CỘT 1: NHỮNG NGƯỜI CHIẾN THẮNG */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 px-2">
              <span className="text-xl">🏆</span>
              <h2 className="text-lg font-black text-amber-300 tracking-wide uppercase">
                Phe Chiến Thắng ({winners.length})
              </h2>
            </div>

            <div className="space-y-3">
              {winners.map(player => (
                <div
                  key={player.id}
                  className={`p-4 rounded-3xl border ${theme.cardWinnerBg} flex items-center justify-between transition hover:scale-[1.02]`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="text-3xl p-2 rounded-2xl bg-black/40 border border-white/10">
                      {player.avatar || '🧑‍✈️'}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-base truncate text-white">
                          {player.nickname}
                        </span>
                        {player.id === currentUserId && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                            BẠN
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        {renderRoleBadge(player)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-1 pl-2">
                    <div className="font-black text-emerald-400 flex items-center justify-end gap-1">
                      <span>👑</span> THẮNG CUỘC
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      🔫 {player.gunCount ?? 0} súng
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT 2: NHỮNG NGƯỜI THUA CUỘC */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 px-2">
              <span className="text-xl">💀</span>
              <h2 className="text-lg font-black text-slate-400 tracking-wide uppercase">
                Phe Thua Cuộc ({losers.length})
              </h2>
            </div>

            <div className="space-y-3">
              {losers.map(player => (
                <div
                  key={player.id}
                  className="p-4 rounded-3xl border border-slate-800 bg-slate-900/60 flex items-center justify-between transition hover:bg-slate-900/90"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="text-3xl p-2 rounded-2xl bg-black/30 border border-slate-800 opacity-80">
                      {player.avatar || '🧑‍✈️'}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base truncate text-slate-300">
                          {player.nickname}
                        </span>
                        {player.id === currentUserId && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                            BẠN
                          </span>
                        )}
                        {player.status === 'ELIMINATED' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600/40 text-red-300 border border-red-500/40">
                            ĐÃ CHẾT
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        {renderRoleBadge(player)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-1 pl-2">
                    <div className="font-semibold text-slate-500">
                      THẤT BẠI
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      🔫 {player.gunCount ?? 0} súng
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ACTION CONTROLS: RETURN TO LOBBY / LEAVE ROOM */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="text-left text-xs text-slate-400 space-y-1">
            <div className="font-bold text-slate-200">
              Ván chơi đã hoàn tất và lưu trữ kết quả.
            </div>
            <div>
              {isHost
                ? 'Chủ phòng có thể bấm nút bên phải để đưa tất cả mọi người về Sảnh chờ chuẩn bị ván mới.'
                : 'Đang chờ Chủ phòng bấm nút đưa toàn bộ người chơi về lại Sảnh chờ...'}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onLeaveRoom}
              className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              🚪 RỜI PHÒNG
            </button>

            {isHost && (
              <button
                onClick={onReturnToLobby}
                className="flex-1 md:flex-initial px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 font-black text-slate-950 text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition transform"
              >
                QUAY LẠI SẢNH CHỜ (CHƠI VÁN MỚI) 🔁
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndGame;
