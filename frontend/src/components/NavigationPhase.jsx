import React, { useState, useEffect } from 'react';
import { SoundEngine } from '../utils/soundEffects';

/**
 * NavigationPhase Component (BR-003)
 * Giao diện bốc bài, chọn bài vào Logbook, điều hướng tàu và xử lý Nhảy tàu.
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

  // Card background styling
  const getCardStyle = (direction) => {
    switch (direction) {
      case 'BLUE':
        return 'from-cyan-900/90 via-blue-950/90 to-slate-900 border-cyan-400/60 shadow-cyan-900/50 text-cyan-200';
      case 'RED':
        return 'from-red-950/90 via-rose-950/90 to-slate-900 border-red-500/60 shadow-red-950/50 text-red-200';
      case 'YELLOW':
        return 'from-amber-950/90 via-yellow-950/90 to-purple-950/90 border-amber-400/60 shadow-amber-900/50 text-amber-200';
      default:
        return 'from-slate-800 via-slate-900 to-slate-950 border-slate-600 text-slate-300';
    }
  };

  const getCardBadge = (direction) => {
    switch (direction) {
      case 'BLUE':
        return { label: 'SAILOR', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: '⚓' };
      case 'RED':
        return { label: 'PIRATE', bg: 'bg-red-500/20 text-red-300 border-red-500/40', icon: '⚔️' };
      case 'YELLOW':
        return { label: 'CULT', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🐙' };
      default:
        return { label: 'UNKNOWN', bg: 'bg-slate-700 text-slate-300', icon: '❓' };
    }
  };

  const getActionDescription = (action) => {
    switch (action) {
      case 'DRUNK':
        return { title: 'Drunken Stupor 🍺', desc: 'Captain is intoxicated! Captaincy passes to the player on the left.' };
      case 'CULT_UPRISING':
        return { title: 'Cult Uprising 👁️', desc: 'Dark powers summon the Deep! Secret conversions may occur.' };
      case 'ARMED':
        return { title: 'Arms Cache 🔫', desc: 'Grants +1 pistol to the incumbent Navigator.' };
      case 'DISARMED':
        return { title: 'Disarm 🚫', desc: 'Navigator loses 1 pistol to the common armory.' };
      case 'MERMAID':
        return { title: 'Mermaid Song 🧜‍♀️', desc: 'Captain appoints 1 player to secretly examine the last 3 discarded cards.' };
      case 'TELESCOPE':
        return { title: 'Spyglass 🔭', desc: 'Captain appoints 1 player to inspect the top card of the navigation deck.' };
      case 'NONE':
      default:
        return { title: 'Fair Winds ⛵', desc: 'The vessel glides smoothly along the plotted course with no extra incident.' };
    }
  };

  // Eligible emergency navigator candidates
  const eligibleEmergencyCandidates = players.filter(p =>
    p.id !== room?.captainId &&
    p.id !== room?.lieutenantId &&
    p.status !== 'ELIMINATED'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      {/* Top Header bar */}
      <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 md:p-6 mb-6 shadow-2xl shadow-black/60">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner">
              🧭
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300">
                NAVIGATION PHASE
              </h1>
              <p className="text-xs text-slate-400">Room: <span className="font-mono text-cyan-300 font-semibold">{room?.id}</span> | Mode: <span className="text-amber-300 font-medium">{room?.mapType}</span></p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Deck:</span>
              <span className="font-bold text-cyan-400">{room?.navigationDeck?.drawPileCount ?? 19} 🎴</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Discard:</span>
              <span className="font-bold text-red-400">{room?.navigationDeck?.discardPileCount ?? 0} 🗑️</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Logbook:</span>
              <span className="font-bold text-amber-400">{room?.navigationDeck?.logbookCount ?? 0}/2 📖</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${timeLeft <= 10 ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-slate-800 text-cyan-300 border-cyan-500/30'}`}>
              ⏱️ {timeLeft}s
            </div>
          </div>
        </div>

        {/* Current Officers Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className={`p-3 rounded-xl border flex items-center space-x-3 ${isCaptain ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}>
            <span className="text-2xl">👑</span>
            <div className="overflow-hidden">
              <div className="text-xs text-amber-400/90 font-bold uppercase tracking-wider">Captain {isCaptain && '(YOU)'}</div>
              <div className="text-sm font-semibold truncate text-white">{captain?.nickname || 'Unassigned'}</div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center space-x-3 ${isLieutenant ? 'bg-sky-950/40 border-sky-500/60 ring-2 ring-sky-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}>
            <span className="text-2xl">⚔️</span>
            <div className="overflow-hidden">
              <div className="text-xs text-sky-400/90 font-bold uppercase tracking-wider">Lieutenant {isLieutenant && '(YOU)'}</div>
              <div className="text-sm font-semibold truncate text-white">{lieutenant?.nickname || 'Unassigned'}</div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center space-x-3 ${isNavigator ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}>
            <span className="text-2xl">🧭</span>
            <div className="overflow-hidden">
              <div className="text-xs text-emerald-400/90 font-bold uppercase tracking-wider">Navigator {isNavigator && '(YOU)'}</div>
              <div className="text-sm font-semibold truncate text-white">{navigator?.nickname || 'Unassigned'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="w-full max-w-5xl">
        {/* VIEW 1: CAPTAIN DRAW PHASE / INITIAL NAVIGATION */}
        {(currentPhase === 'NAVIGATION' || currentPhase === 'NAVIGATION_CAPTAIN_DRAW') && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

            {isCaptain ? (
              <div>
                <div className="text-center mb-8">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
                    CAPTAIN'S TURN
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    {activeCards.length > 0 ? 'Select 1 Card to Keep in Logbook' : 'Draw Secret Navigation Cards'}
                  </h2>
                  <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                    {activeCards.length > 0
                      ? 'You drew 2 secret navigation cards. Click 1 card to pass to Navigator. The other card will be discarded face-down.'
                      : 'Click the button below to draw 2 navigation cards from the deck.'}
                  </p>
                </div>

                {activeCards.length === 0 ? (
                  <div className="flex justify-center py-6">
                    <button
                      id="btn-start-navigation-draw"
                      onClick={() => onStartNavigation && onStartNavigation()}
                      className="px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-xl shadow-amber-500/30 transition-all duration-200 transform hover:scale-105 cursor-pointer flex items-center space-x-3"
                    >
                      <span className="text-2xl">🧭</span>
                      <span>DRAW 2 SECRET NAVIGATION CARDS</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Drawn cards list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                      {activeCards.map((card, idx) => {
                        const badge = getCardBadge(card.direction || card.color);
                        const actionInfo = getActionDescription(card.action);
                        const isSelected = selectedCardId === card.id;

                        return (
                          <div
                            key={card.id || idx}
                            id={`card-captain-${card.id || idx}`}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 transform bg-gradient-to-b ${getCardStyle(card.direction || card.color)} ${
                              isSelected
                                ? 'scale-105 ring-4 ring-amber-400/80 border-amber-300 shadow-2xl shadow-amber-500/40'
                                : 'hover:scale-102 hover:border-slate-400 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg}`}>
                                {badge.icon} {badge.label}
                              </span>
                              <span className="text-xs font-mono opacity-60">Card #{idx + 1}</span>
                            </div>

                            <div className="my-6 text-center">
                              <div className="text-5xl mb-3">{badge.icon}</div>
                              <div className="text-xl font-bold text-white tracking-wide">{actionInfo.title}</div>
                              <div className="text-xs text-slate-300 mt-2 leading-relaxed px-2">{actionInfo.desc}</div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                              <span className="text-slate-300">Status:</span>
                              <span className={`font-semibold ${isSelected ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                                {isSelected ? '✓ KEEP IN LOGBOOK' : 'Will be discarded'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-center">
                      <button
                        id="btn-confirm-captain-card"
                        disabled={!selectedCardId}
                        onClick={() => selectedCardId && onCaptainSelectCard && onCaptainSelectCard(selectedCardId)}
                        className={`px-8 py-3.5 rounded-xl font-bold text-base shadow-xl transition-all duration-200 flex items-center space-x-2 ${
                          selectedCardId
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 cursor-pointer scale-100 hover:scale-105'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span>📖</span>
                        <span>CONFIRM LOGBOOK SELECTION</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl animate-bounce">
                  👑
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Captain is Inspecting the Charts</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Captain <span className="text-amber-300 font-semibold">{captain?.nickname}</span> is secretly drawing 2 navigation cards and keeping 1 in the Logbook.
                </p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-ping" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: LIEUTENANT DRAW PHASE */}
        {currentPhase === 'NAVIGATION_LIEUTENANT_DRAW' && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-sky-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full filter blur-3xl pointer-events-none" />

            {isLieutenant ? (
              <div>
                <div className="text-center mb-8">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 mb-2">
                    LIEUTENANT'S TURN
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Select 1 More Card for the Logbook</h2>
                  <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                    Captain kept 1 card in the Logbook. Now draw 2 cards and <span className="text-sky-300 font-semibold">choose 1 to keep</span>. The 2 Logbook cards will be shuffled before passing to the Navigator.
                  </p>
                </div>

                {/* Drawn cards list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                  {activeCards.map((card, idx) => {
                    const badge = getCardBadge(card.direction || card.color);
                    const actionInfo = getActionDescription(card.action);
                    const isSelected = selectedCardId === card.id;

                    return (
                      <div
                        key={card.id || idx}
                        id={`card-lieutenant-${card.id || idx}`}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 transform bg-gradient-to-b ${getCardStyle(card.direction || card.color)} ${
                          isSelected
                            ? 'scale-105 ring-4 ring-sky-400/80 border-sky-300 shadow-2xl shadow-sky-500/40'
                            : 'hover:scale-102 hover:border-slate-400 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg}`}>
                            {badge.icon} {badge.label}
                          </span>
                          <span className="text-xs font-mono opacity-60">Card #{idx + 1}</span>
                        </div>

                        <div className="my-6 text-center">
                          <div className="text-5xl mb-3">{badge.icon}</div>
                          <div className="text-xl font-bold text-white tracking-wide">{actionInfo.title}</div>
                          <div className="text-xs text-slate-300 mt-2 leading-relaxed px-2">{actionInfo.desc}</div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-slate-300">Status:</span>
                          <span className={`font-semibold ${isSelected ? 'text-sky-300' : 'text-slate-400'}`}>
                            {isSelected ? '✓ KEEP IN LOGBOOK' : 'Will be discarded'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center">
                  <button
                    id="btn-confirm-lieutenant-card"
                    disabled={!selectedCardId}
                    onClick={() => selectedCardId && onLieutenantSelectCard && onLieutenantSelectCard(selectedCardId)}
                    className={`px-8 py-3.5 rounded-xl font-bold text-base shadow-xl transition-all duration-200 flex items-center space-x-2 ${
                      selectedCardId
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white cursor-pointer scale-100 hover:scale-105'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>📖</span>
                    <span>CONFIRM LOGBOOK SELECTION</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-4xl animate-bounce">
                  ⚔️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Thuyền Phó Đang Xem Xét Hải Đồ</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Thuyền phó <span className="text-sky-300 font-semibold">{lieutenant?.nickname}</span> đang chọn 1 cards bài tiếp theo để hoàn thành 2 cards trong Hộp Nhật Ký Hành Trình.
                </p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-sky-400 rounded-full animate-ping" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: NAVIGATOR DECISION PHASE */}
        {currentPhase === 'NAVIGATION_NAVIGATOR_DECISION' && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

            {isNavigator ? (
              <div>
                <div className="text-center mb-8">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
                    QUYẾT ĐỊNH CỦA HOA TIÊU
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Chọn 1 Hải Đồ Để Con Tàu Di Chuyển</h2>
                  <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                    Dưới đây là 2 cards bài được gửi từ Thuyền trưởng và Thuyền phó (đã được Server xáo trộn ngẫu nhiên). Bạn có quyền chọn 1 cards để thực thi, hoặc chọn <span className="text-red-400 font-semibold">Tự Nhảy Tàu</span> nếu phản đối.
                  </p>
                </div>

                {/* Logbook cards list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                  {activeCards.map((card, idx) => {
                    const badge = getCardBadge(card.direction || card.color);
                    const actionInfo = getActionDescription(card.action);
                    const isSelected = selectedCardId === card.id;

                    return (
                      <div
                        key={card.id || idx}
                        id={`card-navigator-${card.id || idx}`}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 transform bg-gradient-to-b ${getCardStyle(card.direction || card.color)} ${
                          isSelected
                            ? 'scale-105 ring-4 ring-emerald-400/80 border-emerald-300 shadow-2xl shadow-emerald-500/40'
                            : 'hover:scale-102 hover:border-slate-400 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg}`}>
                            {badge.icon} {badge.label}
                          </span>
                          <span className="text-xs font-mono opacity-60">Lá trong Nhật Ký #{idx + 1}</span>
                        </div>

                        <div className="my-6 text-center">
                          <div className="text-5xl mb-3">{badge.icon}</div>
                          <div className="text-xl font-bold text-white tracking-wide">{actionInfo.title}</div>
                          <div className="text-xs text-slate-300 mt-2 leading-relaxed px-2">{actionInfo.desc}</div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-slate-300">Hướng đi:</span>
                          <span className={`font-semibold ${isSelected ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                            {isSelected ? '✓ CHỌN ĐIỀU HƯỚNG' : 'Bỏ qua'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    id="btn-confirm-navigator-card"
                    disabled={!selectedCardId}
                    onClick={() => selectedCardId && onNavigatorSelectCard && onNavigatorSelectCard(selectedCardId)}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                      selectedCardId
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 cursor-pointer scale-100 hover:scale-105'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>🧭</span>
                    <span>CHỐT ĐIỀU HƯỚNG TÀU</span>
                  </button>

                  <button
                    id="btn-jump-overboard"
                    onClick={() => setShowOverboardConfirm(true)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer hover:border-red-400"
                  >
                    <span>🌊</span>
                    <span>TỰ NHẢY TÀU (JUMP OVERBOARD)</span>
                  </button>
                </div>

                {/* Overboard Confirmation Modal */}
                {showOverboardConfirm && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-red-500/60 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
                      <div className="text-5xl mb-4">🌊 🦈</div>
                      <h3 className="text-xl font-extrabold text-red-400 mb-2">BẠN CÓ CHẮC CHẮN MUỐN NHẢY TÀU?</h3>
                      <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                        Hành động này sẽ <span className="text-red-400 font-bold">LOẠI BẠN HOÀN TOÀN KHỎI VÁN ĐẤU (ELIMINATED)</span> và bạn sẽ mất toàn bộ súng. Cả 2 cards bài trong Nhật ký sẽ bị hủy bí mật.
                      </p>
                      <div className="flex space-x-3 justify-center">
                        <button
                          id="btn-cancel-overboard"
                          onClick={() => setShowOverboardConfirm(false)}
                          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          id="btn-confirm-overboard"
                          onClick={() => onNavigatorJumpOverboard && onNavigatorJumpOverboard()}
                          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/50 transition-colors"
                        >
                          CONFIRM NHẢY TÀU
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl animate-bounce">
                  🧭
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Hoa Tiêu Đang Định Đoạt Hướng Đi</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Hoa tiêu <span className="text-emerald-300 font-semibold">{navigator?.nickname}</span> đang mở Hộp Nhật Ký và lựa chọn hướng điều hướng cho con tàu.
                </p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: EMERGENCY NAVIGATOR SELECTION */}
        {currentPhase === 'EMERGENCY_NAVIGATOR_SELECTION' && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-rose-500/60 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full filter blur-3xl pointer-events-none" />

            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-2 animate-pulse">
                🚨 TÌNH HUỐNG KHẨN CẤP
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Hoa Tiêu Đã Tự Nhảy Tàu!</h2>
              <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                Hoa tiêu trước đó đã nhảy xuống biển và bị loại khỏi trò chơi. Thuyền trưởng cần bổ nhiệm ngay một <span className="text-rose-300 font-semibold">Hoa Tiêu Khẩn Cấp</span> mới để tiếp tục hành trình.
              </p>
            </div>

            {isCaptain ? (
              <div className="max-w-xl mx-auto">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Chọn 1 Thủy Thủ Làm Hoa Tiêu Khẩn Cấp:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {eligibleEmergencyCandidates.map(cand => {
                    const isSelected = selectedEmergencyCandidateId === cand.id;
                    const isOffDuty = cand.status === 'OFF_DUTY';

                    return (
                      <div
                        key={cand.id}
                        id={`candidate-emergency-${cand.id}`}
                        onClick={() => setSelectedEmergencyCandidateId(cand.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center space-x-3 ${
                          isSelected
                            ? 'bg-rose-950/60 border-rose-400 ring-2 ring-rose-400/40 text-white'
                            : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500 text-slate-300'
                        }`}
                      >
                        <span className="text-3xl">{cand.avatar || '🧑‍✈️'}</span>
                        <div className="overflow-hidden flex-1">
                          <div className="font-bold truncate">{cand.nickname}</div>
                          <div className="text-xs text-slate-400 flex items-center space-x-2">
                            <span>Súng: {cand.gunCount} 🔫</span>
                            {isOffDuty && <span className="text-amber-400 font-medium">(Nghỉ phép)</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center">
                  <button
                    id="btn-confirm-emergency-navigator"
                    disabled={!selectedEmergencyCandidateId}
                    onClick={() => selectedEmergencyCandidateId && onAppointEmergencyNavigator && onAppointEmergencyNavigator(selectedEmergencyCandidateId)}
                    className={`px-8 py-3.5 rounded-xl font-bold text-base shadow-xl transition-all duration-200 flex items-center space-x-2 ${
                      selectedEmergencyCandidateId
                        ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white cursor-pointer scale-100 hover:scale-105'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>🚨</span>
                    <span>EMERGENCY NAVIGATOR APPOINTMENT</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="text-4xl mb-3">👑</div>
                <h4 className="text-lg font-bold text-white mb-1">Đang Chờ Thuyền Trưởng Bổ Nhiệm</h4>
                <p className="text-sm text-slate-400">
                  Thuyền trưởng <span className="text-amber-300 font-semibold">{captain?.nickname}</span> đang chọn một Hoa tiêu mới từ các thành viên còn lại trên tàu.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: EXECUTE ACTIONS PHASE */}
        {currentPhase === 'EXECUTE_ACTIONS' && room?.executedNavigationCard && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-indigo-500/40 p-6 md:p-8 shadow-2xl text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-3">
              KẾT QUẢ ĐIỀU HƯỚNG
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6">Con Tàu Đang Rẽ Sóng Tiến Về Phía Trước!</h2>

            <div className="max-w-md mx-auto mb-6">
              {(() => {
                const card = room.executedNavigationCard;
                const badge = getCardBadge(card.direction || card.color);
                const actionInfo = getActionDescription(card.action);

                return (
                  <div className={`rounded-2xl p-6 border-2 bg-gradient-to-b ${getCardStyle(card.direction || card.color)} shadow-2xl`}>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg}`}>
                      {badge.icon} {badge.label}
                    </span>
                    <div className="my-6">
                      <div className="text-6xl mb-3 animate-pulse">{badge.icon}</div>
                      <div className="text-2xl font-bold text-white">{actionInfo.title}</div>
                      <div className="text-xs text-slate-200 mt-2">{actionInfo.desc}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationPhase;
