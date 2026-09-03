import React, { useState, useEffect } from 'react';
import cardTarotBackPng from '../assets/ui/frames/card_tarot_back.png';
import cardTarotFrontPng from '../assets/ui/frames/card_tarot_front.png';
import dossierParchmentPlatePng from '../assets/ui/frames/dossier_parchment_plate.png';
import iconFlintlockPistolPng from '../assets/ui/sprites/icon_flintlock_pistol.png';
import sealSailorAdmiraltyPng from '../assets/ui/sprites/seal_sailor_admiralty.png';
import sealPirateMutineerPng from '../assets/ui/sprites/seal_pirate_mutineer.png';
import sealCultEldritchPng from '../assets/ui/sprites/seal_cult_eldritch.png';
import panelPiratesGatheringPng from '../assets/ui/frames/panel_pirates_gathering.png';
import panelAllEyesClosedPng from '../assets/ui/frames/panel_all_eyes_closed.png';
import portholeRingCleanPng from '../assets/ui/frames/porthole_ring_clean.png';
import emblemPiratePng from '../assets/ui/sprites/emblem_pirate.png';
import emblemSailorPng from '../assets/ui/sprites/emblem_sailor.png';
import emblemCultLeaderPng from '../assets/ui/sprites/emblem_cult_leader.png';
import emblemCultistPng from '../assets/ui/sprites/emblem_cultist.png';
import titleRolePiratePng from '../assets/ui/sprites/title_role_pirate.png';
import titleRoleSailorPng from '../assets/ui/sprites/title_role_sailor.png';
import titleRoleCultLeaderPng from '../assets/ui/sprites/title_role_cult_leader.png';
import titleRoleCultistPng from '../assets/ui/sprites/title_role_cultist.png';
import badgeCompassRosePng from '../assets/ui/sprites/badge_compass_rose.png';
import candlePropCleanPng from '../assets/ui/sprites/candle_prop_clean.png';
import roleRevealFogBgJpg from '../assets/ui/backgrounds/role_reveal_fog_bg.jpg';
import Vignette from './ui/Vignette';
import DustParticles from './ui/DustParticles';
import { SoundEngine } from '../utils/soundEffects';
import { getAvatarSrc } from '../constants/avatars';

const FACTION_DETAILS = {
  SAILOR: {
    name: 'SAILOR',
    titleImg: titleRoleSailorPng,
    emblem: emblemSailorPng,
    sealImg: sealSailorAdmiraltyPng,
    textColor: 'text-sailor',
    borderColor: 'border-sailor/60',
    glowColor: 'shadow-[0_0_25px_rgba(74,122,140,0.45)]',
    tagline: 'Loyal Crew & Defenders of the Vessel',
    orderTitle: 'ADMIRALTY ORDERS',
    goalTitle: 'VICTORY OBJECTIVE',
    goal: 'Steer the ship to Bluewater Bay (Blue Route) OR eliminate all Mutineers & Cultists.',
    armamentCount: '3 PISTOLS',
    armamentUsage: '(MUTINY / DEFENSE)',
    protocolTitle: 'TACTICAL PROTOCOL',
    tips: 'Scrutinize Lieutenant elections; beware of hidden Pirate infiltrators in the crew.'
  },
  PIRATE: {
    name: 'PIRATE',
    titleImg: titleRolePiratePng,
    emblem: emblemPiratePng,
    sealImg: sealPirateMutineerPng,
    textColor: 'text-pirate',
    borderColor: 'border-pirate/60',
    glowColor: 'shadow-[0_0_30px_rgba(168,59,42,0.55)]',
    tagline: 'Buccaneers & Crimson Mutineers',
    orderTitle: "MUTINEER'S CREED",
    goalTitle: 'VICTORY OBJECTIVE',
    goal: 'Hijack the helm and steer directly into Crimson Cove (Red Route) to claim the plunder.',
    armamentCount: '3 PISTOLS',
    armamentUsage: '(MUTINY / HIJACK)',
    protocolTitle: 'TACTICAL PROTOCOL',
    tips: 'Coordinate in secret night gatherings; hoard guns to overthrow the Captain.'
  },
  CULT_LEADER: {
    name: 'CULT LEADER',
    titleImg: titleRoleCultLeaderPng,
    emblem: emblemCultLeaderPng,
    sealImg: sealCultEldritchPng,
    textColor: 'text-firelight',
    borderColor: 'border-gold/60',
    glowColor: 'shadow-[0_0_30px_rgba(232,166,62,0.5)]',
    tagline: 'High Priest & Herald of the Deep',
    orderTitle: 'DEEP CALLING',
    goalTitle: 'VICTORY OBJECTIVE',
    goal: 'Guide vessel to Kraken Sanctuary (Yellow Route) OR get fed to the Kraken by the Captain!',
    armamentCount: '3 PISTOLS',
    armamentUsage: '(CHAOS / BLUFF)',
    protocolTitle: 'NIGHT CONVERSION',
    tips: 'Perform Cult Rituals in darkness to secretly convert crew members into devout Cultists.'
  },
  CULTIST: {
    name: 'CULTIST',
    titleImg: titleRoleCultistPng,
    emblem: emblemCultistPng,
    sealImg: sealCultEldritchPng,
    textColor: 'text-cult-glow',
    borderColor: 'border-cult/60',
    glowColor: 'shadow-[0_0_30px_rgba(155,109,215,0.5)]',
    tagline: 'Devout Follower of the Kraken',
    orderTitle: 'DEVOUT OATH',
    goalTitle: 'VICTORY OBJECTIVE',
    goal: 'Serve your Cult Leader unconditionally; guide ship into the all-devouring Maw of the Kraken.',
    armamentCount: '3 PISTOLS',
    armamentUsage: '(PROTECT MASTER)',
    protocolTitle: 'TACTICAL PROTOCOL',
    tips: 'Shield your Cult Leader at all costs; vote chaotically to disrupt Sailor navigation.'
  }
};

/**
 * RoleReveal Component (Task T062 - Eldritch Architecture)
 * - 3D Flippable Antique Tarot Card (Dark Leather Back + Ancient Parchment Front).
 * - 100% English maritime lore & gothic typography ('Pirata One').
 * - Dynamic Night Gathering: Pirates secret reunion panel vs. Mystic Eyes-Closed Kraken shroud.
 * - Synced countdown timer with ember numerals.
 */
const RoleReveal = ({ room, myRole, currentUserId }) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const faction = FACTION_DETAILS[myRole] || FACTION_DETAILS.SAILOR;
  const isPirate = myRole === 'PIRATE';
  const knownPirates = room?.knownPirates || [];
  const knownCultLeader = room?.knownCultLeader || null;

  // Auto flip card after initial reveal delay (450ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
      SoundEngine.playCardFlip();
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize countdown with server deadline
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

  const handleToggleFlip = () => {
    SoundEngine.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const handleToggleDossier = (e) => {
    e.stopPropagation();
    SoundEngine.playCardFlip();
    setIsDossierOpen((prev) => !prev);
  };

  return (
    <div
      className="relative min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 py-3 sm:py-4 px-2 sm:px-4 bg-abyss text-parchment select-none overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${roleRevealFogBgJpg})` }}
    >
      {/* Background Mood Overlay: Soft dark vignette layer */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none z-0" />
      <Vignette />
      <DustParticles />

      {/* ── 1. Top HUD: Narrative Shroud & Prominent Dawn Countdown (Scaled -20%) ── */}
      <div className="relative z-20 w-full max-w-xl flex flex-col items-center text-center px-3 mb-1">
        {/* Atmosphere / Night Status Description */}
        <p className="font-body text-[11px] sm:text-xs text-parchment-dim leading-relaxed drop-shadow max-w-lg">
          {isPirate
            ? "You and your fellow buccaneers share allegiance to the Crimson Flag."
            : "Darkness shrouds the ship. The Pirates are secretly identifying their comrades in the shadows. Remain silent until dawn breaks!"
          }
        </p>

        {/* Prominent & Highly Visible Dawn Countdown (Clean borderless) */}
        <div className="flex items-center justify-center gap-2 mt-1 py-0.5 px-4 filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)]">
          <span className="font-display text-xs sm:text-sm text-parchment-bright tracking-widest uppercase">
            DAWN WILL BREAK IN
          </span>
          <span
            className={`font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-wider ${
              timeLeft <= 5
                ? 'text-blood animate-pulse scale-110 drop-shadow-[0_0_14px_rgba(235,50,35,0.95)]'
                : 'text-ember drop-shadow-[0_0_12px_rgba(212,98,42,0.9)]'
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* ── 2. Center Stage: 3D Flippable Antique Tarot Role Card (Scaled -20%) ── */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center my-1">
        <div
          id="tarot-card-container"
          onClick={handleToggleFlip}
          className="perspective-1000 cursor-pointer w-full max-w-[200px] sm:max-w-[225px] md:max-w-[245px] aspect-[768/1192] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99] group"
          title="Click to flip Tarot Card"
        >
          {/* Card Inner Wrapper with 3D Transform */}
          <div
            className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-out ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* ── A. Tarot Card Back (Aged Parchment + Engraved Kraken Compass) ── */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]">
              <img
                src={cardTarotBackPng}
                alt="Tarot Card Back"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
              />
            </div>

            {/* ── B. Tarot Card Front (Antique Parchment + Inked Faction Emblem) ── */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]">
              <img
                src={cardTarotFrontPng}
                alt="Tarot Card Front"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
              />

              {/* Card Front Content Overlay (Positioned neatly inside the clear parchment area) */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-between pt-[26%] sm:pt-[27%] pb-[8%] px-[12%]">
                
                {/* 1. Header: Hand-Drawn Gothic Role Title Wordmark (Calibrated below border artwork, equalized font scale) */}
                <div className="flex flex-col items-center text-center w-full max-w-[85%]">
                  <img
                    src={faction.titleImg}
                    alt={faction.name}
                    className={`${
                      myRole === 'CULT_LEADER'
                        ? 'max-h-[17px] sm:max-h-[20px] md:max-h-[22px] max-w-[92%]'
                        : 'max-h-[16px] sm:max-h-[18px] md:max-h-[20px] max-w-[65%] sm:max-w-[68%]'
                    } w-auto object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] pointer-events-none select-none`}
                  />
                  <span className="font-body text-[9px] sm:text-[10px] text-[#5C452D] font-medium italic mt-0.5 max-w-[200px] leading-tight line-clamp-1">
                    {faction.tagline}
                  </span>
                </div>

                {/* 2. Center: Large Hand-Inked Faction Emblem (100% solid, opaque & prominent as in mockup) */}
                <div className="relative my-auto flex items-center justify-center flex-1 py-1">
                  <img
                    src={faction.emblem}
                    alt={faction.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.75)] transform group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
                  />
                </div>

              </div>

              {/* ── 4. Pinned Naval Tactical Dossier (Tucked Vertically Inside Initially, Swings Out On Click) ── */}
              <div
                id="tactical-dossier-pinned"
                onClick={handleToggleDossier}
                className={`absolute top-[4%] sm:top-[5%] left-[75%] sm:left-[77%] w-[220px] sm:w-[250px] md:w-[280px] aspect-[1129/838] z-30 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.92)] origin-[28px_28px] sm:origin-[34px_34px] transition-transform duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] cursor-pointer group/dossier ${
                  isDossierOpen
                    ? 'rotate-[3.5deg] scale-100 hover:rotate-[1deg]'
                    : 'rotate-[86deg] scale-[0.98] hover:rotate-[82deg]'
                }`}
                title={isDossierOpen ? "Click to fold dossier into card" : "Click to unroll secret orders"}
              >
                {/* Background Burned Deckle Parchment Frame */}
                <img
                  src={dossierParchmentPlatePng}
                  alt="Naval Tactical Dossier"
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
                />

                {/* Authority Wax Seal Pinning the Dossier to the Card (Enlarged, circular, firmly stamped inside parchment) */}
                <div
                  className="absolute left-1 top-1 sm:left-2 sm:top-2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 z-40 flex items-center justify-center filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)] pointer-events-none select-none transform transition-transform duration-300 group-hover/dossier:scale-105"
                >
                  <img
                    src={faction.sealImg}
                    alt="Faction Wax Seal"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Dossier Content Inside Parchment */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between pt-[7%] pb-[6%] pl-[10%] pr-[9%] text-left">
                  
                  {/* Row 1: Orders Header & Victory Objective (Pushed right to clear the wax seal completely) */}
                  <div className="pl-[36px] sm:pl-[44px] md:pl-[50px]">
                    <div className="border-b border-[#5C452D]/35 pb-0.5">
                      <span className="font-display font-black text-[9.5px] sm:text-[10.5px] md:text-[11.5px] tracking-wide text-[#2B1B0E] uppercase">
                        {faction.orderTitle}:
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-display text-[8px] sm:text-[8.5px] md:text-[9px] tracking-widest text-[#5C452D] font-bold uppercase">
                        {faction.goalTitle} →
                      </span>
                    </div>
                    <p className="font-body text-[8px] sm:text-[9px] md:text-[9.5px] text-[#1F160D] font-medium leading-snug mt-0.5">
                      {faction.goal}
                    </p>
                  </div>

                  {/* Row 2: Armament Box (Prominent Flintlock Pistol illustration on left, details on right) */}
                  <div className="flex items-center justify-between border border-[#5C452D]/35 bg-[#000000]/5 rounded px-2.5 py-0.5 my-0.5">
                    <div className="flex-1 max-w-[58%] flex items-center justify-center py-0.5">
                      <img
                        src={iconFlintlockPistolPng}
                        alt="Flintlock Pistol"
                        className="h-9 sm:h-10 md:h-12 w-auto max-w-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] transform hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col items-end text-right pl-1.5">
                      <span className="font-display text-[9px] sm:text-[10px] md:text-[10.5px] font-black uppercase tracking-wider text-[#3A2A1A]">
                        ARMAMENT:
                      </span>
                      <span className="font-display text-[9.5px] sm:text-[10.5px] md:text-[11.5px] font-bold text-amber-950 tracking-wide">
                        {faction.armamentCount}
                      </span>
                      <span className="font-body text-[7.5px] sm:text-[8px] md:text-[9px] text-[#5C452D] font-medium italic">
                        {faction.armamentUsage}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Tactical Protocol Guidance */}
                  <div className="flex flex-col pt-0.5">
                    <span className="font-display text-[8.5px] sm:text-[9px] md:text-[10px] font-black tracking-wider text-[#3A2A1A] uppercase">
                      {faction.protocolTitle}:
                    </span>
                    <p className="font-body text-[8px] sm:text-[8.5px] md:text-[9px] text-[#2B1B0E] italic leading-tight mt-0.5">
                      {faction.tips}
                    </p>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 3. Bottom Area: Dynamic Night Gathering 5:1 Panels (Scaled -20%) ── */}
      <div className="relative z-20 w-full max-w-xl mt-1 sm:mt-2 flex flex-col items-center">
        {isPirate ? (
          /* ── A. Pirate Gathering 5:1 Weathered Oak Timber Plank ── */
          <div className="w-full flex flex-col items-center">
            {/* The 5:1 Wooden Plank Container */}
            <div className="relative w-full aspect-[1248/432] max-w-[480px] sm:max-w-[520px] flex items-center justify-center filter drop-shadow-[0_10px_22px_rgba(0,0,0,0.95)]">
              {/* Background Plank Frame */}
              <img
                src={panelPiratesGatheringPng}
                alt="Pirates Gathering Plank"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
              />

              {/* Avatars Row Container - Positioned neatly inside the central oak surface */}
              <div className="relative z-10 w-full h-full flex items-center justify-center gap-2 sm:gap-4 px-6 sm:px-10 pt-[13%] pb-[3%]">
                {knownPirates.map((pirate) => {
                  const isMe = pirate.id === currentUserId;
                  const avatarImg = getAvatarSrc(pirate.avatar);
                  return (
                    <div
                      key={pirate.id}
                      className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:scale-105"
                      title={`${pirate.nickname || pirate.name}${isMe ? ' (YOU)' : ''}`}
                    >
                      {/* Porthole Ring Token with Red Glow for Fellow Pirates */}
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center">
                        {/* Red Aura for Pirates */}
                        <div className="absolute inset-0 rounded-full bg-red-600/35 blur-md animate-pulse" />
                        
                        {/* Crimson Ring Border */}
                        <div className="absolute -inset-0.5 rounded-full border-2 border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.7)] pointer-events-none z-10" />

                        {/* Porthole Ring Asset */}
                        <img
                          src={portholeRingCleanPng}
                          alt="Porthole Ring"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-20 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        />

                        {/* Circular Avatar inside porthole */}
                        <div className="w-[74%] h-[74%] rounded-full overflow-hidden z-0 bg-[#2A1D0E] flex items-center justify-center">
                          <img
                            src={avatarImg}
                            alt={pirate.nickname || pirate.name}
                            className="w-full h-full object-cover filter contrast-105 drop-shadow"
                          />
                        </div>
                      </div>

                      {/* Nickname and YOU tag */}
                      <div className="mt-1 flex items-center justify-center gap-1 max-w-[70px] sm:max-w-[85px]">
                        <span className="font-display text-[9.5px] sm:text-[10.5px] text-parchment-bright truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {pirate.nickname || pirate.name}
                        </span>
                        {isMe && (
                          <span className="font-display text-[8px] bg-pirate text-white px-1 py-0.2 rounded uppercase tracking-wider flex-shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ── B. Non-Pirate (Sailor & Cultist) Eyes Closed Shroud (5:1 Frame) ── */
          <div className="w-full flex flex-col items-center">
            {/* The 5:1 All Eyes Are Closed Frame */}
            <div className="relative w-full aspect-[1198/464] max-w-[480px] sm:max-w-[520px] flex items-center justify-center filter drop-shadow-[0_10px_22px_rgba(0,0,0,0.95)]">
              <img
                src={panelAllEyesClosedPng}
                alt="All Eyes Are Closed Frame"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default RoleReveal;
