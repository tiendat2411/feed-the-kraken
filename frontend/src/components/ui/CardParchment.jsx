import React from 'react';
import parchmentCardBg from '../../assets/ui/frames/parchment_card.jpg';

/**
 * CardParchment Component (T053)
 * Tấm da dê cổ mép rách hữu cơ theo phong cách Don't Starve Together.
 * Sử dụng asset parchment_card.jpg mang vệt ố vàng thời gian, nét vẽ tay và ấn ký Kraken watermark.
 */
const CardParchment = ({
  children,
  className = '',
  style = {},
  glowColor = 'default',
  ...props
}) => {
  // Glow color mapping for special faction/firelight states
  const glowStyles = {
    default: 'shadow-parchment',
    gold: 'shadow-parchment firelight-glow border-gold-dim/40',
    sailor: 'shadow-parchment border-sailor/40 shadow-[0_0_25px_rgba(74,122,140,0.25)]',
    pirate: 'shadow-parchment border-pirate/40 shadow-[0_0_25px_rgba(168,59,42,0.25)]',
    cult: 'shadow-parchment border-cult/40 eldritch-glow',
  };

  return (
    <div
      className={`relative rounded-sm overflow-hidden border border-gold-dim/30 ${glowStyles[glowColor] || glowStyles.default} ${className}`}
      style={{
        backgroundColor: '#1E1812',
        ...style,
      }}
      {...props}
    >
      {/* Background Parchment Texture Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(${parchmentCardBg})`,
        }}
        aria-hidden="true"
      />

      {/* Aged Paper Inner Glow & Depth */}
      <div
        className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(10,10,8,0.7),inset_0_0_10px_rgba(201,168,76,0.08)]"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-10 text-parchment">
        {children}
      </div>
    </div>
  );
};

export default CardParchment;
