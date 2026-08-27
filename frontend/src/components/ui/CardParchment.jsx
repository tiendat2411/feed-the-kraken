import React from 'react';

/**
 * CardParchment Component
 * Simulates a century-old goatskin parchment card with gold leaf border.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.interactive=false] - If true, adds hover scale and cursor pointer
 * @param {boolean} [props.active=false] - If true, highlights the card with golden border
 * @param {'none' | 'sailor' | 'pirate' | 'cult'} [props.faction='none'] - Faction-tinted border/glow
 * @param {boolean} [props.stains=true] - Adds vintage seawater stains
 */
const CardParchment = ({
  children,
  className = '',
  interactive = false,
  active = false,
  faction = 'none',
  stains = true,
  ...rest
}) => {
  const factionStyles = {
    none: active ? 'border-gold shadow-firelight' : 'border-gold-dim/60',
    sailor: 'border-sailor shadow-[0_0_15px_rgba(74,122,140,0.3)]',
    pirate: 'border-pirate shadow-[0_0_15px_rgba(168,59,42,0.35)]',
    cult: 'border-cult shadow-[0_0_15px_rgba(107,63,160,0.35)]',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-firelight active:scale-[0.98]'
    : '';

  return (
    <div
      className={`card-parchment ${stains ? 'aged-stain' : ''} ${
        factionStyles[faction] || factionStyles.none
      } ${interactiveStyles} p-4 rounded relative overflow-hidden ${className}`}
      {...rest}
    >
      {/* Corner ornamental accents */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-gold/40 pointer-events-none" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-gold/40 pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-2 h-1.5 border-b border-l border-gold/40 pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-2 h-1.5 border-b border-r border-gold/40 pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default CardParchment;
