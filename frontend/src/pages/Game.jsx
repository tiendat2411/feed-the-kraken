import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Lobby from './Lobby';
import RoleReveal from '../components/RoleReveal';
import MutinyBoard from '../components/MutinyBoard';
import NavigationPhase from '../components/NavigationPhase';
import MapBoardUI from '../components/MapBoardUI';
import GameHeader from '../components/GameHeader';

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
  const [showMapModal, setShowMapModal] = useState(false);
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

    socket.on('ROOM_DISSOLVED', () => {
      alert('Phòng đã bị chủ phòng giải tán.');
      navigate('/');
    });

    socket.on('PLAYER_KICKED', () => {
      alert('Bạn đã bị chủ phòng kick.');
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
    if (socket && window.confirm('Bạn có chắc chắn muốn rời khỏi phòng không?')) {
      socket.emit('leave_room', () => {
        navigate('/');
      });
    }
  };

  const handleDissolveRoom = () => {
    if (socket && window.confirm('Bạn có chắc chắn muốn giải tán phòng không? Tất cả người chơi sẽ bị đưa về trang chủ.')) {
      socket.emit('dissolve_room', () => {
        navigate('/');
      });
    }
  };

  const handleKickPlayer = (playerId) => {
    if (socket && window.confirm('Bạn có chắc chắn muốn kick người chơi này không?')) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-2xl text-center max-w-md">
          {error}
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
        >
          Quay lại Trang Chủ
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center space-y-4">
        <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
          Connecting to room...
        </div>
        <button
          onClick={fetchRoomState}
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
        >
          Thử kết nối lại
        </button>
      </div>
    );
  }

  const effectiveUserId = room.myId || currentUserId;

  // Conversion Private Alert Overlay (UC-015 AC-3)
  const renderConversionToast = () => {
    if (!conversionNotification) return null;
    return (
      <div className="fixed top-6 right-6 z-50 max-w-md p-5 rounded-3xl bg-purple-950 border border-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.5)] text-white space-y-3 animate-bounce">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🐙</span>
          <div>
            <h4 className="font-black text-purple-300 text-sm">THU NẠP TÀ GIÁO BÍ MẬT</h4>
            <p className="text-xs text-purple-200">
              {conversionNotification.message}
            </p>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-purple-900/60 text-xs border border-purple-500/40 text-amber-300">
          Giáo chủ của bạn: <span className="font-black">{conversionNotification.cult_leader_name}</span>
        </div>
        <button
          onClick={() => setConversionNotification(null)}
          className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs"
        >
          ĐÃ HIỂU
        </button>
      </div>
    );
  };

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
      <div className="min-h-screen flex flex-col">
        {renderConversionToast()}
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

  // 3. Execution & Map Actions Phase (BR-004)
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
      <div className="min-h-screen flex flex-col">
        {renderConversionToast()}
        <GameHeader
          room={room}
          currentUserId={effectiveUserId}
          onLeaveRoom={handleLeaveRoom}
          onDissolveRoom={handleDissolveRoom}
        />
        <div className="flex-1">
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

  // 4. Navigation & Card Drawing Phase (BR-003)
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
      <div className="min-h-screen flex flex-col">
        {renderConversionToast()}
        <GameHeader
          room={room}
          currentUserId={effectiveUserId}
          onLeaveRoom={handleLeaveRoom}
          onDissolveRoom={handleDissolveRoom}
        />
        <div className="flex-1">
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

  // 5. Day Phase & Mutiny Voting (BR-002)
  return (
    <div className="min-h-screen flex flex-col">
      {renderConversionToast()}
      <GameHeader
        room={room}
        currentUserId={effectiveUserId}
        onLeaveRoom={handleLeaveRoom}
        onDissolveRoom={handleDissolveRoom}
      />
      <div className="flex-1">
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
