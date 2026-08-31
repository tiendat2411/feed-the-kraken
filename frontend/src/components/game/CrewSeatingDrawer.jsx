import React, { useState } from 'react';
import handleDrawerBrassPng from '../../assets/ui/sprites/handle_drawer_brass.png';
import compassTableRoundPng from '../../assets/ui/frames/compass_table_round.png';
import crownGoldBadgePng from '../../assets/ui/sprites/crown_gold_badge.png';
import badgeLtMedalPng from '../../assets/ui/sprites/badge_lieutenant_medal.png';
import badgeNavCompassPng from '../../assets/ui/sprites/badge_navigator_compass.png';
import iconSilenceTonguePng from '../../assets/ui/sprites/icon_silence_cut_tongue.png';
import iconOffdutyWavesPng from '../../assets/ui/sprites/icon_offduty_waves.png';
import gemEmeraldOnlinePng from '../../assets/ui/sprites/gem_emerald_online.png';
import gemRubyOfflinePng from '../../assets/ui/sprites/gem_ruby_offline.png';
import CrewPlate from '../lobby/CrewPlate';
import { getAvatarSrc } from '../../constants/avatars';

/**
 * CrewSeatingDrawer Component (Task T061 - In-Game Command Architecture)
 * - Collapsed Bottom Bar: Displays 3 officer avatars, personal gun count, and brass expand handle.
 * - Expanded Sliding Drawer:
 *   - Tab A: CIRCULAR SEATING RADAR (Compass table with YOU at 6 o'clock, clockwise arrow, Next Captain if Drunk highlight, officer/status badges).
 *   - Tab B: CREW ROSTER GRID (Grid of CrewPlates).
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
  const me = players.find(p => p.id === myId || p.sessionToken === currentUserId) || {};
  const isHost = room.hostId === myId || room.hostId === me.id;

  const captainPlayer = players.find(p => p.id === room.captainId);
  const ltPlayer = players.find(p => p.id === (room.lieutenantId || room.nominatedLieutenantId));
  const navPlayer = players.find(p => p.id === (room.navigatorId || room.nominatedNavigatorId));

  // Determine player indices for seating radar
  const myIndex = players.findIndex(p => p.id === myId || p.sessionToken === currentUserId);
  const effectiveMyIndex = myIndex >= 0 ? myIndex : 0;
  const captainIndex = players.findIndex(p => p.id === room.captainId);
  const nextCaptainIndex = captainIndex >= 0 && players.length > 1 ? (captainIndex + 1) % players.length : -1;

  return (
    <>
      {/* ── 1. Collapsed Bottom Bar (Fixed HUD Footer) ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 select-none bg-[#140F0A]/95 border-t-2 border-gold/40 shadow-[0_-8px_30px_rgba(0,0,0,0.95)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2">
          {/* Left: 3 Officers Quick Summary */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
            {/* Captain */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-gold/40">
              <img src={crownGoldBadgePng} alt="Captain Crown" className="w-4 h-4 object-contain" />
              <span className="font-heading font-bold text-[10px] sm:text-xs text-gold uppercase">CAP:</span>
              <span className="font-heading text-xs sm:text-sm text-parchment-bright truncate max-w-[70px] sm:max-w-[100px]">
                {captainPlayer ? (captainPlayer.nickname || captainPlayer.name) : 'UNASSIGNED'}
              </span>
            </div>

            {/* Lieutenant */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-blue-500/40">
              <img src={badgeLtMedalPng} alt="Lieutenant Medal" className="w-3.5 h-3.5 object-contain" />
              <span className="font-heading font-bold text-[10px] sm:text-xs text-blue-400 uppercase">LT:</span>
              <span className="font-heading text-xs sm:text-sm text-parchment-bright truncate max-w-[70px] sm:max-w-[100px]">
                {ltPlayer ? (ltPlayer.nickname || ltPlayer.name) : 'UNASSIGNED'}
              </span>
            </div>

            {/* Navigator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-cyan-500/40">
              <img src={badgeNavCompassPng} alt="Navigator Compass" className="w-3.5 h-3.5 object-contain" />
              <span className="font-heading font-bold text-[10px] sm:text-xs text-cyan-400 uppercase">NAV:</span>
              <span className="font-heading text-xs sm:text-sm text-parchment-bright truncate max-w-[70px] sm:max-w-[100px]">
                {navPlayer ? (navPlayer.nickname || navPlayer.name) : 'UNASSIGNED'}
              </span>
            </div>
          </div>

          {/* Center: Expand Drawer Trigger Button with Brass Handle */}
          <button
            type="button"
            id="btn-toggle-crew-drawer"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 sm:px-5 py-1 rounded bg-gold/15 hover:bg-gold/30 border border-gold/50 hover:border-gold transition-all duration-150 transform hover:scale-[1.03] active:scale-95 cursor-pointer filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
            title="Click to view Seating Radar & Crew Roster"
          >
            <img
              src={handleDrawerBrassPng}
              alt="Brass Handle"
              className="w-5 sm:w-6 h-3.5 sm:h-4 object-contain"
            />
            <span className="font-display font-bold text-xs sm:text-sm text-gold tracking-wider uppercase whitespace-nowrap">
              {isOpen ? '▼ CLOSE CREW & SEATING' : '▲ CREW & SEATING RADAR'}
            </span>
          </button>

          {/* Right: Personal Armory & Identity Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blood/80 border border-red-500/50 shadow-inner">
              <span className="text-xs sm:text-sm">🔫</span>
              <span className="font-heading font-black text-xs sm:text-sm text-gold-bright tracking-wider">
                {me.gunCount ?? 3} GUNS
              </span>
            </div>

            {me.speechRestricted && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-900/80 border border-red-500 text-red-200 text-[10px] font-heading font-bold animate-pulse"
                title="You are silenced by cut tongue"
              >
                <img src={iconSilenceTonguePng} alt="Silenced" className="w-3.5 h-3.5 object-contain" />
                <span className="hidden sm:inline">SILENCED</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* ── 2. Expanded Sliding Drawer Panel ── */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-12 sm:bottom-14 z-40 max-h-[82vh] bg-[#120E0A]/95 backdrop-blur-xl border-t-2 border-gold shadow-[0_-12px_45px_rgba(0,0,0,0.95)] flex flex-col transition-all duration-300 animate-slide-up select-none">
          {/* Drawer Top Navigation Bar */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-2.5 border-b border-gold/30 bg-black/40">
            {/* Tab Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="btn-tab-seating-radar"
                onClick={() => setActiveTab('RADAR')}
                className={`font-display text-sm sm:text-base tracking-wider px-4 py-1 rounded transition-all ${
                  activeTab === 'RADAR'
                    ? 'bg-gold text-[#140F0A] font-black shadow-[0_0_12px_rgba(201,168,76,0.6)]'
                    : 'bg-black/50 text-parchment-dim hover:text-gold border border-gold/30'
                }`}
              >
                🪑 CIRCULAR SEATING RADAR
              </button>

              <button
                type="button"
                id="btn-tab-crew-roster"
                onClick={() => setActiveTab('GRID')}
                className={`font-display text-sm sm:text-base tracking-wider px-4 py-1 rounded transition-all ${
                  activeTab === 'GRID'
                    ? 'bg-gold text-[#140F0A] font-black shadow-[0_0_12px_rgba(201,168,76,0.6)]'
                    : 'bg-black/50 text-parchment-dim hover:text-gold border border-gold/30'
                }`}
              >
                👥 CREW ROSTER ({players.length}/11)
              </button>
            </div>

            {/* Minimize / Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-heading font-bold text-xs sm:text-sm text-parchment-dim hover:text-gold px-3 py-1 rounded bg-black/40 border border-white/10 hover:border-gold/40 transition cursor-pointer"
            >
              ▼ MINIMIZE
            </button>
          </div>

          {/* Drawer Body Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-h-[70vh]">
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
                  {/* Clockwise Direction Compass Centerpiece Indicator */}
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
                  // Angle step clockwise:
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
                      {/* Captain Crown Overlay */}
                      {isCaptain && (
                        <img
                          src={crownGoldBadgePng}
                          alt="Captain Crown"
                          className="w-6 h-6 sm:w-7 sm:h-7 object-contain -mb-1 filter drop-shadow-[0_0_8px_rgba(232,166,62,0.9)] animate-bounce"
                        />
                      )}

                      {/* Next Captain if Drunk Tag */}
                      {isNextCaptainIfDrunk && !isCaptain && (
                        <div className="mb-0.5 px-1.5 py-0.2 rounded bg-amber-500/20 border border-gold text-gold text-[9px] sm:text-[10px] font-heading font-black whitespace-nowrap animate-pulse">
                          NEXT CAPTAIN (IF DRUNK 🍺)
                        </div>
                      )}

                      {/* Seat Avatar Porthole */}
                      <div
                        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-1 bg-[#1A1510] border-2 transition-all duration-200 transform group-hover:scale-110 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] ${
                          isMe
                            ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                            : isCaptain
                            ? 'border-gold shadow-[0_0_12px_rgba(201,168,76,0.6)]'
                            : isNextCaptainIfDrunk
                            ? 'border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
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
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 object-contain filter drop-shadow"
                        />

                        {/* Officer Badges Floating at Top-Right */}
                        {isLt && (
                          <img
                            src={badgeLtMedalPng}
                            alt="Lieutenant"
                            className="absolute -top-1 -right-2 w-5 h-5 object-contain filter drop-shadow"
                            title="Lieutenant"
                          />
                        )}
                        {isNav && (
                          <img
                            src={badgeNavCompassPng}
                            alt="Navigator"
                            className="absolute -top-1 -right-2 w-5 h-5 object-contain filter drop-shadow"
                            title="Navigator"
                          />
                        )}

                        {/* Silenced Icon */}
                        {p.speechRestricted && (
                          <img
                            src={iconSilenceTonguePng}
                            alt="Silenced"
                            className="absolute -bottom-1 -left-1 w-4 h-4 object-contain filter drop-shadow"
                            title="Silenced"
                          />
                        )}

                        {/* Off-duty Waves Icon */}
                        {p.status === 'OFF_DUTY' && (
                          <img
                            src={iconOffdutyWavesPng}
                            alt="Off Duty"
                            className="absolute -bottom-1 -left-1 w-4 h-4 object-contain filter drop-shadow"
                            title="Off Duty (Overboard)"
                          />
                        )}
                      </div>

                      {/* Player Label & Guns */}
                      <div className="text-center mt-1 flex flex-col items-center">
                        <span
                          className={`font-heading font-black text-[11px] sm:text-xs tracking-wide max-w-[80px] sm:max-w-[100px] truncate ${
                            isMe ? 'text-emerald-300' : 'text-parchment-bright'
                          }`}
                        >
                          {p.nickname || p.name} {isMe && '(YOU)'}
                        </span>
                        <span className="font-heading font-bold text-[10px] text-gold-dim">
                          🔫 {p.gunCount ?? 3}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── TAB B: CREW ROSTER GRID ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
                {players.map((player) => {
                  const isMe = player.id === myId || player.sessionToken === currentUserId;
                  const isHostPlayer = player.id === room.hostId;

                  return (
                    <CrewPlate
                      key={player.id}
                      player={player}
                      isMe={isMe}
                      isHostPlayer={isHostPlayer}
                      canKick={isHost && !isMe}
                      onKick={() => onKickPlayer(player.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CrewSeatingDrawer;
