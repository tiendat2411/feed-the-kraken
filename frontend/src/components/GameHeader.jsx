import React, { useState } from 'react';
import { LogOut, Trash2, Volume2, VolumeX, Sparkles, Anchor, Copy, Check } from 'lucide-react';
import { SoundEngine } from '../utils/soundEffects';
import ButtonWood from './ui/ButtonWood';

/**
 * GameHeader Component
 * Fixed top captain's helm beam providing real-time game status, phase tracking,
 * sound controls, and emergency disembark/dissolve actions.
 */
const GameHeader = ({
  room,
  currentUserId,
  onLeaveRoom,
  onDissolveRoom
}) => {
  if (!room) return null;

  const myId = room.myId || currentUserId;
  const isHost = Boolean(room.hostId && (room.hostId === myId || room.hostId === currentUserId));
  const [muted, setMuted] = useState(SoundEngine.isMuted());
  const [copied, setCopied] = useState(false);

  const handleToggleSound = () => {
    const nextState = SoundEngine.toggleMute();
    setMuted(nextState);
  };

  const handleCopyCode = () => {
    if (!room?.id) return;
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPhaseName = (phase) => {
    switch (phase) {
      case 'ROLE_REVEAL':
      case 'PIRATES_GATHERING':
        return '🌙 Night Phase (Secret Roles)';
      case 'DAY_1_CREW_SELECTION':
      case 'APPOINT_TEAM':
        return '☀️ Day Phase (Appoint Team)';
      case 'LOYALTY_CHECK':
        return '⚔️ Mutiny Gun Bidding';
      case 'MUTINY_REVEALED':
        return '📜 Mutiny Resolution';
      case 'MUTINY_TIE_BREAKER':
        return '⚖️ Mutiny Tie Breaker';
      case 'NAVIGATION':
      case 'NAVIGATION_CAPTAIN_DRAW':
        return '🧭 Captain Navigation Draw';
      case 'NAVIGATION_LIEUTENANT_DRAW':
        return '🧭 Lieutenant Navigation Draw';
      case 'NAVIGATION_NAVIGATOR_DECISION':
        return '🧭 Navigator Helm Choice';
      case 'EMERGENCY_NAVIGATOR_SELECTION':
        return '🚨 Emergency Navigator Selection';
      case 'EXECUTE_ACTIONS':
      case 'EXECUTE_MAP_ACTION':
      case 'EXECUTE_CARD_ACTION':
        return '⛵ Sea Route & Map Action';
      case 'CULT_UPRISING':
      case 'CULT_UPRISING_BLIND':
        return '🐙 Cult of the Kraken Uprising';
      case 'ROUND_END':
        return '⏳ Off-Duty Shift & Round End';
      case 'END_GAME':
        return '🏆 Voyage Finished';
      default:
        return phase;
    }
  };

  return (
    <header className="w-full bg-hull-dark/95 border-b border-hull-light/80 px-3 sm:px-6 py-2.5 sticky top-0 z-40 shadow-wood-panel select-none">
      {/* Top subtle golden hairline */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold-dim/30 to-transparent" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* ====================================================================
            Left: Room Identity, Chart Type, and Phase Tracker
            ==================================================================== */}
        <div className="flex items-center gap-2 sm:gap-3.5 overflow-hidden">
          
          {/* Room ID Tag */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-abyss border border-hull-light hover:border-gold-dim rounded text-xs text-gold transition cursor-pointer"
            title="Click to copy voyage room code"
          >
            <span className="font-heading text-[10px] uppercase tracking-widest text-parchment-dim hidden xs:inline">
              Voyage:
            </span>
            <span className="font-heading font-bold text-xs sm:text-sm tracking-wider text-parchment-bright">
              {room.id}
            </span>
            {copied ? <Check size={12} className="text-verdigris" /> : <Copy size={12} className="text-parchment-dim" />}
          </button>

          {/* Chart Type (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-hull/60 border border-hull-light/40 rounded text-xs text-parchment-dim font-heading">
            <Anchor size={13} className="text-gold-dim" />
            <span className="truncate">
              {room.mapType === 'LONG_JOURNEY' ? 'Long Voyage (23 Cards)' : 'Quick Voyage (19 Cards)'}
            </span>
          </div>

          {/* Current Game Phase Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-hull rounded border border-gold-dim/40 text-xs font-heading text-parchment-bright shadow-sm truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            <Sparkles size={13} className="text-gold shrink-0" />
            <span className="truncate font-semibold tracking-wide">
              {getPhaseName(room.gamePhase)}
            </span>
          </div>
        </div>

        {/* ====================================================================
            Right: Sound Control & Disembark / Dissolve Actions
            ==================================================================== */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Sound Mute Toggle Button */}
          <button
            id="btn-sound-toggle-header"
            onClick={handleToggleSound}
            className={`p-1.5 sm:p-2 rounded border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
              muted
                ? 'bg-hull-dark border-hull-light text-parchment-dim/50 hover:text-parchment'
                : 'bg-hull border-gold-dim text-gold-bright shadow-firelight'
            }`}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Host Dissolve Room Action */}
          {isHost && (
            <ButtonWood
              variant="danger"
              size="sm"
              onClick={onDissolveRoom}
              icon={<Trash2 size={13} />}
              title="Dissolve Voyage for all players"
              className="hidden sm:inline-flex"
            >
              Dissolve
            </ButtonWood>
          )}

          {/* Player Leave Room Action */}
          <ButtonWood
            variant="secondary"
            size="sm"
            onClick={onLeaveRoom}
            icon={<LogOut size={13} />}
            title="Leave this voyage"
          >
            <span className="hidden sm:inline">Leave</span>
          </ButtonWood>
        </div>

      </div>
    </header>
  );
};

export default GameHeader;
