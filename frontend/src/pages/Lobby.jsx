import React from 'react';
import { Users, Crown, Settings, Map as MapIcon, Play, LogOut, UserX } from 'lucide-react';

const AVATARS = ['🧑‍✈️', '👩‍🔧', '👨‍🍳', '🥷', '🧟‍♂️', '🧜‍♀️', '⚓', '🏴‍☠️', '🐙', '🦈'];

const Lobby = ({
  room,
  currentUserId,
  onSelectAvatar,
  onSelectMap,
  onStartGame,
  onLeaveRoom,
  onKickPlayer
}) => {
  if (!room) return <div className="text-white flex justify-center items-center h-full">Loading...</div>;

  const players = room.players || [];
  const isHost = room.hostId === currentUserId;
  const canStart = players.length >= 5 && players.length <= 11;
  const me = players.find((p) => p.id === currentUserId) || {};

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Room: {room.id}
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2">
              <Users size={18} /> {players.length} / 11 Players
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onLeaveRoom}
              className="px-4 py-2 flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition duration-300 font-semibold"
            >
              <LogOut size={18} /> Leave
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Players List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
              <Users className="text-blue-400" /> Crew Members
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {players.map((player) => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-4 rounded-xl border transition duration-300 ${player.id === currentUserId ? 'bg-blue-900/40 border-blue-500/50' : 'bg-white/5 border-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                      {player.avatar || '❓'}
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {player.name}
                        {player.id === room.hostId && <Crown size={16} className="text-yellow-400" />}
                        {player.id === currentUserId && <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md">You</span>}
                      </div>
                      <div className="text-sm text-slate-400 flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${player.connectionStatus === 'OFFLINE' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        {player.connectionStatus === 'OFFLINE' ? 'Offline' : 'Online'}
                      </div>
                    </div>
                  </div>
                  {isHost && player.id !== currentUserId && (
                    <button 
                      onClick={() => onKickPlayer(player.id)}
                      className="text-slate-500 hover:text-red-400 transition p-2 rounded-lg hover:bg-white/5"
                      title="Kick Player"
                    >
                      <UserX size={18} />
                    </button>
                  )}
                </div>
              ))}
              
              {/* Empty slots placeholders */}
              {Array.from({ length: Math.max(0, 5 - players.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/5 opacity-50">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center"></div>
                  <div className="text-slate-500 italic">Waiting for player...</div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <Settings className="text-purple-400" /> Room Settings
              </h2>
              
              {/* Map Selection (Host Only) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <MapIcon size={16} /> Map Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => isHost && onSelectMap('QUICK_JOURNEY')}
                    disabled={!isHost}
                    className={`px-4 py-3 rounded-xl border transition ${
                      room.mapType === 'QUICK_JOURNEY' 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-200' 
                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-700/50'
                    } ${!isHost && 'cursor-not-allowed opacity-80'}`}
                  >
                    Quick Journey
                  </button>
                  <button
                    onClick={() => isHost && onSelectMap('LONG_JOURNEY')}
                    disabled={!isHost}
                    className={`px-4 py-3 rounded-xl border transition ${
                      room.mapType === 'LONG_JOURNEY' 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-200' 
                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-700/50'
                    } ${!isHost && 'cursor-not-allowed opacity-80'}`}
                  >
                    Long Journey
                  </button>
                </div>
              </div>

              {/* Avatar Selection (Everyone) */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">Choose Your Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onSelectAvatar(emoji)}
                      className={`w-12 h-12 text-2xl flex items-center justify-center rounded-xl transition transform hover:scale-110 ${
                        me.avatar === emoji 
                          ? 'bg-blue-500/30 border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                          : 'bg-slate-800/50 border border-transparent hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button (Host Only) */}
            {isHost && (
              <button
                onClick={onStartGame}
                disabled={!canStart}
                className={`w-full py-4 rounded-2xl flex justify-center items-center gap-3 font-bold text-lg transition duration-300 shadow-xl ${
                  canStart 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Play fill="currentColor" size={20} />
                {canStart ? 'START VOYAGE' : 'WAITING FOR CREW (MIN 5)'}
              </button>
            )}
            {!isHost && (
              <div className="w-full py-4 rounded-2xl flex justify-center items-center gap-3 font-bold text-lg bg-slate-800/50 text-slate-400 border border-white/5">
                WAITING FOR HOST TO START...
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Lobby;
