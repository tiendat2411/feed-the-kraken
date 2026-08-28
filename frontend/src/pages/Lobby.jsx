import React, { useState } from 'react';
import { Users, Crown, Settings, Map as MapIcon, Play, LogOut, UserX, Copy, Check, Anchor, Flame, Skull } from 'lucide-react';
import PanelWood from '../components/ui/PanelWood';
import CardParchment from '../components/ui/CardParchment';
import ButtonWood from '../components/ui/ButtonWood';
import Vignette from '../components/ui/Vignette';
import DustParticles from '../components/ui/DustParticles';

const AVATARS = ['🧑‍✈️', '👩‍🔧', '👨‍🍳', '🥷', '🧟‍♂️', '🧜‍♀️', '⚓', '🏴‍☠️', '🐙', '🦈'];

const Lobby = ({
  room,
  currentUserId,
  onSelectAvatar,
  onSelectMap,
  onStartGame,
  onLeaveRoom,
  onDissolveRoom,
  onKickPlayer
}) => {
  const [copied, setCopied] = useState(false);

  if (!room) {
    return (
      <div className="min-h-screen bg-abyss text-parchment flex justify-center items-center font-heading text-lg tracking-widest animate-pulse">
        Gathering Voyage Data...
      </div>
    );
  }

  const players = room.players || [];
  const myId = room.myId || currentUserId;
  const me = players.find((p) => p.id === myId || p.id === currentUserId || p.sessionToken === currentUserId) || {};
  const isHost = Boolean(room.hostId && (room.hostId === myId || room.hostId === me.id));
  const canStart = isHost && players.length >= 5 && players.length <= 11;

  const handleCopyCode = () => {
    if (!room?.id) return;
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-[100dvh] bg-abyss text-parchment p-4 sm:p-6 md:p-8 font-body overflow-x-hidden">
      {/* Atmosphere Layers */}
      <Vignette mode="global" intensity="default" />
      <DustParticles count={7} />

      <div className="max-w-6xl mx-auto relative z-20 space-y-6 animate-fade-in-up">
        
        {/* ====================================================================
            Top Cabin Header: Room Code, Player Count & Host Controls
            ==================================================================== */}
        <PanelWood glow="firelight" nails={true} className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-heading text-xs uppercase tracking-widest text-parchment-dim">
                  Voyage Code
                </span>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-hull rounded border border-gold-dim/40 hover:border-gold text-xs text-gold-bright transition font-mono tracking-wider cursor-pointer"
                  title="Copy voyage code"
                >
                  <span className="font-heading text-lg font-bold">{room.id}</span>
                  {copied ? <Check size={14} className="text-verdigris" /> : <Copy size={14} />}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-parchment-dim mt-1.5 flex items-center gap-2 font-heading tracking-wide">
                <Users size={16} className="text-gold-dim" />
                <span>Crew Complement:</span>
                <span className="font-bold text-parchment-bright">
                  {players.length} / 11 Sailors
                </span>
                {players.length < 5 && (
                  <span className="text-[11px] text-amber-400 font-semibold">
                    (Requires {5 - players.length} more)
                  </span>
                )}
              </p>
            </div>

            {/* Room Exit / Dissolve Actions */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {isHost && (
                <ButtonWood
                  variant="danger"
                  size="sm"
                  onClick={onDissolveRoom}
                  icon={<Skull size={14} />}
                  title="Dissolve this voyage for all crew members"
                >
                  Dissolve Voyage
                </ButtonWood>
              )}
              <ButtonWood
                variant="secondary"
                size="sm"
                onClick={onLeaveRoom}
                icon={<LogOut size={14} />}
              >
                Disembark
              </ButtonWood>
            </div>
          </div>
        </PanelWood>

        {/* ====================================================================
            Main Layout Grid: Crew Roster (Left) vs Captain's Journal (Right)
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLS: Crew Members Roster */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-heading text-lg sm:text-xl font-bold tracking-widest text-parchment-bright flex items-center gap-2 uppercase">
                <Anchor size={18} className="text-gold-dim" />
                Crew Roster
              </h2>
              <span className="text-xs font-heading tracking-wider text-parchment-dim uppercase">
                Minimum 5 Sailors Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Active Player Wooden Nameplates */}
              {players.map((player) => {
                const isMe = Boolean(player.id === myId || player.id === me.id || player.id === currentUserId || player.sessionToken === currentUserId);
                const isPlayerHost = player.id === room.hostId;
                const isOnline = player.connectionStatus !== 'OFFLINE';

                return (
                  <PanelWood
                    key={player.id}
                    variant={isMe ? 'raised' : 'default'}
                    glow={isMe ? 'firelight' : 'none'}
                    nails={true}
                    className={`p-3.5 sm:p-4 border ${
                      isMe ? 'border-gold/60' : 'border-hull-light'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar Frame */}
                        <div className="w-11 h-11 rounded bg-abyss border border-gold-dim/40 flex items-center justify-center text-2xl shadow-inner select-none shrink-0">
                          {player.avatar || '⚓'}
                        </div>

                        {/* Name & Status */}
                        <div className="min-w-0">
                          <div className="font-heading font-bold text-sm sm:text-base text-parchment-bright flex items-center gap-1.5 truncate">
                            <span className="truncate">{player.name || player.nickname}</span>
                            {isPlayerHost && (
                              <Crown
                                size={15}
                                className="text-gold-bright shrink-0"
                                title="Ship Captain (Host)"
                              />
                            )}
                            {isMe && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-gold/20 text-gold-bright rounded border border-gold/40 shrink-0">
                                You
                              </span>
                            )}
                          </div>

                          <div className="text-xs flex items-center gap-1.5 mt-0.5 text-parchment-dim">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isOnline
                                  ? 'bg-verdigris shadow-[0_0_6px_#4A7A6A]'
                                  : 'bg-blood shadow-[0_0_6px_#8B1A1A]'
                              }`}
                            />
                            <span className="font-body text-[11px]">
                              {isOnline ? 'Aboard (Online)' : 'Lost at Sea (Offline)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Host Kick Button */}
                      {isHost && !isMe && (
                        <button
                          onClick={() => onKickPlayer(player.id)}
                          className="text-parchment-dim/40 hover:text-blood hover:bg-blood/10 p-1.5 rounded transition cursor-pointer"
                          title={`Cast ${player.name || 'sailor'} overboard`}
                        >
                          <UserX size={16} />
                        </button>
                      )}
                    </div>
                  </PanelWood>
                );
              })}

              {/* Empty Bunk Placeholders */}
              {Array.from({ length: Math.max(0, 5 - players.length) }).map((_, i) => (
                <div
                  key={`empty-bunk-${i}`}
                  className="flex items-center gap-3 p-3.5 sm:p-4 rounded border border-dashed border-hull-light/50 bg-hull-dark/30 select-none opacity-60"
                >
                  <div className="w-11 h-11 rounded bg-abyss/40 border border-hull-light/30 flex items-center justify-center text-parchment-dim/40">
                    ⚓
                  </div>
                  <div className="text-xs font-heading italic text-parchment-dim/60 tracking-wider">
                    Awaiting sailor #{players.length + i + 1}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COL: Captain's Journal & Room Settings */}
          <div className="space-y-4">
            <CardParchment stains={true} className="p-5 md:p-6 space-y-6">
              
              {/* Journal Title */}
              <div className="border-b border-gold-dim/30 pb-3">
                <h3 className="font-heading text-base sm:text-lg font-bold tracking-widest text-parchment-bright uppercase flex items-center gap-2">
                  <Settings size={17} className="text-gold" />
                  Captain's Logbook
                </h3>
                <p className="text-xs text-parchment-dim mt-0.5">
                  Configure the voyage chart & identity
                </p>
              </div>

              {/* Map Selection (Host Only / View Only for Crew) */}
              <div className="space-y-2.5">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-parchment-dim flex items-center gap-1.5">
                  <MapIcon size={14} className="text-gold-dim" />
                  Voyage Nautical Chart
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => isHost && onSelectMap('QUICK_JOURNEY')}
                    disabled={!isHost}
                    className={`p-3 rounded text-left transition-all border relative overflow-hidden select-none ${
                      room.mapType === 'QUICK_JOURNEY'
                        ? 'bg-hull-light border-gold text-gold-bright shadow-firelight'
                        : 'bg-hull-dark/80 border-hull-light text-parchment-dim hover:border-gold-dim/60'
                    } ${!isHost ? 'cursor-default opacity-85' : 'cursor-pointer active:scale-95'}`}
                  >
                    <div className="font-heading font-bold text-xs uppercase tracking-wider">
                      Quick Chart
                    </div>
                    <div className="text-[10px] text-parchment-dim mt-0.5">
                      19 Nav Cards
                    </div>
                    {room.mapType === 'QUICK_JOURNEY' && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => isHost && onSelectMap('LONG_JOURNEY')}
                    disabled={!isHost}
                    className={`p-3 rounded text-left transition-all border relative overflow-hidden select-none ${
                      room.mapType === 'LONG_JOURNEY'
                        ? 'bg-hull-light border-gold text-gold-bright shadow-firelight'
                        : 'bg-hull-dark/80 border-hull-light text-parchment-dim hover:border-gold-dim/60'
                    } ${!isHost ? 'cursor-default opacity-85' : 'cursor-pointer active:scale-95'}`}
                  >
                    <div className="font-heading font-bold text-xs uppercase tracking-wider">
                      Long Chart
                    </div>
                    <div className="text-[10px] text-parchment-dim mt-0.5">
                      23 Nav Cards
                    </div>
                    {room.mapType === 'LONG_JOURNEY' && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                    )}
                  </button>
                </div>
              </div>

              {/* Avatar Selection (Available for all sailors) */}
              <div className="space-y-2.5">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-parchment-dim">
                  Select Sailor Insignia
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onSelectAvatar(emoji)}
                      className={`h-10 text-xl flex items-center justify-center rounded border transition-all cursor-pointer ${
                        me.avatar === emoji
                          ? 'bg-hull-light border-gold shadow-firelight scale-105'
                          : 'bg-abyss/80 border-hull-light/60 hover:border-gold-dim/60 hover:bg-hull-dark'
                      }`}
                      title={`Choose ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Voyage Action Button (Ship's Wheel Style) */}
              <div className="pt-2">
                {isHost ? (
                  <ButtonWood
                    variant={canStart ? 'gold' : 'secondary'}
                    size="lg"
                    fullWidth={true}
                    onClick={onStartGame}
                    disabled={!canStart}
                    icon={canStart ? <Flame size={18} className="text-firelight" /> : <Anchor size={18} />}
                  >
                    {canStart ? 'SET SAIL (START VOYAGE)' : `NEED ${Math.max(0, 5 - players.length)} MORE CREW`}
                  </ButtonWood>
                ) : (
                  <div className="p-3.5 bg-hull-dark/90 border border-hull-light rounded text-center font-heading text-xs uppercase tracking-wider text-parchment-dim flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                    Awaiting Captain's Command...
                  </div>
                )}
              </div>

            </CardParchment>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Lobby;
