import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Compass, 
  Award, 
  Crosshair, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ShieldAlert, 
  VolumeX, 
  Flame, 
  Users,
  Swords,
  Check,
  UserCheck
} from 'lucide-react';
import { SoundEngine } from '../utils/soundEffects';

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

  const players = room.players || [];
  const myId = room.myId || currentUserId;
  const me = players.find(p => p.id === myId || p.sessionToken === currentUserId) || {};
  const isCaptain = room.captainId === me.id;
  const session = room.mutinySession || {};
  const gamePhase = room.gamePhase;

  // Countdown timer calculation
  useEffect(() => {
    if (!room.phaseDeadline) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.phaseDeadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [room.phaseDeadline]);

  // Play gunshot sound when MUTINY_REVEALED
  useEffect(() => {
    if (gamePhase === 'MUTINY_REVEALED') {
      SoundEngine.playGunshot();
    }
  }, [gamePhase]);

  // Reset local vote state when phase changes
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

  const captainPlayer = players.find(p => p.id === room.captainId) || {};
  const ltPlayer = players.find(p => p.id === (room.lieutenantId || room.nominatedLieutenantId || session.nominatedLieutenantId));
  const navPlayer = players.find(p => p.id === (room.navigatorId || room.nominatedNavigatorId || session.nominatedNavigatorId));

  const totalRequiredGuns = session.requiredGuns || 3;
  const votesList = session.votes || [];
  const currentChooser = players.find(p => p.id === session.currentChooser);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 1. Header & Command Deck */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-600 to-amber-400 p-0.5 shadow-lg shadow-yellow-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-3xl">
                {captainPlayer.avatar || '🧑‍✈️'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Crown className="text-yellow-400" size={20} />
                <span className="text-xs uppercase tracking-widest text-yellow-400 font-bold">Incumbent Captain</span>
              </div>
              <h2 className="text-2xl font-black text-white">{captainPlayer.nickname || captainPlayer.name || 'Captain'}</h2>
            </div>
          </div>

          {/* Role & Inventory Summary */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-900/80 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
              <Crosshair className="text-red-400" size={18} />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Armory</div>
                <div className="text-lg font-black text-red-400">🔫 {me.gunCount ?? 3}</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
              <div className="text-xl">🎭</div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Secret Role</div>
                <div className="text-sm font-bold text-blue-400">{myRole || room.myRole || 'Sailor'}</div>
              </div>
            </div>

            {me.speechRestricted && (
              <div className="bg-red-500/20 border border-red-500/40 px-3 py-2 rounded-2xl flex items-center gap-2 text-red-300 text-xs font-bold animate-pulse">
                <VolumeX size={16} /> Silenced (Tongue Cut)
              </div>
            )}
          </div>
        </div>

        {/* 2. Officers Display Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border flex items-center gap-4 transition ${ltPlayer ? 'bg-indigo-950/40 border-indigo-500/40 shadow-lg shadow-indigo-500/10' : 'bg-slate-900/40 border-white/5 border-dashed'}`}>
            <div className="w-12 h-12 rounded-xl bg-indigo-900/40 border border-indigo-400/30 flex items-center justify-center text-2xl">
              {ltPlayer ? ltPlayer.avatar : '🎖️'}
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-indigo-400 flex items-center gap-1.5">
                <Award size={14} /> Lieutenant
                {room.nominatedLieutenantId && !room.lieutenantId && <span className="text-[10px] text-yellow-400">(Nominated)</span>}
              </div>
              <div className="font-bold text-lg text-slate-200">
                {ltPlayer ? (ltPlayer.nickname || ltPlayer.name) : 'Not Appointed'}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center gap-4 transition ${navPlayer ? 'bg-cyan-950/40 border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/40 border-white/5 border-dashed'}`}>
            <div className="w-12 h-12 rounded-xl bg-cyan-900/40 border border-cyan-400/30 flex items-center justify-center text-2xl">
              {navPlayer ? navPlayer.avatar : '🧭'}
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                <Compass size={14} /> Navigator
                {room.nominatedNavigatorId && !room.navigatorId && <span className="text-[10px] text-yellow-400">(Nominated)</span>}
              </div>
              <div className="font-bold text-lg text-slate-200">
                {navPlayer ? (navPlayer.nickname || navPlayer.name) : 'Not Appointed'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Dynamic Phase View */}

        {/* PHASE 1: APPOINT NAVIGATION TEAM */}
        {(gamePhase === 'DAY_1_CREW_SELECTION' || gamePhase === 'APPOINT_TEAM') && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full uppercase tracking-wider">
                Phase 1: Navigation Team Appointment
              </span>
              <h3 className="text-3xl font-extrabold">
                {isCaptain ? 'Select Lieutenant and Navigator' : 'Captain is deliberating appointments...'}
              </h3>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {isCaptain 
                  ? 'Select 1 Lieutenant (draws 2 cards) and 1 Navigator (steers 1 card). You cannot appoint yourself.'
                  : 'Debate, persuade the Captain for office, or ready your guns for Mutiny!'}
              </p>
            </div>

            {isCaptain && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {players.map((p) => {
                    const isMePlayer = p.id === me.id;
                    const isOffDuty = p.status === 'OFF_DUTY';
                    const isEliminated = p.status === 'ELIMINATED';
                    const disabled = isMePlayer || isOffDuty || isEliminated;

                    const isSelectedLt = selectedLt === p.id;
                    const isSelectedNav = selectedNav === p.id;

                    return (
                      <div 
                        key={p.id}
                        className={`p-4 rounded-2xl border transition relative flex flex-col justify-between gap-3 ${
                          disabled ? 'bg-slate-900/20 border-white/5 opacity-40 cursor-not-allowed' :
                          isSelectedLt ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/50' :
                          isSelectedNav ? 'bg-cyan-950/60 border-cyan-500 ring-2 ring-cyan-500/50' :
                          'bg-slate-900/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                            {p.avatar}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold truncate flex items-center gap-1.5">
                              {p.nickname || p.name}
                              {isMePlayer && <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">YOU</span>}
                            </div>
                            <div className="text-xs text-slate-400">
                              {isOffDuty ? 'Off-duty' : isEliminated ? 'Eliminated' : `🔫 ${p.gunCount ?? 3} guns`}
                            </div>
                          </div>
                        </div>

                        {!disabled && (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => {
                                if (isSelectedLt) {
                                  setSelectedLt(null);
                                } else {
                                  setSelectedLt(p.id);
                                  if (isSelectedNav) setSelectedNav(null);
                                }
                              }}
                              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                                isSelectedLt 
                                  ? 'bg-indigo-600 text-white shadow-md' 
                                  : 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-500/30'
                              }`}
                            >
                              <Award size={13} /> Lieutenant
                            </button>

                            <button
                              onClick={() => {
                                if (isSelectedNav) {
                                  setSelectedNav(null);
                                } else {
                                  setSelectedNav(p.id);
                                  if (isSelectedLt) setSelectedLt(null);
                                }
                              }}
                              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                                isSelectedNav 
                                  ? 'bg-cyan-600 text-white shadow-md' 
                                  : 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-500/30'
                              }`}
                            >
                              <Compass size={13} /> Navigator
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleAppointSubmit}
                    disabled={!selectedLt || !selectedNav}
                    className={`px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition shadow-xl ${
                      selectedLt && selectedNav 
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 shadow-yellow-500/20 hover:scale-105 cursor-pointer' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <CheckCircle2 size={22} />
                    CONFIRM NAVIGATION TEAM
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHASE 2: LOYALTY CHECK / MUTINY VOTE */}
        {gamePhase === 'LOYALTY_CHECK' && (
          <div className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl shadow-red-950/30">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mx-auto">
                <Flame size={14} className="text-red-400" /> Loyalty Check Vote
              </span>
              <h3 className="text-3xl font-extrabold text-red-100">WILL YOU MUTINY AGAINST THE CAPTAIN?</h3>
              <p className="text-slate-300 text-sm max-w-xl mx-auto">
                At least <strong className="text-red-400 font-extrabold text-base">{totalRequiredGuns} Guns</strong> are required to overthrow the Captain! If mutiny succeeds, the highest gun committer claims the Captaincy.
              </p>
              {timeLeft !== null && (
                <div className="flex items-center justify-center gap-2 text-yellow-400 font-mono text-sm pt-2">
                  <Clock size={16} /> Disconnect grace period: <strong>{timeLeft}s</strong>
                </div>
              )}
            </div>

            {/* Voting Form for Non-Captains */}
            {!isCaptain && (
              <div className="max-w-xl mx-auto bg-slate-900/80 border border-red-500/30 p-6 rounded-3xl text-center space-y-6 shadow-xl">
                <div>
                  <h4 className="text-lg font-bold text-slate-200">Guns to Commit Covertly</h4>
                  <p className="text-xs text-slate-400 mt-1">Your guns are only spent if the mutiny succeeds. Your pledge remains strictly confidential.</p>
                </div>

                {!hasVotedLocal ? (
                  <div className="space-y-6">
                    <div className="flex justify-center items-center gap-3">
                      {Array.from({ length: (me.gunCount || 0) + 1 }).map((_, guns) => (
                        <button
                          key={guns}
                          onClick={() => setGunVote(guns)}
                          className={`w-14 h-14 rounded-2xl text-xl font-black transition flex flex-col items-center justify-center border ${
                            gunVote === guns 
                              ? 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400 text-white shadow-lg shadow-red-500/40 scale-110' 
                              : 'bg-slate-800/80 border-white/10 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <span>{guns}</span>
                          <span className="text-[10px] opacity-70">🔫</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleVoteSubmit}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg shadow-xl shadow-red-600/30 hover:scale-[1.02] transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Crosshair size={20} />
                      CONFIRM PLEDGE OF {gunVote} GUNS
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-emerald-300 space-y-2">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-400 animate-bounce" />
                    <div className="font-bold text-lg">You have covertly pledged {gunVote} guns!</div>
                    <p className="text-xs text-slate-400">Waiting for fellow crew members to cast their votes...</p>
                  </div>
                )}
              </div>
            )}

            {isCaptain && (
              <div className="p-6 bg-yellow-950/30 border border-yellow-500/30 rounded-3xl max-w-lg mx-auto text-center space-y-2">
                <ShieldAlert size={36} className="mx-auto text-yellow-400" />
                <h4 className="font-bold text-yellow-200">You are the Captain</h4>
                <p className="text-xs text-slate-300">As Captain, you cannot vote in a mutiny against yourself. Observe the loyalty of your crew!</p>
              </div>
            )}

            {/* Voting Grid Indicator (Hidden Votes) */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400 text-center">Crew Ballot Status</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {players.filter(p => p.id !== room.captainId).map((p) => {
                  const voted = votesList.find(v => v.playerId === p.id)?.hasVoted;
                  return (
                    <div key={p.id} className="p-3 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="text-xl">{p.avatar}</div>
                        <span className="text-sm font-semibold truncate">{p.nickname || p.name}</span>
                      </div>
                      <div>
                        {voted ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <Check size={12} /> Committed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-md animate-pulse">
                            <Clock size={12} /> Deliberating
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: MUTINY REVEALED & CAPTAIN CONFIRMATION */}
        {gamePhase === 'MUTINY_REVEALED' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl animate-gun-shake">
            <div className="text-center space-y-3">
              <span className={`px-4 py-1 text-xs font-black rounded-full uppercase tracking-wider ${
                session.isSuccess ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {session.isSuccess ? '🔥 MUTINY SUCCEEDED' : '🛡️ MUTINY FAILED'}
              </span>
              
              <h3 className="text-4xl font-black">
                {session.isSuccess ? 'CAPTAIN HAS BEEN OVERTHROWN!' : 'CAPTAIN RETAINS POWER!'}
              </h3>

              <div className="text-2xl font-black text-slate-200">
                Total guns: <span className="text-red-400">{session.totalGuns || 0}</span> / <span className="text-slate-400">{session.requiredGuns} guns required</span>
              </div>
            </div>

            {/* Revealed Votes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {votesList.map((v) => {
                const voter = players.find(p => p.id === v.playerId);
                const isWinner = session.winnerId === v.playerId;
                return (
                  <div 
                    key={v.playerId} 
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition ${
                      isWinner 
                        ? 'bg-yellow-950/50 border-yellow-500 ring-2 ring-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                        : 'bg-slate-900/60 border-white/10'
                    }`}
                  >
                    <div className="text-3xl">{voter?.avatar || '🧑‍✈️'}</div>
                    <div className="font-bold text-sm truncate w-full flex items-center justify-center gap-1">
                      {voter?.nickname || voter?.name}
                      {isWinner && <Crown size={14} className="text-yellow-400" />}
                    </div>
                    <div className="text-lg font-black text-red-400 bg-red-950/40 px-3 py-1 rounded-xl border border-red-500/20">
                      🔫 {v.guns ?? 0}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Captain Confirmation Button (Game Pace Logic) */}
            <div className="p-6 bg-slate-900/80 border border-white/10 rounded-3xl max-w-2xl mx-auto text-center space-y-4">
              {isCaptain ? (
                <div className="space-y-4">
                  <div className="text-sm text-slate-300">
                    {session.isSuccess 
                      ? 'You are the New Captain! Click below to appoint your Navigation Team.' 
                      : 'Mutiny was crushed. Click below to confirm the Navigation Team at the helm.'}
                  </div>
                  <button
                    onClick={onConfirmOutcome}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-105 transition cursor-pointer flex items-center justify-center gap-2 mx-auto"
                  >
                    <ChevronRight size={22} />
                    {session.isSuccess ? 'APPOINT NEW NAVIGATION TEAM' : 'PROCEED WITH NAVIGATION'}
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 text-sm flex items-center justify-center gap-2 animate-pulse">
                  <Clock size={16} /> Waiting for Captain (<strong className="text-white">{captainPlayer.nickname}</strong>) to confirm and proceed...
                </div>
              )}
            </div>
          </div>
        )}

        {/* PHASE 4: TIE BREAKER CHAIN ELIMINATION */}
        {gamePhase === 'MUTINY_TIE_BREAKER' && (
          <div className="bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mx-auto">
                <Swords size={14} className="text-purple-400" /> Mutiny Tie-Breaker (Chain Elimination)
              </span>
              <h3 className="text-3xl font-extrabold text-purple-100">TIE-BREAKER ELIMINATION CHAIN</h3>
              <p className="text-slate-300 text-sm max-w-xl mx-auto">
                Multiple crew members tied with the highest guns! The decisive chooser eliminates 1 candidate from the race, who then eliminates the next until only 1 remains!
              </p>
              <div className="pt-2">
                <span className="text-sm font-bold text-yellow-400 bg-yellow-950/40 px-3 py-1 rounded-xl border border-yellow-500/30">
                  Decisive Chooser: {currentChooser?.nickname || 'Determining'}
                </span>
              </div>
            </div>

            {/* Tie Candidates Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {(session.tieCandidates || []).map((candId) => {
                const cand = players.find(p => p.id === candId);
                const isMyTurnToChoose = session.currentChooser === me.id;
                return (
                  <div key={candId} className="p-5 bg-slate-900/80 border border-purple-500/30 rounded-2xl flex flex-col items-center text-center gap-3">
                    <div className="text-4xl">{cand?.avatar || '🧑‍✈️'}</div>
                    <div className="font-bold text-base">{cand?.nickname || cand?.name}</div>
                    
                    {isMyTurnToChoose && candId !== me.id && (
                      <button
                        onClick={() => onEliminateTieCandidate(candId)}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-red-600/30 cursor-pointer"
                      >
                        ELIMINATE CANDIDATE
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MutinyBoard;
