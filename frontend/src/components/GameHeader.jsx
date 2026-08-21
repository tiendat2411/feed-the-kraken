import React from 'react';
import { LogOut, Trash2, Shield, Compass, Sparkles } from 'lucide-react';

/**
 * GameHeader Component
 * Thanh điều hướng đỉnh trang dùng chung cho mọi giai đoạn trong game (RoleReveal, Mutiny, Navigation).
 * Cung cấp nút Rời phòng (cho player) và Giải tán phòng (cho Host) để tránh kẹt phòng trong bộ nhớ.
 */
const GameHeader = ({
  room,
  currentUserId,
  onLeaveRoom,
  onDissolveRoom
}) => {
  if (!room) return null;

  const myId = room.myId || currentUserId;
  const isHost = room.hostId === myId;

  const getPhaseName = (phase) => {
    switch (phase) {
      case 'ROLE_REVEAL':
      case 'PIRATES_GATHERING':
        return '🌙 Ban Đêm (Vai Trò Bí Mật)';
      case 'DAY_1_CREW_SELECTION':
      case 'APPOINT_TEAM':
        return '☀️ Ban Ngày (Bổ Nhiệm)';
      case 'LOYALTY_CHECK':
        return '⚔️ Biểu Quyết Bạo Loạn';
      case 'MUTINY_REVEALED':
        return '📜 Kết Quả Bạo Loạn';
      case 'MUTINY_TIE_BREAKER':
        return '⚖️ Giải Quyết Hòa Súng';
      case 'NAVIGATION':
      case 'NAVIGATION_CAPTAIN_DRAW':
        return '🧭 Thuyền Trưởng Rút Bài';
      case 'NAVIGATION_LIEUTENANT_DRAW':
        return '🧭 Thuyền Phó Rút Bài';
      case 'NAVIGATION_NAVIGATOR_DECISION':
        return '🧭 Quyết Định Của Hoa Tiêu';
      case 'EMERGENCY_NAVIGATOR_SELECTION':
        return '🚨 Bổ Nhiệm Hoa Tiêu Khẩn Cấp';
      case 'EXECUTE_ACTIONS':
        return '⛵ Thực Thi Điều Hướng';
      default:
        return phase;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Room Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-xl text-xs">
            <span className="text-slate-400">Phòng:</span>
            <span className="font-mono font-bold text-cyan-300">{room.id}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-xl text-xs">
            <span className="text-slate-400">Chế độ:</span>
            <span className="font-semibold text-amber-300">{room.mapType === 'LONG_JOURNEY' ? 'Hải Trình Dài (23 Thẻ)' : 'Hành Trình Nhanh (19 Thẻ)'}</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1 rounded-xl text-xs text-indigo-200">
            <Sparkles size={13} className="text-indigo-400" />
            <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{getPhaseName(room.gamePhase)}</span>
          </div>
        </div>

        {/* Right: Room Control Actions */}
        <div className="flex items-center space-x-2">
          {/* Host Dissolve Room Button */}
          {isHost && (
            <button
              id="btn-dissolve-room-header"
              onClick={onDissolveRoom}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 transition-all hover:scale-105 cursor-pointer shadow-sm shadow-red-950"
              title="Giải tán phòng chơi này cho toàn bộ người chơi"
            >
              <Trash2 size={14} />
              <span>GIẢI TÁN PHÒNG</span>
            </button>
          )}

          {/* Leave Room Button for all players */}
          <button
            id="btn-leave-room-header"
            onClick={onLeaveRoom}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-600/60 transition-all hover:scale-105 cursor-pointer"
            title="Rời khỏi phòng chơi và quay lại trang chủ"
          >
            <LogOut size={14} />
            <span>RỜI PHÒNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
