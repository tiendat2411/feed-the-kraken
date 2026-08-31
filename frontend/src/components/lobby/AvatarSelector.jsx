import React from 'react';
import { PIRATE_AVATARS } from '../../constants/avatars';

/**
 * AvatarSelector Component
 * Bảng chọn Avatar 11 nhân vật Pirates of the Caribbean nằm ở không gian cabin bên dưới bảng Map.
 */
const AvatarSelector = ({
  currentAvatar,
  onSelectAvatar
}) => {
  return (
    <div className="w-full select-none my-2 sm:my-3">
      <h3 className="font-heading font-black text-xs sm:text-sm text-gold uppercase tracking-widest mb-2 flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        CHOOSE YOUR AVATAR
      </h3>

      <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
        {PIRATE_AVATARS.map((char) => {
          const isSelected = currentAvatar === char.id || currentAvatar === char.name;

          return (
            <button
              key={char.id}
              type="button"
              onClick={() => onSelectAvatar(char.id)}
              className={`
                relative aspect-square rounded-full p-0.5
                transition-all duration-150 transform hover:scale-110 active:scale-95
                filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]
                ${isSelected
                  ? 'ring-2 ring-gold scale-110 shadow-[0_0_15px_rgba(232,166,62,0.9)]'
                  : 'opacity-75 hover:opacity-100'
                }
              `}
              title={char.name}
            >
              <img
                src={char.src}
                alt={char.name}
                className="w-full h-full object-contain rounded-full pointer-events-none"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarSelector;
