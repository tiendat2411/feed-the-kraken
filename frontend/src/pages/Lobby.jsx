import React from 'react';
import LobbyHeader from '../components/lobby/LobbyHeader';
import CrewPlate from '../components/lobby/CrewPlate';
import MapSelector from '../components/lobby/MapSelector';
import AvatarSelector from '../components/lobby/AvatarSelector';
import StartVoyageButton from '../components/lobby/StartVoyageButton';
import CardParchment from '../components/ui/CardParchment';
import Vignette from '../components/ui/Vignette';
import DustParticles from '../components/ui/DustParticles';
import lobbyCabinBg from '../assets/ui/backgrounds/lobby_cabin_bg.jpg';

/**
 * Lobby Component (T059 - Eldritch Architecture)
 * - Nền không gian cabin thuyền trưởng ấm cúng với đèn bão và bụi tro bay.
 * - Thanh Header ván gỗ sồi phong hóa với mã phòng và nút thoát.
 * - Lưới 2 cột Thẻ Thuyền Viên CrewPlate với 11 Avatar Pirates of the Caribbean.
 * - Bản đồ Map Selection trong tờ giấy Da Dê lớn, Bảng chọn Avatar và nút Bánh Lái Hoàng Kim nằm bên dưới.
 */
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
  if (!room) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0A0A08] text-gold font-display text-2xl animate-pulse">
        Loading room data...
      </div>
    );
  }

  const players = room.players || [];
  const myId = room.myId || currentUserId;
  const me = players.find((p) => p.id === myId || p.id === currentUserId || p.sessionToken === currentUserId) || {};
  const isHost = (room.hostId && (room.hostId === myId || room.hostId === me.id));
  const canStart = isHost && players.length >= 5 && players.length <= 11;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col p-3 sm:p-6 overflow-x-hidden select-none bg-[#0A0A08] bg-cover bg-center"
      style={{
        backgroundImage: `url(${lobbyCabinBg})`,
      }}
    >
      {/* ── Atmospheric Overlays ── */}
      <Vignette />
      <DustParticles count={12} />

      {/* ── Main Layout Container ── */}
      <div className="relative z-30 w-full max-w-6xl mx-auto flex-1 flex flex-col justify-between py-2">
        {/* Header Bar */}
        <LobbyHeader
          roomId={room.id}
          playerCount={players.length}
          maxPlayers={11}
          isHost={isHost}
          onDissolveRoom={onDissolveRoom}
          onLeaveRoom={onLeaveRoom}
        />

        {/* Content Body: Left Crew Quarters + Right Navigation & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 flex-1 items-start">
          {/* Left Column: Crew Members List (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <h2 className="font-heading font-black text-xs sm:text-sm md:text-base text-gold uppercase tracking-widest mb-3 flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              CREW QUARTERS ({players.length}/11)
            </h2>

            {/* 2-Column Grid of Crew Plates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {players.map((player) => {
                const isMe = (player.id === myId || player.id === me.id || player.id === currentUserId || player.sessionToken === currentUserId);
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

              {/* Empty slot placeholders up to 5 minimum */}
              {Array.from({ length: Math.max(0, 5 - players.length) }).map((_, idx) => (
                <CrewPlate key={`empty-${idx}`} isEmpty={true} />
              ))}
            </div>
          </div>

          {/* Right Column: Map Selection Logbook + Avatar Selector + Action Button (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* 1. Map Selection inside CardParchment */}
            <CardParchment className="w-full !p-3 sm:!p-5 !items-stretch">
              <div className="text-center border-b border-hull/40 pb-1.5 mb-2.5">
                <h2 className="font-display text-xl sm:text-2xl text-[#2E1F0C] tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                  MAP SELECTION
                </h2>
              </div>

              <MapSelector
                selectedMap={room.mapType || 'QUICK_JOURNEY'}
                onSelectMap={onSelectMap}
                isHost={isHost}
              />
            </CardParchment>

            {/* 2. Avatar Selection (Outside Parchment) */}
            <AvatarSelector
              currentAvatar={me.avatar}
              onSelectAvatar={onSelectAvatar}
            />

            {/* 3. Start Voyage Action Button */}
            <StartVoyageButton
              isHost={isHost}
              canStart={canStart}
              onStartGame={onStartGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
