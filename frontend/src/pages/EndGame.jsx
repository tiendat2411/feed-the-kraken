import React, { useEffect } from 'react';
import { SoundEngine } from '../utils/soundEffects';
import { Anchor, Skull, Flame, Crown, Trophy, RotateCcw, LogOut, Sparkles } from 'lucide-react';
import PanelWood from '../components/ui/PanelWood';
import CardParchment from '../components/ui/CardParchment';
import ButtonWood from '../components/ui/ButtonWood';
import Vignette from '../components/ui/Vignette';
import DustParticles from '../components/ui/DustParticles';

/**
 * EndGame Page / Component (BR-005 / UC-018)
 * Eldritch Parchment Hall of Fame & Final Revelation:
 * Faction Victory Celebration Banner, 100% Player Identity Reveal, and Host Return to Lobby Controls.
 */
const EndGame = ({ room, currentUserId, onReturnToLobby, onLeaveRoom }) => {
  const isHost = room?.hostId === currentUserId;
  const gameResult = room?.gameResult || {};
  const winningFaction = gameResult.winningFaction || room?.winnerFaction || 'SAILOR';
  const winReason = gameResult.winReason || room?.winReason || 'REACHED_DESTINATION';
  const playersSnapshot = gameResult.playersSnapshot || room?.players || [];
  const terminalNode = gameResult.terminalNode || room?.mapBoard?.currentNode || null;
  const totalRounds = gameResult.totalRounds ?? 0;

  // Play victory fanfare on mount
  useEffect(() => {
    SoundEngine.playVictoryFanfare(winningFaction);
  }, [winningFaction]);

  const factionThemes = {
    SAILOR: {
      title: 'SAILOR FACTION VICTORIOUS!',
      subtitle: 'The vessel has navigated through turbulent waters and arrived safely at Bluewater Bay!',
      badge: 'CREW OF THE CROWN (SAILORS)',
      icon: Anchor,
      glow: 'firelight',
      titleColor: 'text-sailor-glow',
      borderClass: 'border-sailor/60',
      badgeBg: 'bg-sailor/20 text-sailor-glow border-sailor/40'
    },
    PIRATE: {
      title: 'PIRATE FACTION VICTORIOUS!',
      subtitle: 'The vessel has been seized by the brotherhood and anchored at Crimson Cove to divide the spoils!',
      badge: 'BROTHERHOOD OF PIRATES',
      icon: Skull,
      glow: 'firelight',
      titleColor: 'text-pirate-glow',
      borderClass: 'border-pirate/60',
      badgeBg: 'bg-pirate/20 text-pirate-glow border-pirate/40'
    },
    CULT: {
      title: 'CULT OF THE KRAKEN VICTORIOUS!',
      subtitle: winReason.includes('SACRIFICED')
        ? 'The Cult Leader was successfully sacrificed! The Ancient Kraken has awakened and consumed the sea!'
        : 'The vessel was lured straight into the gaping maw of the Kraken Sanctuary in the deep abyss!',
      badge: 'CULT OF THE KRAKEN',
      icon: Flame,
      glow: 'eldritch',
      titleColor: 'text-cult-glow',
      borderClass: 'border-cult/60',
      badgeBg: 'bg-cult/20 text-cult-glow border-cult/40'
    }
  };

  const theme = factionThemes[winningFaction] || factionThemes.SAILOR;
  const WinIcon = theme.icon;

  const winners = playersSnapshot.filter(p => p.isWinner);
  const losers = playersSnapshot.filter(p => !p.isWinner);

  const renderRoleBadge = (player) => {
    const isCultLeader = player.isCultLeader || player.originalFaction === 'CULT_LEADER';
    const isCultist = player.isCultist || player.currentFaction === 'CULTIST';
    const wasConverted = isCultist && !isCultLeader && player.originalFaction !== 'CULTIST';

    if (isCultLeader) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-heading font-bold bg-gold/20 text-gold-bright border border-gold/40">
          <Crown size={11} className="text-gold-bright" /> CULT LEADER
        </span>
      );
    }

    if (wasConverted) {
      return (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-heading text-parchment-dim/60 line-through bg-abyss border border-hull-light">
            {player.originalFaction}
          </span>
          <span className="text-cult-glow font-bold text-xs">➔</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-heading font-bold bg-cult/20 text-cult-glow border border-cult/50 animate-pulse">
            🐙 CULTIST (CONVERTED)
          </span>
        </div>
      );
    }

    if (player.currentFaction === 'PIRATE' || player.originalFaction === 'PIRATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-heading font-bold bg-pirate/20 text-pirate-glow border border-pirate/40">
          <Skull size={11} /> PIRATE
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-heading font-bold bg-sailor/20 text-sailor-glow border border-sailor/40">
        <Anchor size={11} /> SAILOR
      </span>
    );
  };

  return (
    <main className="min-h-[100dvh] bg-abyss text-parchment p-4 sm:p-6 md:p-8 flex flex-col items-center justify-between relative overflow-x-hidden font-body select-none">
      {/* Ambient Atmosphere */}
      <Vignette mode="global" intensity="heavy" />
      <DustParticles count={8} />

      <div className="w-full max-w-5xl space-y-6 relative z-20 animate-fade-in-up">
        
        {/* ====================================================================
            1. Hero Victory Banner
            ==================================================================== */}
        <CardParchment stains={true} className={`p-6 sm:p-8 text-center space-y-3 ${theme.borderClass}`}>
          <div className="flex justify-center mb-1">
            <div className="w-16 h-16 rounded bg-abyss border border-gold flex items-center justify-center text-3xl shadow-firelight animate-ship-bob">
              <WinIcon size={36} className={theme.titleColor} />
            </div>
          </div>

          <div className={`inline-block px-3 py-0.5 rounded text-[10px] font-heading font-black uppercase tracking-widest border ${theme.badgeBg}`}>
            {theme.badge}
          </div>

          <h1 className={`font-heading text-3xl sm:text-5xl font-black uppercase tracking-wider ${theme.titleColor}`}>
            {theme.title}
          </h1>

          <p className="text-xs sm:text-sm text-parchment-dim max-w-xl mx-auto font-body leading-relaxed">
            {theme.subtitle}
          </p>

          {/* Quick Stats Grid */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-xs font-heading">
            <div className="px-3 py-1 bg-hull rounded border border-hull-light text-parchment-dim">
              🗺️ Chart: <span className="font-bold text-parchment-bright">{room?.mapType === 'LONG_JOURNEY' ? 'Long Voyage' : 'Quick Voyage'}</span>
            </div>
            {terminalNode && (
              <div className="px-3 py-1 bg-hull rounded border border-hull-light text-parchment-dim">
                🏁 Terminal Haven: <span className="font-bold text-gold">{terminalNode.name || terminalNode.id}</span>
              </div>
            )}
            <div className="px-3 py-1 bg-hull rounded border border-hull-light text-parchment-dim">
              ⏳ Voyage Shifts: <span className="font-bold text-parchment-bright">{totalRounds}</span>
            </div>
          </div>
        </CardParchment>

        {/* ====================================================================
            2. Hall of Fame: 100% Identity Revelation
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* WINNERS COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Trophy size={18} className="text-gold" />
              <h2 className="font-heading text-base sm:text-lg font-bold text-gold tracking-wider uppercase">
                Victorious Sailors ({winners.length})
              </h2>
            </div>

            <div className="space-y-2.5">
              {winners.map(player => (
                <PanelWood
                  key={player.id}
                  variant="raised"
                  glow="firelight"
                  nails={true}
                  className="p-3.5 flex items-center justify-between border-gold/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded bg-abyss border border-gold/40 flex items-center justify-center text-2xl shrink-0">
                      {player.avatar || '🧑‍✈️'}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="font-heading font-bold text-sm text-parchment-bright flex items-center gap-1.5 truncate">
                        <span className="truncate">{player.nickname}</span>
                        {player.id === currentUserId && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-gold/20 text-gold-bright border border-gold/40 shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5">
                        {renderRoleBadge(player)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-heading shrink-0 pl-2">
                    <div className="font-bold text-verdigris flex items-center justify-end gap-1">
                      <Crown size={12} /> VICTORIOUS
                    </div>
                    <div className="text-[10px] text-parchment-dim">
                      🔫 {player.gunCount ?? 0} guns
                    </div>
                  </div>
                </PanelWood>
              ))}
            </div>
          </div>

          {/* LOSERS COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Skull size={18} className="text-parchment-dim" />
              <h2 className="font-heading text-base sm:text-lg font-bold text-parchment-dim tracking-wider uppercase">
                Defeated Sailors ({losers.length})
              </h2>
            </div>

            <div className="space-y-2.5">
              {losers.map(player => (
                <PanelWood
                  key={player.id}
                  nails={true}
                  className="p-3.5 flex items-center justify-between border-hull-light/60 opacity-85"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded bg-abyss border border-hull-light flex items-center justify-center text-2xl shrink-0 opacity-75">
                      {player.avatar || '🧑‍✈️'}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="font-heading font-bold text-sm text-parchment-bright flex items-center gap-1.5 truncate">
                        <span className="truncate">{player.nickname}</span>
                        {player.id === currentUserId && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-hull text-parchment-dim border border-hull-light shrink-0">
                            You
                          </span>
                        )}
                        {player.status === 'ELIMINATED' && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blood/20 text-blood border border-blood/40 shrink-0">
                            Overboard
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5">
                        {renderRoleBadge(player)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-heading shrink-0 pl-2">
                    <div className="font-bold text-parchment-dim/60">
                      DEFEATED
                    </div>
                    <div className="text-[10px] text-parchment-dim">
                      🔫 {player.gunCount ?? 0} guns
                    </div>
                  </div>
                </PanelWood>
              ))}
            </div>
          </div>

        </div>

        {/* ====================================================================
            3. Action Controls: Return to Lobby / Disembark
            ==================================================================== */}
        <PanelWood glow="none" nails={true} className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left text-xs text-parchment-dim font-heading space-y-0.5">
            <div className="font-bold text-parchment-bright">
              Voyage records have been archived in the captain's log.
            </div>
            <div>
              {isHost
                ? 'The Captain may initiate a return to the Lobby for a fresh voyage.'
                : 'Awaiting the Captain to assemble the crew in the Lobby...'}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <ButtonWood
              variant="secondary"
              size="md"
              onClick={onLeaveRoom}
              icon={<LogOut size={15} />}
            >
              Disembark
            </ButtonWood>

            {isHost && (
              <ButtonWood
                variant="gold"
                size="md"
                onClick={onReturnToLobby}
                icon={<RotateCcw size={16} />}
              >
                RETURN TO LOBBY
              </ButtonWood>
            )}
          </div>
        </PanelWood>

      </div>
    </main>
  );
};

export default EndGame;
