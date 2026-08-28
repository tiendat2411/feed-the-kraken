import React from 'react';
import woodPanelPng from '../../assets/ui/frames/wood_panel_clean.png';

/**
 * PanelWood Component (T052)
 * Khung bệ ván gỗ sồi phong hóa bọc 4 góc đồng verdigris.
 * Giữ nguyên 100% tỷ lệ gốc (1398:1024) không bị méo/kéo dãn theo chiều dọc.
 */
const PanelWood = ({
  children,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div
      className={`relative w-full aspect-[1398/1024] filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] ${className}`}
      style={style}
      {...props}
    >
      {/* Background Wood Board Artwork (Transparent PNG with original proportions) */}
      <img
        src={woodPanelPng}
        alt="Wood Panel Board"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
        aria-hidden="true"
      />

      {/* Content Container (Padded inside the wood frame) */}
      <div className="absolute inset-[3.5%] z-10 flex flex-col justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default PanelWood;
