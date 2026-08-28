import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { Anchor, Compass, User, KeyRound, Skull, Flame } from 'lucide-react';
import PanelWood from '../components/ui/PanelWood';
import CardParchment from '../components/ui/CardParchment';
import ButtonWood from '../components/ui/ButtonWood';
import InputPlank from '../components/ui/InputPlank';
import Vignette from '../components/ui/Vignette';
import DustParticles from '../components/ui/DustParticles';

const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = () => {
    if (!nickname.trim()) {
      setError('Please enter your sailor nickname.');
      return;
    }
    setError('');
    setIsLoading(true);
    socket.emit('create_room', { playerName: nickname.trim() }, (response) => {
      setIsLoading(false);
      if (response?.success) {
        navigate(`/game/${response.room.id}`, { state: { initialRoom: response.room } });
      } else {
        setError(response?.error || 'Failed to create voyage room.');
      }
    });
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomCode.trim()) {
      setError('Enter both nickname and voyage code.');
      return;
    }
    setError('');
    setIsLoading(true);
    socket.emit(
      'join_room',
      { roomId: roomCode.trim().toUpperCase(), playerName: nickname.trim() },
      (response) => {
        setIsLoading(false);
        if (response?.success) {
          navigate(`/game/${response.room.id}`, { state: { initialRoom: response.room } });
        } else {
          setError(response?.error || 'Failed to board the ship. Check the room code.');
        }
      }
    );
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 py-8 bg-abyss text-parchment overflow-hidden">
      {/* Atmospheric Ambient Layers */}
      <Vignette mode="global" intensity="default" />
      <DustParticles count={8} />

      {/* Background Decorative Sea Watermark & Wave Silhouettes */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none opacity-20 flex items-center justify-center overflow-hidden"
      >
        <svg
          className="w-[800px] h-[800px] text-hull-light animate-ship-bob"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          {/* Subtle Kraken Tentacle & Compass silhouette watermark */}
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
          <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" fill="none" opacity="0.4" />
          <path
            d="M50 8 L54 44 L90 50 L54 56 L50 92 L46 56 L10 50 L46 44 Z"
            fill="currentColor"
            opacity="0.15"
          />
        </svg>
      </div>

      {/* Main Cabin Command Panel (Centered Double-Bezel Frame) */}
      <div className="relative z-20 w-full max-w-md animate-fade-in-up">
        {/* Flanking Candlelight Flame Accents (Left & Right) */}
        <div className="hidden sm:flex absolute -left-6 top-1/2 -translate-y-1/2 flex-col items-center pointer-events-none select-none z-30">
          <div className="w-1.5 h-4 bg-gradient-to-t from-firelight via-gold to-white rounded-full animate-candle-flicker" />
          <div className="w-2.5 h-16 bg-gradient-to-b from-[#4A3B2A] to-[#2A2118] rounded-sm border-t border-gold-dim/40 shadow-md" />
        </div>
        <div className="hidden sm:flex absolute -right-6 top-1/2 -translate-y-1/2 flex-col items-center pointer-events-none select-none z-30">
          <div className="w-1.5 h-4 bg-gradient-to-t from-firelight via-gold to-white rounded-full animate-candle-flicker" />
          <div className="w-2.5 h-16 bg-gradient-to-b from-[#4A3B2A] to-[#2A2118] rounded-sm border-t border-gold-dim/40 shadow-md" />
        </div>

        {/* Outer Hull Wood Panel */}
        <PanelWood glow="firelight" nails={true} className="border-gold-dim/40">
          {/* Inner Aged Parchment Card */}
          <CardParchment stains={true} className="text-center p-6 md:p-8 space-y-6">
            
            {/* Header: Title with Kraken Silhouette */}
            <div className="relative pt-2">
              {/* Subtle tentacle silhouette behind title */}
              <div 
                aria-hidden="true" 
                className="absolute inset-x-0 -top-4 flex justify-center opacity-15 pointer-events-none"
              >
                <Skull className="w-24 h-24 text-gold animate-ship-bob" strokeWidth={1} />
              </div>

              <h1 className="relative font-display text-4xl sm:text-5xl md:text-6xl text-gold-bright tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Feed The Kraken
              </h1>
              <p className="font-heading text-xs sm:text-sm text-parchment-dim tracking-[0.2em] uppercase mt-1">
                A Treacherous Voyage into the Abyss
              </p>

              {/* Decorative Nautical Line */}
              <div className="flex items-center justify-center gap-3 my-4">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold-dim to-transparent" />
                <Anchor className="w-3.5 h-3.5 text-gold-dim" strokeWidth={1.5} />
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold-dim to-transparent" />
              </div>
            </div>

            {/* Error Message Box (Aged Blood Notice) */}
            {error && (
              <div className="p-3 bg-blood/20 border border-blood/60 text-parchment-bright rounded text-xs sm:text-sm text-left flex items-start gap-2 shadow-inner animate-fade-in-up">
                <span className="text-blood font-bold text-base leading-none">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields: Nickname & Room Code */}
            <div className="space-y-4">
              <InputPlank
                label="Sailor Nickname"
                placeholder="e.g. Captain Morgan"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={15}
                icon={<User className="w-4 h-4" strokeWidth={1.5} />}
                disabled={isLoading}
              />

              <InputPlank
                label="Voyage Code (To Board Ship)"
                placeholder="e.g. ABCD12"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                icon={<KeyRound className="w-4 h-4" strokeWidth={1.5} />}
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <ButtonWood
                variant="primary"
                size="lg"
                fullWidth={true}
                onClick={handleCreateRoom}
                disabled={isLoading || !socket?.connected}
                icon={<Flame className="w-4 h-4 text-firelight" strokeWidth={1.5} />}
              >
                CREATE NEW VOYAGE
              </ButtonWood>

              {/* Antique Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-[1px] bg-hull-light" />
                <span className="font-heading text-[10px] uppercase tracking-widest text-parchment-dim/60">
                  OR
                </span>
                <div className="flex-1 h-[1px] bg-hull-light" />
              </div>

              <ButtonWood
                variant="secondary"
                size="md"
                fullWidth={true}
                onClick={handleJoinRoom}
                disabled={isLoading || !socket?.connected}
                icon={<Compass className="w-4 h-4 text-parchment-dim" strokeWidth={1.5} />}
              >
                JOIN EXISTING CREW
              </ButtonWood>
            </div>

            {/* Server Connection Status Indicator */}
            <div className="pt-2">
              {!socket?.connected ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-hull-dark/80 border border-firelight/40 rounded text-xs text-firelight font-heading tracking-wider animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-firelight animate-ping" />
                  Seeking Harbor Beacons (Connecting)...
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-verdigris font-heading tracking-wider opacity-80">
                  <span className="w-1.5 h-1.5 rounded-full bg-verdigris shadow-[0_0_6px_#4A7A6A]" />
                  Connected to Deep Sea Gateway
                </div>
              )}
            </div>

          </CardParchment>
        </PanelWood>
      </div>

      {/* Footer Lore Teaser */}
      <footer className="relative z-20 mt-8 text-center text-xs text-parchment-dim/60 font-body">
        <p className="italic">
          "Sailors seek the harbor. Pirates crave the cove. Cultists feed the beast."
        </p>
      </footer>
    </main>
  );
};

export default Home;
