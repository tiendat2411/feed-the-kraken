import React, { useState } from 'react';
import inputWoodSlotCleanPng from '../../assets/ui/frames/input_wood_slot_clean.png';
import badgeCaptainHatPng from '../../assets/ui/sprites/badge_captain_hat.png';
import badgeLtMedalPng from '../../assets/ui/sprites/badge_lieutenant_medal.png';
import badgeNavCompassPng from '../../assets/ui/sprites/badge_navigator_compass.png';
import gemEmeraldOnlinePng from '../../assets/ui/sprites/gem_emerald_online.png';
import gemRubyOfflinePng from '../../assets/ui/sprites/gem_ruby_offline.png';
import iconFlintlockPistolPng from '../../assets/ui/sprites/icon_flintlock_pistol.png';
import CrewPlate from '../lobby/CrewPlate';
import { getAvatarSrc } from '../../constants/avatars';

/**
 * CrewSeatingDrawer Component (Task T063 - Captain's Tabletop Environment & Under-Drawer)
 * - Authentic high-resolution Full Under-Drawer (drawer_full_container.png) at 1616x1751.
 * - Non-sticky under-desk placement: Tucked into the under-desk cavity with peeking anchor handle.
 * - Interactive slide-out action revealing the antique brass Seating Radar with 12 player portholes.
 * - Dual Tabs: SEATING RADAR (Tab A) & CREW ROSTER (Tab B) in carved wood slot frames.
 * - Zero stock icons / Unicode emojis (100% custom graphic assets).
 * - 100% English display language and Eldritch Parchment typography.
 */
const CrewSeatingDrawer = ({
  room,
  currentUserId,
  onKickPlayer
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('RADAR'); // 'RADAR' | 'GRID'

  if (!room) return null;

  const players = room.players || [];
  const myId = room.myId || currentUserId;
  const isHost = room.hostId === myId;

  // Determine player indices for circular seating radar
  const myIndex = players.findIndex(p => p.id === myId || p.sessionToken === currentUserId);
  const effectiveMyIndex = myIndex >= 0 ? myIndex : 0;
  const captainIndex = players.findIndex(p => p.id === room.captainId);
  const nextCaptainIndex = captainIndex >= 0 && players.length > 1 ? (captainIndex + 1) % players.length : -1;

  return (
    <section className="w-full max-w-4xl mx-auto mt-4 mb-8 flex flex-col items-center select-none relative z-30">
      {/* ── 1. Collapsed Drawer Lip / Peeking Under-Desk Fascia ── */}
      {!isOpen && (
        <div className="relative w-full max-w-xl flex flex-col items-center animate-fadeIn">
          {/* Peeking Drawer Bar with Antique Anchor Handle */}
          <div className="relative w-full aspect-[940/260] max-h-[90px] flex items-center justify-between px-4 sm:px-8 filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
            <img
              src={handleDrawerAntiquePng}
              alt="Antique Drawer Handle"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
              aria-hidden="true"
            />

            {/* Left: Quick Tab A Button */}
            <button
              type="button"
              id="btn-peek-seating-radar"
              onClick={() => {
                setActiveTab('RADAR');
                setIsOpen(true);
              }}
              className="relative z-10 h-[34px] sm:h-[38px] px-3 sm:px-4 flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition"
            >
              <img
                src={inputWoodSlotCleanPng}
                alt="Radar Tab"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-85 hover:opacity-100"
              />
              <span className="relative z-10 font-heading font-black text-[11px] sm:text-xs text-parchment-bright tracking-widest uppercase whitespace-nowrap drop-shadow">
                SEATING RADAR
              </span>
            </button>

            {/* Center Pull Trigger */}
            <button
              type="button"
              id="btn-toggle-crew-drawer-peeking"
              onClick={() => setIsOpen(true)}
              className="relative z-10 flex flex-col items-center justify-center cursor-pointer group focus:outline-none -translate-y-1"
              title="Click to pull out under-table drawer"
            >
              <div className="px-3 py-1 rounded bg-[#100D09]/95 border border-gold/70 shadow-inner group-hover:border-gold transition-colors">
                <span className="font-display font-black text-[10px] sm:text-xs text-gold group-hover:text-amber-300 tracking-widest uppercase whitespace-nowrap flex items-center gap-1">
                  <span>▲</span> PULL DRAWER OUT
                </span>
              </div>
            </button>

            {/* Right: Quick Tab B Button */}
            <button
              type="button"
              id="btn-peek-crew-roster"
              onClick={() => {
                setActiveTab('GRID');
                setIsOpen(true);
              }}
              className="relative z-10 h-[34px] sm:h-[38px] px-3 sm:px-4 flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition"
            >
              <img
                src={inputWoodSlotCleanPng}
                alt="Crew Tab"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-85 hover:opacity-100"
              />
              <span className="relative z-10 font-heading font-black text-[11px] sm:text-xs text-parchment-bright tracking-widest uppercase whitespace-nowrap drop-shadow">
                CREW ({players.length}/11)
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── 2. Expanded Drawer Container (100% Full Under-Drawer Asset) ── */}
      {isOpen && (
        <div className="relative w-full max-w-3xl aspect-[1616/1751] flex flex-col items-center filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] animate-fadeIn">
          {/* Authentic High-Res Wooden Drawer Asset */}
          <img
            src={drawerFullContainerPng}
            alt="Captain's Under-Drawer Container"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 select-none"
            aria-hidden="true"
          />

          {/* ── Drawer Top Header / Navigation Tabs ── */}
          <div className="relative z-10 w-[85%] mt-8 sm:mt-10 flex items-center justify-between px-2 sm:px-4">
            {/* Tab A: SEATING RADAR */}
            <button
              type="button"
              id="btn-tab-seating-radar"
              onClick={() => setActiveTab('RADAR')}
              className="relative h-[36px] sm:h-[42px] min-w-[130px] sm:min-w-[160px] aspect-[1058/374] flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]"
            >
              <img
                src={inputWoodSlotCleanPng}
                alt="Seating Radar Slot Frame"
                className={`absolute inset-0 w-full h-full object-fill pointer-events-none transition-all ${
                  activeTab === 'RADAR'
                    ? 'filter brightness-125 drop-shadow-[0_0_10px_rgba(201,168,76,0.9)]'
                    : 'opacity-70 hover:opacity-100'
                }`}
              />
              <span
                className={`relative z-10 font-heading font-black text-xs sm:text-sm tracking-widest uppercase whitespace-nowrap text-center px-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                  activeTab === 'RADAR' ? 'text-gold-bright' : 'text-parchment-dim hover:text-gold'
                }`}
              >
                SEATING RADAR
              </span>
            </button>

            {/* Instruction Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#100D09]/90 border border-gold/40 shadow-inner">
              <span className="font-display font-black text-[10px] sm:text-xs text-gold tracking-widest uppercase whitespace-nowrap">
                CLOCKWISE TURN ORDER
              </span>
            </div>

            {/* Tab B: CREW ROSTER */}
            <button
              type="button"
              id="btn-tab-crew-roster"
              onClick={() => setActiveTab('GRID')}
              className="relative h-[36px] sm:h-[42px] min-w-[130px] sm:min-w-[160px] aspect-[1058/374] flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]"
            >
              <img
                src={inputWoodSlotCleanPng}
                alt="Crew Roster Slot Frame"
                className={`absolute inset-0 w-full h-full object-fill pointer-events-none transition-all ${
                  activeTab === 'GRID'
                    ? 'filter brightness-125 drop-shadow-[0_0_10px_rgba(201,168,76,0.9)]'
                    : 'opacity-70 hover:opacity-100'
                }`}
              />
              <span
                className={`relative z-10 font-heading font-black text-xs sm:text-sm tracking-widest uppercase whitespace-nowrap text-center px-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                  activeTab === 'GRID' ? 'text-gold-bright' : 'text-parchment-dim hover:text-gold'
                }`}
              >
                CREW ({players.length}/11)
              </span>
            </button>
          </div>

          {/* ── Drawer Interior Body ── */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center p-4">
            {activeTab === 'RADAR' ? (
              /* ── TAB A: CIRCULAR SEATING RADAR OVER COMPASS ── */
              <div className="relative w-full h-full flex items-center justify-center">
                {/* 12 Player Seats Positioned in a Circle Over Brass Dial Sockets */}
                {players.map((p, idx) => {
                  const N = players.length;
                  // Pin 'ME' at bottom (angle = PI / 2, i.e. 90 deg / 6 o'clock)
                  const angle = (2 * Math.PI / N) * (idx - effectiveMyIndex) + (Math.PI / 2);
                  
                  // Geometrically calibrated to match drawer_full_container.png compass sockets:
                  // Center is cx = 50.0%, cy = 46.5%, socket radius = 28.5%
                  const centerX = 50;
                  const centerY = 46.5;
                  const radiusPercent = 28.5;
                  const x = centerX + radiusPercent * Math.cos(angle);
                  const y = centerY + radiusPercent * Math.sin(angle);

                  const isMe = p.id === myId || p.sessionToken === currentUserId;
                  const isCaptain = p.id === room.captainId;
                  const isNextCaptainIfDrunk = idx === nextCaptainIndex;
                  const isLt = p.id === (room.lieutenantId || room.nominatedLieutenantId);
                  const isNav = p.id === (room.navigatorId || room.nominatedNavigatorId);
                  const isOnline = p.connectionStatus !== 'OFFLINE';
                  const avatarSrc = getAvatarSrc(p.avatar);

                  return (
                    <div
                      key={p.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      {/* Captain Hat Sprite */}
                      {isCaptain && (
                        <img
                          src={badgeCaptainHatPng}
                          alt="Captain Hat"
                          className="w-8 h-5 sm:w-10 sm:h-6 object-contain -mb-1 filter drop-shadow-[0_0_10px_rgba(232,166,62,0.95)] animate-bounce z-30"
                          title="Captain"
                        />
                      )}

                      {/* Next Captain if Drunk Tag */}
                      {isNextCaptainIfDrunk && !isCaptain && (
                        <div className="mb-0.5 px-1.5 py-0.5 rounded bg-amber-500/30 border border-gold text-gold text-[8px] sm:text-[9px] font-heading font-black whitespace-nowrap animate-pulse shadow-md">
                          NEXT (IF DRUNK)
                        </div>
                      )}

                      {/* Secret Cult Leader Tag */}
                      {room?.knownCultLeader?.id === p.id && !isMe && (
                        <div
                          className="mb-0.5 px-2 py-0.5 rounded-full bg-purple-950/90 border border-purple-400 text-purple-200 text-[8px] sm:text-[9px] font-heading font-black shadow-[0_0_10px_rgba(168,85,247,0.9)] animate-pulse whitespace-nowrap"
                          title="Your Secret Cult Leader (Visible only to you)"
                        >
                          CULT LEADER
                        </div>
                      )}

                      {/* Seat Avatar Porthole */}
                      <div
                        className={`relative w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] md:w-[64px] md:h-[64px] rounded-full p-0.5 bg-[#1A1510] border-2 transition-all duration-200 transform group-hover:scale-110 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] ${
                          isMe
                            ? 'border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.85)]'
                            : isCaptain
                            ? 'border-gold shadow-[0_0_14px_rgba(201,168,76,0.75)]'
                            : isNextCaptainIfDrunk
                            ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.65)]'
                            : 'border-hull-light hover:border-gold/70'
                        }`}
                      >
                        <img
                          src={avatarSrc}
                          alt={p.nickname || p.name}
                          className="w-full h-full object-cover rounded-full pointer-events-none"
                        />

                        {/* Connection Gem on Avatar Edge */}
                        <img
                          src={isOnline ? gemEmeraldOnlinePng : gemRubyOfflinePng}
                          alt={isOnline ? 'Online' : 'Offline'}
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 object-contain filter drop-shadow"
                        />

                        {/* Officer Badges Floating at Top-Right */}
                        {isLt && (
                          <img
                            src={badgeLtMedalPng}
                            alt="Lieutenant"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 object-contain filter drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]"
                            title="Lieutenant"
                          />
                        )}
                        {isNav && (
                          <img
                            src={badgeNavCompassPng}
                            alt="Navigator"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 object-contain filter drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                            title="Navigator"
                          />
                        )}
                      </div>

                      {/* Player Label & Guns */}
                      <div className="text-center mt-0.5 flex flex-col items-center max-w-[80px] sm:max-w-[100px]">
                        <span
                          className={`font-heading font-black text-[11px] sm:text-xs tracking-wide truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                            isMe ? 'text-emerald-300' : 'text-parchment-bright'
                          }`}
                        >
                          {p.nickname || p.name}
                        </span>
                        <span className="font-heading font-bold text-[10px] sm:text-[11px] text-gold-dim flex items-center gap-1 drop-shadow">
                          <img
                            src={iconFlintlockPistolPng}
                            alt="Guns"
                            className="w-3 h-3 object-contain"
                          />
                          <span>{p.gunCount ?? 3}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── TAB B: CREW ROSTER GRID OVER WOOD BACKING ── */
              <div className="w-[85%] max-h-[75%] overflow-y-auto pr-2 custom-scrollbar bg-[#120E0A]/90 backdrop-blur-md rounded-2xl border border-gold/40 p-3 sm:p-4 shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {players.map((player) => {
                    const isMe = player.id === myId || player.sessionToken === currentUserId;
                    const isHostPlayer = player.id === room.hostId;
                    const isCap = player.id === room.captainId;
                    const isLt = player.id === (room.lieutenantId || room.nominatedLieutenantId);
                    const isNav = player.id === (room.navigatorId || room.nominatedNavigatorId);

                    return (
                      <CrewPlate
                        key={player.id}
                        player={player}
                        isMe={isMe}
                        isHostPlayer={isHostPlayer}
                        isCaptain={isCap}
                        isLieutenant={isLt}
                        isNavigator={isNav}
                        isKnownCultLeader={room?.knownCultLeader?.id === player.id && !isMe}
                        canKick={isHost && !isMe}
                        onKick={() => onKickPlayer(player.id)}
                        showGameStatus={true}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Drawer Bottom Push Action / Antique Anchor Handle Trigger ── */}
          <div className="relative z-20 w-full mb-3 flex flex-col items-center justify-center">
            <button
              type="button"
              id="btn-close-crew-drawer"
              onClick={() => setIsOpen(false)}
              className="group flex flex-col items-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none"
              title="Click to push drawer back in"
            >
              <div className="px-4 py-1.5 rounded-full bg-[#100D09]/95 hover:bg-[#1A1510] border border-gold/70 text-gold hover:text-parchment-bright font-display text-xs sm:text-sm tracking-widest uppercase transition-all shadow-[0_4px_12px_rgba(0,0,0,0.9)] flex items-center gap-1.5">
                <span>▼</span> PUSH DRAWER BACK IN
              </div>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CrewSeatingDrawer;

