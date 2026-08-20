import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Lobby from './Lobby';
import RoleReveal from '../components/RoleReveal';
import MutinyBoard from '../components/MutinyBoard';
import NavigationPhase from '../components/NavigationPhase';

const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [room, setRoom] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [privateCards, setPrivateCards] = useState([]);
  const [error, setError] = useState('');

  // Extract currentUserId from sessionToken
  const currentUserId = localStorage.getItem('sessionToken');

  useEffect(() => {
    if (!socket) return;

    // Listen for room updates
    socket.on('room_state', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.myRole) {
        setMyRole(updatedRoom.myRole);
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

    socket.on('ROOM_DISSOLVED', () => {
      alert('Phòng đã bị chủ phòng giải tán.');
      navigate('/');
    });

    socket.on('PLAYER_KICKED', () => {
      alert('Bạn đã bị chủ phòng kick.');
      navigate('/');
    });

    return () => {
      socket.off('room_state');
      socket.off('ROLE_ASSIGNED');
      socket.off('CARDS_DRAWN_SECRET');
      socket.off('NAVIGATOR_CARDS_SECRET');
      socket.off('NAVIGATION_CARD_EXECUTED');
      socket.off('NAVIGATOR_JUMPED_OVERBOARD');
      socket.off('ROOM_DISSOLVED');
      socket.off('PLAYER_KICKED');
    };
  }, [socket, navigate]);

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
    if (socket) {
      socket.emit('leave_room');
      navigate('/');
    }
  };

  const handleDissolveRoom = () => {
    if (socket && window.confirm('Bạn có chắc chắn muốn giải tán phòng không?')) {
      socket.emit('dissolve_room');
      navigate('/');
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

  if (error) {
    return <div className="min-h-screen bg-slate-900 text-white p-8">{error}</div>;
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <div className="text-xl animate-pulse">Connecting to room...</div>
      </div>
    );
  }

  const effectiveUserId = room.myId || currentUserId;

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
      <RoleReveal 
        room={room} 
        myRole={myRole || room.myRole} 
        currentUserId={effectiveUserId} 
      />
    );
  }

  // 3. Navigation & Card Drawing Phase (BR-003)
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
      <NavigationPhase
        room={room}
        currentUserId={effectiveUserId}
        myRole={myRole || room.myRole}
        privateCards={privateCards}
        onCaptainSelectCard={handleCaptainSelectCard}
        onLieutenantSelectCard={handleLieutenantSelectCard}
        onNavigatorSelectCard={handleNavigatorSelectCard}
        onNavigatorJumpOverboard={handleNavigatorJumpOverboard}
        onAppointEmergencyNavigator={handleAppointEmergencyNavigator}
      />
    );
  }

  // 4. Day Phase & Mutiny Voting (BR-002)
  return (
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
  );
};

export default Game;
