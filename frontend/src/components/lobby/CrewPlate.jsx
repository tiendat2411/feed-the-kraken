import React from 'react';
import crewPlateWoodPng from '../../assets/ui/frames/crew_plate_wood.png';
import crownGoldBadgePng from '../../assets/ui/sprites/crown_gold_badge.png';
import gemEmeraldOnlinePng from '../../assets/ui/sprites/gem_emerald_online.png';
import gemRubyOfflinePng from '../../assets/ui/sprites/gem_ruby_offline.png';
import iconKickSkullPng from '../../assets/ui/sprites/icon_kick_skull.png';
import { getAvatarSrc } from '../../constants/avatars';

/**
 * CrewPlate Component
 * Phiến thẻ gỗ sồi khắc tên thành viên thủy thủ đoàn.
 * - Avatar đục lỗ đồng tâm bên trái.
 * - Tên người chơi và huy hiệu YOU nằm ở giữa với khoảng đệm an toàn pl-[23%].
 * - Vương miện Host hoặc Nút Kick được đặt ở vị trí hành động bên phải (trước viên ngọc trạng thái).
 */
const CrewPlate = ({
  player,
  isMe = false,
  isHostPlayer = false,
  canKick = false,
  onKick,
  isEmpty = false
}) => {
  if (isEmpty) {
    return (
      <div className="relative w-full aspect-[1286/202] opacity-40 select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
        <img
          src={crewPlateWoodPng}
          alt="Empty Slot Frame"
          className="absolute inset-0 w-full h-full object-fill grayscale pointer-events-none"
          aria-hidden="true"
        />
        <div className="absolute inset-0 z-10 flex items-center justify-center pl-[22%] pr-8">
          <span className="font-heading italic text-xs sm:text-sm text-parchment-dim tracking-widest uppercase">
            WAITING FOR CREW...
          </span>
        </div>
      </div>
    );
  }

  const avatarSrc = getAvatarSrc(player.avatar);
  const isOnline = player.connectionStatus !== 'OFFLINE';

  return (
    <div
      className="relative w-full aspect-[1286/202] select-none transition-all duration-200 transform hover:scale-[1.02] filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]"
    >
      {/* ── Background Carved Wood Plate ── */}
      <img
        src={crewPlateWoodPng}
        alt="Crew Plate Frame"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        aria-hidden="true"
      />

      {/* ── 1. Left Porthole Avatar: Exact geometric match with plate's left ring ── */}
      <div className="absolute left-0 top-0 h-full aspect-square z-10 flex items-center justify-center pointer-events-none">
        <img
          src={avatarSrc}
          alt={player.name || player.nickname || 'Avatar'}
          className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
        />
      </div>

      {/* ── 2. Middle Content Area (Player Name + YOU Badge immediately adjacent) ── */}
      <div className="absolute inset-0 z-10 flex items-center justify-between pl-[24%] sm:pl-[22%] md:pl-[20%] pr-[13%] sm:pr-[12%]">
        {/* Left-Aligned Name and YOU Badge */}
        <div className="flex-1 min-w-0 pr-2 flex items-center gap-1.5 sm:gap-2">
          <span
            className={`
              font-display font-bold text-sm sm:text-base md:text-lg lg:text-xl
              truncate tracking-wide drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]
              ${isMe ? 'text-gold' : 'text-parchment-bright'}
            `}
          >
            {player.name || player.nickname}
          </span>

          {/* YOU Badge (Immediately next to the player's name) */}
          {isMe && (
            <span className="font-heading font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-gold/20 border border-gold/40 text-gold-bright uppercase tracking-widest flex-shrink-0">
              YOU
            </span>
          )}
        </div>

        {/* Right Action Slot: Host Royal Crown Badge OR Kick Button */}
        <div className="flex items-center justify-center flex-shrink-0 mr-1">
          {isHostPlayer ? (
            <img
              src={crownGoldBadgePng}
              alt="Captain Host Crown"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain filter drop-shadow-[0_0_8px_rgba(232,166,62,0.85)]"
              title="Room Host (Captain)"
            />
          ) : (
            canKick && (
              <button
                type="button"
                onClick={onKick}
                className="p-1 rounded transition-all duration-150 transform hover:scale-125 hover:rotate-6 active:scale-95 flex-shrink-0"
                title="Walk the Plank (Kick Player)"
              >
                <img
                  src={iconKickSkullPng}
                  alt="Kick"
                  className="w-4 h-4 sm:w-5 sm:h-5 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                />
              </button>
            )
          )}
        </div>
      </div>

      {/* ── 3. Right Status Jewel: Center-aligned on the carved gem socket hole (X: 94.17%, Y: 50%) ── */}
      <div className="absolute right-[5.83%] top-1/2 -translate-y-1/2 translate-x-1/2 z-10 h-[46%] aspect-square flex items-center justify-center pointer-events-none">
        <img
          src={isOnline ? gemEmeraldOnlinePng : gemRubyOfflinePng}
          alt={isOnline ? 'Online' : 'Offline'}
          className={`
            w-full h-full object-contain
            ${isOnline ? 'filter drop-shadow-[0_0_10px_rgba(52,211,153,0.95)]' : 'filter drop-shadow-[0_0_8px_rgba(225,29,72,0.9)]'}
          `}
          title={isOnline ? 'Online' : 'Offline'}
        />
      </div>
    </div>
  );
};

export default CrewPlate;
