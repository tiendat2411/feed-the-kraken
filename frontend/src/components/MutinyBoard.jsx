import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Compass, 
  Award, 
  Crosshair, 
  Clock, 
  CheckCircle2, 
  VolumeX, 
  Flame, 
  Swords, 
  Check, 
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Shield
} from 'lucide-react';
import { SoundEngine } from '../utils/soundEffects';
import PanelWood from './ui/PanelWood';
import CardParchment from './ui/CardParchment';
import ButtonWood from './ui/ButtonWood';

const MutinyBoard = ({
  room,
  currentUserId,
  myRole,
  onAppointTeam,
  onSubmitVote,
  onConfirmOutcome,
  onEliminateTieCandidate,
  onCutTongue
}) => {
  const [selectedLt, setSelectedLt] = useState(null);
  const [selectedNav, setSelectedNav] = useState(null);
  const [gunVote, setGunVote] = useState(0);
  const [hasVotedLocal, setHasVotedLocal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const players = room?.players || [];
  const myId = room?.myId || currentUserId;
  const me = players.find(p => p.id === myId || p.sessionToken === currentUserId) || {};
  const isCaptain = room?.captainId === me.id;
  const session = room?.mutinySession || {};
  const gamePhase = room?.gamePhase;

  // Synchronized countdown timer with server deadline
  useEffect(() => {
    if (!room?.phaseDeadline) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.phaseDeadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [room?.phaseDeadline]);

  // Gunshot audio trigger upon mutiny outcome revelation
  useEffect(() => {
    if (gamePhase === 'MUTINY_REVEALED') {
      SoundEngine.playGunshot();
    }
  }, [gamePhase]);

  // Reset local vote selection on phase transition
  useEffect(() => {
    if (gamePhase === 'LOYALTY_CHECK') {
      const myVote = session.votes?.find(v => v.playerId === me.id);
      if (myVote && myVote.hasVoted) {
        setHasVotedLocal(true);
      } else {
        setHasVotedLocal(false);
        setGunVote(0);
      }
    }
  }, [gamePhase, session.votes, me.id]);

  const handleAppointSubmit = () => {
    if (!selectedLt || !selectedNav) return;
    onAppointTeam(selectedLt, selectedNav);
  };

  const handleVoteSubmit = () => {
    onSubmitVote(gunVote);
    setHasVotedLocal(true);
  };

  const captainPlayer = players.find(p => p.id === room?.captainId) || {};
  const ltPlayer = players.find(p => p.id === (room?.lieutenantId || room?.nominatedLieutenantId || session?.nominatedLieutenantId));
  const navPlayer = players.find(p => p.id === (room?.navigatorId || room?.nominatedNavigatorId || session?.nominatedNavigatorId));

  const totalRequiredGuns = session.requiredGuns || 3;
  const votesList = session.votes || [];
  const currentChooser = players.find(p => p.id === session.currentChooser);

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 md:p-8 space-y-6 select-none animate-fade-in-up">

      {/* ====================================================================
          1. Command Deck Header: Incumbent Captain & Personal Arsenal
          ==================================================================== */}
      <PanelWood glow="firelight" nails={true} className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Captain Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded bg-abyss border-2 border-gold flex items-center justify-center text-3xl shadow-firelight shrink-0">
              {captainPlayer.avatar || '🧑‍✈️'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-heading text-xs uppercase tracking-widest text-gold">
                <Crown size={15} className="text-gold-bright" />
                <span>Incumbent Ship Captain</span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-parchment-bright">
                {captainPlayer.nickname || captainPlayer.name || 'Captain'}
              </h2>
            </div>
          </div>

          {/* Player Personal Inventory Summary */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
            {/* Gun Count Stash */}
            <div className="bg-abyss px-3.5 py-1.5 rounded border border-hull-light flex items-center gap-2 text-xs font-heading">
              <Crosshair size={14} className="text-pirate-glow" />
              <div>
                <span className="text-[10px] text-parchment-dim uppercase block">Armory</span>
                <span className="font-bold text-pirate-glow text-sm">🔫 {me.gunCount ?? 3} Guns</span>
              </div>
            </div>

            {/* Secret Role Pill */}
            <div className="bg-abyss px-3.5 py-1.5 rounded border border-gold-dim/40 flex items-center gap-2 text-xs font-heading">
              <span className="text-sm">🎭</span>
              <div>
                <span className="text-[10px] text-parchment-dim uppercase block">True Faction</span>
                <span className="font-bold text-gold-bright">{myRole || room?.myRole || 'Sailor'}</span>
              </div>
            </div>

            {/* Speech Restriction (Cut Tongue) Badge */}
            {me.speechRestricted && (
              <div className="bg-blood/20 border border-blood/60 px-3 py-1.5 rounded flex items-center gap-1.5 text-blood text-xs font-heading font-bold animate-pulse">
                <VolumeX size={14} /> Tongue Cut
              </div>
            )}
          </div>

        </div>
      </PanelWood>

      {/* ====================================================================
          2. Officers Display Bar (Lieutenant & Navigator Nominees)
          ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Lieutenant Card */}
        <PanelWood
          variant={ltPlayer ? 'raised' : 'default'}
          className={`p-3.5 sm:p-4 border ${ltPlayer ? 'border-sailor/50 shadow-sm' : 'border-dashed border-hull-light/50'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded bg-abyss border border-sailor/40 flex items-center justify-center text-2xl shrink-0">
              {ltPlayer ? ltPlayer.avatar : '🎖️'}
            </div>
            <div>
              <div className="font-heading text-[11px] font-bold uppercase tracking-wider text-sailor-glow flex items-center gap-1">
                <Award size={13} /> Lieutenant (Thuyền Phó)
                {room?.nominatedLieutenantId && !room?.lieutenantId && (
                  <span className="text-[9px] text-gold-bright">(Nominated)</span>
                )}
              </div>
              <div className="font-heading font-bold text-sm sm:text-base text-parchment-bright">
                {ltPlayer ? (ltPlayer.nickname || ltPlayer.name) : 'Awaiting Appointment...'}
              </div>
            </div>
          </div>
        </PanelWood>

        {/* Navigator Card */}
        <PanelWood
          variant={navPlayer ? 'raised' : 'default'}
          className={`p-3.5 sm:p-4 border ${navPlayer ? 'border-verdigris/50 shadow-sm' : 'border-dashed border-hull-light/50'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded bg-abyss border border-verdigris/40 flex items-center justify-center text-2xl shrink-0">
              {navPlayer ? navPlayer.avatar : '🧭'}
            </div>
            <div>
              <div className="font-heading text-[11px] font-bold uppercase tracking-wider text-verdigris-glow flex items-center gap-1">
                <Compass size={13} /> Navigator (Hoa Tiêu)
                {room?.nominatedNavigatorId && !room?.navigatorId && (
                  <span className="text-[9px] text-gold-bright">(Nominated)</span>
                )}
              </div>
              <div className="font-heading font-bold text-sm sm:text-base text-parchment-bright">
                {navPlayer ? (navPlayer.nickname || navPlayer.name) : 'Awaiting Appointment...'}
              </div>
            </div>
          </div>
        </PanelWood>
      </div>

      {/* ====================================================================
          3. DYNAMIC PHASE VIEW
          ==================================================================== */}

      {/* --------------------------------------------------------------------
          PHASE 1: APPOINT NAVIGATION TEAM
          -------------------------------------------------------------------- */}
      {(gamePhase === 'DAY_1_CREW_SELECTION' || gamePhase === 'APPOINT_TEAM') && (
        <CardParchment stains={true} className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="inline-block px-3 py-0.5 bg-hull border border-gold-dim/40 text-gold-bright text-[10px] font-heading font-bold rounded uppercase tracking-widest">
              Phase 1: Appoint Navigation Officers
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-parchment-bright uppercase">
              {isCaptain ? 'Select Your Lieutenant & Navigator' : 'The Captain is Weighing Their Choice...'}
            </h3>
            <p className="text-xs sm:text-sm text-parchment-dim leading-relaxed">
              {isCaptain
                ? 'Nominate 1 Lieutenant (draws 2 cards) and 1 Navigator (steers 1 card). You cannot appoint yourself.'
                : 'Confer with the crew, petition the Captain, or ready your flintlocks for Mutiny!'}
            </p>
          </div>

          {isCaptain && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {players.map((p) => {
                  const isMePlayer = p.id === me.id;
                  const isOffDuty = p.status === 'OFF_DUTY';
                  const isEliminated = p.status === 'ELIMINATED';
                  const disabled = isMePlayer || isOffDuty || isEliminated;

                  const isSelectedLt = selectedLt === p.id;
                  const isSelectedNav = selectedNav === p.id;

                  return (
                    <PanelWood
                      key={p.id}
                      variant={isSelectedLt || isSelectedNav ? 'raised' : 'default'}
                      glow={isSelectedLt ? 'firelight' : isSelectedNav ? 'verdigris' : 'none'}
                      nails={true}
                      className={`p-3.5 border flex flex-col justify-between gap-3 ${
                        disabled
                          ? 'opacity-40 cursor-not-allowed border-hull-light/40'
                          : isSelectedLt
                          ? 'border-sailor'
                          : isSelectedNav
                          ? 'border-verdigris'
                          : 'border-hull-light hover:border-gold-dim/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-abyss border border-hull-light flex items-center justify-center text-xl shrink-0">
                          {p.avatar}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <div className="font-heading font-bold text-xs sm:text-sm text-parchment-bright truncate flex items-center gap-1">
                            <span className="truncate">{p.nickname || p.name}</span>
                            {isMePlayer && <span className="text-[9px] text-gold">(You)</span>}
                          </div>
                          <div className="text-[11px] text-parchment-dim font-body">
                            {isOffDuty ? 'Off-Duty (Nghỉ ca)' : isEliminated ? 'Cast Overboard' : `🔫 ${p.gunCount ?? 3} Guns`}
                          </div>
                        </div>
                      </div>

                      {!disabled && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hull-light/40">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelectedLt) setSelectedLt(null);
                              else {
                                setSelectedLt(p.id);
                                if (isSelectedNav) setSelectedNav(null);
                              }
                            }}
                            className={`py-1.5 px-2 rounded text-[11px] font-heading font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 border ${
                              isSelectedLt
                                ? 'bg-sailor text-white border-sailor-glow shadow-sm'
                                : 'bg-hull-dark/80 text-sailor-glow border-hull-light hover:border-sailor/40'
                            }`}
                          >
                            <Award size={12} /> Lieutenant
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (isSelectedNav) setSelectedNav(null);
                              else {
                                setSelectedNav(p.id);
                                if (isSelectedLt) setSelectedLt(null);
                              }
                            }}
                            className={`py-1.5 px-2 rounded text-[11px] font-heading font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 border ${
                              isSelectedNav
                                ? 'bg-verdigris text-white border-verdigris-glow shadow-sm'
                                : 'bg-hull-dark/80 text-verdigris-glow border-hull-light hover:border-verdigris/40'
                            }`}
                          >
                            <Compass size={12} /> Navigator
                          </button>
                        </div>
                      )}
                    </PanelWood>
                  );
                })}
              </div>

              <div className="flex justify-center pt-2">
                <ButtonWood
                  variant="gold"
                  size="lg"
                  onClick={handleAppointSubmit}
                  disabled={!selectedLt || !selectedNav}
                  icon={<CheckCircle2 size={18} />}
                >
                  CONFIRM APPOINTED TEAM
                </ButtonWood>
              </div>
            </div>
          )}
        </CardParchment>
      )}

      {/* --------------------------------------------------------------------
          PHASE 2: LOYALTY CHECK / MUTINY VOTE
          -------------------------------------------------------------------- */}
      {gamePhase === 'LOYALTY_CHECK' && (
        <CardParchment stains={true} className="p-6 md:p-8 space-y-6 border-pirate/50">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-pirate/20 border border-pirate/40 text-pirate-glow text-[10px] font-heading font-bold rounded uppercase tracking-widest">
              <Flame size={12} className="text-pirate-glow" /> Loyalty Check: Will You Mutiny?
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-black text-parchment-bright uppercase">
              MUTINY AGAINST THE CAPTAIN?
            </h3>
            <p className="text-xs sm:text-sm text-parchment-dim leading-relaxed">
              Requires a total of <strong className="text-pirate-glow font-black text-base">{totalRequiredGuns} Flintlocks</strong> across all crew members to overthrow the Captain! The highest bidder will ascend as the new Captain.
            </p>
            {timeLeft !== null && (
              <div className="flex items-center justify-center gap-1.5 text-gold font-heading text-xs pt-1">
                <Clock size={14} /> Time Remaining: <strong>{timeLeft}s</strong>
              </div>
            )}
          </div>

          {/* Voting Box for Non-Captains */}
          {!isCaptain && (
            <PanelWood glow="none" className="max-w-lg mx-auto p-5 sm:p-6 text-center space-y-5 border-pirate/40">
              <div>
                <h4 className="font-heading font-bold text-sm sm:text-base text-parchment-bright uppercase">
                  Secret Flintlock Bid
                </h4>
                <p className="text-xs text-parchment-dim mt-0.5">
                  Your guns are only discarded if the Mutiny succeeds. Your bid remains confidential.
                </p>
              </div>

              {!hasVotedLocal ? (
                <div className="space-y-5">
                  {/* Gun Selector Coins */}
                  <div className="flex justify-center items-center gap-2.5 flex-wrap">
                    {Array.from({ length: (me.gunCount || 0) + 1 }).map((_, guns) => (
                      <button
                        key={guns}
                        type="button"
                        onClick={() => setGunVote(guns)}
                        className={`w-12 h-12 rounded border transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
                          gunVote === guns
                            ? 'bg-pirate border-pirate-glow text-white shadow-lg scale-110'
                            : 'bg-abyss border-hull-light text-parchment-dim hover:border-gold-dim'
                        }`}
                      >
                        <span className="font-heading font-bold text-base">{guns}</span>
                        <span className="text-[9px] opacity-75">🔫</span>
                      </button>
                    ))}
                  </div>

                  <ButtonWood
                    variant="danger"
                    size="lg"
                    fullWidth={true}
                    onClick={handleVoteSubmit}
                    icon={<Crosshair size={18} />}
                  >
                    CONFIRM BID ({gunVote} GUNS)
                  </ButtonWood>
                </div>
              ) : (
                <div className="p-4 bg-abyss rounded border border-verdigris/50 text-verdigris space-y-1.5 animate-fade-in-up">
                  <CheckCircle2 size={30} className="mx-auto text-verdigris animate-pulse" />
                  <div className="font-heading font-bold text-sm text-parchment-bright">
                    Locked In {gunVote} Guns In Secret!
                  </div>
                  <p className="text-xs text-parchment-dim">
                    Awaiting remaining crew members to cast their bids...
                  </p>
                </div>
              )}
            </PanelWood>
          )}

          {isCaptain && (
            <PanelWood glow="firelight" className="max-w-lg mx-auto p-5 text-center space-y-2 border-gold-dim/40">
              <ShieldAlert size={30} className="mx-auto text-gold" />
              <h4 className="font-heading font-bold text-sm text-parchment-bright uppercase">
                You are the Incumbent Captain
              </h4>
              <p className="text-xs text-parchment-dim">
                The Captain cannot vote in mutinies against themselves. Stand firm and observe your crew's loyalty!
              </p>
            </PanelWood>
          )}

          {/* Voting Grid Indicators */}
          <div className="space-y-2.5 max-w-3xl mx-auto">
            <h4 className="font-heading text-[10px] uppercase font-bold tracking-widest text-parchment-dim text-center">
              Crew Bidding Status
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {players.filter(p => p.id !== room?.captainId).map((p) => {
                const voted = votesList.find(v => v.playerId === p.id)?.hasVoted;
                return (
                  <div key={p.id} className="p-2.5 bg-abyss/80 border border-hull-light rounded flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <div className="text-base shrink-0">{p.avatar}</div>
                      <span className="font-heading text-xs text-parchment-bright truncate">{p.nickname || p.name}</span>
                    </div>
                    <div className="shrink-0">
                      {voted ? (
                        <span className="flex items-center gap-1 text-[10px] text-verdigris font-heading font-bold bg-verdigris/10 px-1.5 py-0.5 rounded border border-verdigris/30">
                          <Check size={10} /> Locked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-gold-dim font-heading font-bold bg-hull px-1.5 py-0.5 rounded animate-pulse">
                          <Clock size={10} /> Bidding
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardParchment>
      )}

      {/* --------------------------------------------------------------------
          PHASE 3: MUTINY REVEALED
          -------------------------------------------------------------------- */}
      {gamePhase === 'MUTINY_REVEALED' && (
        <CardParchment stains={true} className="p-6 md:p-8 space-y-6 animate-gun-shake border-gold">
          <div className="text-center space-y-2">
            <span className={`inline-block px-3 py-0.5 text-xs font-heading font-black rounded uppercase tracking-wider border ${
              session.isSuccess ? 'bg-pirate/20 text-pirate-glow border-pirate' : 'bg-verdigris/20 text-verdigris-glow border-verdigris'
            }`}>
              {session.isSuccess ? '🔥 MUTINY SUCCEEDED' : '🛡️ MUTINY QUELLED'}
            </span>

            <h3 className="font-heading text-2xl sm:text-4xl font-black text-parchment-bright uppercase">
              {session.isSuccess ? 'THE CAPTAIN HAS BEEN OVERTHROWN!' : 'THE CAPTAIN HAS RETAINED COMMAND!'}
            </h3>

            <div className="font-heading text-lg sm:text-xl font-bold text-parchment">
              Total Flintlocks Bid: <span className="text-pirate-glow font-black text-2xl">{session.totalGuns || 0}</span> / <span className="text-parchment-dim">{session.requiredGuns} Required</span>
            </div>
          </div>

          {/* Revealed Bids Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {votesList.map((v) => {
              const voter = players.find(p => p.id === v.playerId);
              const isWinner = session.winnerId === v.playerId;
              return (
                <PanelWood
                  key={v.playerId}
                  glow={isWinner ? 'firelight' : 'none'}
                  variant={isWinner ? 'raised' : 'default'}
                  className={`p-3 text-center space-y-1 border ${
                    isWinner ? 'border-gold ring-1 ring-gold' : 'border-hull-light'
                  }`}
                >
                  <div className="text-2xl">{voter?.avatar || '🧑‍✈️'}</div>
                  <div className="font-heading font-bold text-xs text-parchment-bright truncate flex items-center justify-center gap-1">
                    <span className="truncate">{voter?.nickname || voter?.name}</span>
                    {isWinner && <Crown size={13} className="text-gold-bright shrink-0" />}
                  </div>
                  <div className="font-heading font-black text-sm text-pirate-glow bg-abyss py-0.5 rounded border border-hull-light">
                    🔫 {v.guns ?? 0}
                  </div>
                </PanelWood>
              );
            })}
          </div>

          {/* Captain Confirmation Transition Action */}
          <div className="p-5 bg-hull-dark/95 border border-hull-light rounded max-w-xl mx-auto text-center space-y-3">
            {isCaptain ? (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-parchment font-body">
                  {session.isSuccess
                    ? 'You are the newly crowned Captain! Click below to begin appointing your officers.'
                    : 'The mutiny has been crushed. Click below to escort your navigation team to the helm.'}
                </p>
                <ButtonWood
                  variant="gold"
                  size="lg"
                  onClick={onConfirmOutcome}
                  icon={<ChevronRight size={20} />}
                  className="mx-auto"
                >
                  {session.isSuccess ? 'APPOINT NEW OFFICERS' : 'PROCEED TO NAVIGATION'}
                </ButtonWood>
              </div>
            ) : (
              <div className="text-parchment-dim text-xs font-heading flex items-center justify-center gap-2 animate-pulse">
                <Clock size={15} /> Awaiting Captain (<strong className="text-parchment-bright">{captainPlayer.nickname}</strong>) to confirm and proceed...
              </div>
            )}
          </div>
        </CardParchment>
      )}

      {/* --------------------------------------------------------------------
          PHASE 4: TIE BREAKER CHAIN ELIMINATION
          -------------------------------------------------------------------- */}
      {gamePhase === 'MUTINY_TIE_BREAKER' && (
        <CardParchment stains={true} className="p-6 md:p-8 space-y-6 border-cult">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-cult/20 border border-cult/40 text-cult-glow text-[10px] font-heading font-bold rounded uppercase tracking-widest">
              <Swords size={12} className="text-cult-glow" /> Tie-Breaker Chain Elimination
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-black text-parchment-bright uppercase">
              MUTINY TIE-BREAKER DUEL
            </h3>
            <p className="text-xs sm:text-sm text-parchment-dim leading-relaxed">
              Multiple sailors tied for the highest gun bid! The current decider must eliminate one contender; the eliminated contender then eliminates the next until one remains!
            </p>
            <div className="pt-1">
              <span className="text-xs font-heading font-bold text-gold bg-abyss px-3 py-1 rounded border border-gold-dim/40">
                Current Decider: {currentChooser?.nickname || 'Resolving...'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-w-2xl mx-auto">
            {(session.tieCandidates || []).map((candId) => {
              const cand = players.find(p => p.id === candId);
              const isMyTurnToChoose = session.currentChooser === me.id;
              return (
                <PanelWood key={candId} nails={true} className="p-4 text-center space-y-3 border-cult/40">
                  <div className="text-3xl">{cand?.avatar || '🧑‍✈️'}</div>
                  <div className="font-heading font-bold text-sm text-parchment-bright">{cand?.nickname || cand?.name}</div>

                  {isMyTurnToChoose && candId !== me.id && (
                    <ButtonWood
                      variant="danger"
                      size="sm"
                      fullWidth={true}
                      onClick={() => onEliminateTieCandidate(candId)}
                    >
                      ELIMINATE CONTENDER
                    </ButtonWood>
                  )}
                </PanelWood>
              );
            })}
          </div>
        </CardParchment>
      )}

    </div>
  );
};

export default MutinyBoard;
