import React, { useState, useEffect } from 'react';
import { SoundEngine } from '../utils/soundEffects';
import { Compass, Anchor, Skull, Flame, Award, BookOpen, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import PanelWood from './ui/PanelWood';
import CardParchment from './ui/CardParchment';
import ButtonWood from './ui/ButtonWood';

/**
 * NavigationPhase Component (BR-003)
 * Eldritch Parchment Navigation Command Deck:
 * Captain Draw (2 keep 1) -> Lieutenant Draw (2 keep 1) -> Navigator Decision (2 choose 1 / Jump Overboard).
 */
const NavigationPhase = ({
  room,
  currentUserId,
  myRole,
  privateCards = [],
  onStartNavigation,
  onCaptainSelectCard,
  onLieutenantSelectCard,
  onNavigatorSelectCard,
  onNavigatorJumpOverboard,
  onAppointEmergencyNavigator
}) => {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedEmergencyCandidateId, setSelectedEmergencyCandidateId] = useState(null);
  const [showOverboardConfirm, setShowOverboardConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const players = room?.players || [];
  const captain = players.find(p => p.id === room?.captainId);
  const lieutenant = players.find(p => p.id === room?.lieutenantId);
  const navigator = players.find(p => p.id === room?.navigatorId);
  const me = players.find(p => p.id === currentUserId || p.sessionToken === currentUserId);

  const isCaptain = me?.id === room?.captainId;
  const isLieutenant = me?.id === room?.lieutenantId;
  const isNavigator = me?.id === room?.navigatorId;

  const currentPhase = room?.gamePhase || 'NAVIGATION';
  const activeCards = (privateCards && privateCards.length > 0) ? privateCards : (room?.myNavigationCards || []);

  // Play flip sound when new active cards appear
  useEffect(() => {
    if (activeCards && activeCards.length > 0) {
      SoundEngine.playCardFlip();
    }
  }, [activeCards.length, currentPhase]);

  // Reset selected card when phase changes or cards change
  useEffect(() => {
    setSelectedCardId(null);
    setShowOverboardConfirm(false);
  }, [currentPhase, activeCards]);

  // Countdown timer for 60s
  useEffect(() => {
    setTimeLeft(60);
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPhase]);

  const getCardBadge = (direction) => {
    switch (direction) {
      case 'BLUE':
        return { label: 'SAILOR COURSE', bg: 'bg-sailor/20 text-sailor-glow border-sailor/50', icon: '⚓', faction: 'sailor' };
      case 'RED':
        return { label: 'PIRATE COURSE', bg: 'bg-pirate/20 text-pirate-glow border-pirate/50', icon: '⚔️', faction: 'pirate' };
      case 'YELLOW':
        return { label: 'CULT COURSE', bg: 'bg-cult/20 text-cult-glow border-cult/50', icon: '🐙', faction: 'cult' };
      default:
        return { label: 'UNKNOWN COURSE', bg: 'bg-hull text-parchment-dim border-hull-light', icon: '❓', faction: 'none' };
    }
  };

  const getActionDescription = (action) => {
    switch (action) {
      case 'DRUNK':
        return { title: 'Intoxicated (Say Xỉn) 🍺', desc: 'The Captain is drunk! Command passes to the next sailor on the left.' };
      case 'CULT_UPRISING':
        return { title: 'Cult Uprising (Nổi Dậy Tà Giáo) 👁️', desc: 'Dark tentacles surge! The Cult Leader gains influence and conducts rituals.' };
      case 'ARMED':
        return { title: 'Armed (Tiếp Vũ Khí) 🔫', desc: 'The current Navigator receives 1 additional flintlock pistol into their stash.' };
      case 'DISARMED':
        return { title: 'Disarmed (Tước Khí) 🚫', desc: 'The Navigator is stripped of 1 gun into the ship armory.' };
      case 'MERMAID':
        return { title: 'Mermaid Song (Tiếng Hát Tiên Cá) 🧜‍♀️', desc: 'The Captain designates 1 sailor to inspect the last 3 discarded cards.' };
      case 'TELESCOPE':
        return { title: 'Spyglass (Kính Viễn Vọng) 🔭', desc: 'The Captain designates 1 sailor to secretly inspect the top card of the draw pile.' };
      case 'NONE':
      default:
        return { title: 'Fair Winds (Thuận Buồm Xuôi Gió) ⛵', desc: 'The vessel glides smoothly along the plotted sea course.' };
    }
  };

  const eligibleEmergencyCandidates = players.filter(p =>
    p.id !== room?.captainId &&
    p.id !== room?.lieutenantId &&
    p.status !== 'ELIMINATED'
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-6 select-none animate-fade-in-up">
      
      {/* ====================================================================
          Top Navigation Shelf: Deck Counters & Officers Status
          ==================================================================== */}
      <PanelWood glow="firelight" nails={true} className="p-4 sm:p-5 space-y-4">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hull-light pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-abyss border border-gold-dim flex items-center justify-center text-xl shadow-inner shrink-0">
              🧭
            </div>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-parchment-bright uppercase tracking-wider">
                Vessel Navigation Deck
              </h2>
              <p className="text-[11px] text-parchment-dim font-heading">
                Voyage: <span className="text-gold font-bold">{room?.id}</span> | Chart: <span className="text-parchment-bright">{room?.mapType}</span>
              </p>
            </div>
          </div>

          {/* Deck Counters & Timer */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-abyss px-2.5 py-1 rounded border border-hull-light text-xs font-heading">
              <span className="text-parchment-dim text-[10px] uppercase mr-1.5">Draw:</span>
              <span className="font-bold text-gold-bright">{room?.navigationDeck?.drawPileCount ?? 19} 🎴</span>
            </div>
            <div className="bg-abyss px-2.5 py-1 rounded border border-hull-light text-xs font-heading">
              <span className="text-parchment-dim text-[10px] uppercase mr-1.5">Discard:</span>
              <span className="font-bold text-pirate-glow">{room?.navigationDeck?.discardPileCount ?? 0} 🗑️</span>
            </div>
            <div className="bg-abyss px-2.5 py-1 rounded border border-hull-light text-xs font-heading">
              <span className="text-parchment-dim text-[10px] uppercase mr-1.5">Logbook:</span>
              <span className="font-bold text-verdigris-glow">{room?.navigationDeck?.logbookCount ?? 0}/2 📖</span>
            </div>
            <div className={`px-2.5 py-1 rounded border font-mono font-bold text-xs ${
              timeLeft <= 10 ? 'bg-blood/20 text-blood border-blood animate-pulse' : 'bg-hull border-gold-dim text-gold'
            }`}>
              ⏱️ {timeLeft}s
            </div>
          </div>
        </div>

        {/* Officers Nameplates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Captain */}
          <div className={`p-2.5 rounded border flex items-center gap-2.5 ${
            isCaptain ? 'bg-hull border-gold shadow-firelight' : 'bg-abyss/80 border-hull-light'
          }`}>
            <span className="text-xl">👑</span>
            <div className="min-w-0">
              <div className="font-heading text-[10px] uppercase font-bold text-gold tracking-wider truncate">
                Captain {isCaptain && '(You)'}
              </div>
              <div className="font-heading font-bold text-xs text-parchment-bright truncate">
                {captain?.nickname || 'Unassigned'}
              </div>
            </div>
          </div>

          {/* Lieutenant */}
          <div className={`p-2.5 rounded border flex items-center gap-2.5 ${
            isLieutenant ? 'bg-hull border-sailor shadow-[0_0_10px_rgba(74,122,140,0.4)]' : 'bg-abyss/80 border-hull-light'
          }`}>
            <span className="text-xl">🎖️</span>
            <div className="min-w-0">
              <div className="font-heading text-[10px] uppercase font-bold text-sailor-glow tracking-wider truncate">
                Lieutenant {isLieutenant && '(You)'}
              </div>
              <div className="font-heading font-bold text-xs text-parchment-bright truncate">
                {lieutenant?.nickname || 'Unassigned'}
              </div>
            </div>
          </div>

          {/* Navigator */}
          <div className={`p-2.5 rounded border flex items-center gap-2.5 ${
            isNavigator ? 'bg-hull border-verdigris shadow-[0_0_10px_rgba(74,122,106,0.4)]' : 'bg-abyss/80 border-hull-light'
          }`}>
            <span className="text-xl">🧭</span>
            <div className="min-w-0">
              <div className="font-heading text-[10px] uppercase font-bold text-verdigris-glow tracking-wider truncate">
                Navigator {isNavigator && '(You)'}
              </div>
              <div className="font-heading font-bold text-xs text-parchment-bright truncate">
                {navigator?.nickname || 'Unassigned'}
              </div>
            </div>
          </div>
        </div>

      </PanelWood>

      {/* ====================================================================
          Main Dynamic Navigation Stage
          ==================================================================== */}

      {/* --------------------------------------------------------------------
          VIEW 1: CAPTAIN DRAW PHASE / INITIAL NAVIGATION
          -------------------------------------------------------------------- */}
      {(currentPhase === 'NAVIGATION' || currentPhase === 'NAVIGATION_CAPTAIN_DRAW') && (
        <CardParchment stains={true} className="p-6 md:p-8 space-y-6">
          {isCaptain ? (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <span className="inline-block px-3 py-0.5 bg-hull border border-gold-dim text-gold-bright text-[10px] font-heading font-bold rounded uppercase tracking-widest">
                  Captain's Helm Turn
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-parchment-bright uppercase">
                  {activeCards.length > 0 ? 'Select 1 Navigation Card for the Logbook' : 'Draw Secret Sea Chart Cards'}
                </h3>
                <p className="text-xs sm:text-sm text-parchment-dim leading-relaxed">
                  {activeCards.length > 0
                    ? 'You drew 2 secret cards. Click 1 card to deposit into the Logbook. The unchosen card is discarded facedown.'
                    : 'Click the button below to draw 2 cards from the top of the Navigation Deck.'}
                </p>
              </div>

              {activeCards.length === 0 ? (
                <div className="flex justify-center py-6">
                  <ButtonWood
                    variant="gold"
                    size="xl"
                    onClick={() => onStartNavigation && onStartNavigation()}
                    icon={<Compass size={22} />}
                  >
                    DRAW 2 NAVIGATION CARDS
                  </ButtonWood>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {activeCards.map((card, idx) => {
                      const badge = getCardBadge(card.direction || card.color);
                      const actionInfo = getActionDescription(card.action);
                      const isSelected = selectedCardId === card.id;

                      return (
                        <div
                          key={card.id || idx}
                          id={`card-captain-${card.id || idx}`}
                          onClick={() => setSelectedCardId(card.id)}
                          className={`cursor-pointer transition-all duration-300 transform ${
                            isSelected ? 'scale-105' : 'hover:scale-102 opacity-85 hover:opacity-100'
                          }`}
                        >
                          <CardParchment
                            active={isSelected}
                            faction={badge.faction}
                            className="p-5 text-center space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold border ${badge.bg}`}>
                                {badge.icon} {badge.label}
                              </span>
                              <span className="font-mono text-[10px] text-parchment-dim">Card #{idx + 1}</span>
                            </div>

                            <div className="py-3">
                              <div className="text-4xl mb-2">{badge.icon}</div>
                              <div className="font-heading font-bold text-base text-parchment-bright">{actionInfo.title}</div>
                              <p className="text-xs text-parchment-dim font-body mt-1 leading-relaxed">{actionInfo.desc}</p>
                            </div>

                            <div className="pt-2 border-t border-gold-dim/20 text-xs font-heading font-bold">
                              <span className={isSelected ? 'text-gold-bright' : 'text-parchment-dim/60'}>
                                {isSelected ? '✓ WILL DEPOSIT IN LOGBOOK' : 'Will be discarded'}
                              </span>
                            </div>
                          </CardParchment>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center">
                    <ButtonWood
                      variant="gold"
                      size="lg"
                      disabled={!selectedCardId}
                      onClick={() => selectedCardId && onCaptainSelectCard && onCaptainSelectCard(selectedCardId)}
                      icon={<BookOpen size={18} />}
                    >
                      CONFIRM & DEPOSIT IN LOGBOOK
                    </ButtonWood>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-abyss border border-gold-dim flex items-center justify-center text-3xl animate-bounce">
                👑
              </div>
              <h3 className="font-heading text-lg font-bold text-parchment-bright uppercase tracking-wider">
                Captain is Plotting the Sea Course
              </h3>
              <p className="text-xs text-parchment-dim max-w-md mx-auto">
                Captain <strong className="text-gold-bright">{captain?.nickname}</strong> is secretly drawing 2 cards and selecting 1 to seal into the Logbook.
              </p>
            </div>
          )}
        </CardParchment>
      )}

      {/* --------------------------------------------------------------------
          VIEW 2: LIEUTENANT DRAW PHASE
          -------------------------------------------------------------------- */}
      {currentPhase === 'NAVIGATION_LIEUTENANT_DRAW' && (
        <CardParchment stains={true} className="p-6 md:p-8 space-y-6">
          {isLieutenant ? (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <span className="inline-block px-3 py-0.5 bg-sailor/20 border border-sailor/40 text-sailor-glow text-[10px] font-heading font-bold rounded uppercase tracking-widest">
                  Lieutenant's Turn
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-parchment-bright uppercase">
                  Select 1 Additional Card for the Logbook
                </h3>
                <p className="text-xs sm:text-sm text-parchment-dim leading-relaxed">
                  The Captain has sealed 1 card. You drew 2 new cards: <span className="text-sailor-glow font-bold">choose 1 to deposit</span>. Both cards in the Logbook will be shuffled before being handed to the Navigator.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {activeCards.map((card, idx) => {
                  const badge = getCardBadge(card.direction || card.color);
                  const actionInfo = getActionDescription(card.action);
                  const isSelected = selectedCardId === card.id;

                  return (
                    <div
                      key={card.id || idx}
                      id={`card-lieutenant-${card.id || idx}`}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`cursor-pointer transition-all duration-300 transform ${
                        isSelected ? 'scale-105' : 'hover:scale-102 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <CardParchment
                        active={isSelected}
                        faction={badge.faction}
                        className="p-5 text-center space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold border ${badge.bg}`}>
                            {badge.icon} {badge.label}
                          </span>
                          <span className="font-mono text-[10px] text-parchment-dim">Card #{idx + 1}</span>
                        </div>

                        <div className="py-3">
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <div className="font-heading font-bold text-base text-parchment-bright">{actionInfo.title}</div>
                          <p className="text-xs text-parchment-dim font-body mt-1 leading-relaxed">{actionInfo.desc}</p>
                        </div>

                        <div className="pt-2 border-t border-gold-dim/20 text-xs font-heading font-bold">
                          <span className={isSelected ? 'text-sailor-glow' : 'text-parchment-dim/60'}>
                            {isSelected ? '✓ WILL DEPOSIT IN LOGBOOK' : 'Will be discarded'}
                          </span>
                        </div>
                      </CardParchment>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <ButtonWood
                  variant="primary"
                  size="lg"
                  disabled={!selectedCardId}
                  onClick={() => selectedCardId && onLieutenantSelectCard && onLieutenantSelectCard(selectedCardId)}
                  icon={<BookOpen size={18} />}
                >
                  CONFIRM & SEAL LOGBOOK
                </ButtonWood>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-abyss border border-sailor/50 flex items-center justify-center text-3xl animate-bounce">
                🎖️
              </div>
              <h3 className="font-heading text-lg font-bold text-parchment-bright uppercase tracking-wider">
                Lieutenant is Adding to the Logbook
              </h3>
              <p className="text-xs text-parchment-dim max-w-md mx-auto">
                Lieutenant <strong className="text-sailor-glow">{lieutenant?.nickname}</strong> is selecting the second card to complete the Logbook box.
              </p>
            </div>
          )}
        </CardParchment>
      )}

      {/* --------------------------------------------------------------------
          VIEW 3: NAVIGATOR DECISION PHASE
          -------------------------------------------------------------------- */}
      {currentPhase === 'NAVIGATION_NAVIGATOR_DECISION' && (
        <CardParchment stains={true} className="p-6 md:p-8 space-y-6">
          {isNavigator ? (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <span className="inline-block px-3 py-0.5 bg-verdigris/20 border border-verdigris/40 text-verdigris-glow text-[10px] font-heading font-bold rounded uppercase tracking-widest">
                  Navigator's Helm Decision
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-parchment-bright uppercase">
                  Steer the Ship or Jump Overboard
                </h3>
                <p className="text-xs sm:text-sm text-parchment-dim leading-relaxed">
                  Below are the 2 sealed cards from the Captain and Lieutenant (shuffled randomly). Choose 1 to steer the vessel, or <span className="text-blood font-bold">Jump Overboard</span> in defiance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {activeCards.map((card, idx) => {
                  const badge = getCardBadge(card.direction || card.color);
                  const actionInfo = getActionDescription(card.action);
                  const isSelected = selectedCardId === card.id;

                  return (
                    <div
                      key={card.id || idx}
                      id={`card-navigator-${card.id || idx}`}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`cursor-pointer transition-all duration-300 transform ${
                        isSelected ? 'scale-105' : 'hover:scale-102 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <CardParchment
                        active={isSelected}
                        faction={badge.faction}
                        className="p-5 text-center space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold border ${badge.bg}`}>
                            {badge.icon} {badge.label}
                          </span>
                          <span className="font-mono text-[10px] text-parchment-dim">Logbook Card #{idx + 1}</span>
                        </div>

                        <div className="py-3">
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <div className="font-heading font-bold text-base text-parchment-bright">{actionInfo.title}</div>
                          <p className="text-xs text-parchment-dim font-body mt-1 leading-relaxed">{actionInfo.desc}</p>
                        </div>

                        <div className="pt-2 border-t border-gold-dim/20 text-xs font-heading font-bold">
                          <span className={isSelected ? 'text-verdigris-glow' : 'text-parchment-dim/60'}>
                            {isSelected ? '✓ CHOSEN STEERING COURSE' : 'Discarded'}
                          </span>
                        </div>
                      </CardParchment>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <ButtonWood
                  variant="gold"
                  size="lg"
                  disabled={!selectedCardId}
                  onClick={() => selectedCardId && onNavigatorSelectCard && onNavigatorSelectCard(selectedCardId)}
                  icon={<Compass size={18} />}
                >
                  EXECUTE COURSE
                </ButtonWood>

                <ButtonWood
                  variant="danger"
                  size="md"
                  onClick={() => setShowOverboardConfirm(true)}
                  icon={<Skull size={16} />}
                >
                  JUMP OVERBOARD
                </ButtonWood>
              </div>

              {/* Overboard Confirmation Modal */}
              {showOverboardConfirm && (
                <div className="fixed inset-0 bg-abyss/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <PanelWood glow="none" nails={true} className="max-w-md w-full text-center p-6 space-y-4 border-blood">
                    <div className="text-4xl">🌊 🦈</div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-blood uppercase tracking-wider">
                      Are You Certain You Want to Jump Overboard?
                    </h3>
                    <p className="text-xs text-parchment-dim leading-relaxed">
                      This action will <strong className="text-blood font-bold">ELIMINATE YOU FROM THE VOYAGE</strong>. You will lose all guns and both cards in the Logbook will be discarded facedown.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <ButtonWood variant="secondary" size="sm" onClick={() => setShowOverboardConfirm(false)}>
                        Cancel
                      </ButtonWood>
                      <ButtonWood
                        variant="danger"
                        size="sm"
                        onClick={() => onNavigatorJumpOverboard && onNavigatorJumpOverboard()}
                      >
                        CONFIRM JUMP
                      </ButtonWood>
                    </div>
                  </PanelWood>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-abyss border border-verdigris/50 flex items-center justify-center text-3xl animate-bounce">
                🧭
              </div>
              <h3 className="font-heading text-lg font-bold text-parchment-bright uppercase tracking-wider">
                Navigator is Deciding the Ship's Destiny
              </h3>
              <p className="text-xs text-parchment-dim max-w-md mx-auto">
                Navigator <strong className="text-verdigris-glow">{navigator?.nickname}</strong> is opening the sealed Logbook to choose the final route.
              </p>
            </div>
          )}
        </CardParchment>
      )}

      {/* --------------------------------------------------------------------
          VIEW 4: EMERGENCY NAVIGATOR SELECTION
          -------------------------------------------------------------------- */}
      {currentPhase === 'EMERGENCY_NAVIGATOR_SELECTION' && (
        <CardParchment stains={true} className="p-6 md:p-8 space-y-6 border-blood">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="inline-block px-3 py-0.5 bg-blood/20 border border-blood/50 text-blood text-[10px] font-heading font-bold rounded uppercase tracking-widest animate-pulse">
              🚨 Emergency on Deck
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-parchment-bright uppercase">
              Navigator Jumped Overboard!
            </h3>
            <p className="text-xs sm:text-sm text-parchment-dim leading-relaxed">
              The previous Navigator has cast themselves into the sea. The Captain must immediately appoint an <strong className="text-blood">Emergency Navigator</strong> from the remaining sailors.
            </p>
          </div>

          {isCaptain ? (
            <div className="space-y-4 max-w-xl mx-auto">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-parchment-dim">
                Select a Sailor as Emergency Navigator:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {eligibleEmergencyCandidates.map((cand) => {
                  const isSelected = selectedEmergencyCandidateId === cand.id;
                  const isOffDuty = cand.status === 'OFF_DUTY';

                  return (
                    <PanelWood
                      key={cand.id}
                      onClick={() => setSelectedEmergencyCandidateId(cand.id)}
                      glow={isSelected ? 'firelight' : 'none'}
                      variant={isSelected ? 'raised' : 'default'}
                      className={`p-3 cursor-pointer flex items-center gap-3 border ${
                        isSelected ? 'border-gold' : 'border-hull-light hover:border-gold-dim'
                      }`}
                    >
                      <span className="text-2xl">{cand.avatar || '🧑‍✈️'}</span>
                      <div className="min-w-0">
                        <div className="font-heading font-bold text-xs text-parchment-bright truncate">{cand.nickname}</div>
                        <div className="text-[10px] text-parchment-dim">
                          Guns: {cand.gunCount} 🔫 {isOffDuty && '(Off-duty)'}
                        </div>
                      </div>
                    </PanelWood>
                  );
                })}
              </div>

              <div className="flex justify-center pt-2">
                <ButtonWood
                  variant="gold"
                  size="lg"
                  disabled={!selectedEmergencyCandidateId}
                  onClick={() => selectedEmergencyCandidateId && onAppointEmergencyNavigator && onAppointEmergencyNavigator(selectedEmergencyCandidateId)}
                  icon={<AlertTriangle size={18} />}
                >
                  APPOINT EMERGENCY NAVIGATOR
                </ButtonWood>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <div className="text-3xl">👑</div>
              <h4 className="font-heading font-bold text-base text-parchment-bright uppercase">
                Awaiting Captain's Emergency Appointment
              </h4>
              <p className="text-xs text-parchment-dim">
                Captain <strong className="text-gold-bright">{captain?.nickname}</strong> is choosing a new Navigator from the crew.
              </p>
            </div>
          )}
        </CardParchment>
      )}

      {/* --------------------------------------------------------------------
          VIEW 5: EXECUTE ACTIONS PHASE
          -------------------------------------------------------------------- */}
      {currentPhase === 'EXECUTE_ACTIONS' && room?.executedNavigationCard && (
        <CardParchment stains={true} className="p-6 md:p-8 space-y-6 text-center border-gold">
          <span className="inline-block px-3 py-0.5 bg-hull border border-gold-dim text-gold-bright text-[10px] font-heading font-bold rounded uppercase tracking-widest">
            Executed Sea Route
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-black text-parchment-bright uppercase">
            The Vessel Surges Forward!
          </h3>

          <div className="max-w-sm mx-auto">
            {(() => {
              const card = room.executedNavigationCard;
              const badge = getCardBadge(card.direction || card.color);
              const actionInfo = getActionDescription(card.action);

              return (
                <CardParchment faction={badge.faction} className="p-6 text-center space-y-4">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-heading font-bold border ${badge.bg}`}>
                    {badge.icon} {badge.label}
                  </span>
                  <div className="py-2">
                    <div className="text-5xl mb-2 animate-ship-bob">{badge.icon}</div>
                    <div className="font-heading font-bold text-lg text-parchment-bright">{actionInfo.title}</div>
                    <p className="text-xs text-parchment-dim font-body mt-1 leading-relaxed">{actionInfo.desc}</p>
                  </div>
                </CardParchment>
              );
            })()}
          </div>
        </CardParchment>
      )}

    </div>
  );
};

export default NavigationPhase;
