import React, { useEffect, useState, useRef } from 'react';
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
import DustParticles from '../components/ui/DustParticles';
import cabinRoomBg from '../assets/ui/backgrounds/cabin_room_bg.jpg';
import tabletopCaptainDeskPng from '../assets/ui/backgrounds/tabletop_captain_desk.png';
import scrollActionDeskTriggerPng from '../assets/ui/sprites/scroll_action_desk_trigger.png';
import krakenEyesGlowPng from '../assets/ui/sprites/kraken_eyes_glow.png';
import emblemCultLeaderPng from '../assets/ui/sprites/emblem_cult_leader.png';
import { getAvatarSrc } from '../constants/avatars';
import badgeCaptainHatPng from '../assets/ui/sprites/badge_captain_hat.png';
import iconFlintlockPistolPng from '../assets/ui/sprites/icon_flintlock_pistol.png';
import badgeNavigatorCompassPng from '../assets/ui/sprites/badge_navigator_compass.png';

/**
 * Game Master Page Component (Feature 007 - In-Game Command Layout Architecture)
 * - 100% English display language & Eldritch Parchment aesthetic.
 * - Persistent Full Sea Chart (~100% width MapBoardUI).
 * - Floating Action Trigger Latch (compact brass tab fixed at right edge).
 * - Full-Width Sliding Action Desk (opens to full canvas for Phase operations).
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

  // Full-Width Action Desk Drawer State
  const [isActionDeskOpen, setIsActionDeskOpen] = useState(false);
  const prevPhaseRef = useRef(room?.gamePhase);

  // Auto-slide open Action Desk when entering an interactive phase
  useEffect(() => {
    if (room?.gamePhase && room.gamePhase !== prevPhaseRef.current) {
      prevPhaseRef.current = room.gamePhase;
      const interactivePhases = [
        'DAY_1_CREW_SELECTION',
        'APPOINT_TEAM',
        'LOYALTY_CHECK',
        'MUTINY_VOTE',
        'MUTINY_REVEALED',
        'MUTINY_TIE_BREAKER',
        'NAVIGATION',
        'CAPTAIN_DRAW',
        'LIEUTENANT_PASS',
        'NAVIGATOR_CHOOSE'
      ];
      if (interactivePhases.includes(room.gamePhase)) {
        setIsActionDeskOpen(true);
      }
    }
  }, [room?.gamePhase]);

  const getActionDeskSprite = () => {
    const phase = room?.gamePhase || '';
    if (phase.includes('APPOINT') || phase.includes('CREW_SELECTION')) {
      return badgeCaptainHatPng;
    }
    if (phase.includes('MUTINY') || phase === 'LOYALTY_CHECK') {
      return iconFlintlockPistolPng;
    }
    return badgeNavigatorCompassPng;
  };

  const fetchRoomState = () => {
    if (!socket || !roomId) return;
    socket.emit('get_room_state', { roomId }, (response) => {
      if (response && response.success) {
        setRoom(response.room);
        if (response.room?.myRole) {
          setMyRole(response.room.myRole);
        }
        if (response.room?.myId) {
          setCurrentUserId(response.room.myId);
        }
        if (response.room?.myNavigationCards) {
          setPrivateCards(response.room.myNavigationCards);
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
      if (updatedRoom?.myNavigationCards !== undefined) {
        setPrivateCards(updatedRoom.myNavigationCards || []);
      }
    };

    const handlePlayerKicked = () => {
      alert('You have been kicked from the room by the host.');
      navigate('/');
    };

    const handleRoomDissolved = () => {
      alert('The room was dissolved by the host.');
      navigate('/');
    };

    const handleRoleAssigned = ({ role }) => {
      setMyRole(role);
    };

    const handlePrivateCardsDrawn = ({ cards }) => {
      setPrivateCards(cards || []);
    };

    const handlePrivateCardsPassed = ({ cards }) => {
      setPrivateCards(cards || []);
    };

    const handlePrivateCardAction = ({ cards }) => {
      setPrivateCards(cards || []);
    };

    const handleNavigationCardExecuted = () => {
      setPrivateCards([]);
    };

    const handleCultConversionSuccess = (data) => {
      setConversionNotification({
        message: data?.message || 'You have been secretly converted into the Cult by the Cult Leader!',
        cult_leader_id: data?.cult_leader_id,
        cult_leader_name: data?.cult_leader_name,
        cult_leader_avatar: data?.cult_leader_avatar || 'jack_sparrow'
      });
      setMyRole('CULTIST');
    };

    // Listen to real-time room updates from backend
    socket.on('room_state', handleRoomUpdated);
    socket.on('room_updated', handleRoomUpdated);
    socket.on('PLAYER_KICKED', handlePlayerKicked);
    socket.on('player_kicked', handlePlayerKicked);
    socket.on('ROOM_DISSOLVED', handleRoomDissolved);
    socket.on('room_dissolved', handleRoomDissolved);
    socket.on('ROLE_ASSIGNED', handleRoleAssigned);
    socket.on('role_assigned', handleRoleAssigned);
    socket.on('CARDS_DRAWN_SECRET', handlePrivateCardsDrawn);
    socket.on('cards_drawn_secret', handlePrivateCardsDrawn);
    socket.on('NAVIGATOR_CARDS_SECRET', handlePrivateCardsDrawn);
    socket.on('navigator_cards_secret', handlePrivateCardsDrawn);
    socket.on('CARD_PASSED_SECRET', handlePrivateCardsPassed);
    socket.on('card_passed_secret', handlePrivateCardsPassed);
    socket.on('CARD_ACTION_PRIVATE', handlePrivateCardAction);
    socket.on('card_action_private', handlePrivateCardAction);
    socket.on('NAVIGATION_CARD_EXECUTED', handleNavigationCardExecuted);
    socket.on('navigation_card_executed', handleNavigationCardExecuted);
    socket.on('CULTIST_CONVERTED', handleCultConversionSuccess);
    socket.on('cultist_converted', handleCultConversionSuccess);
    socket.on('CULT_CONVERSION_SUCCESS', handleCultConversionSuccess);
    socket.on('cult_conversion_success', handleCultConversionSuccess);

    return () => {
      socket.off('room_state', handleRoomUpdated);
      socket.off('room_updated', handleRoomUpdated);
      socket.off('PLAYER_KICKED', handlePlayerKicked);
      socket.off('player_kicked', handlePlayerKicked);
      socket.off('ROOM_DISSOLVED', handleRoomDissolved);
      socket.off('room_dissolved', handleRoomDissolved);
      socket.off('ROLE_ASSIGNED', handleRoleAssigned);
      socket.off('role_assigned', handleRoleAssigned);
      socket.off('CARDS_DRAWN_SECRET', handlePrivateCardsDrawn);
      socket.off('cards_drawn_secret', handlePrivateCardsDrawn);
      socket.off('NAVIGATOR_CARDS_SECRET', handlePrivateCardsDrawn);
      socket.off('navigator_cards_secret', handlePrivateCardsDrawn);
      socket.off('CARD_PASSED_SECRET', handlePrivateCardsPassed);
      socket.off('card_passed_secret', handlePrivateCardsPassed);
      socket.off('CARD_ACTION_PRIVATE', handlePrivateCardAction);
      socket.off('card_action_private', handlePrivateCardAction);
      socket.off('NAVIGATION_CARD_EXECUTED', handleNavigationCardExecuted);
      socket.off('navigation_card_executed', handleNavigationCardExecuted);
      socket.off('CULTIST_CONVERTED', handleCultConversionSuccess);
      socket.off('cultist_converted', handleCultConversionSuccess);
      socket.off('CULT_CONVERSION_SUCCESS', handleCultConversionSuccess);
      socket.off('cult_conversion_success', handleCultConversionSuccess);
    };
  }, [socket, roomId, currentUserId, navigate]);

  // Actions
  const handleSelectAvatar = (avatarId) => {
    if (socket) {
      socket.emit('update_avatar', { avatar: avatarId });
      socket.emit('select_avatar', { avatar: avatarId });
    }
  };

  const handleSelectMap = (mapType) => {
    if (socket) {
      socket.emit('update_map', { mapType });
      socket.emit('select_map', { mapType });
    }
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

  const handleConfirmCultNight = () => {
    if (socket) socket.emit('confirm_cult_night');
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
      className="relative min-h-screen w-full flex flex-col select-none bg-[#07090C] bg-cover bg-top bg-no-repeat overflow-x-hidden"
      style={{
        backgroundImage: `url(${cabinRoomBg})`,
      }}
    >
      {/* ── Atmospheric Particle Overlays ── */}
      <DustParticles count={14} />

      {/* ── Fixed Top HUD Header (Z-50) ── */}
      <GameHeader
        room={room}
        currentUserId={effectiveUserId}
        onLeaveRoom={handleLeaveRoom}
        onDissolveRoom={handleDissolveRoom}
      />

      {/* ── Main Command Deck Canvas: Captain's Tabletop & Under-Drawer ── */}
      <main className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 pt-28 sm:pt-36 md:pt-[16vw] lg:pt-[19vw] xl:pt-[21vw] pb-12 flex flex-col items-center">
        
        {/* ── Zone 2: Independent Captain's Tabletop Container (90° Orthographic Flat Lay, ~70% Scale) ── */}
        <div className="relative w-[92%] sm:w-[82%] md:w-[72%] max-w-[1160px] aspect-[1920/1069] flex items-center justify-center filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] select-none">
          {/* Tabletop Surface Asset (with Flintlock Pistol, Dagger, Rum Mug, Gold Coins, Fine Brass Rim) */}
          <img
            src={tabletopCaptainDeskPng}
            alt="Captain's Tabletop Desk"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 select-none"
            aria-hidden="true"
          />

          {/* ── Zone 3: Action Desk Trigger Scroll (Mounted on Lower-Right Flank, below Rum Mug) ── */}
          <div className="absolute right-[3.6%] top-[44%] z-30 pointer-events-auto select-none">
            <button
              type="button"
              id="btn-trigger-action-desk"
              onClick={() => setIsActionDeskOpen(!isActionDeskOpen)}
              className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 transform hover:scale-105 active:scale-95 focus:outline-none"
              title={isActionDeskOpen ? "Return to Sea Chart" : "Open Action Desk"}
            >
              {/* Clean Rolled Parchment Scroll with Red Wax Skull & Anchor Seal */}
              <div className="relative w-9 sm:w-11 md:w-13 aspect-[284/850] flex flex-col items-center justify-center filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)] hover:drop-shadow-[0_0_20px_rgba(232,166,62,0.9)] opacity-100 transition-all">
                <img
                  src={scrollActionDeskTriggerPng}
                  alt="Action Desk Scroll Trigger"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
            </button>
          </div>

          {/* ── Zone 2: Central Stage (In-Desk Brass Frame Interior: Exactly bounded by engraved brass rim) ── */}
          <div className="absolute left-[11.9%] right-[11.9%] top-[18.4%] bottom-[16.2%] z-10 overflow-hidden shadow-inner bg-[#070A0F]/80">
            {/* 1. Default State: Persistent Full Sea Chart (MapBoardUI) */}
            <div
              className={`w-full h-full overflow-y-auto transition-opacity duration-300 ${
                isActionDeskOpen ? 'hidden' : 'block animate-fadeIn'
              }`}
            >
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
                onConfirmCultNight={handleConfirmCultNight}
                onResolveCultGuns={handleResolveCultGuns}
                onResolveCultCabinSearch={handleResolveCultCabinSearch}
                onResolveCultConversion={handleResolveCultConversion}
                onAdvanceNextRound={handleAdvanceNextRound}
              />
            </div>

            {/* 2. Action State: In-Place Sliding Action Desk (Mutiny / Navigation) */}
            <div
              className={`w-full h-full overflow-y-auto p-3 sm:p-5 bg-[#0C0907]/96 transition-all duration-300 ${
                isActionDeskOpen ? 'block animate-fadeIn' : 'hidden'
              }`}
            >
              {/* In-Desk Action Header */}
              <div className="sticky top-0 z-20 w-full bg-[#16100A]/95 border-b border-gold/40 px-3 py-2 mb-3 flex items-center justify-between rounded-lg shadow-md">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                    <img
                      src={getActionDeskSprite()}
                      alt="Active Phase"
                      className="w-full h-full object-contain filter drop-shadow"
                    />
                  </div>
                  <h2 className="font-display font-black text-sm sm:text-lg text-gold tracking-widest uppercase text-shadow-sm">
                    {room?.gamePhase ? room.gamePhase.replace(/_/g, ' ') : 'ACTION DESK'}
                  </h2>
                </div>

                <button
                  type="button"
                  id="btn-return-to-sea-chart"
                  onClick={() => setIsActionDeskOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#20170F] hover:bg-[#2F2115] border border-gold/50 text-gold hover:text-parchment-bright font-display text-xs sm:text-sm tracking-wider transition-all shadow cursor-pointer"
                >
                  <span>◀</span>
                  <span>PEEK SEA CHART</span>
                </button>
              </div>

              {/* Action Content Canvas */}
              <div className="w-full max-w-5xl mx-auto pb-6">
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
            </div>
          </div>
        </div>

        {/* ── Zone 5: Non-Sticky Captain's Under-Drawer (Below Desk Flat Bottom Edge) ── */}
        <CrewSeatingDrawer
          room={room}
          currentUserId={effectiveUserId}
          onKickPlayer={handleKickPlayer}
        />
      </main>

      {/* ── Secret Cult Conversion Modal for Converted Victim (AC-3 UC-015) ── */}
      {conversionNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn select-none">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#120A16] border-2 border-purple-500 shadow-[0_0_80px_rgba(168,85,247,0.6)] text-center space-y-5 text-parchment-bright">
            {/* Header */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 flex items-center justify-center filter drop-shadow-[0_0_25px_rgba(168,85,247,0.9)] animate-pulse">
                <img
                  src={krakenEyesGlowPng}
                  alt="Kraken Eyes"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-purple-300 tracking-wider">
                YOU HAVE BEEN CONVERTED!
              </h2>
              <div className="px-3.5 py-1 rounded-full bg-purple-900/60 border border-purple-400 text-purple-200 font-heading font-black text-xs uppercase tracking-widest">
                NEW FACTION: CULTIST
              </div>
            </div>

            <p className="text-xs sm:text-sm font-heading text-slate-300 leading-relaxed px-2">
              An occult whisper from the depths has claimed your soul. You are no longer loyal to your former faction — you now serve the ancient Kraken! Your new mission is to steer the ship to the <span className="font-bold text-purple-300">Kraken's Nest</span> or sacrifice your Cult Leader to the abyss!
            </p>

            {/* Revealed Cult Leader Identity Card */}
            <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-400/80 shadow-2xl flex items-center gap-4 text-left">
              <div className="relative w-16 h-16 rounded-full p-1 bg-[#1A1510] border-2 border-gold shadow-[0_0_15px_rgba(232,166,62,0.7)] flex-shrink-0">
                <img
                  src={getAvatarSrc(conversionNotification.cult_leader_avatar)}
                  alt={conversionNotification.cult_leader_name}
                  className="w-full h-full object-cover rounded-full pointer-events-none"
                />
                <img
                  src={emblemCultLeaderPng}
                  alt="Cult Leader Badge"
                  className="absolute -top-2 -right-2 w-7 h-7 object-contain filter drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading text-[11px] text-purple-300 uppercase tracking-widest font-black">
                  YOUR SECRET CULT LEADER
                </div>
                <div className="font-display font-black text-lg sm:text-xl text-gold-bright truncate">
                  {conversionNotification.cult_leader_name}
                </div>
                <div className="font-heading text-[10px] text-slate-400 leading-tight">
                  Protect their identity at all costs. Do not let other factions discover them!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConversionNotification(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 font-display font-black text-white text-sm sm:text-base tracking-widest uppercase shadow-2xl shadow-purple-900/50 active:scale-98 transition cursor-pointer"
            >
              I SERVE THE KRAKEN ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
