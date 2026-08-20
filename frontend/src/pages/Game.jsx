import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Lobby from './Lobby';
import RoleReveal from '../components/RoleReveal';
import MutinyBoard from '../components/MutinyBoard';

const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [room, setRoom] = useState(null);
  const [myRole, setMyRole] = useState(null);
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

  // 3. Day Phase & Mutiny & Navigation
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
