import React from 'react';
import buttonHelmGoldPng from '../../assets/ui/buttons/button_helm_gold.png';

/**
 * StartVoyageButton Component
 * Nút hành động Bánh lái Hoàng Kim lớn để bắt đầu hành trình.
 * Giữ nguyên tỷ lệ gốc 1311:249 của asset và đục sạch 100% khoảng trắng giữa các nan hoa bánh lái.
 */
const StartVoyageButton = ({
  isHost,
  canStart,
  onStartGame
}) => {
  if (!isHost) {
    return (
      <div className="relative w-full aspect-[1311/249] select-none opacity-85 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
        <img
          src={buttonHelmGoldPng}
          alt="Helm Button Plate"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          aria-hidden="true"
        />
        <div className="absolute inset-0 z-10 flex items-center justify-center pl-[14%] sm:pl-[15%] pr-4">
          <span className="font-heading font-black text-xs sm:text-sm md:text-base text-parchment-dim tracking-widest uppercase animate-pulse">
            WAITING FOR HOST TO START...
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={!canStart}
      onClick={onStartGame}
      className={`
        relative w-full aspect-[1311/249] select-none cursor-pointer group
        transition-all duration-150 transform hover:scale-[1.02] active:scale-95
        disabled:cursor-not-allowed disabled:transform-none
        filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]
        ${canStart ? 'hover:drop-shadow-[0_0_25px_rgba(232,166,62,0.95)]' : 'opacity-60'}
      `}
    >
      {/* Background Helm Plate Texture */}
      <img
        src={buttonHelmGoldPng}
        alt="Start Voyage Helm Plate"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        aria-hidden="true"
      />

      {/* Button Text in Pirata One */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pl-[14%] sm:pl-[15%] pr-4">
        <span
          className={`
            font-heading font-black text-xs sm:text-sm md:text-base lg:text-lg tracking-widest uppercase whitespace-nowrap
            drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]
            ${canStart ? 'text-[#FFFCEB] group-hover:text-gold animate-pulse' : 'text-parchment-dim'}
          `}
        >
          {canStart ? 'START VOYAGE' : 'WAITING FOR CREW (MIN 5)'}
        </span>
      </div>
    </button>
  );
};

export default StartVoyageButton;
