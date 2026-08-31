import React, { useState, useEffect } from 'react';
import { Shield, Skull, Eye, EyeOff, Flame, Clock, Users, Anchor } from 'lucide-react';

const FACTION_DETAILS = {
  SAILOR: {
    name: 'SAILOR',
    color: 'from-blue-600 to-cyan-500',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/20',
    icon: Anchor,
    tagline: 'Loyal Crew & Defenders of the Ship',
    goal: 'Navigate the ship safely to Bluewater Bay (Blue Route) or defeat all Pirates & Cultists.',
    tips: 'Be cautious when electing the Lieutenant and Navigator. Never let Pirates take the helm!'
  },
  PIRATE: {
    name: 'PIRATE',
    color: 'from-red-600 to-rose-700',
    border: 'border-red-500/50',
    glow: 'shadow-red-500/30',
    icon: Skull,
    tagline: 'Buccaneers & Mutineers',
    goal: 'Hijack the ship and steer directly into Crimson Cove (Red Route) to claim the plunder.',
    tips: 'Coordinate covertly with your comrades! Use guns to trigger a Mutiny and overthrow the Captain.'
  },
  CULT_LEADER: {
    name: 'CULT LEADER',
    color: 'from-amber-500 to-yellow-600',
    border: 'border-yellow-500/50',
    glow: 'shadow-yellow-500/30',
    icon: Flame,
    tagline: 'Herald of the Deep Kraken',
    goal: 'Lure the ship into the Kraken Lair (Yellow Route) OR get fed to the Kraken by the Captain!',
    tips: 'Use Cult Rituals to secretly convert crew members into devout Cultists.'
  },
  CULTIST: {
    name: 'CULTIST',
    color: 'from-purple-600 to-indigo-600',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/30',
    icon: Eye,
    tagline: 'Devout Follower of the Deep',
    goal: 'Serve the Cult Leader and steer the vessel towards the Maw of the Kraken.',
    tips: 'Protect your Cult Leader and create opportunities for ritual sacrifices.'
  }
};

const RoleReveal = ({ room, myRole, currentUserId }) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const faction = FACTION_DETAILS[myRole] || FACTION_DETAILS.SAILOR;
  const Icon = faction.icon;
  const isPirate = myRole === 'PIRATE';
  const knownPirates = room?.knownPirates || [];

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

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br ${faction.color} opacity-20 blur-3xl rounded-full pointer-events-none`}></div>
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br ${faction.color} opacity-20 blur-3xl rounded-full pointer-events-none`}></div>

      {/* Top Countdown Banner */}
      <div className="z-10 mb-6 flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-xl">
        <Clock className="text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} size={20} />
        <span className="font-semibold text-slate-300">FIRST NIGHT PHASE:</span>
        <span className={`font-mono text-2xl font-black ${timeLeft <= 5 ? 'text-red-400 animate-ping' : 'text-yellow-400'}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Main Container */}
      <div className="z-10 max-w-2xl w-full space-y-6">
        
        {/* Role Identity Card */}
        <div className={`bg-slate-900/80 backdrop-blur-xl border ${faction.border} rounded-3xl p-6 sm:p-8 shadow-2xl ${faction.glow} transition duration-500`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${faction.color} flex items-center justify-center shadow-lg`}>
                <Icon size={32} className="text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">YOUR SECRET IDENTITY</span>
                <h1 className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${faction.color} bg-clip-text text-transparent`}>
                  {faction.name}
                </h1>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Armament</span>
              <div className="text-lg font-bold text-amber-400 flex items-center gap-1 justify-end">
                🔫 3 Guns
              </div>
            </div>
          </div>

          {/* Goal & Mission */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Shield size={16} className="text-blue-400" /> Faction Objective
              </h3>
              <p className="text-slate-300 bg-white/5 p-4 rounded-xl border border-white/5 text-sm leading-relaxed">
                {faction.goal}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                💡 Tactical Advice
              </h3>
              <p className="text-xs text-slate-400 italic">
                {faction.tips}
              </p>
            </div>
          </div>
        </div>

        {/* Night Phase Actions Area */}
        {isPirate ? (
          /* Pirate Gathering Screen */
          <div className="bg-red-950/40 backdrop-blur-md border border-red-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Skull className="text-red-400 animate-bounce" size={24} />
              <div>
                <h2 className="text-xl font-bold text-red-200">PIRATES GATHERING</h2>
                <p className="text-xs text-red-300/80">You and your fellow pirates below share allegiance to the Crimson Flag:</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {knownPirates.map((pirate) => (
                <div 
                  key={pirate.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    pirate.id === currentUserId 
                      ? 'bg-red-500/20 border-red-500/60 shadow-lg shadow-red-500/10' 
                      : 'bg-black/40 border-red-500/20'
                  }`}
                >
                  <div className="text-2xl w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center border border-red-500/30">
                    {pirate.avatar || '🏴‍☠️'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-sm text-red-100 truncate flex items-center gap-1">
                      {pirate.nickname || pirate.name}
                      {pirate.id === currentUserId && <span className="text-[10px] bg-red-500 text-white px-1 rounded">YOU</span>}
                    </div>
                    <span className="text-[11px] text-red-400">Fellow Pirate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Non-Pirate Eyes Closed Overlay */
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 animate-pulse">
              <EyeOff size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-200">ALL EYES ARE CLOSED... 🌙</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                Darkness shrouds the ship. The Pirates are secretly identifying their comrades. Remain silent until dawn breaks!
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Dawn will break automatically in {timeLeft} seconds
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RoleReveal;
