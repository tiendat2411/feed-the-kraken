import React, { useState } from 'react';
import woodHeaderBarPng from '../assets/ui/frames/wood_header_bar.png';
import plateRoomCodePng from '../assets/ui/frames/plate_room_code.png';
import parchmentNailedPlatePng from '../assets/ui/frames/parchment_nailed_plate.png';
import inputWoodSlotCleanPng from '../assets/ui/frames/input_wood_slot_clean.png';
import badgeCompassRosePng from '../assets/ui/sprites/badge_compass_rose.png';
import badgeShipVoyagePng from '../assets/ui/sprites/badge_ship_voyage.png';
import iconSoundOnPng from '../assets/ui/sprites/icon_sound_on.png';
import iconSoundOffPng from '../assets/ui/sprites/icon_sound_off.png';
import ButtonWood from './ui/ButtonWood';
import { SoundEngine } from '../utils/soundEffects';

/**
 * GameHeader Component (Task T060 - Eldritch Architecture)
 * In-game top navigation header HUD in 100% English.
 * - Weathered warm oak 14:1 beam fixed sticky top-0.
 * - Ornate carved wood cartouche plate displaying ROOM: [ID].
 * - Nailed parchment sheet displaying current Game Phase in English.
 * - Central voyage frame displaying LONG JOURNEY / QUICK JOURNEY flanked by enlarged medallions.
 * - Antique brass horn sound toggle button and ButtonWood action buttons.
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
  const [muted, setMuted] = useState(SoundEngine.isMuted());

  const handleToggleSound = () => {
    const nextState = SoundEngine.toggleMute();
    setMuted(nextState);
  };

  const getPhaseName = (phase) => {
    switch (phase) {
      case 'ROLE_REVEAL':
      case 'PIRATES_GATHERING':
        return 'SECRET ROLES';
      case 'DAY_1_CREW_SELECTION':
      case 'APPOINT_TEAM':
        return 'CREW APPOINTMENT';
      case 'LOYALTY_CHECK':
        return 'MUTINY VOTE';
      case 'MUTINY_REVEALED':
        return 'MUTINY RESULT';
      case 'MUTINY_TIE_BREAKER':
        return 'TIE BREAKER';
      case 'NAVIGATION':
      case 'NAVIGATION_CAPTAIN_DRAW':
        return 'CAPTAIN DRAW';
      case 'NAVIGATION_LIEUTENANT_DRAW':
        return 'LIEUTENANT DRAW';
      case 'NAVIGATION_NAVIGATOR_DECISION':
        return 'NAVIGATOR DECISION';
      case 'EMERGENCY_NAVIGATOR_SELECTION':
        return 'EMERGENCY APPOINTMENT';
      case 'EXECUTE_ACTIONS':
        return 'EXECUTE ACTIONS';
      default:
        return phase ? phase.replace(/_/g, ' ') : '';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full select-none filter drop-shadow-[0_10px_24px_rgba(0,0,0,0.95)]">
      {/* Background Header Wood Bar (14:1 Proportion, Expanded Height) */}
      <div className="relative w-full aspect-[1680/120] min-h-[76px] sm:min-h-[88px] md:min-h-[96px] flex items-center pl-[5%] sm:pl-[4.5%] pr-[3.5%] sm:pr-[4%]">
        <img
          src={woodHeaderBarPng}
          alt="Game Header Beam"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          aria-hidden="true"
        />

        {/* Content Container */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 sm:gap-4">
          {/* ── 1. Left: Room Code Plaque & Nailed Parchment Phase Plate ── */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Ornate Wood & Bronze Cartouche Plaque for Room Code */}
            <div className="relative h-[55px] sm:h-[66px] md:h-[72px] aspect-[650/335] flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
              <img
                src={plateRoomCodePng}
                alt="Room Code Plaque"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
              />
              <span
                className="relative z-10 font-display font-bold text-xs sm:text-base md:text-lg text-gold tracking-widest text-center px-6 sm:px-8 pb-1 whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                style={{ textShadow: '0 0 10px rgba(201,168,76,0.6)' }}
              >
                ROOM: {room.id}
              </span>
            </div>

            {/* Flat Nailed Parchment Paper for Game Phase */}
            <div className="relative h-[50px] sm:h-[60px] md:h-[66px] aspect-[551/340] hidden sm:flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
              <img
                src={parchmentNailedPlatePng}
                alt="Nailed Parchment Phase Sheet"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              />
              <span className="relative z-10 font-heading font-black text-xs sm:text-sm md:text-base text-[#241708] tracking-wider uppercase px-4 truncate max-w-[160px] md:max-w-[220px] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)] text-center leading-tight">
                {getPhaseName(room.gamePhase)}
              </span>
            </div>
          </div>

          {/* ── 2. Center: Voyage Mode with Flanking Enlarged Compass & Ship Tokens ── */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Left: Glowing Compass Rose */}
            <img
              src={badgeCompassRosePng}
              alt="Compass Rose"
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 object-contain filter drop-shadow-[0_0_12px_rgba(232,166,62,0.9)] flex-shrink-0 transform hover:scale-105 transition"
            />

            {/* Middle: Carved Wood Slot Frame (Text Only) */}
            <div className="relative h-[46px] sm:h-[54px] md:h-[58px] min-w-[180px] sm:min-w-[210px] md:min-w-[230px] aspect-[1058/374] flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
              <img
                src={inputWoodSlotCleanPng}
                alt="Voyage Wood Slot Frame"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              />
              <span className="relative z-10 font-heading font-black text-xs sm:text-sm md:text-base text-[#FFFCEB] tracking-widest uppercase whitespace-nowrap text-center px-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                {room.mapType === 'LONG_JOURNEY' ? 'LONG JOURNEY' : 'QUICK JOURNEY'}
              </span>
            </div>

            {/* Right: Ship Voyage Token */}
            <img
              src={badgeShipVoyagePng}
              alt="Ship Voyage Token"
              className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 object-contain filter drop-shadow-[0_0_10px_rgba(232,166,62,0.8)] flex-shrink-0 transform hover:scale-105 transition"
            />
          </div>

          {/* ── 3. Right: Sound Toggle & Action Buttons ── */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Sound Toggle Antique Brass Horn */}
            <button
              type="button"
              id="btn-sound-toggle-header"
              onClick={handleToggleSound}
              className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full p-1.5 bg-black/40 hover:bg-black/60 border border-gold/40 hover:border-gold transition-all duration-150 transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.85)]"
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
            >
              <img
                src={muted ? iconSoundOffPng : iconSoundOnPng}
                alt={muted ? 'Muted' : 'Sound On'}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              />
            </button>

            {/* Host Dissolve Room Button */}
            {isHost && (
              <ButtonWood
                id="btn-dissolve-room-header"
                variant="primary"
                onClick={onDissolveRoom}
                className="!h-[38px] sm:!h-[44px] md:!h-[48px] !min-w-[105px] sm:!min-w-[125px] md:!min-w-[135px] !px-3 sm:!px-4 !text-xs sm:!text-sm md:!text-base"
              >
                DISSOLVE
              </ButtonWood>
            )}

            {/* Leave Room Button */}
            <ButtonWood
              id="btn-leave-room-header"
              variant="primary"
              onClick={onLeaveRoom}
              className="!h-[38px] sm:!h-[44px] md:!h-[48px] !min-w-[85px] sm:!min-w-[105px] md:!min-w-[115px] !px-3 sm:!px-4 !text-xs sm:!text-sm md:!text-base"
            >
              LEAVE
            </ButtonWood>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
