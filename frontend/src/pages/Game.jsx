import React from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

const Game = () => {
  const { roomId } = useParams();
  const socket = useSocket();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h2 className="text-2xl font-bold mb-4">Room: {roomId}</h2>
      <p className="text-gray-400">Waiting for other players...</p>
      
      <div className="mt-8 p-4 bg-gray-800 rounded">
        <p>Socket Status: {socket ? (socket.connected ? 'Connected 🟢' : 'Connecting 🟡') : 'Initializing 🔴'}</p>
      </div>
    </div>
  );
};

export default Game;
