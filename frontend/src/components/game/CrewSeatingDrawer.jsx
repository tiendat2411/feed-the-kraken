import React, { useState } from 'react';
import woodBottomBarPng from '../../assets/ui/frames/wood_bottom_bar.png';
import inputWoodSlotCleanPng from '../../assets/ui/frames/input_wood_slot_clean.png';
import handleDrawerBrassPng from '../../assets/ui/sprites/handle_drawer_brass.png';
import compassTableRoundPng from '../../assets/ui/frames/compass_table_round.png';
import badgeCaptainHatPng from '../../assets/ui/sprites/badge_captain_hat.png';
import badgeLtMedalPng from '../../assets/ui/sprites/badge_lieutenant_medal.png';
import badgeNavCompassPng from '../../assets/ui/sprites/badge_navigator_compass.png';
import gemEmeraldOnlinePng from '../../assets/ui/sprites/gem_emerald_online.png';
import gemRubyOfflinePng from '../../assets/ui/sprites/gem_ruby_offline.png';
import CrewPlate from '../lobby/CrewPlate';
import { getAvatarSrc } from '../../constants/avatars';

/**
 * CrewSeatingDrawer Component (Task T061 - In-Game Command Architecture)
 * - Persistent Bottom Bar: Becomes the sliding top header of the drawer itself.
 * - Kraken Brass Handle: Single central control to pull open (▲) and push close (▼).
 * - Tabs: SEATING RADAR (Tab A) & CREW ROSTER (Tab B) in authentic carved wood slot frames (input_wood_slot_clean.png).
 * - Captain Badge: Uses authentic weathered leather pirate captain hat (badge_captain_hat.png).
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

  // Determine player indices for seating radar
  const myIndex = players.findIndex(p => p.id === myId || p.sessionToken === currentUserId);
  const effectiveMyIndex = myIndex >= 0 ? myIndex : 0;
  const captainIndex = players.findIndex(p => p.id === room.captainId);
  const nextCaptainIndex = captainIndex >= 0 && players.length > 1 ? (captainIndex + 1) % players.length : -1;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out select-none flex flex-col ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3.75rem)] sm:translate-y-[calc(100%-4.25rem)]'
      }`}
    >
      {/* ── 1. Sliding Header Bar (The Bottom Bar that moves up with the drawer) ── */}
      <div className="relative w-full h-15 sm:h-17 flex items-center justify-center shadow-[0_-8px_30px_rgba(0,0,0,0.95)] z-20 cursor-pointer">
        {/* Background Weathered Oak Beam with Verdigris Metal Corners */}
        <img
          src={woodBottomBarPng}
          alt="Drawer Header Beam"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
          aria-hidden="true"
        />

        {/* Centered Controls Container (Keeps tabs away from the outer corner metal ornaments) */}
        <div className="relative z-10 w-full max-w-3xl md:max-w-4xl lg:max-w-5xl flex items-center justify-between px-6 sm:px-10 md:px-14">
          {/* Left: Tab A Button (Seating Radar) in Carved Wood Slot Frame */}
          <div className="flex items-center">
            <button
              type="button"
              id="btn-tab-seating-radar"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('RADAR');
                if (!isOpen) setIsOpen(true);
              }}
              className="relative h-[38px] sm:h-[44px] min-w-[130px] sm:min-w-[155px] md:min-w-[175px] aspect-[1058/374] flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]"
            >
              <img
                src={inputWoodSlotCleanPng}
                alt="Seating Radar Slot Frame"
                className={`absolute inset-0 w-full h-full object-fill pointer-events-none transition-all ${
                  activeTab === 'RADAR' && isOpen
                    ? 'filter brightness-125 drop-shadow-[0_0_10px_rgba(201,168,76,0.9)]'
                    : 'opacity-80 hover:opacity-100'
                }`}
              />
              <span
                className={`relative z-10 font-heading font-black text-xs sm:text-sm tracking-widest uppercase whitespace-nowrap text-center px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                  activeTab === 'RADAR' && isOpen ? 'text-gold-bright' : 'text-parchment-dim hover:text-gold'
                }`}
              >
                SEATING RADAR
              </span>
            </button>
          </div>

          {/* Center: Prominent Kraken Brass Handle (Opens / Closes the drawer) */}
          <div className="flex flex-col items-center justify-center -translate-y-1 sm:-translate-y-2">
            <button
              type="button"
              id="btn-toggle-crew-drawer"
              onClick={() => setIsOpen(!isOpen)}
              className="group flex flex-col items-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none"
              title={isOpen ? 'Click to pull down and close drawer' : 'Click to pull up Crew & Seating Radar'}
            >
              <img
                src={handleDrawerBrassPng}
                alt="Kraken Brass Handle"
                className="w-20 sm:w-24 md:w-28 h-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] group-hover:drop-shadow-[0_0_15px_rgba(232,166,62,0.9)] transition-all"
              />
              <div className="flex items-center gap-1 px-3 py-0.5 rounded bg-[#100D09]/95 border border-gold/60 shadow-inner -mt-1">
                <span className="font-display font-black text-[10px] sm:text-xs text-gold tracking-wider uppercase whitespace-nowrap">
                  {isOpen ? '▼ CLOSE CREW RADAR' : '▲ CREW & SEATING RADAR'}
                </span>
              </div>
            </button>
          </div>

          {/* Right: Tab B Button (Crew Roster) in Carved Wood Slot Frame */}
          <div className="flex items-center">
            <button
              type="button"
              id="btn-tab-crew-roster"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('GRID');
                if (!isOpen) setIsOpen(true);
              }}
              className="relative h-[38px] sm:h-[44px] min-w-[130px] sm:min-w-[155px] md:min-w-[175px] aspect-[1058/374] flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]"
            >
              <img
                src={inputWoodSlotCleanPng}
                alt="Crew Roster Slot Frame"
                className={`absolute inset-0 w-full h-full object-fill pointer-events-none transition-all ${
                  activeTab === 'GRID' && isOpen
                    ? 'filter brightness-125 drop-shadow-[0_0_10px_rgba(201,168,76,0.9)]'
                    : 'opacity-80 hover:opacity-100'
                }`}
              />
              <span
                className={`relative z-10 font-heading font-black text-xs sm:text-sm tracking-widest uppercase whitespace-nowrap text-center px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                  activeTab === 'GRID' && isOpen ? 'text-gold-bright' : 'text-parchment-dim hover:text-gold'
                }`}
              >
                CREW ROSTER ({players.length}/11)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Expanded Drawer Content Container (Slides up underneath the header bar) ── */}
      <div className="relative z-10 w-full bg-[#120E0A]/95 backdrop-blur-xl border-t border-gold/40 shadow-[0_-15px_50px_rgba(0,0,0,0.95)] max-h-[75vh] overflow-y-auto p-4 sm:p-6">
        {activeTab === 'RADAR' ? (
          /* ── TAB A: CIRCULAR SEATING RADAR ── */
          <div className="relative w-full max-w-2xl mx-auto aspect-square flex items-center justify-center my-2">
            {/* Background Pirate Round Compass Table */}
            <div className="relative w-[52%] aspect-square flex items-center justify-center filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
              <img
                src={compassTableRoundPng}
                alt="Pirate Round Table"
                className="w-full h-full object-contain pointer-events-none"
              />
              {/* Clockwise Direction Indicator */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl sm:text-2xl text-gold animate-spin-slow">↻</span>
                <span className="font-heading text-[10px] sm:text-xs text-gold/80 uppercase tracking-widest font-bold">
                  CLOCKWISE TURN
                </span>
              </div>
            </div>

            {/* Player Seats Positioned in a Circle Around Table */}
            {players.map((p, idx) => {
              const N = players.length;
              // Pin 'ME' at bottom (angle = PI / 2, i.e. 90 deg / 6 o'clock)
              const angle = (2 * Math.PI / N) * (idx - effectiveMyIndex) + (Math.PI / 2);
              const radiusPercent = 38; // Distance from center
              const x = 50 + radiusPercent * Math.cos(angle);
              const y = 50 + radiusPercent * Math.sin(angle);

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
                  {/* Captain Pirate Hat Overlay */}
                  {isCaptain && (
                    <img
                      src={badgeCaptainHatPng}
                      alt="Captain Hat"
                      className="w-10 h-6 sm:w-11 sm:h-7 object-contain -mb-1.5 filter drop-shadow-[0_0_10px_rgba(232,166,62,0.95)] animate-bounce z-30"
                      title="Captain"
                    />
                  )}

                  {/* Next Captain if Drunk Tag */}
                  {isNextCaptainIfDrunk && !isCaptain && (
                    <div className="mb-0.5 px-2 py-0.5 rounded bg-amber-500/25 border border-gold text-gold text-[9px] sm:text-[10px] font-heading font-black whitespace-nowrap animate-pulse shadow-md">
                      NEXT CAPTAIN (IF DRUNK 🍺)
                    </div>
                  )}

                  {/* Secret Cult Leader Tag (Visible only to Cultists) */}
                  {room?.knownCultLeader?.id === p.id && !isMe && (
                    <div
                      className="mb-0.5 px-2 py-0.5 rounded-full bg-purple-950/90 border border-purple-400 text-purple-200 text-[8px] sm:text-[9px] font-heading font-black flex items-center gap-0.5 shadow-[0_0_10px_rgba(168,85,247,0.9)] animate-pulse whitespace-nowrap"
                      title="Your Secret Cult Leader (Visible only to you)"
                    >
                      <span>👁️</span>
                      <span>CULT LEADER</span>
                    </div>
                  )}

                  {/* Seat Avatar Porthole (+30% Size Increase) */}
                  <div
                    className={`relative w-[62px] h-[62px] sm:w-[74px] sm:h-[74px] md:w-[78px] md:h-[78px] rounded-full p-1 bg-[#1A1510] border-2 transition-all duration-200 transform group-hover:scale-110 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] ${
                      isMe
                        ? 'border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.8)]'
                        : isCaptain
                        ? 'border-gold shadow-[0_0_14px_rgba(201,168,76,0.7)]'
                        : isNextCaptainIfDrunk
                        ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : 'border-hull-light hover:border-gold/60'
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
                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 object-contain filter drop-shadow"
                    />

                    {/* Officer Badges Floating at Top-Right */}
                    {isLt && (
                      <img
                        src={badgeLtMedalPng}
                        alt="Lieutenant"
                        className="absolute -top-1.5 -right-2 w-6 h-6 object-contain filter drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]"
                        title="Lieutenant"
                      />
                    )}
                    {isNav && (
                      <img
                        src={badgeNavCompassPng}
                        alt="Navigator"
                        className="absolute -top-1.5 -right-2 w-6 h-6 object-contain filter drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                        title="Navigator"
                      />
                    )}
                  </div>

                  {/* Player Label & Guns */}
                  <div className="text-center mt-1 flex flex-col items-center">
                    <span
                      className={`font-heading font-black text-xs sm:text-sm tracking-wide max-w-[90px] sm:max-w-[120px] truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                        isMe ? 'text-emerald-300' : 'text-parchment-bright'
                      }`}
                    >
                      {p.nickname || p.name} {isMe && '(YOU)'}
                    </span>
                    <span className="font-heading font-bold text-[11px] sm:text-xs text-gold-dim flex items-center gap-1 drop-shadow">
                      <span>🔫</span>
                      <span>{p.gunCount ?? 3}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── TAB B: CREW ROSTER GRID (2 Columns with Rich Status Badges) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 max-w-5xl mx-auto p-1 sm:p-2">
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
        )}
      </div>
    </div>
  );
};

export default CrewSeatingDrawer;
