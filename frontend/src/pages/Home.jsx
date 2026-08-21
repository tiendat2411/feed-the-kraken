import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    setError('');
    socket.emit('create_room', { playerName: nickname }, (response) => {
      if (response.success) {
        navigate(`/game/${response.room.id}`, { state: { initialRoom: response.room } });
      } else {
        setError(response.error || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomCode.trim()) {
      setError('Please enter both nickname and room code');
      return;
    }
    setError('');
    socket.emit('join_room', { roomId: roomCode.toUpperCase(), playerName: nickname }, (response) => {
      if (response.success) {
        navigate(`/game/${response.room.id}`, { state: { initialRoom: response.room } });
      } else {
        setError(response.error || 'Failed to join room');
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full text-center">
        <h1 className="text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Feed The Kraken
        </h1>
        <p className="text-slate-400 mb-8 font-medium">Prepare for a treacherous voyage.</p>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl text-sm">{error}</div>}

        <div className="space-y-4 mb-8">
          <div>
            <input 
              type="text" 
              placeholder="Enter your nickname" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              maxLength={15}
            />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Room Code (to join)" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition uppercase"
              maxLength={6}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleCreateRoom}
            disabled={!socket?.connected}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            CREATE NEW ROOM
          </button>
          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="text-slate-500 text-sm font-medium">OR</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>
          <button 
            onClick={handleJoinRoom}
            disabled={!socket?.connected}
            className="w-full py-4 rounded-xl font-bold text-lg bg-slate-800 hover:bg-slate-700 border border-white/10 transition duration-300 disabled:opacity-50"
          >
            JOIN ROOM
          </button>
        </div>
        
        {!socket?.connected && (
          <p className="mt-6 text-sm text-yellow-500/80 animate-pulse">Connecting to server...</p>
        )}
      </div>
    </div>
  );
};

export default Home;
