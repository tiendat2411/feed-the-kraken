import React from 'react';
import mapCardQuickPng from '../../assets/ui/frames/map_card_quick.png';
import mapCardLongPng from '../../assets/ui/frames/map_card_long.png';

/**
 * MapSelector Component
 * Chọn loại hải trình bản đồ (Quick Journey vs Long Journey).
 * 2 thẻ hải đồ da dê viền đồng với kích thước lớn vừa vặn toàn bộ trang giấy Map Selection.
 */
const MapSelector = ({
  selectedMap = 'QUICK_JOURNEY',
  onSelectMap,
  isHost = false
}) => {
  return (
    <div className="w-full max-w-[92%] mx-auto select-none py-1">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 justify-items-center">
        {/* Quick Journey Map Card */}
        <button
          type="button"
          disabled={!isHost}
          onClick={() => onSelectMap('QUICK_JOURNEY')}
          className={`
            relative aspect-[563/680] w-full max-h-[170px] sm:max-h-[210px] rounded-sm overflow-hidden
            transition-all duration-200 transform
            ${selectedMap === 'QUICK_JOURNEY'
              ? 'scale-[1.04] ring-2 ring-gold shadow-[0_0_20px_rgba(232,166,62,0.8)]'
              : 'opacity-75 hover:opacity-95 hover:scale-[1.01]'
            }
            ${!isHost ? 'cursor-default' : 'cursor-pointer'}
          `}
        >
          <img
            src={mapCardQuickPng}
            alt="Quick Journey Map"
            className="w-full h-full object-contain pointer-events-none"
          />
          {selectedMap === 'QUICK_JOURNEY' && (
            <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-gold/90 text-hull-dark font-heading font-black text-[8px] sm:text-[10px] tracking-widest shadow">
              SELECTED
            </div>
          )}
        </button>

        {/* Long Journey Map Card */}
        <button
          type="button"
          disabled={!isHost}
          onClick={() => onSelectMap('LONG_JOURNEY')}
          className={`
            relative aspect-[563/680] w-full max-h-[170px] sm:max-h-[210px] rounded-sm overflow-hidden
            transition-all duration-200 transform
            ${selectedMap === 'LONG_JOURNEY'
              ? 'scale-[1.04] ring-2 ring-gold shadow-[0_0_20px_rgba(232,166,62,0.8)]'
              : 'opacity-75 hover:opacity-95 hover:scale-[1.01]'
            }
            ${!isHost ? 'cursor-default' : 'cursor-pointer'}
          `}
        >
          <img
            src={mapCardLongPng}
            alt="Long Journey Map"
            className="w-full h-full object-contain pointer-events-none"
          />
          {selectedMap === 'LONG_JOURNEY' && (
            <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-gold/90 text-hull-dark font-heading font-black text-[8px] sm:text-[10px] tracking-widest shadow">
              SELECTED
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default MapSelector;
