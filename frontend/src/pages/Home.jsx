import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import PanelWood from '../components/ui/PanelWood';
import CardParchment from '../components/ui/CardParchment';
import ButtonWood from '../components/ui/ButtonWood';
import InputPlank from '../components/ui/InputPlank';
import CandleProp from '../components/ui/CandleProp';
import Vignette from '../components/ui/Vignette';
import DustParticles from '../components/ui/DustParticles';
import homeOceanBg from '../assets/ui/backgrounds/home_ocean_bg.jpg';

/**
 * Home Component (T058 - Final Balanced & Calibrated Edition)
 * - Tỷ lệ khung gỗ & da dê chuẩn xác 100%, không bị méo.
 * - 2 Ô input & 2 nút bấm thu gọn 15%, nằm lọt 100% bên trong mặt giấy da dê với lề an toàn.
 * - Nút Join Room hiển thị trọn vẹn 100% cả viền trên và viền dưới.
 * - Toàn bộ bảng nằm trọn vẹn trong 1 màn hình viewport bình thường (không cần F11).
 * - Cặp nến cổ phát sáng rực rỡ ở 2 bên bệ gỗ.
 */
const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    if (!nickname.trim()) {
      setError('Vui lòng nhập biệt danh');
      return;
    }
    setError('');
    socket.emit('create_room', { playerName: nickname.trim() }, (response) => {
      if (response.success) {
        navigate(`/game/${response.room.id}`, { state: { initialRoom: response.room } });
      } else {
        setError(response.error || 'Không thể tạo phòng');
      }
    });
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomCode.trim()) {
      setError('Vui lòng nhập cả biệt danh và mã phòng');
      return;
    }
    setError('');
    socket.emit(
      'join_room',
      { roomId: roomCode.trim().toUpperCase(), playerName: nickname.trim() },
      (response) => {
        if (response.success) {
          navigate(`/game/${response.room.id}`, { state: { initialRoom: response.room } });
        } else {
          setError(response.error || 'Không thể vào phòng');
        }
      }
    );
  };

  return (
    <div
      className="relative h-screen w-full flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none bg-[#0A0A08] bg-cover bg-center"
      style={{
        backgroundImage: `url(${homeOceanBg})`,
      }}
    >
      {/* ── Atmospheric Overlays ── */}
      <Vignette />
      <DustParticles count={10} />

      {/* ── Centerpiece: Harmonious Assembly Container ── */}
      <div className="relative z-30 w-full max-w-[620px] max-h-[82vh] my-auto flex items-center justify-center">
        {/* Layer 1: Weathered Oak Timber Backing Panel (1398:1024 Aspect Ratio) */}
        <PanelWood className="relative overflow-visible">
          {/* Layer 2: Ragged-edge Antique Parchment Card (1155:808 Aspect Ratio) */}
          <CardParchment className="relative overflow-visible">
            {/* Header: Title & Subtitle in Pirata One */}
            <div className="text-center pt-1 mb-0.5">
              <h1
                className="font-display text-3xl sm:text-4xl md:text-5xl text-gold tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)]"
                style={{ textShadow: '0 0 25px rgba(201,168,76,0.4), 0 4px 8px rgba(0,0,0,0.9)' }}
              >
                Feed the Kraken
              </h1>
              <p className="font-heading text-[11px] sm:text-xs text-parchment-dim tracking-widest mt-0.5">
                Prepare for a treacherous voyage.
              </p>
            </div>

            {/* Error Alert Box Overlay (if error) */}
            {error && (
              <div className="mb-1 px-3 py-0.5 rounded bg-blood/95 border border-pirate-glow text-parchment-bright text-[11px] sm:text-xs font-heading font-bold shadow-2xl text-center animate-bounce">
                ⚠️ {error}
              </div>
            )}

            {/* Form Fields: Sleek Nautical InputPlank components (-15% Scaled) */}
            <div className="w-full space-y-1 sm:space-y-1.5 my-1 flex flex-col items-center">
              <InputPlank
                id="input-nickname"
                name="nickname"
                label="NICKNAME"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={15}
              />

              <InputPlank
                id="input-room-code"
                name="roomCode"
                label="ROOM CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                maxLength={6}
                uppercase
              />
            </div>

            {/* Action Buttons: Unified Pair (-15% Scaled, 100% Inside Parchment) */}
            <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 w-full pt-1 pb-1">
              <ButtonWood
                id="btn-create-room"
                variant="gold"
                onClick={handleCreateRoom}
                className="w-auto"
              >
                CREATE ROOM
              </ButtonWood>

              <ButtonWood
                id="btn-join-room"
                variant="primary"
                onClick={handleJoinRoom}
                className="w-auto"
              >
                JOIN ROOM
              </ButtonWood>
            </div>

            {/* Server Connection Status */}
            {!socket?.connected && (
              <div className="mt-0.5 text-[10px] sm:text-[11px] font-heading text-gold-dim animate-pulse">
                Đang kết nối tới máy chủ...
              </div>
            )}
          </CardParchment>

          {/* ── Standalone Atmospheric Candle Props: Large candles at bottom corners ── */}
          <CandleProp className="absolute -bottom-8 sm:-bottom-12 -left-8 sm:-left-14 w-24 sm:w-32 md:w-36 h-36 sm:h-48 md:h-56 hidden sm:block" />
          <CandleProp className="absolute -bottom-8 sm:-bottom-12 -right-8 sm:-right-14 w-24 sm:w-32 md:w-36 h-36 sm:h-48 md:h-56 hidden sm:block" />
        </PanelWood>
      </div>
    </div>
  );
};

export default Home;
