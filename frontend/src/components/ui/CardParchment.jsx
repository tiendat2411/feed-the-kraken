import React from 'react';
import parchmentSheetPng from '../../assets/ui/frames/parchment_sheet_clean.png';

/**
 * CardParchment Component (T053)
 * Tấm da dê cổ mép rách răng cưa hữu cơ với 4 góc đinh sắt gỉ.
 * Giữ nguyên 100% tỷ lệ gốc (1155:808) không bị méo/kéo dãn theo chiều dọc.
 */
const CardParchment = ({
  children,
  className = '',
  style = {},
  glowColor = 'default',
  ...props
}) => {
  return (
    <div
      className={`relative w-full h-full aspect-[1155/808] filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] ${className}`}
      style={style}
      {...props}
    >
      {/* Background Torn Parchment Paper Artwork (Transparent PNG with original proportions) */}
      <img
        src={parchmentSheetPng}
        alt="Parchment Sheet"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
        aria-hidden="true"
      />

      {/* Content Container (Padded inside the parchment surface) */}
      <div className="absolute inset-[3.5%] z-10 text-parchment flex flex-col justify-between items-center py-2 sm:py-3 px-4 sm:px-6">
        {children}
      </div>
    </div>
  );
};

export default CardParchment;
