import React from 'react';

/**
 * ButtonWood Component (T054)
 * Nút bấm phiến gỗ chạm khắc nổi khối theo phong cách Don't Starve.
 * 3 variants chính: default (gỗ sẫm), gold (viền kim loại vàng đồng chạm khắc), danger (phiến gỗ đỏ vấy máu).
 */
const ButtonWood = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs tracking-wider',
    md: 'px-5 py-2.5 text-sm tracking-widest',
    lg: 'px-7 py-3.5 text-base tracking-widest font-bold',
  };

  const variantStyles = {
    primary: `
      bg-hull hover:bg-hull-light text-parchment-bright
      border border-hull-light/80 hover:border-gold-dim/60
      shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-2px_4px_rgba(0,0,0,0.5),0_3px_8px_rgba(0,0,0,0.5)]
      hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-2px_4px_rgba(0,0,0,0.5),0_0_12px_rgba(201,168,76,0.2)]
    `,
    gold: `
      bg-gradient-to-b from-[#4A3B1E] via-[#3A2D14] to-[#251D0C]
      text-gold hover:text-parchment-bright
      border-2 border-gold-dim hover:border-gold
      shadow-[inset_0_1px_0_rgba(255,230,150,0.2),inset_0_-3px_6px_rgba(0,0,0,0.7),0_0_15px_rgba(201,168,76,0.3)]
      hover:shadow-[inset_0_1px_0_rgba(255,230,150,0.3),inset_0_-3px_6px_rgba(0,0,0,0.7),0_0_25px_rgba(232,166,62,0.45)]
    `,
    danger: `
      bg-gradient-to-b from-[#3D1A1A] via-[#2A1010] to-[#1A0A0A]
      text-pirate-glow hover:text-parchment-bright
      border border-pirate/50 hover:border-pirate
      shadow-[inset_0_1px_0_rgba(255,100,100,0.1),inset_0_-2px_4px_rgba(0,0,0,0.6),0_3px_8px_rgba(139,26,26,0.3)]
      hover:shadow-[inset_0_1px_0_rgba(255,100,100,0.2),inset_0_-2px_4px_rgba(0,0,0,0.6),0_0_15px_rgba(168,59,42,0.4)]
    `,
    ghost: `
      bg-hull/40 hover:bg-hull/80 text-parchment-dim hover:text-parchment
      border border-hull-light/40 hover:border-hull-light
      shadow-none
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center
        font-heading uppercase rounded-sm cursor-pointer select-none
        transition-all duration-150 transform
        active:scale-[0.98] active:translate-y-0.5
        focus:outline-none focus:ring-1 focus:ring-gold/50
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default ButtonWood;
