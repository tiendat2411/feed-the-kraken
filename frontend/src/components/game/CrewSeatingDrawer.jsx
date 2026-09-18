import React, { useState } from 'react';
import drawerEmptyShellPng from '../../assets/ui/frames/drawer_empty_shell.png';
import drawerRadarBasePng from '../../assets/ui/frames/drawer_radar_base.png';
import cardCrewDossierPng from '../../assets/ui/frames/card_crew_dossier.png';
import badgeCaptainHatPng from '../../assets/ui/sprites/badge_captain_hat.png';
import badgeLtMedalPng from '../../assets/ui/sprites/badge_lieutenant_medal.png';
import badgeNavCompassPng from '../../assets/ui/sprites/badge_navigator_compass.png';
import iconOffdutyWavesPng from '../../assets/ui/sprites/icon_offduty_waves.png';
import iconSilenceTonguePng from '../../assets/ui/sprites/icon_silence_cut_tongue.png';
import gemEmeraldOnlinePng from '../../assets/ui/sprites/gem_emerald_online.png';
import gemRubyOfflinePng from '../../assets/ui/sprites/gem_ruby_offline.png';
import iconFlintlockPistolPng from '../../assets/ui/sprites/icon_flintlock_pistol.png';
import iconKickSkullPng from '../../assets/ui/sprites/icon_kick_skull.png';
import flogNotSailorPng from '../../assets/ui/sprites/flog_not_sailor.png';
import flogNotPiratePng from '../../assets/ui/sprites/flog_not_pirate.png';
import flogNotCultistPng from '../../assets/ui/sprites/flog_not_cultist.png';
import { getAvatarSrc } from '../../constants/avatars';

/**
 * CrewDossierCard Subcomponent (Tab B / Chamber 2)
 * Rendered with exact geometric placement into the 5 mechanical recessed slots
 * of card_crew_dossier.png (4:3 aspect ratio).
 */
const CrewDossierCard = ({
  player,
  isMe,
  isHostPlayer,
  isCaptain,
  isLieutenant,
  isNavigator,
  isKnownCultLeader,
  canKick,
  onKick
}) => {
  const avatarSrc = getAvatarSrc(player.avatar);
  const isOnline = player.connectionStatus !== 'OFFLINE';
  const isEliminated = player.status === 'ELIMINATED';
  const isOffDuty = player.status === 'OFF_DUTY';
  const isSilenced = Boolean(player.speechRestricted);

  // Flogging statement badge
  const floggingStatement = player.floggingStatement;
  let flogBadgeSrc = null;
  let flogText = '';
  if (floggingStatement) {
    const faction = (floggingStatement.falseFaction || floggingStatement.factionType || floggingStatement.text || '').toUpperCase();
    if (faction.includes('SAILOR')) {
      flogBadgeSrc = flogNotSailorPng;
      flogText = 'NOT A SAILOR';
    } else if (faction.includes('PIRATE')) {
      flogBadgeSrc = flogNotPiratePng;
      flogText = 'NOT A PIRATE';
    } else if (faction.includes('CULT')) {
      flogBadgeSrc = flogNotCultistPng;
      flogText = 'NOT A CULTIST';
    }
  }

  return (
    <div
      className={`relative w-full aspect-[1200/896] select-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] transition-all duration-200 transform hover:scale-[1.02] ${
        isEliminated ? 'opacity-50 grayscale' : ''
      }`}
    >
      {/* ── Background: Antique Mechanical Dossier Card ── */}
      <img
        src={cardCrewDossierPng}
        alt="Crew Dossier Frame"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* ── 1. Avatar Porthole Socket (Top-Left: left 10%, top 13%, w 26%) ── */}
      <div className="absolute left-[10.5%] top-[14%] w-[25%] aspect-square z-10 flex items-center justify-center pointer-events-none">
        <div className="relative w-[82%] h-[82%] rounded-full overflow-hidden border border-black/80 shadow-inner bg-[#1A1510]">
          <img
            src={avatarSrc}
            alt={player.nickname || player.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── 1b. Gem Socket (Directly below Avatar: left 18.5%, top 51%, w 9%) ── */}
      <div className="absolute left-[18.5%] top-[51%] w-[9%] aspect-square z-20 flex items-center justify-center pointer-events-none">
        <img
          src={isOnline ? gemEmeraldOnlinePng : gemRubyOfflinePng}
          alt={isOnline ? 'Online' : 'Offline'}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          title={isOnline ? 'Online' : 'Offline'}
        />
      </div>

      {/* ── 2. Nameplate Ribbon (Top-Right: left 43%, top 17%, w 44%, h 17%) ── */}
      <div className="absolute left-[43%] top-[17%] w-[44%] h-[17%] z-10 flex items-center justify-center px-2 text-center pointer-events-none">
        <div className="flex items-center gap-1 max-w-full">
          <span className="font-heading font-black text-[11px] sm:text-xs md:text-sm text-[#1A1208] tracking-wider truncate drop-shadow-sm">
            {player.nickname || player.name}
          </span>
          {isMe && (
            <span className="px-1 py-0.2 rounded bg-emerald-800/90 text-emerald-200 text-[8px] sm:text-[9px] font-heading font-black tracking-widest uppercase">
              YOU
            </span>
          )}
          {isHostPlayer && (
            <span className="px-1 py-0.2 rounded bg-amber-800/90 text-amber-200 text-[8px] sm:text-[9px] font-heading font-black tracking-widest uppercase">
              HOST
            </span>
          )}
        </div>
      </div>

      {/* ── 3a. Officer Duty Slot (Mid-Right Left Tray: left 43.5%, top 44.5%, w 19%, h 14%) ── */}
      <div className="absolute left-[43.5%] top-[44.5%] w-[19%] h-[14%] z-10 flex items-center justify-center pointer-events-none">
        {isCaptain && (
          <img
            src={badgeCaptainHatPng}
            alt="Captain"
            className="h-[80%] object-contain filter drop-shadow-[0_0_6px_rgba(201,168,76,0.9)] animate-pulse"
            title="Captain"
          />
        )}
        {isLieutenant && (
          <img
            src={badgeLtMedalPng}
            alt="Lieutenant"
            className="h-[80%] object-contain filter drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]"
            title="Lieutenant"
          />
        )}
        {isNavigator && (
          <img
            src={badgeNavCompassPng}
            alt="Navigator"
            className="h-[80%] object-contain filter drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]"
            title="Navigator"
          />
        )}
        {isOffDuty && !isCaptain && !isLieutenant && !isNavigator && (
          <img
            src={iconOffdutyWavesPng}
            alt="Off-Duty"
            className="h-[70%] object-contain opacity-75"
            title="Off-Duty"
          />
        )}
        {isSilenced && (
          <img
            src={iconSilenceTonguePng}
            alt="Silenced"
            className="h-[75%] object-contain filter drop-shadow"
            title="Tongue Cut / Silenced"
          />
        )}
        {isKnownCultLeader && (
          <div className="px-1 py-0.5 rounded bg-purple-900 border border-purple-400 text-purple-200 text-[8px] font-heading font-bold shadow">
            CULT
          </div>
        )}
      </div>

      {/* ── 3b. Armory Guns Slot (Mid-Right Right Tray: left 67.5%, top 44.5%, w 19%, h 14%) ── */}
      <div className="absolute left-[67.5%] top-[44.5%] w-[19%] h-[14%] z-10 flex items-center justify-center gap-1 pointer-events-none">
        <img
          src={iconFlintlockPistolPng}
          alt="Guns"
          className="h-[65%] object-contain filter drop-shadow"
        />
        <span className="font-display font-black text-xs sm:text-sm text-[#1A1208] drop-shadow-sm">
          {player.gunCount ?? 3}
        </span>
      </div>

      {/* ── 4. Flogging Record Docket (Bottom Frame: left 9%, top 66%, w 81%, h 25%) ── */}
      <div className="absolute left-[9%] top-[66%] w-[81%] h-[25%] z-10 flex items-center justify-between px-3">
        {/* Left: Flogging Statement or Clear Record */}
        <div className="flex items-center gap-2">
          {flogBadgeSrc ? (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <img
                src={flogBadgeSrc}
                alt={flogText}
                className="h-6 sm:h-8 object-contain filter drop-shadow"
              />
              <span className="font-heading font-black text-[9px] sm:text-[11px] text-red-950 uppercase tracking-wider">
                {flogText}
              </span>
            </div>
          ) : (
            <span className="font-heading italic text-[9px] sm:text-[10px] text-[#554228]/70 tracking-widest uppercase">
              VOYAGE RECORD CLEAN
            </span>
          )}
        </div>

        {/* Right: Kick Action Button for Host */}
        {canKick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onKick();
            }}
            className="group relative p-1 rounded-md bg-red-950/80 hover:bg-red-900 border border-red-500/60 transition-transform active:scale-90 cursor-pointer shadow"
            title={`Kick ${player.nickname || player.name} from room`}
          >
            <img
              src={iconKickSkullPng}
              alt="Kick Player"
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain group-hover:scale-110 transition-transform"
            />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * CrewSeatingDrawer Component (Task T063 - Captain's Tabletop Environment & Under-Drawer)
 * - Authentic 2-Compartment Wooden Drawer (drawer_empty_shell.png) at 1800x1024.
 * - Non-sticky under-desk placement: Tucked directly beneath tabletop bottom edge with peeking front lip and authentic brass handle.
 * - Smooth physical pull-out animation revealing:
 *    * Chamber 1 (Left): Circular Seating Radar dial (drawer_radar_base.png).
 *    * Chamber 2 (Right): Crew Dossier Cards grid (card_crew_dossier.png).
 * - 100% English display language and Eldritch Parchment typography.
 * - Zero Unicode emojis (100% custom graphic assets).
 */
const CrewSeatingDrawer = ({
  room,
  currentUserId,
  onKickPlayer
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!room) return null;

  const players = room.players || [];
  const myId = room.myId || currentUserId;
  const isHost = room.hostId === myId;

  // Circular seating order calculation
  const myIndex = players.findIndex(p => p.id === myId || p.sessionToken === currentUserId);
  const effectiveMyIndex = myIndex >= 0 ? myIndex : 0;
  const captainIndex = players.findIndex(p => p.id === room.captainId);
  const nextCaptainIndex = captainIndex >= 0 && players.length > 1 ? (captainIndex + 1) % players.length : -1;

  return (
    <section className="w-[70%] sm:w-[62%] md:w-[55%] max-w-[880px] mx-auto -mt-2 sm:-mt-3 mb-8 flex flex-col items-center select-none relative z-30">
      {/* ── Outer Drawer Shell Container (70-80% of Tabletop Width) ── */}
      <div
        className={`relative w-full mx-auto overflow-hidden transition-all duration-700 ease-out filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] ${
          isOpen
            ? 'aspect-[1800/1024] max-h-[510px] min-h-[380px]'
            : 'h-[52px] sm:h-[64px] md:h-[74px] cursor-pointer group hover:brightness-110'
        }`}
        onClick={!isOpen ? () => setIsOpen(true) : undefined}
        title={!isOpen ? "Click to pull out Captain's Under-Drawer" : undefined}
      >
        {/* Full-sized Drawer Body anchored to bottom so only the front lip & handle peek out when collapsed */}
        <div className="absolute inset-x-0 bottom-0 w-full aspect-[1800/1024] flex flex-col items-center justify-between">
          {/* Authentic 2-Compartment Wooden Drawer Shell Asset */}
          <img
            src={drawerEmptyShellPng}
            alt="Captain's Under-Drawer Shell"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
            aria-hidden="true"
          />

          {/* ── Hover Shimmer on Peeking Lip when Closed ── */}
          {!isOpen && (
            <div className="absolute inset-x-0 bottom-2 flex items-center justify-center pointer-events-none z-20">
              <span className="font-display font-black text-[9px] sm:text-[11px] text-gold tracking-widest uppercase filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#120E0A]/90 px-3 py-0.5 rounded-full border border-gold/40">
                ▲ CLICK TO PULL DRAWER OUT
              </span>
            </div>
          )}

          {/* ── Expanded Drawer Interior (Chambers 1 & 2) ── */}
          <div
            className={`relative z-10 w-full h-full flex flex-col justify-between transition-opacity duration-500 ${
              isOpen ? 'opacity-100 pointer-events-auto delay-200' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Top Chamber Header Bar */}
            <div className="relative z-20 w-[92%] mx-auto mt-3 sm:mt-5 flex items-center justify-between px-3 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xs sm:text-sm text-gold tracking-widest uppercase">
                  SEATING RADAR
                </span>
                <span className="hidden md:inline-block font-heading text-[11px] text-amber-400/70 italic tracking-wider">
                  (Clockwise Turn Order)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xs sm:text-sm text-gold tracking-widest uppercase">
                  CREW DOSSIERS
                </span>
                <span className="font-heading text-[11px] text-amber-400/70 italic tracking-wider">
                  ({players.length} Registered)
                </span>
              </div>
            </div>

            {/* Dual Chambers Body */}
            <div className="relative z-10 w-[94%] h-[78%] mx-auto flex items-stretch">
              {/* ── CHAMBER 1 (LEFT): SEATING RADAR ── */}
              <div className="w-1/2 h-full flex items-center justify-center p-2 sm:p-4">
                <div className="relative w-[85%] max-w-[440px] max-h-full aspect-square flex items-center justify-center translate-x-[5%]">
                  {/* Antique Astrolabe Radar Dial Asset */}
                  <img
                    src={drawerRadarBasePng}
                    alt="Seating Radar Compass Dial"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
                    aria-hidden="true"
                  />

                  {/* 5-11 Dynamic Player Seats Clockwise Around the Center */}
                  {players.map((p, idx) => {
                    const N = players.length;
                    const angle = (2 * Math.PI / N) * (idx - effectiveMyIndex) + (Math.PI / 2);
                    const radiusPercent = 30.0;
                    const centerX = 50.0;
                    const centerY = 50.0;
                    const x = centerX + radiusPercent * Math.cos(angle);
                    const y = centerY + radiusPercent * Math.sin(angle);

                    const isMe = p.id === myId || p.sessionToken === currentUserId;
                    const isCaptain = p.id === room.captainId;
                    const isNextCaptainIfDrunk = idx === nextCaptainIndex;
                    const isLt = p.id === (room.lieutenantId || room.nominatedLieutenantId);
                    const isNav = p.id === (room.navigatorId || room.nominatedNavigatorId);
                    const isOnline = p.connectionStatus !== 'OFFLINE';
                    const avatarSrc = getAvatarSrc(p.avatar);

                    return (
                      <div
                        key={p.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group pointer-events-auto flex items-center justify-center"
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        {/* Floating Captain Hat Sprite — positioned absolutely above */}
                        {isCaptain && (
                          <div className="absolute -top-3.5 sm:-top-5 inset-x-0 flex justify-center pointer-events-none z-30">
                            <img
                              src={badgeCaptainHatPng}
                              alt="Captain"
                              className="w-6 h-4 sm:w-7 sm:h-4.5 object-contain filter drop-shadow-[0_0_8px_rgba(232,166,62,0.95)] animate-bounce"
                              title="Captain"
                            />
                          </div>
                        )}

                        {/* Next Captain if Drunk Tag — positioned absolutely above */}
                        {isNextCaptainIfDrunk && !isCaptain && (
                          <div className="absolute -top-3 sm:-top-4 inset-x-0 flex justify-center pointer-events-none z-30">
                            <div className="px-1 py-0.2 rounded bg-amber-500/40 border border-gold text-gold text-[7px] sm:text-[8px] font-heading font-black whitespace-nowrap animate-pulse shadow">
                              NEXT
                            </div>
                          </div>
                        )}

                        {/* Seat Avatar Porthole: In-flow circular element that acts as the geometric anchor */}
                        <div
                          className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full p-0.5 bg-[#1A1510] border-2 transition-all duration-200 transform group-hover:scale-110 filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)] ${
                            isMe
                              ? 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.85)]'
                              : isCaptain
                              ? 'border-gold shadow-[0_0_10px_rgba(201,168,76,0.8)]'
                              : isNextCaptainIfDrunk
                              ? 'border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                              : 'border-gold/40 hover:border-gold'
                          }`}
                        >
                          <img
                            src={avatarSrc}
                            alt={p.nickname || p.name}
                            className="w-full h-full object-cover rounded-full pointer-events-none"
                          />

                          {/* Connection Status Gem */}
                          <img
                            src={isOnline ? gemEmeraldOnlinePng : gemRubyOfflinePng}
                            alt={isOnline ? 'Online' : 'Offline'}
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain filter drop-shadow"
                            title={isOnline ? 'Online' : 'Offline'}
                          />

                          {/* Lieutenant / Navigator Badges */}
                          {isLt && (
                            <img
                              src={badgeLtMedalPng}
                              alt="Lieutenant"
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain filter drop-shadow"
                              title="Lieutenant"
                            />
                          )}
                          {isNav && (
                            <img
                              src={badgeNavCompassPng}
                              alt="Navigator"
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain filter drop-shadow"
                              title="Navigator"
                            />
                          )}
                        </div>

                        {/* Seat Nickname & Pistols — positioned absolutely below */}
                        <div className="absolute top-full mt-0.5 inset-x-0 -mx-6 flex flex-col items-center pointer-events-none text-center whitespace-nowrap z-20">
                          <span
                            className={`font-heading font-black text-[9px] sm:text-[10px] tracking-tight truncate max-w-[65px] sm:max-w-[80px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${
                              isMe ? 'text-emerald-300' : 'text-parchment-bright'
                            }`}
                          >
                            {p.nickname || p.name}
                          </span>
                          <span className="font-heading font-bold text-[8px] sm:text-[9px] text-gold-dim flex items-center gap-0.5 drop-shadow">
                            <img
                              src={iconFlintlockPistolPng}
                              alt="Guns"
                              className="w-2.5 h-2.5 object-contain"
                            />
                            <span>{p.gunCount ?? 3}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── CHAMBER 2 (RIGHT): CREW DOSSIER ROSTER ── */}
              <div className="w-1/2 h-full flex flex-col p-2 sm:p-3 overflow-y-auto">
                <div className="flex flex-col items-center gap-2.5 w-full pr-1">
                  {players.map((player) => {
                    const isMe = player.id === myId || player.sessionToken === currentUserId;
                    const isHostPlayer = player.id === room.hostId;
                    const isCap = player.id === room.captainId;
                    const isLt = player.id === (room.lieutenantId || room.nominatedLieutenantId);
                    const isNav = player.id === (room.navigatorId || room.nominatedNavigatorId);

                    return (
                      <div key={player.id} className="w-[82%] max-w-[340px]">
                        <CrewDossierCard
                          player={player}
                          isMe={isMe}
                          isHostPlayer={isHostPlayer}
                          isCaptain={isCap}
                          isLieutenant={isLt}
                          isNavigator={isNav}
                          isKnownCultLeader={room?.knownCultLeader?.id === player.id && !isMe}
                          canKick={isHost && !isMe}
                          onKick={() => onKickPlayer(player.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Push Drawer Back In Action (Mounted just above the brass handle) ── */}
            <div className="relative z-20 mt-auto mb-3 sm:mb-4 flex items-center justify-center">
              <button
                type="button"
                id="btn-close-drawer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="px-4 py-1 rounded-full bg-[#120E0A]/95 hover:bg-[#1E1711] border border-gold/60 text-gold hover:text-parchment-bright font-display text-xs tracking-widest uppercase transition-all shadow-[0_4px_12px_rgba(0,0,0,0.9)] flex items-center gap-1.5 cursor-pointer"
                title="Push drawer back into under-desk cavity"
              >
                <span>▲</span> PUSH DRAWER BACK IN
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrewSeatingDrawer;
