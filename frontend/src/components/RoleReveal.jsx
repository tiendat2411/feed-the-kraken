import React, { useState, useEffect } from 'react';
import { Shield, Skull, Eye, EyeOff, Flame, Clock, Anchor, Sparkles } from 'lucide-react';
import CardParchment from './ui/CardParchment';
import PanelWood from './ui/PanelWood';

const FACTION_CONFIG = {
  SAILOR: {
    title: 'SAILOR',
    subtitle: 'Loyal Crew of the Crown',
    colorText: 'text-sailor-glow',
    colorBorder: 'border-sailor',
    glowClass: 'shadow-[0_0_25px_rgba(74,122,140,0.4)]',
    icon: Anchor,
    badgeBg: 'bg-sailor/20 text-sailor-glow border-sailor/40',
    goal: 'Steer the vessel safely to Bluewater Bay (Blue Harbor) or exterminate all Pirates and Cultists.',
    tips: 'Watch who you appoint as Lieutenant and Navigator. Never let Pirates seize the helm.'
  },
  PIRATE: {
    title: 'PIRATE',
    subtitle: 'Brotherhood of the Black Flag',
    colorText: 'text-pirate-glow',
    colorBorder: 'border-pirate',
    glowClass: 'shadow-[0_0_25px_rgba(168,59,42,0.45)]',
    icon: Skull,
    badgeBg: 'bg-pirate/20 text-pirate-glow border-pirate/40',
    goal: 'Hijack the vessel and steer directly into the fiery haven of Crimson Cove (Red Route) to divide the treasure.',
    tips: 'Conspire with your mates in secret. Wield your flintlocks to launch a Mutiny against the Captain when the time is right.'
  },
  CULT_LEADER: {
    title: 'CULT LEADER',
    subtitle: 'High Priest of the Deep',
    colorText: 'text-gold-bright',
    colorBorder: 'border-gold',
    glowClass: 'shadow-[0_0_30px_rgba(201,168,76,0.5)]',
    icon: Flame,
    badgeBg: 'bg-gold/20 text-gold-bright border-gold/40',
    goal: 'Lure the vessel into the gaping maw of the Kraken Sanctuary (Yellow Route) OR get fed to the Kraken by the Captain!',
    tips: 'Perform sacred Cult Rituals during sea events to secretly convert crew members into devout Cultists.'
  },
  CULTIST: {
    title: 'CULTIST',
    subtitle: 'Devout Acolyte of the Abyss',
    colorText: 'text-cult-glow',
    colorBorder: 'border-cult',
    glowClass: 'shadow-eldritch',
    icon: Eye,
    badgeBg: 'bg-cult/20 text-cult-glow border-cult/40',
    goal: 'Serve the Cult Leader and sacrifice the ship to the Ancient Kraken in the deep abyss.',
    tips: 'Protect your Cult Leader at all costs and assist their ascendancy without revealing your faith.'
  }
};

const RoleReveal = ({ room, myRole, currentUserId }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  const faction = FACTION_CONFIG[myRole] || FACTION_CONFIG.SAILOR;
  const Icon = faction.icon;
  const isPirate = myRole === 'PIRATE';
  const isNightGathering = room?.gamePhase === 'PIRATES_GATHERING';
  const knownPirates = room?.knownPirates || [];

  // Countdown synchronization with server phase deadline
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

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 py-8 relative select-none">
      
      {/* ====================================================================
          Top Countdown Banner (Circular Ember Clock)
          ==================================================================== */}
      <div className="z-20 mb-6 flex items-center gap-3 px-5 py-2 bg-hull-dark/90 border border-gold-dim/40 rounded-full shadow-firelight animate-fade-in-up">
        <Clock className="text-gold animate-spin" style={{ animationDuration: '6s' }} size={16} />
        <span className="font-heading text-xs uppercase tracking-widest text-parchment-dim">
          First Night Phase:
        </span>
        <span className={`font-mono text-lg font-black ${timeLeft <= 5 ? 'text-blood animate-ping' : 'text-gold-bright'}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="z-20 max-w-xl w-full space-y-6">

        {/* ====================================================================
            Tarot 3D Flip Card Container
            ==================================================================== */}
        <div className="perspective-1000 w-full max-w-sm mx-auto h-[460px] sm:h-[480px]">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full h-full relative cursor-pointer transform-style-3d transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* --------------------------------------------------------------
                CARD BACK: Dark Leather with Gold Kraken Line Art
                -------------------------------------------------------------- */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded border-2 border-gold-dim bg-gradient-to-b from-[#2A2118] via-[#1A1510] to-[#0A0A08] shadow-2xl p-6 flex flex-col items-center justify-between overflow-hidden">
              {/* Inner Decorative Golden Border */}
              <div className="absolute inset-2 border border-gold-dim/30 rounded pointer-events-none" />

              {/* Top Header */}
              <div className="text-center pt-2">
                <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-gold-dim">
                  Vessel Identity Card
                </span>
                <h3 className="font-display text-2xl text-gold-bright mt-0.5">
                  Feed The Kraken
                </h3>
              </div>

              {/* Center Emblem: Kraken Silhouette Line Art */}
              <div className="relative w-36 h-36 flex items-center justify-center my-auto">
                <div className="absolute inset-0 rounded-full border border-gold-dim/20 animate-spin" style={{ animationDuration: '20s' }} />
                <div className="w-28 h-28 rounded-full bg-abyss border border-gold-dim/40 flex items-center justify-center shadow-inner">
                  <Skull className="w-14 h-14 text-gold/60 animate-ship-bob" strokeWidth={1.2} />
                </div>
              </div>

              {/* Bottom Instruction */}
              <div className="text-center pb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-hull rounded border border-gold-dim/40 text-xs font-heading text-parchment-bright tracking-wider animate-pulse">
                  <Sparkles size={12} className="text-gold" />
                  Tap Card to Reveal Role
                </div>
                <p className="text-[10px] text-parchment-dim/60 font-body italic mt-1.5">
                  Keep your true faction hidden from prying eyes
                </p>
              </div>
            </div>

            {/* --------------------------------------------------------------
                CARD FRONT: Aged Parchment Role Face
                -------------------------------------------------------------- */}
            <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded border-2 ${faction.colorBorder} ${faction.glowClass} bg-gradient-to-b from-[#3D3228] via-[#2A2118] to-[#1A1510] shadow-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden`}>
              {/* Inner Gold Foil Hairline */}
              <div className="absolute inset-2 border border-gold-dim/30 rounded pointer-events-none" />

              {/* Role Header */}
              <div className="text-center border-b border-gold-dim/30 pb-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className={`p-2 rounded bg-abyss border border-gold-dim/40 shadow-inner`}>
                    <Icon size={24} className={faction.colorText} strokeWidth={1.8} />
                  </div>
                </div>
                <h2 className={`font-heading text-2xl sm:text-3xl font-black uppercase tracking-wider ${faction.colorText}`}>
                  {faction.title}
                </h2>
                <p className="font-heading text-[11px] text-parchment-dim tracking-widest uppercase">
                  {faction.subtitle}
                </p>
              </div>

              {/* Win Goal on Aged Parchment Box */}
              <div className="my-auto space-y-2.5">
                <div className="bg-abyss/85 p-3.5 rounded border border-hull-light text-left shadow-inner">
                  <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-parchment-bright uppercase tracking-wider mb-1">
                    <Shield size={13} className="text-gold" />
                    Faction Victory Condition
                  </div>
                  <p className="text-xs text-parchment font-body leading-relaxed">
                    {faction.goal}
                  </p>
                </div>

                <div className="p-2.5 bg-hull-dark/90 rounded border border-gold-dim/20 text-left">
                  <span className="font-heading text-[10px] uppercase tracking-wider text-parchment-dim block mb-0.5">
                    💡 Secret Advice:
                  </span>
                  <p className="text-[11px] text-parchment-dim italic font-body">
                    {faction.tips}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="text-center border-t border-gold-dim/20 pt-2.5 flex items-center justify-between text-xs font-heading">
                <span className="text-parchment-dim text-[11px]">Equipped: 🔫 3 Flintlocks</span>
                <span className="text-gold-dim text-[10px] uppercase tracking-wider underline cursor-pointer">
                  Tap to flip
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ====================================================================
            Night Phase Gathering / Eyes Closed Veil Area
            ==================================================================== */}
        {isNightGathering && isPirate ? (
          /* Pirate Secret Gathering Roster */
          <PanelWood glow="none" nails={true} className="border-pirate/50 p-5 space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-2.5 border-b border-pirate/30 pb-3">
              <Skull className="text-pirate-glow animate-pulse" size={22} />
              <div>
                <h3 className="font-heading font-bold text-base text-pirate-glow tracking-wider uppercase">
                  Pirates Gathering (Hải Tặc Hội Tụ)
                </h3>
                <p className="text-xs text-parchment-dim">
                  Your fellow pirates aboard this vessel are:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {knownPirates.map((pirate) => {
                const isMe = pirate.id === currentUserId;
                return (
                  <div
                    key={pirate.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded border ${
                      isMe
                        ? 'bg-pirate/20 border-pirate shadow-[0_0_10px_rgba(168,59,42,0.3)]'
                        : 'bg-abyss/80 border-hull-light'
                    }`}
                  >
                    <div className="text-xl w-8 h-8 rounded bg-hull flex items-center justify-center border border-gold-dim/30 shrink-0">
                      {pirate.avatar || '🏴‍☠️'}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <div className="font-heading font-bold text-xs text-parchment-bright truncate flex items-center gap-1">
                        <span className="truncate">{pirate.nickname || pirate.name}</span>
                        {isMe && <span className="text-[9px] text-gold">(You)</span>}
                      </div>
                      <span className="text-[10px] text-pirate-glow font-body">Brotherhood</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </PanelWood>
        ) : isNightGathering && !isPirate ? (
          /* Non-Pirate Veil: Eyes Closed Screen */
          <CardParchment stains={true} className="text-center p-6 space-y-3 animate-fade-in-up border-hull-light">
            <div className="w-12 h-12 mx-auto rounded-full bg-abyss border border-hull-light flex items-center justify-center text-parchment-dim">
              <EyeOff size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-parchment-bright uppercase tracking-wider">
                All Eyes Closed in the Dark... 🌙
              </h3>
              <p className="text-xs text-parchment-dim max-w-md mx-auto mt-1 leading-relaxed">
                Total darkness descends upon the sea. Pirates are secretly identifying their brethren. Maintain absolute silence until dawn arrives.
              </p>
            </div>
            <div className="text-[11px] text-gold font-heading tracking-widest uppercase">
              Dawn will break automatically in {timeLeft} seconds
            </div>
          </CardParchment>
        ) : null}

      </div>
    </div>
  );
};

export default RoleReveal;
