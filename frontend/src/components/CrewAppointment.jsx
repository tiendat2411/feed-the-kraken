import React, { useState } from 'react';
import trayCaptainCommandPng from '../assets/ui/frames/tray_captain_command.png';
import daisOfficersCradlePng from '../assets/ui/frames/dais_officers_cradle.png';
import tabletCrewPlankPng from '../assets/ui/frames/tablet_crew_plank.png';
import tokenAdmiraltyKeyPng from '../assets/ui/sprites/token_admiralty_key.png';
import tokenBrassHelmPng from '../assets/ui/sprites/token_brass_helm.png';
import btnRatifyCommandPng from '../assets/ui/buttons/btn_ratify_command.png';
import btnPegLtPng from '../assets/ui/buttons/btn_peg_lt.png';
import btnPegNavPng from '../assets/ui/buttons/btn_peg_nav.png';
import btnPegCaptainPng from '../assets/ui/buttons/btn_peg_captain.png';
import stigmaIronChainPng from '../assets/ui/sprites/stigma_iron_chain.png';
import gemEmeraldOnlinePng from '../assets/ui/sprites/gem_emerald_online.png';
import gemRubyOfflinePng from '../assets/ui/sprites/gem_ruby_offline.png';
import iconFlintlockPistolPng from '../assets/ui/sprites/icon_flintlock_pistol.png';
import iconSilenceTonguePng from '../assets/ui/sprites/icon_silence_cut_tongue.png';
import { getAvatarSrc } from '../constants/avatars';
import { SoundEngine } from '../utils/soundEffects';

/**
 * CrewAppointment Component (Task T064)
 * "Eldritch Parchment" Tactile Command Tray & Nautical Tablets.
 * 1:1 In-Frame Fit matching the Golden Benchmark Test Composite.
 * Allows the incumbent Captain to appoint 1 Lieutenant and 1 Navigator.
 */
const CrewAppointment = ({
  room = {},
  currentUserId,
  myRole,
  onAppointTeam
}) => {
  const players = room.players || [];
  const myId = room.myId || currentUserId;
  const me = players.find(p => p.id === myId || p.sessionToken === currentUserId) || {};
  const isCaptain = room.captainId === me.id;

  // Initial selected state from room nominations if existing
  const initialLt = room.nominatedLieutenantId || room.lieutenantId || null;
  const initialNav = room.nominatedNavigatorId || room.navigatorId || null;

  const [selectedLt, setSelectedLt] = useState(initialLt);
  const [selectedNav, setSelectedNav] = useState(initialNav);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Officers references
  const captainPlayer = players.find(p => p.id === room.captainId) || {};
  const appointedLtPlayer = players.find(p => p.id === selectedLt);
  const appointedNavPlayer = players.find(p => p.id === selectedNav);

  // Candidate crew list (everyone except the Captain)
  const crewCandidates = players.filter(p => p.id !== room.captainId);

  // Toggle Lieutenant assignment for a player
  const handleToggleLt = (targetPlayerId) => {
    if (!isCaptain) return;
    SoundEngine.playCardFlip();

    if (selectedLt === targetPlayerId) {
      setSelectedLt(null);
    } else {
      setSelectedLt(targetPlayerId);
      // Invariant: Player cannot be both LT and NAV simultaneously
      if (selectedNav === targetPlayerId) {
        setSelectedNav(null);
      }
    }
  };

  // Toggle Navigator assignment for a player
  const handleToggleNav = (targetPlayerId) => {
    if (!isCaptain) return;
    SoundEngine.playCardFlip();

    if (selectedNav === targetPlayerId) {
      setSelectedNav(null);
    } else {
      setSelectedNav(targetPlayerId);
      // Invariant: Player cannot be both LT and NAV simultaneously
      if (selectedLt === targetPlayerId) {
        setSelectedLt(null);
      }
    }
  };

  // Submit appointment ratification
  const handleRatifySubmit = () => {
    if (!isCaptain || !selectedLt || !selectedNav || isSubmitting) return;
    setIsSubmitting(true);
    SoundEngine.playBell();
    if (typeof onAppointTeam === 'function') {
      onAppointTeam(selectedLt, selectedNav);
    }
  };

  const isRatifyReady = Boolean(selectedLt && selectedNav);

  // Split candidate crew into Top-Left Wing, Top-Right Wing, and Bottom Deck
  // Dynamically handles up to 10 candidates (full 11-player lobby: 1 captain + 10 crew)
  const getCandidateLayout = (candidates) => {
    const total = candidates.length;
    if (total <= 6) {
      return {
        topLeft: [],
        topRight: [],
        bottom: candidates
      };
    }
    const overflow = total - 6; // 1 to 4
    const leftCount = Math.ceil(overflow / 2); // 1 to 2
    const rightCount = Math.floor(overflow / 2); // 0 to 2
    return {
      topLeft: candidates.slice(0, leftCount),
      topRight: candidates.slice(leftCount, leftCount + rightCount),
      bottom: candidates.slice(leftCount + rightCount)
    };
  };

  const layout = getCandidateLayout(crewCandidates);
  const isFlanked = layout.topLeft.length > 0;

  // Reusable crew tablet plank renderer
  const renderCrewTablet = (candidate) => {
    const isCandidateMe = candidate.id === me.id;
    const isOffDuty = candidate.status === 'OFF_DUTY';
    const isEliminated = candidate.status === 'ELIMINATED';
    const isOnline = candidate.connectionStatus !== 'OFFLINE';
    const isSilenced = Boolean(candidate.speechRestricted);

    const isLtCandidate = selectedLt === candidate.id;
    const isNavCandidate = selectedNav === candidate.id;
    const isDisabled = !isCaptain || isOffDuty || isEliminated;

    // Organic contour aura (soft radiant glow hugging the wooden silhouette like the scroll asset)
    let cardFilter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.75))';
    if (isLtCandidate) {
      cardFilter = 'drop-shadow(0 0 16px rgba(99, 102, 241, 0.85)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.7))';
    } else if (isNavCandidate) {
      cardFilter = 'drop-shadow(0 0 16px rgba(52, 211, 153, 0.85)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.7))';
    } else if (isCandidateMe) {
      cardFilter = 'drop-shadow(0 0 14px rgba(234, 179, 8, 0.8)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.7))';
    }

    return (
      <div
        key={candidate.id}
        style={{ filter: cardFilter }}
        className={`relative h-full aspect-[804/1100] flex-shrink-0 transition-transform duration-200 ${
          isDisabled ? 'cursor-default' : 'hover:scale-[1.03] cursor-pointer'
        }`}
      >
        {/* Tablet Plank Wooden Frame - Crisp clean background */}
        <img
          src={tabletCrewPlankPng}
          alt="Crew Plank"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          aria-hidden="true"
        />

        {/* 1. Top Porthole Window: Avatar & Indicators */}
        <div className="absolute top-[8%] left-[50%] -translate-x-1/2 w-[52%] aspect-square z-10 flex items-center justify-center">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-black/70 border border-gold/40 shadow-inner">
            <img
              src={getAvatarSrc(candidate.avatar)}
              alt={candidate.nickname || candidate.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Online / Offline Gem Indicator */}
          <div className="absolute top-0 right-0 w-[22%] aspect-square z-20">
            <img
              src={isOnline ? gemEmeraldOnlinePng : gemRubyOfflinePng}
              alt={isOnline ? 'Online' : 'Offline'}
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>

          {/* Speech Restricted (Tongue Cut) Indicator */}
          {isSilenced && (
            <div className="absolute bottom-0 left-0 w-[24%] aspect-square z-20" title="Silenced (Cut Tongue)">
              <img
                src={iconSilenceTonguePng}
                alt="Silenced"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
          )}
        </div>

        {/* 2. Middle Carved Nameplate - Centered vertically & horizontally, no guns text, no YOU text */}
        <div className="absolute top-[49.5%] left-[14%] right-[14%] h-[12.5%] z-10 flex items-center justify-center overflow-hidden px-1 pointer-events-none">
          <span
            className={`font-heading font-black text-[clamp(8px,0.9vw,11px)] truncate tracking-wide text-shadow-sm leading-none ${
              isCandidateMe ? 'text-yellow-200' : 'text-parchment-bright'
            }`}
            title={candidate.nickname || candidate.name}
          >
            {candidate.nickname || candidate.name}
          </span>
        </div>

        {/* 3. Lower Sockets: Circular Officer Pegs (Positioned precisely over inner core of brass sockets) */}
        {!isOffDuty && !isEliminated && (
          <>
            {/* Left Peg Socket: Lieutenant (Centered right under carved brass rim at cx: 29.85%, cy: 79.82%) */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none"
              style={{
                left: '29.85%',
                top: '79.82%',
                width: '25.37%',
                aspectRatio: '1 / 1'
              }}
            >
              {isLtCandidate ? (
                /* Plugged LT Peg Coin */
                <button
                  type="button"
                  onClick={() => handleToggleLt(candidate.id)}
                  disabled={!isCaptain}
                  className={`w-full h-full p-0 bg-transparent border-0 flex items-center justify-center pointer-events-auto transition-transform transform active:scale-90 ${
                    isCaptain ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                  }`}
                  title="Selected as Lieutenant. Click to remove."
                >
                  <img
                    src={btnPegLtPng}
                    alt="LT Peg"
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-scaleIn select-none"
                  />
                </button>
              ) : (
                /* Empty Socket Button */
                <button
                  type="button"
                  onClick={() => handleToggleLt(candidate.id)}
                  disabled={!isCaptain}
                  className={`w-full h-full rounded-full flex items-center justify-center pointer-events-auto transition-all ${
                    isCaptain
                      ? 'cursor-pointer hover:bg-indigo-500/20 active:scale-95 group'
                      : 'cursor-default'
                  }`}
                  title={isCaptain ? 'Appoint as Lieutenant' : 'Lieutenant Socket'}
                >
                  <span className="font-display font-black text-[clamp(8px,0.92vw,12px)] text-[#A68942] opacity-80 group-hover:opacity-100 group-hover:text-indigo-300 transition-colors leading-none tracking-normal select-none flex items-center justify-center">
                    LT
                  </span>
                </button>
              )}
            </div>

            {/* Right Peg Socket: Navigator (Centered right under carved brass rim at cx: 69.65%, cy: 79.82%) */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none"
              style={{
                left: '69.65%',
                top: '79.82%',
                width: '25.37%',
                aspectRatio: '1 / 1'
              }}
            >
              {isNavCandidate ? (
                /* Plugged NAV Peg Coin */
                <button
                  type="button"
                  onClick={() => handleToggleNav(candidate.id)}
                  disabled={!isCaptain}
                  className={`w-full h-full p-0 bg-transparent border-0 flex items-center justify-center pointer-events-auto transition-transform transform active:scale-90 ${
                    isCaptain ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                  }`}
                  title="Selected as Navigator. Click to remove."
                >
                  <img
                    src={btnPegNavPng}
                    alt="NAV Peg"
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-scaleIn select-none"
                  />
                </button>
              ) : (
                /* Empty Socket Button */
                <button
                  type="button"
                  onClick={() => handleToggleNav(candidate.id)}
                  disabled={!isCaptain}
                  className={`w-full h-full rounded-full flex items-center justify-center pointer-events-auto transition-all ${
                    isCaptain
                      ? 'cursor-pointer hover:bg-emerald-500/20 active:scale-95 group'
                      : 'cursor-default'
                  }`}
                  title={isCaptain ? 'Appoint as Navigator' : 'Navigator Socket'}
                >
                  <span className="font-display font-black text-[clamp(7.5px,0.88vw,11.5px)] text-[#A68942] opacity-80 group-hover:opacity-100 group-hover:text-emerald-300 transition-colors leading-none tracking-tight select-none flex items-center justify-center">
                    NAV
                  </span>
                </button>
              )}
            </div>
          </>
        )}

        {/* 4. Off-Duty Stigma Iron Chains Overlay */}
        {isOffDuty && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
            <img
              src={stigmaIronChainPng}
              alt="Off-Duty Chains"
              className="w-full h-full object-fill filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.95)]"
            />
          </div>
        )}

        {/* 5. Eliminated Overlay */}
        {isEliminated && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-black/75 rounded flex flex-col items-center justify-center p-1 text-center">
            <span className="text-sm">☠️</span>
            <span className="font-display font-black text-[7px] text-red-500 uppercase tracking-widest">
              ELIMINATED
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-transparent">
      {/* ── Background Layer: Command Tray Canvas (Fits 1:1 into In-Desk Brass Opening) ── */}
      <img
        src={trayCaptainCommandPng}
        alt="Captain's Command Tray"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        aria-hidden="true"
      />

      {/* ── Section A1: Top-Left Wing Tablets (Strictly inside Green Leather area) ── */}
      {layout.topLeft.length > 0 && (
        <div
          className="absolute z-10 flex items-center justify-center gap-2 sm:gap-3"
          style={{
            top: '13.7%',
            left: '7.0%',
            width: '20.5%',
            height: '27.8%'
          }}
        >
          {layout.topLeft.map(renderCrewTablet)}
        </div>
      )}

      {/* ── Section A2: Top Officers Dais (Moved up right to top rim to maximize central area) ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
        style={{
          top: '0.8%',
          width: '44%',
          aspectRatio: '1172 / 419'
        }}
      >
        {/* Dais Frame Texture */}
        <img
          src={daisOfficersCradlePng}
          alt="Officers Cradle Dais"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          aria-hidden="true"
        />

        {/* Cradle 1 (Left): Incumbent Captain Avatar - Perfectly centered & covers circular recessed well */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
          style={{
            left: '18.94%',
            top: '49.16%',
            width: '17.9%',
            aspectRatio: '1 / 1'
          }}
        >
          <img
            src={getAvatarSrc(captainPlayer.avatar)}
            alt={captainPlayer.nickname || 'Captain'}
            style={{ filter: 'drop-shadow(0 0 12px rgba(234, 179, 8, 0.85))' }}
            className="w-full h-full object-contain rounded-full pointer-events-none select-none z-10"
          />
          {/* Captain Peg Stamp Pin (z-20, outside overflow, completely unclipped) */}
          <div className="absolute -bottom-1 -right-1 w-[38%] aspect-square flex items-center justify-center z-20 pointer-events-none">
            <img
              src={btnPegCaptainPng}
              alt="Captain Peg"
              className="w-full h-full object-contain filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
            />
          </div>
        </div>

        {/* Cradle 2 (Center): Lieutenant Cradle - Centered in Royal Navy Velvet */}
        {appointedLtPlayer ? (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 animate-fadeIn"
            style={{
              left: '50.0%',
              top: '49.16%',
              width: '17.9%',
              aspectRatio: '1 / 1'
            }}
          >
            <img
              src={getAvatarSrc(appointedLtPlayer.avatar)}
              alt={appointedLtPlayer.nickname || 'Lieutenant'}
              style={{ filter: 'drop-shadow(0 0 14px rgba(99, 102, 241, 0.9))' }}
              className="w-full h-full object-contain rounded-full pointer-events-none select-none z-10"
            />
            {/* LT Peg Stamp Pin (z-20, outside overflow, completely unclipped) */}
            <div className="absolute -bottom-1 -right-1 w-[38%] aspect-square flex items-center justify-center z-20 pointer-events-none">
              <img
                src={btnPegLtPng}
                alt="LT Peg"
                className="w-full h-full object-contain filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
              />
            </div>
          </div>
        ) : (
          /* Resting Admiralty Skeleton Key */
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)] opacity-90 hover:opacity-100 transition-opacity z-10"
            style={{
              left: '50.0%',
              top: '49.16%',
              width: '24%',
              aspectRatio: '946 / 356'
            }}
          >
            <img
              src={tokenAdmiraltyKeyPng}
              alt="Admiralty Key"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Cradle 3 (Right): Navigator Cradle - Centered in Emerald Velvet */}
        {appointedNavPlayer ? (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 animate-fadeIn"
            style={{
              left: '81.06%',
              top: '49.16%',
              width: '17.9%',
              aspectRatio: '1 / 1'
            }}
          >
            <img
              src={getAvatarSrc(appointedNavPlayer.avatar)}
              alt={appointedNavPlayer.nickname || 'Navigator'}
              style={{ filter: 'drop-shadow(0 0 14px rgba(52, 211, 153, 0.9))' }}
              className="w-full h-full object-contain rounded-full pointer-events-none select-none z-10"
            />
            {/* NAV Peg Stamp Pin (z-20, outside overflow, completely unclipped) */}
            <div className="absolute -bottom-1 -right-1 w-[38%] aspect-square flex items-center justify-center z-20 pointer-events-none">
              <img
                src={btnPegNavPng}
                alt="NAV Peg"
                className="w-full h-full object-contain filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
              />
            </div>
          </div>
        ) : (
          /* Resting Brass Helm Wheel */
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)] opacity-90 hover:opacity-100 transition-opacity z-10"
            style={{
              left: '81.06%',
              top: '49.16%',
              width: '18%',
              aspectRatio: '1 / 1'
            }}
          >
            <img
              src={tokenBrassHelmPng}
              alt="Brass Helm Wheel"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* ── Section A3: Top-Right Wing Tablets (Strictly inside Green Leather area) ── */}
      {layout.topRight.length > 0 && (
        <div
          className="absolute z-10 flex items-center justify-center gap-2 sm:gap-3"
          style={{
            top: '13.7%',
            right: '7.0%',
            width: '20.5%',
            height: '27.8%'
          }}
        >
          {layout.topRight.map(renderCrewTablet)}
        </div>
      )}

      {/* ── Section B: Bottom Candidate Crew Tablets Deck (Shifted down towards Ratify bar) ── */}
      <div
        className="absolute left-[4%] right-[4%] z-10 flex items-center justify-center gap-2 sm:gap-3 md:gap-4 overflow-visible px-2"
        style={{
          top: isFlanked ? '52.8%' : '45.0%',
          height: '27.8%'
        }}
      >
        {layout.bottom.map(renderCrewTablet)}
      </div>

      {/* ── Section C: Bottom Action / Ratify Bar (Clean Button, No Subtitle Text) ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center"
        style={{
          bottom: '4.5%',
          width: isCaptain ? '28%' : '42%',
          maxWidth: isCaptain ? '380px' : '520px'
        }}
      >
        {isCaptain ? (
          /* Captain's Ratification Controls - Clean button without crowded subtitle */
          <div className="w-full flex items-center justify-center">
            <div className="relative w-full aspect-[1250/201] flex items-center justify-center">
              {isRatifyReady ? (
                /* Active Ratify Command Button */
                <button
                  type="button"
                  id="btn-ratify-command"
                  onClick={handleRatifySubmit}
                  disabled={isSubmitting}
                  className="relative w-full h-full cursor-pointer transition-transform duration-200 transform hover:scale-[1.03] active:scale-[0.98] filter hover:brightness-110 drop-shadow-[0_4px_14px_rgba(232,166,62,0.7)] focus:outline-none"
                  title="Seal and ratify the watch appointments"
                >
                  <img
                    src={btnRatifyCommandPng}
                    alt="Ratify Appointment"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </button>
              ) : (
                /* Disabled Ratify Bar */
                <div className="relative w-full h-full opacity-40 cursor-not-allowed filter grayscale select-none">
                  <img
                    src={btnRatifyCommandPng}
                    alt="Ratify Appointment (Disabled)"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Non-Captain Deliberation Banner */
          <div className="w-full py-1.5 px-3 rounded bg-[#110D09]/90 border border-gold/40 text-center shadow-lg">
            <h4 className="font-display font-black text-[clamp(8px,1vw,12px)] text-gold tracking-widest uppercase leading-tight">
              THE CAPTAIN IS DELIBERATING APPOINTMENTS...
            </h4>
            <p className="font-heading text-[clamp(6px,0.7vw,8px)] text-parchment-dim truncate leading-tight mt-0.5">
              Debate in the quarters, earn favor for office, or ready your flintlocks for Mutiny!
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CrewAppointment;
