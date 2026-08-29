import React, { useState } from 'react';
import woodHeaderBarPng from '../../assets/ui/frames/wood_header_bar.png';
import ButtonWood from '../ui/ButtonWood';

/**
 * LobbyHeader Component
 * Thanh tiêu đề ván gỗ sồi phong hóa bọc 4 góc đồng verdigris tỷ lệ 14:1.
 * - Căn lề an toàn pl-[6%] tránh đè góc đồng bên trái.
 * - Tích hợp nút sao chép mã phòng (Click to Copy Room Code) kèm thông báo COPIED.
 */
const LobbyHeader = ({
  roomId,
  playerCount,
  maxPlayers = 11,
  isHost,
  onDissolveRoom,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative w-full max-w-6xl mx-auto mb-4 sm:mb-6 select-none filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]">
      {/* Background Header Wood Bar (Exact 14:1 Proportion) */}
      <div className="relative w-full aspect-[1680/120] min-h-[64px] sm:min-h-[76px] flex items-center pl-[7%] sm:pl-[6%] md:pl-[5.5%] pr-[4%] sm:pr-[5%]">
        <img
          src={woodHeaderBarPng}
          alt="Lobby Header Frame"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          aria-hidden="true"
        />

        {/* Content Layer */}
        <div className="relative z-10 w-full flex items-center justify-between gap-3">
          {/* Left: Click-to-Copy Room Code & Crew Counter */}
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Interactive Room Code Badge */}
            <button
              type="button"
              onClick={handleCopyRoomCode}
              className="group flex items-center gap-2 px-2.5 py-1 rounded bg-black/30 hover:bg-black/50 border border-gold/30 hover:border-gold transition-all duration-150 transform hover:scale-[1.03] active:scale-95 cursor-pointer"
              title="Nhấp để sao chép mã phòng"
            >
              <h1
                className="font-display text-xl sm:text-2xl md:text-3xl text-gold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:text-gold-bright"
                style={{ textShadow: '0 0 15px rgba(201,168,76,0.4)' }}
              >
                ROOM: {roomId}
              </h1>

              {/* Copy Feedback Icon / Text */}
              <span
                className={`
                  font-heading font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded uppercase tracking-widest transition-all duration-200
                  ${copied
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400 animate-pulse'
                    : 'bg-gold/10 text-gold/80 border border-gold/30 group-hover:bg-gold/20 group-hover:text-gold'
                  }
                `}
              >
                {copied ? 'COPIED!' : 'COPY'}
              </span>
            </button>

            {/* Crew Counter */}
            <span className="font-heading font-bold text-xs sm:text-sm text-parchment-dim tracking-widest uppercase">
              {playerCount} / {maxPlayers} CREW MEMBERS
            </span>
          </div>

          {/* Right: Room Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isHost && (
              <ButtonWood
                id="btn-dissolve-room"
                variant="primary"
                onClick={onDissolveRoom}
                className="!h-[34px] sm:!h-[38px] !min-w-[100px] sm:!min-w-[120px] !px-2.5 sm:!px-3"
              >
                CLOSE ROOM
              </ButtonWood>
            )}
            <ButtonWood
              id="btn-leave-room"
              variant="primary"
              onClick={onLeaveRoom}
              className="!h-[34px] sm:!h-[38px] !min-w-[80px] sm:!min-w-[100px] !px-2.5 sm:!px-3"
            >
              LEAVE
            </ButtonWood>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LobbyHeader;
