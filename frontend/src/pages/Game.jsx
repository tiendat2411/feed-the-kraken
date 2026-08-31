import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Lobby from './Lobby';
import RoleReveal from '../components/RoleReveal';
import MutinyBoard from '../components/MutinyBoard';
import NavigationPhase from '../components/NavigationPhase';
import MapBoardUI from '../components/MapBoardUI';
import EndGame from './EndGame';
import GameHeader from '../components/GameHeader';
import CrewSeatingDrawer from '../components/game/CrewSeatingDrawer';
import EventModalOverlay from '../components/game/EventModalOverlay';
import Vignette from '../components/ui/Vignette';
import DustParticles from '../components/ui/DustParticles';
import lobbyCabinBg from '../assets/ui/backgrounds/lobby_cabin_bg.jpg';

/**
 * Game Master Page Component (Task T061 - In-Game Command Layout Architecture)
 * - 100% English display language & Eldritch Parchment aesthetic.
 * - Persistent Dual-Pane Layout:
 *   - Left 60%: Persistent Sea Chart (MapBoardUI).
 *   - Right 40%: Dynamic Action Desk (Navigation / Mutiny / Execution).
 * - Minimizable Center Event Modal Overlay.
 * - Collapsible Bottom Crew Dock & Circular Seating Radar Drawer.
 */
const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();

  const [room, setRoom] = useState(location.state?.initialRoom || null);
  const [error, setError] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [privateCards, setPrivateCards] = useState([]);
  const [conversionNotification, setConversionNotification] = useState(null);

  // Mobile View Toggle: 'CHART' | 'ACTION'
  const [mobileTab, setMobileTab] = useState('CHART');

  const fetchRoomState = () => {
    if (!socket || !roomId) return;
    socket.emit('get_room', { roomId }, (response) => {
      if (response && response.success) {
        setRoom(response.room);
        if (response.room?.myRole) {
          setMyRole(response.room.myRole);
        }
        if (response.room?.myId) {
          setCurrentUserId(response.room.myId);
        }
        setError(null);
      } else {
        setError(response?.error || 'Room not found or session expired');
      }
    });
  };

  useEffect(() => {
    if (!socket) return;

    fetchRoomState();

    const handleRoomUpdated = (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom?.myRole) {
        setMyRole(updatedRoom.myRole);
      }
      if (updatedRoom?.myId) {
        setCurrentUserId(updatedRoom.myId);
      }
    };

    const handlePlayerKicked = ({ playerId }) => {
      if (playerId === currentUserId) {
        alert('You have been kicked from the room by the host.');
        navigate('/');
      }
    };

    const handleRoomDissolved = () => {
      alert('The room was dissolved by the host.');
      navigate('/');
    };

    const handleRoleAssigned = ({ role }) => {
      setMyRole(role);
    };

    const handlePrivateCardsDrawn = ({ cards }) => {
      setPrivateCards(cards);
    };

    const handlePrivateCardsPassed = ({ cards }) => {
      setPrivateCards(cards);
    };

    const handlePrivateCardAction = ({ cards }) => {
      setPrivateCards(cards);
    };

    const handleCultConversionSuccess = (data) => {
      setConversionNotification(data);
      if (data.new_role) {
        setMyRole(data.new_role);
      }
    };

    socket.on('room_updated', handleRoomUpdated);
    socket.on('player_kicked', handlePlayerKicked);
    socket.on('room_dissolved', handleRoomDissolved);
    socket.on('role_assigned', handleRoleAssigned);
    socket.on('private_cards_drawn', handlePrivateCardsDrawn);
    socket.on('private_cards_passed', handlePrivateCardsPassed);
    socket.on('private_card_action', handlePrivateCardAction);
    socket.on('cult_conversion_success', handleCultConversionSuccess);

    return () => {
      socket.off('room_updated', handleRoomUpdated);
      socket.off('player_kicked', handlePlayerKicked);
      socket.off('room_dissolved', handleRoomDissolved);
      socket.off('role_assigned', handleRoleAssigned);
      socket.off('private_cards_drawn', handlePrivateCardsDrawn);
      socket.off('private_cards_passed', handlePrivateCardsPassed);
      socket.off('private_card_action', handlePrivateCardAction);
      socket.off('cult_conversion_success', handleCultConversionSuccess);
    };
  }, [socket, roomId, currentUserId, navigate]);

  // Actions
  const handleSelectAvatar = (avatarId) => {
    if (socket) socket.emit('select_avatar', { avatar: avatarId });
  };

  const handleSelectMap = (mapType) => {
    if (socket) socket.emit('select_map', { mapType });
  };

  const handleStartGame = () => {
    if (socket) socket.emit('start_game');
  };

  const handleLeaveRoom = () => {
    if (socket && window.confirm('Are you sure you want to leave the room?')) {
      socket.emit('leave_room', () => {
        navigate('/');
      });
    }
  };

  const handleDissolveRoom = () => {
    if (socket && window.confirm('Are you sure you want to dissolve the room? All players will be returned to the title screen.')) {
      socket.emit('dissolve_room', () => {
        navigate('/');
      });
    }
  };

  const handleKickPlayer = (playerId) => {
    if (socket && window.confirm('Are you sure you want to kick this player from the ship?')) {
      socket.emit('kick_player', { targetId: playerId });
    }
  };

  const handleAppointTeam = (lieutenantId, navigatorId) => {
    if (socket) socket.emit('appoint_team', { lieutenantId, navigatorId });
  };

  const handleSubmitVote = (gunCount) => {
    if (socket) socket.emit('submit_mutiny_vote', { gunCount });
  };

  const handleConfirmOutcome = () => {
    if (socket) socket.emit('confirm_mutiny_outcome');
  };

  const handleEliminateTieCandidate = (targetCandidateId) => {
    if (socket) socket.emit('eliminate_tie_candidate', { targetCandidateId });
  };

  const handleCutTongue = (targetPlayerId) => {
    if (socket) socket.emit('cut_tongue', { targetPlayerId });
  };

  const handleStartNavigation = () => {
    if (socket) socket.emit('start_navigation');
  };

  const handleCaptainSelectCard = (keptCardId) => {
    if (socket) socket.emit('captain_select_card', { keptCardId });
  };

  const handleLieutenantSelectCard = (keptCardId) => {
    if (socket) socket.emit('lieutenant_select_card', { keptCardId });
  };

  const handleNavigatorSelectCard = (chosenCardId) => {
    if (socket) socket.emit('navigator_select_card', { chosenCardId });
  };

  const handleNavigatorJumpOverboard = () => {
    if (socket) socket.emit('navigator_jump_overboard');
  };

  const handleAppointEmergencyNavigator = (newNavigatorId) => {
    if (socket) socket.emit('appoint_emergency_navigator', { newNavigatorId });
  };

  const handleExecuteMapAction = (targetPlayerId) => {
    if (socket) socket.emit('execute_map_action', { targetPlayerId });
  };

  const handleConfirmMapAction = () => {
    if (socket) socket.emit('confirm_map_action');
  };

  const handleDesignateCardTarget = (targetPlayerId) => {
    if (socket) socket.emit('designate_card_action_target', { targetPlayerId });
  };

  const handleResolveTelescope = (decision) => {
    if (socket) socket.emit('resolve_telescope_decision', { decision });
  };

  const handleAcknowledgeMermaid = () => {
    if (socket) socket.emit('acknowledge_mermaid');
  };

  const handleStartCultUprising = () => {
    if (socket) socket.emit('start_cult_uprising');
  };

  const handleResolveCultGuns = (allocations) => {
    if (socket) socket.emit('resolve_cult_guns_stash', { allocations });
  };

  const handleResolveCultCabinSearch = () => {
    if (socket) socket.emit('resolve_cult_cabin_search');
  };

  const handleResolveCultConversion = (targetPlayerId) => {
    if (socket) socket.emit('resolve_cult_conversion', { targetPlayerId });
  };

  const handleAdvanceNextRound = () => {
    if (socket) socket.emit('advance_next_round');
  };

  const handleReturnToLobby = () => {
    if (socket) socket.emit('return_to_lobby');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A08] text-white p-8 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-blood/80 border border-pirate-glow text-parchment-bright rounded-2xl text-center max-w-md font-heading shadow-2xl">
          {error}
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-hull hover:bg-hull-light text-gold font-display transition cursor-pointer"
        >
          Return to Title Screen
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0A0A08] text-white p-8 flex flex-col items-center justify-center space-y-4">
        <div className="text-2xl font-display text-gold animate-pulse">
          Connecting to room...
        </div>
        <button
          onClick={fetchRoomState}
          className="px-4 py-2 text-xs font-heading font-bold text-parchment-dim hover:text-white bg-hull rounded-lg transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const effectiveUserId = room.myId || currentUserId;

  // 0. End Game Phase
  if (room.status === 'FINISHED' || room.gamePhase === 'END_GAME') {
    return (
      <EndGame
        room={room}
        currentUserId={effectiveUserId}
        onReturnToLobby={handleReturnToLobby}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // 1. Lobby Phase
  if (room.status === 'LOBBY') {
    return (
      <Lobby 
        room={room} 
        currentUserId={effectiveUserId}
        onSelectAvatar={handleSelectAvatar}
        onSelectMap={handleSelectMap}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
        onDissolveRoom={handleDissolveRoom}
        onKickPlayer={handleKickPlayer}
      />
    );
  }

  // 2. Secret Role Reveal & Night Gathering Phase
  if (room.gamePhase === 'ROLE_REVEAL' || room.gamePhase === 'PIRATES_GATHERING') {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0A08]">
        <GameHeader
          room={room}
          currentUserId={effectiveUserId}
          onLeaveRoom={handleLeaveRoom}
          onDissolveRoom={handleDissolveRoom}
        />
        <div className="flex-1">
          <RoleReveal 
            room={room} 
            myRole={myRole || room.myRole} 
            currentUserId={effectiveUserId} 
          />
        </div>
      </div>
    );
  }

  // ── 3. Active Playing Phases: Dual-Pane Command Layout (60% Map + 40% Action Desk) ──

  const isNavigationPhase = [
    'NAVIGATION',
    'NAVIGATION_CAPTAIN_DRAW',
    'NAVIGATION_LIEUTENANT_DRAW',
    'NAVIGATION_NAVIGATOR_DECISION',
    'EMERGENCY_NAVIGATOR_SELECTION',
    'EXECUTE_ACTIONS'
  ].includes(room.gamePhase);

  const isExecutionPhase = [
    'EXECUTE_MAP_ACTION',
    'EXECUTE_CARD_ACTION',
    'CARD_ACTION_TARGET_SELECTION',
    'MERMAID_INSPECTION',
    'TELESCOPE_INSPECTION',
    'CULT_UPRISING',
    'CULT_UPRISING_BLIND',
    'ROUND_END'
  ].includes(room.gamePhase);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col select-none bg-[#0A0A08] bg-cover bg-center overflow-x-hidden"
      style={{
        backgroundImage: `url(${lobbyCabinBg})`,
      }}
    >
      {/* ── Atmospheric Overlays ── */}
      <Vignette />
      <DustParticles count={12} />

      {/* ── Fixed Top HUD Header ── */}
      <GameHeader
        room={room}
        currentUserId={effectiveUserId}
        onLeaveRoom={handleLeaveRoom}
        onDissolveRoom={handleDissolveRoom}
      />

      {/* ── Mobile Quick Tab Switch (< 1024px) ── */}
      <div className="flex lg:hidden items-center justify-center gap-3 px-4 pt-2 z-20">
        <button
          type="button"
          onClick={() => setMobileTab('CHART')}
          className={`font-display text-xs sm:text-sm px-4 py-1.5 rounded transition ${
            mobileTab === 'CHART'
              ? 'bg-gold text-[#140F0A] font-black shadow-lg'
              : 'bg-black/60 text-parchment-dim border border-gold/30'
          }`}
        >
          🗺️ SEA CHART
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('ACTION')}
          className={`relative font-display text-xs sm:text-sm px-4 py-1.5 rounded transition ${
            mobileTab === 'ACTION'
              ? 'bg-gold text-[#140F0A] font-black shadow-lg'
              : 'bg-black/60 text-parchment-dim border border-gold/30'
          }`}
        >
          ⚔️ ACTION DESK
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
        </button>
      </div>

      {/* ── Main Command Playing Stage (Dual-Pane Grid) ── */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* ── LEFT PANE (60% Desktop / 7 Cols): Persistent Sea Chart ── */}
          <section
            className={`lg:col-span-7 flex flex-col ${
              mobileTab === 'CHART' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="w-full">
              <MapBoardUI
                room={room}
                currentUserId={effectiveUserId}
                myRole={myRole || room.myRole}
                onExecuteMapAction={handleExecuteMapAction}
                onConfirmMapAction={handleConfirmMapAction}
                onDesignateCardTarget={handleDesignateCardTarget}
                onResolveTelescope={handleResolveTelescope}
                onAcknowledgeMermaid={handleAcknowledgeMermaid}
                onStartCultUprising={handleStartCultUprising}
                onResolveCultGuns={handleResolveCultGuns}
                onResolveCultCabinSearch={handleResolveCultCabinSearch}
                onResolveCultConversion={handleResolveCultConversion}
                onAdvanceNextRound={handleAdvanceNextRound}
              />
            </div>
          </section>

          {/* ── RIGHT PANE (40% Desktop / 5 Cols): Dynamic Action Desk ── */}
          <section
            className={`lg:col-span-5 flex flex-col ${
              mobileTab === 'ACTION' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="w-full">
              {isNavigationPhase ? (
                /* Phase: Navigation & Card Steer */
                <NavigationPhase
                  room={room}
                  currentUserId={effectiveUserId}
                  myRole={myRole || room.myRole}
                  privateCards={privateCards}
                  onStartNavigation={handleStartNavigation}
                  onCaptainSelectCard={handleCaptainSelectCard}
                  onLieutenantSelectCard={handleLieutenantSelectCard}
                  onNavigatorSelectCard={handleNavigatorSelectCard}
                  onNavigatorJumpOverboard={handleNavigatorJumpOverboard}
                  onAppointEmergencyNavigator={handleAppointEmergencyNavigator}
                />
              ) : (
                /* Default / Day Phase: Mutiny & Appointment */
                <MutinyBoard 
                  room={room}
                  currentUserId={effectiveUserId}
                  myRole={myRole || room.myRole}
                  onAppointTeam={handleAppointTeam}
                  onSubmitVote={handleSubmitVote}
                  onConfirmOutcome={handleConfirmOutcome}
                  onEliminateTieCandidate={handleEliminateTieCandidate}
                  onCutTongue={handleCutTongue}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── Minimizable Center Event Modal Overlay (Cult Ritual / Waypoint Alert) ── */}
      {conversionNotification && (
        <EventModalOverlay
          isOpen={true}
          title="SECRET CULT CONVERSION RITUAL"
          subtitle="A dark touch in the shadows of the cabin..."
          icon="🐙"
          onClose={() => setConversionNotification(null)}
        >
          <div className="space-y-2 text-center">
            <p className="font-heading text-sm text-[#2A2118] leading-relaxed">
              {conversionNotification.message}
            </p>
            <div className="p-2 rounded bg-purple-950/20 border border-purple-800/40 text-purple-900 font-bold">
              Your Cult Leader: <span className="text-gold-dim font-black">{conversionNotification.cult_leader_name}</span>
            </div>
          </div>
        </EventModalOverlay>
      )}

      {/* ── Fixed Bottom Crew Dock with Sliding Seating Radar Drawer ── */}
      <CrewSeatingDrawer
        room={room}
        currentUserId={effectiveUserId}
        onKickPlayer={handleKickPlayer}
      />
    </div>
  );
};

export default Game;
