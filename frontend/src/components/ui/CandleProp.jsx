import React from 'react';
import candlePropPng from '../../assets/ui/sprites/candle_prop_clean.png';

/**
 * CandleProp Component
 * Linh kiện nến cổ độc lập (Standalone Candle Sprite).
 * - Kích thước lớn gấp 3 lần, tạo điểm nhấn ánh sáng hoành tráng 2 bên bệ gỗ.
 * - Có quầng sáng firelight và hiệu ứng bập bùng ngọn lửa candleFlicker.
 */
const CandleProp = ({ className = '', style = {} }) => {
  return (
    <div
      className={`pointer-events-none select-none z-30 ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div className="relative w-full h-full animate-candle-flicker filter drop-shadow-[0_0_35px_rgba(232,166,62,0.8)]">
        <img
          src={candlePropPng}
          alt="Vintage Candle Prop"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default CandleProp;
