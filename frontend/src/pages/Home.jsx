import React from 'react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Feed The Kraken</h1>
      <p className="text-gray-400 mb-8">Enter a room code or create a new game.</p>
      
      <div className="flex space-x-4">
        <button className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">Create Room</button>
        <button className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">Join Room</button>
      </div>
    </div>
  );
};

export default Home;
