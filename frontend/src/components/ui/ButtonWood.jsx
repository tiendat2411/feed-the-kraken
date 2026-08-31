import React from 'react';
import btnGoldPlatePng from '../../assets/ui/buttons/button_gold_plate.png';
import btnWoodPlatePng from '../../assets/ui/buttons/button_wood_plate.png';

/**
 * ButtonWood Component (T054 - Unified Style Edition, Calibrated -15%)
 * Nút bấm phiến gỗ sồi chạm khắc viền đồng bộ theo phong cách Don't Starve.
 * - Kích thước thu gọn 15% để nằm lọt gọn gàng hoàn hảo bên trong mặt giấy da dê.
 * - Lòng nút phẳng mịn, sạch sẽ, tối ưu hoàn hảo để chứa text.
 * - Nút Gold: viền kim loại vàng antique tinh tế.
 * - Nút Wood: viền đồng gỗ thời cổ đồng bộ form dáng.
 * - Chữ hiển thị màu vàng kim / trắng ngả vàng ấm áp, sắc nét.
 */
const ButtonWood = ({
  children,
  variant = 'primary',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  id,
  ...props
}) => {
  const isGold = variant === 'gold';
  const plateSrc = isGold ? btnGoldPlatePng : btnWoodPlatePng;

  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center
        h-[40px] sm:h-[46px] min-w-[135px] sm:min-w-[160px] px-4 sm:px-6
        cursor-pointer select-none group
        transition-all duration-150 transform hover:scale-[1.04] active:scale-95
        disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none
        ${isGold ? 'filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)] hover:drop-shadow-[0_0_15px_rgba(232,166,62,0.8)]' : 'filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)] hover:drop-shadow-[0_0_12px_rgba(212,197,160,0.5)]'}
        ${className}
      `}
      {...props}
    >
      {/* Background Button Plate Texture (Transparent PNG with clean center) */}
      <img
        src={plateSrc}
        alt="Button Plate"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        aria-hidden="true"
      />

      {/* Button Text in Pirata One — Warm Creamy Gold / Antique Gold */}
      <span
        className={`
          relative z-10 font-heading font-black
          text-xs sm:text-sm md:text-base tracking-widest whitespace-nowrap
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]
          ${isGold ? 'text-[#FFD57A] group-hover:text-[#FFF2D6]' : 'text-[#F5EED9] group-hover:text-[#FFFCEB]'}
        `}
      >
        {children}
      </span>
    </button>
  );
};

export default ButtonWood;
