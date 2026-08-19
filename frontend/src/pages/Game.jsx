import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Lobby from './Lobby';
import RoleReveal from '../components/RoleReveal';

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

  // 1. Lobby Phase
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

  // 2. Secret Role Reveal & Night Gathering Phase
  if (room.gamePhase === 'ROLE_REVEAL' || room.gamePhase === 'PIRATES_GATHERING') {
    return (
      <RoleReveal 
        room={room} 
        myRole={myRole || room.myRole} 
        currentUserId={currentUserId} 
      />
    );
  }

  // 3. Day Phase & Ongoing Game
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-4">
        <span className="px-4 py-1 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-sm">
          ☀️ BAN NGÀY - BÌNH MINH ĐÃ LÊN
        </span>
        <h2 className="text-3xl font-extrabold">Room: {room.id} - Giai đoạn: {room.gamePhase}</h2>
        <p className="text-slate-400">
          Thuyền trưởng hiện tại: <span className="text-emerald-400 font-bold">{room.players.find(p => p.id === room.captainId)?.nickname || 'Host'}</span>
        </p>
        <div className="p-4 bg-slate-800/60 rounded-2xl border border-white/5 inline-block text-left text-sm space-y-1">
          <p>🎭 Vai trò của bạn: <strong className="text-blue-400">{myRole || room.myRole || 'Đang tải...'}</strong></p>
          <p>🗺️ Bản đồ: <strong className="text-purple-400">{room.mapType}</strong></p>
          <p>👥 Thủy thủ đoàn: <strong className="text-slate-200">{room.players.length} người</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Game;
