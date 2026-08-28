import React from 'react';
import inputWoodSlotPng from '../../assets/ui/frames/input_wood_slot_clean.png';

/**
 * InputPlank Component (T055 - Sleek Nautical Edition, Calibrated -15%)
 * Khay rãnh gỗ thanh mảnh với chi tiết đinh tán & dây thừng hải tặc.
 * - Kích thước thu gọn 15% để nằm lọt gọn gàng hoàn hảo bên trong mặt giấy da dê.
 * - Lòng máng gỗ đen đúc đặc, không bị xuyên thấu.
 * - Nhãn tag da dê căn chính xác vào giữa lòng bảng tên.
 * - Chữ gõ vào màu vàng kim antique gold (#E8A63E) rực rỡ, sắc nét.
 */
const InputPlank = ({
  label,
  value,
  onChange,
  type = 'text',
  maxLength,
  disabled = false,
  className = '',
  id,
  name,
  uppercase = false,
  ...props
}) => {
  return (
    <div className={`relative w-full max-w-[290px] sm:max-w-[325px] mx-auto select-none ${className}`}>
      {/* Frame Container maintaining exact 1227:441 aspect ratio */}
      <div className="relative w-full aspect-[1227/441] filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.7)]">
        {/* Background Carved Sleek Slot Artwork (Transparent PNG with Solid Inner Cavity) */}
        <img
          src={inputWoodSlotPng}
          alt="Input Slot Frame"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
          aria-hidden="true"
        />

        {/* Dynamic Label Header: Exactly centered in the parchment tag */}
        {label && (
          <div className="absolute top-[0%] left-[34%] right-[34%] h-[18%] flex items-center justify-center pointer-events-none z-10">
            <span className="font-heading font-black text-[10px] sm:text-xs text-[#2E1F0C] uppercase tracking-widest leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
              {label}
            </span>
          </div>
        )}

        {/* Interactive Input Layer: Centered inside the solid dark cavity */}
        <div className="absolute top-[22%] bottom-[14%] left-[12%] right-[12%] flex items-center justify-center z-10">
          <input
            id={id || name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            disabled={disabled}
            autoComplete="off"
            className={`
              w-full h-full bg-transparent text-center
              font-heading font-bold text-sm sm:text-base md:text-lg
              text-[#E8A63E] focus:text-[#FFD57A] focus:outline-none tracking-widest
              selection:bg-gold/30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]
              ${uppercase ? 'uppercase font-mono text-[#E8A63E]' : ''}
            `}
            {...props}
          />
        </div>
      </div>
    </div>
  );
};

export default InputPlank;
