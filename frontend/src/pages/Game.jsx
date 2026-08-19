import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Lobby from './Lobby';

const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');

  // Extract currentUserId from socket (socket.id is not stable on reconnect, but sessionToken is. For now let's assume we can use a token from localStorage)
  const currentUserId = localStorage.getItem('sessionToken');

  useEffect(() => {
    if (!socket) return;

    // Listen for room updates
    socket.on('room_state', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('ROOM_DISSOLVED', () => {
      alert('Phòng đã bị chủ phòng giải tán.');
      navigate('/');
    });

    socket.on('PLAYER_KICKED', () => {
      alert('Bạn đã bị chủ phòng kick.');
      navigate('/');
    });

    // We should probably ask server for current room state if we just navigated here
    // In a real app, join_room is called from Home, and on reconnect it's handled.
    // For now, if we don't have room, we might just be waiting for the server to send 'room_state'
    
    return () => {
      socket.off('room_state');
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

  if (room.status === 'LOBBY') {
    return (
      <Lobby 
        room={room} 
        currentUserId={currentUserId}
        onSelectAvatar={handleSelectAvatar}
        onSelectMap={handleSelectMap}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
        onDissolveRoom={handleDissolveRoom}
        onKickPlayer={handleKickPlayer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h2 className="text-2xl font-bold mb-4">In Game - Room: {room.id}</h2>
      <p>Game Phase: {room.gamePhase}</p>
      {/* Board component will go here in the future */}
    </div>
  );
};

export default Game;
