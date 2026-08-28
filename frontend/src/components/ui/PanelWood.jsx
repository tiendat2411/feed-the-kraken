import React from 'react';
import woodPanelBg from '../../assets/ui/frames/wood_panel.jpg';

/**
 * PanelWood Component (T052)
 * Bệ ván gỗ sồi phong hóa làm khung nền cho các khối giao diện.
 * Ghép từ các thanh gỗ sồi cổ với mắt gỗ, vết nứt tự nhiên và 4 góc bọc kim loại đồng gỉ verdigris patina.
 */
const PanelWood = ({
  children,
  className = '',
  style = {},
  variant = 'default',
  ...props
}) => {
  return (
    <div
      className={`relative rounded-sm overflow-hidden shadow-wood border border-hull-light/60 ${className}`}
      style={{
        backgroundColor: '#1A1510',
        ...style,
      }}
      {...props}
    >
      {/* Background Wood Texture Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-luminosity bg-cover bg-center"
        style={{
          backgroundImage: `url(${woodPanelBg})`,
        }}
        aria-hidden="true"
      />

      {/* Subtle Inner Bevel Shadow */}
      <div
        className="absolute inset-0 pointer-events-none border border-parchment-bright/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),inset_0_-2px_6px_rgba(0,0,0,0.6)]"
        aria-hidden="true"
      />

      {/* Decorative Verdigris Bronze Corner Brackets */}
      <div className="absolute top-0 left-0 w-5 h-5 pointer-events-none border-t-2 border-l-2 border-verdigris/60" aria-hidden="true">
        <div className="w-1.5 h-1.5 bg-verdigris-glow/40 rounded-full m-0.5" />
      </div>
      <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none border-t-2 border-r-2 border-verdigris/60" aria-hidden="true">
        <div className="w-1.5 h-1.5 bg-verdigris-glow/40 rounded-full m-0.5 ml-auto" />
      </div>
      <div className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none border-b-2 border-l-2 border-verdigris/60" aria-hidden="true">
        <div className="w-1.5 h-1.5 bg-verdigris-glow/40 rounded-full m-0.5 mt-auto" />
      </div>
      <div className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none border-b-2 border-r-2 border-verdigris/60" aria-hidden="true">
        <div className="w-1.5 h-1.5 bg-verdigris-glow/40 rounded-full m-0.5 ml-auto mt-auto" />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PanelWood;
