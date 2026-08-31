import React from 'react';
import crewPlateWoodPng from '../../assets/ui/frames/crew_plate_wood.png';
import badgeCaptainHatPng from '../../assets/ui/sprites/badge_captain_hat.png';
import badgeLtMedalPng from '../../assets/ui/sprites/badge_lieutenant_medal.png';
import badgeNavCompassPng from '../../assets/ui/sprites/badge_navigator_compass.png';
import iconSilenceTonguePng from '../../assets/ui/sprites/icon_silence_cut_tongue.png';
import iconOffdutyWavesPng from '../../assets/ui/sprites/icon_offduty_waves.png';
import flogNotSailorPng from '../../assets/ui/sprites/flog_not_sailor.png';
import flogNotPiratePng from '../../assets/ui/sprites/flog_not_pirate.png';
import flogNotCultistPng from '../../assets/ui/sprites/flog_not_cultist.png';
import gemEmeraldOnlinePng from '../../assets/ui/sprites/gem_emerald_online.png';
import gemRubyOfflinePng from '../../assets/ui/sprites/gem_ruby_offline.png';
import iconKickSkullPng from '../../assets/ui/sprites/icon_kick_skull.png';
import { getAvatarSrc } from '../../constants/avatars';

/**
 * CrewPlate Component
 * Phiến thẻ gỗ sồi khắc tên thành viên thủy thủ đoàn.
 * - Avatar đục lỗ đồng tâm bên trái.
 * - Tên người chơi, huy hiệu YOU, số súng bên trái.
 * - Vết chém Tra khảo Flogging được căn chính giữa phiến gỗ sồi.
 * - Các biểu tượng chức vụ và trạng thái (Captain, Lt, Nav, Off-Duty, Silence) ở bên phải (+30% kích thước).
 * - Ngọc trạng thái kết nối ở hốc ngọc bên phải.
 */
const CrewPlate = ({
  player,
  isMe = false,
  isHostPlayer = false,
  isCaptain = false,
  isLieutenant = false,
  isNavigator = false,
  isKnownCultLeader = false,
  canKick = false,
  onKick,
  isEmpty = false,
  showGameStatus = false
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
  const isEliminated = player.status === 'ELIMINATED';
  const isOffDuty = player.status === 'OFF_DUTY';
  const isSilenced = Boolean(player.speechRestricted);

  // Flogging Whiplash Statement Sprite
  const floggingStatement = player.floggingStatement;
  let flogBadgeSrc = null;
  if (floggingStatement) {
    const faction = (floggingStatement.falseFaction || floggingStatement.factionType || floggingStatement.text || '').toUpperCase();
    if (faction.includes('SAILOR')) {
      flogBadgeSrc = flogNotSailorPng;
    } else if (faction.includes('PIRATE')) {
      flogBadgeSrc = flogNotPiratePng;
    } else if (faction.includes('CULT')) {
      flogBadgeSrc = flogNotCultistPng;
    }
  }

  return (
    <div
      className={`relative w-full aspect-[1286/202] select-none transition-all duration-200 transform hover:scale-[1.02] filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)] ${
        isEliminated ? 'opacity-50 grayscale' : ''
      }`}
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

      {/* ── 2. Left Content Area: Player Name + YOU + Cult Leader + Guns ── */}
      <div className="absolute inset-y-0 left-0 right-[15%] z-10 flex items-center justify-between pl-[19%] sm:pl-[18%] md:pl-[17%]">
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[45%] overflow-hidden">
          <span
            className={`
              font-display font-bold text-sm sm:text-base md:text-lg lg:text-xl
              truncate tracking-wide drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]
              ${isMe ? 'text-gold' : 'text-parchment-bright'}
            `}
          >
            {player.name || player.nickname}
          </span>

          {/* YOU Badge */}
          {isMe && (
            <span className="font-heading font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-gold/20 border border-gold/40 text-gold-bright uppercase tracking-widest flex-shrink-0">
              YOU
            </span>
          )}

          {/* Secret Cult Leader Badge (For Cultists) */}
          {isKnownCultLeader && (
            <span
              className="font-heading font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-purple-950/90 border border-purple-400 text-purple-200 uppercase tracking-widest flex-shrink-0 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]"
              title="Your Secret Cult Leader"
            >
              👁️ LEADER
            </span>
          )}

          {/* In-Game Guns Counter */}
          {showGameStatus && player.gunCount !== undefined && (
            <span
              className="font-heading font-bold text-[9px] sm:text-[11px] text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-gold/30 flex items-center gap-1 flex-shrink-0 shadow-inner"
              title={`${player.gunCount} Guns remaining`}
            >
              <span>🔫</span>
              <span>{player.gunCount}</span>
            </span>
          )}
        </div>

        {/* ── 3. Right Status Icons Area (+30% Larger Size) + Kick Button ── */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 mr-2 sm:mr-3">
          {/* Officer Badges (+30% Enriched Size) */}
          {isCaptain && (
            <img
              src={badgeCaptainHatPng}
              alt="Captain"
              className="w-9 h-6 sm:w-11 sm:h-7 md:w-12 md:h-8 object-contain filter drop-shadow-[0_0_8px_rgba(232,166,62,0.95)] transform hover:scale-110 transition-transform"
              title="Captain"
            />
          )}
          {isLieutenant && (
            <img
              src={badgeLtMedalPng}
              alt="Lieutenant"
              className="w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9.5 md:h-9.5 object-contain filter drop-shadow-[0_0_8px_rgba(56,189,248,0.95)] transform hover:scale-110 transition-transform"
              title="Lieutenant"
            />
          )}
          {isNavigator && (
            <img
              src={badgeNavCompassPng}
              alt="Navigator"
              className="w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9.5 md:h-9.5 object-contain filter drop-shadow-[0_0_8px_rgba(52,211,153,0.95)] transform hover:scale-110 transition-transform"
              title="Navigator"
            />
          )}

          {/* Off-Duty Status Icon (+30% Larger) */}
          {isOffDuty && (
            <img
              src={iconOffdutyWavesPng}
              alt="Off-Duty"
              className="w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9.5 md:h-9.5 object-contain filter drop-shadow-[0_0_8px_rgba(251,191,36,0.95)] animate-pulse"
              title="Off-Duty (In Waves / Resting)"
            />
          )}

          {/* Silenced (Cut Tongue) Status Icon (+30% Larger) */}
          {isSilenced && (
            <img
              src={iconSilenceTonguePng}
              alt="Silenced"
              className="w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9.5 md:h-9.5 object-contain filter drop-shadow-[0_0_8px_rgba(244,63,94,0.95)]"
              title="Speech Restricted (Cut Tongue)"
            />
          )}

          {/* Eliminated Badge */}
          {isEliminated && (
            <span className="font-heading font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-red-950/90 border border-red-500 text-red-300 uppercase tracking-wider shadow-md">
              ☠️ LOST
            </span>
          )}

          {/* Kick Button (For Host in Lobby) */}
          {canKick && (
            <button
              type="button"
              onClick={onKick}
              className="p-1 rounded transition-all duration-150 transform hover:scale-125 hover:rotate-6 active:scale-95 flex-shrink-0 cursor-pointer"
              title="Walk the Plank (Kick Player)"
            >
              <img
                src={iconKickSkullPng}
                alt="Kick"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              />
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Center-Aligned Flogging Whiplash Statement Banner (Carved in the middle of oak plank) ── */}
      {flogBadgeSrc && (
        <div
          className="absolute left-[54%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-[65%] max-h-[34px] sm:max-h-[42px] md:max-h-[48px] aspect-[1200/400] flex items-center justify-center pointer-events-none filter drop-shadow-[0_0_12px_rgba(225,29,72,0.95)] animate-pulse"
          title={`Public Flogging Statement: ${player.floggingStatement?.text || 'Interrogated'}`}
        >
          <img
            src={flogBadgeSrc}
            alt={player.floggingStatement?.text || 'Flogged'}
            className="h-full w-auto object-contain pointer-events-none"
          />
        </div>
      )}

      {/* ── 5. Right Status Jewel: Center-aligned on the carved gem socket hole (X: 94.17%, Y: 50%) ── */}
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
