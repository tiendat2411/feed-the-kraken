import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Lobby from './Lobby';
import RoleReveal from '../components/RoleReveal';
import MutinyBoard from '../components/MutinyBoard';
import NavigationPhase from '../components/NavigationPhase';
import MapBoardUI from '../components/MapBoardUI';
import GameHeader from '../components/GameHeader';
import EndGame from './EndGame';
import Vignette from '../components/ui/Vignette';
import DustParticles from '../components/ui/DustParticles';
import PanelWood from '../components/ui/PanelWood';
import CardParchment from '../components/ui/CardParchment';
import ButtonWood from '../components/ui/ButtonWood';

const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();

  // Initialize room with state from navigation if available to eliminate loading screen delay
  const [room, setRoom] = useState(location.state?.initialRoom || null);
  const [myRole, setMyRole] = useState(location.state?.initialRoom?.myRole || null);
  const [privateCards, setPrivateCards] = useState(location.state?.initialRoom?.myNavigationCards || []);
  const [error, setError] = useState('');
  const [conversionNotification, setConversionNotification] = useState(null);

  // Extract currentUserId from sessionToken
  const currentUserId = localStorage.getItem('sessionToken');

  const fetchRoomState = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit('get_room_state', { roomId }, (response) => {
      if (response?.success && response?.room) {
        setRoom(response.room);
        if (response.room.myRole) {
          setMyRole(response.room.myRole);
        }
        if (response.room.myNavigationCards && response.room.myNavigationCards.length > 0) {
          setPrivateCards(response.room.myNavigationCards);
        }
      } else if (response?.error) {
        setError(response.error);
      }
    });
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    // Fetch initial room state immediately
    fetchRoomState();

    // Re-fetch on connect or reconnect
    socket.on('connect', fetchRoomState);

    // Listen for room updates
    socket.on('room_state', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.myRole) {
        setMyRole(updatedRoom.myRole);
      }
      if (updatedRoom.myNavigationCards && updatedRoom.myNavigationCards.length > 0) {
        setPrivateCards(updatedRoom.myNavigationCards);
      }
    });

    // Listen for private role assignment
    socket.on('ROLE_ASSIGNED', ({ role }) => {
      setMyRole(role);
    });

    // Listen for secret cards drawn (Captain, Lieutenant, Navigator)
    socket.on('CARDS_DRAWN_SECRET', ({ role, cards }) => {
      setPrivateCards(cards || []);
    });

    socket.on('NAVIGATOR_CARDS_SECRET', ({ role, cards }) => {
      setPrivateCards(cards || []);
    });

    socket.on('NAVIGATION_CARD_EXECUTED', () => {
      setPrivateCards([]);
    });

    socket.on('NAVIGATOR_JUMPED_OVERBOARD', () => {
      setPrivateCards([]);
    });

    // Listen for Cult Conversion Private Notification (UC-015 AC-3)
    socket.on('CULTIST_CONVERTED', (data) => {
      setMyRole('CULTIST');
      setConversionNotification(data);
    });

    socket.on('GAME_OVER', () => {
      fetchRoomState();
    });

    socket.on('RETURNED_TO_LOBBY', () => {
      fetchRoomState();
    });

    socket.on('ROOM_DISSOLVED', () => {
      alert('The voyage was dissolved by the Captain.');
      navigate('/');
    });

    socket.on('PLAYER_KICKED', () => {
      alert('You have been cast overboard by the Captain.');
      navigate('/');
    });

    return () => {
      socket.off('connect', fetchRoomState);
      socket.off('room_state');
      socket.off('ROLE_ASSIGNED');
      socket.off('CARDS_DRAWN_SECRET');
      socket.off('NAVIGATOR_CARDS_SECRET');
      socket.off('NAVIGATION_CARD_EXECUTED');
      socket.off('NAVIGATOR_JUMPED_OVERBOARD');
      socket.off('CULTIST_CONVERTED');
      socket.off('GAME_OVER');
      socket.off('RETURNED_TO_LOBBY');
      socket.off('ROOM_DISSOLVED');
      socket.off('PLAYER_KICKED');
    };
  }, [socket, navigate, fetchRoomState]);

  const handleSelectAvatar = (avatar) => {
    if (socket) socket.emit('update_avatar', { avatar });
  };

  const handleSelectMap = (mapType) => {
    if (socket) socket.emit('update_map', { mapType });
  };

  const handleStartGame = () => {
    if (socket) socket.emit('start_game');
  };

  const handleLeaveRoom = () => {
    if (socket && window.confirm('Are you sure you want to disembark and return to harbor?')) {
      socket.emit('leave_room', () => {
        navigate('/');
      });
    }
  };

  const handleDissolveRoom = () => {
    if (socket && window.confirm('Are you sure you want to dissolve this voyage? All sailors will return to harbor.')) {
      socket.emit('dissolve_room', () => {
        navigate('/');
      });
    }
  };

  const handleKickPlayer = (playerId) => {
    if (socket && window.confirm('Cast this sailor overboard?')) {
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

  // BR-004 Execution Actions Handlers
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

  // Error Screen (Aged Blood / Parchment Warning)
  if (error) {
    return (
      <main className="min-h-[100dvh] bg-abyss text-parchment p-8 flex flex-col items-center justify-center relative">
        <Vignette mode="global" intensity="heavy" />
        <PanelWood glow="none" className="max-w-md w-full text-center space-y-4 border-blood/60 relative z-20">
          <div className="text-3xl select-none">⚠️</div>
          <h2 className="font-heading text-lg font-bold text-parchment-bright uppercase tracking-wider">
            Voyage Interrupted
          </h2>
          <p className="text-sm text-parchment-dim bg-blood/10 border border-blood/40 p-3 rounded">
            {error}
          </p>
          <ButtonWood variant="secondary" onClick={() => navigate('/')} fullWidth={true}>
            Return to Harbor
          </ButtonWood>
        </PanelWood>
      </main>
    );
  }

  // Loading Screen (Candlelight in the Abyss)
  if (!room) {
    return (
      <main className="min-h-[100dvh] bg-abyss text-parchment p-8 flex flex-col items-center justify-center relative">
        <Vignette mode="global" intensity="default" />
        <DustParticles count={5} />
        <div className="relative z-20 text-center space-y-4 animate-fade-in-up">
          <div className="w-2 h-6 mx-auto bg-gradient-to-t from-firelight via-gold to-white rounded-full animate-candle-flicker" />
          <h2 className="font-heading text-base md:text-lg font-bold text-gold tracking-widest uppercase animate-pulse">
            Reaching Vessel in the Fog...
          </h2>
          <ButtonWood variant="secondary" size="sm" onClick={fetchRoomState}>
            Retry Connection
          </ButtonWood>
        </div>
      </main>
    );
  }

  const effectiveUserId = room.myId || currentUserId;

  // ==========================================================================
  // 0. End Game Phase (BR-005 / UC-018)
  // ==========================================================================
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

  // ==========================================================================
  // Secret Cult Conversion Overlay Toast (UC-015 AC-3)
  // ==========================================================================
  const renderConversionToast = () => {
    if (!conversionNotification) return null;
    return (
      <div className="fixed top-14 right-4 sm:right-6 z-50 max-w-md p-4 sm:p-5 rounded bg-hull-dark border-2 border-cult shadow-eldritch text-parchment space-y-3 animate-fade-in-up">
        <div className="flex items-center space-x-3">
          <span className="text-3xl select-none animate-eldritch-pulse">🐙</span>
          <div>
            <h4 className="font-heading font-black text-cult-glow text-sm uppercase tracking-wider">
              Secret Cult Conversion
            </h4>
            <p className="text-xs text-parchment font-body mt-0.5">
              {conversionNotification.message}
            </p>
          </div>
        </div>
        <div className="p-2 bg-abyss/80 rounded border border-cult/40 text-xs text-gold font-heading tracking-wide">
          Your Cult Leader: <span className="font-bold text-parchment-bright">{conversionNotification.cult_leader_name}</span>
        </div>
        <ButtonWood
          variant="cult"
          size="sm"
          fullWidth={true}
          onClick={() => setConversionNotification(null)}
        >
          I Obey the Kraken
        </ButtonWood>
      </div>
    );
  };

  // ==========================================================================
  // 1. Lobby Phase
  // ==========================================================================
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

  // ==========================================================================
  // 2. Secret Role Reveal & Night Gathering Phase
  // ==========================================================================
  if (room.gamePhase === 'ROLE_REVEAL' || room.gamePhase === 'PIRATES_GATHERING') {
    return (
      <div className="min-h-[100dvh] bg-abyss flex flex-col relative overflow-x-hidden">
        <Vignette mode="global" intensity="heavy" />
        <DustParticles count={6} />
        {renderConversionToast()}
        <GameHeader
          room={room}
          currentUserId={effectiveUserId}
          onLeaveRoom={handleLeaveRoom}
          onDissolveRoom={handleDissolveRoom}
        />
        <div className="flex-1 relative z-10 flex flex-col justify-center">
          <RoleReveal 
            room={room} 
            myRole={myRole || room.myRole} 
            currentUserId={effectiveUserId} 
          />
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 3. Execution & Map Actions Phase (BR-004)
  // ==========================================================================
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

  if (isExecutionPhase) {
    return (
      <div className="min-h-[100dvh] bg-abyss flex flex-col relative overflow-x-hidden">
        <Vignette mode="global" intensity="default" />
        <DustParticles count={6} />
        {renderConversionToast()}
        <GameHeader
          room={room}
          currentUserId={effectiveUserId}
          onLeaveRoom={handleLeaveRoom}
          onDissolveRoom={handleDissolveRoom}
        />
        <div className="flex-1 relative z-10">
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
      </div>
    );
  }

  // ==========================================================================
  // 4. Navigation & Card Drawing Phase (BR-003)
  // ==========================================================================
  const isNavigationPhase = [
    'NAVIGATION',
    'NAVIGATION_CAPTAIN_DRAW',
    'NAVIGATION_LIEUTENANT_DRAW',
    'NAVIGATION_NAVIGATOR_DECISION',
    'EMERGENCY_NAVIGATOR_SELECTION',
    'EXECUTE_ACTIONS'
  ].includes(room.gamePhase);

  if (isNavigationPhase) {
    return (
      <div className="min-h-[100dvh] bg-abyss flex flex-col relative overflow-x-hidden">
        <Vignette mode="global" intensity="default" />
        <DustParticles count={6} />
        {renderConversionToast()}
        <GameHeader
          room={room}
          currentUserId={effectiveUserId}
          onLeaveRoom={handleLeaveRoom}
          onDissolveRoom={handleDissolveRoom}
        />
        <div className="flex-1 relative z-10">
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
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 5. Day Phase & Mutiny Voting (BR-002)
  // ==========================================================================
  return (
    <div className="min-h-[100dvh] bg-abyss flex flex-col relative overflow-x-hidden">
      <Vignette mode="global" intensity="default" />
      <DustParticles count={6} />
      {renderConversionToast()}
      <GameHeader
        room={room}
        currentUserId={effectiveUserId}
        onLeaveRoom={handleLeaveRoom}
        onDissolveRoom={handleDissolveRoom}
      />
      <div className="flex-1 relative z-10">
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
      </div>
    </div>
  );
};

export default Game;
