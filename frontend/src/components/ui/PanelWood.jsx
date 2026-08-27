import React from 'react';

/**
 * PanelWood Component
 * Simulates a weathered dark oak ship-hull panel with antique craftsmanship.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {'none' | 'firelight' | 'eldritch' | 'verdigris'} [props.glow='none']
 * @param {boolean} [props.nails=false] - If true, adds decorative iron nail heads at corners
 * @param {'default' | 'dark' | 'raised'} [props.variant='default']
 */
const PanelWood = ({
  children,
  className = '',
  glow = 'none',
  nails = false,
  variant = 'default',
  ...rest
}) => {
  const glowStyles = {
    none: '',
    firelight: 'shadow-firelight border-gold-dim/40',
    eldritch: 'shadow-eldritch border-cult/50 animate-eldritch-pulse',
    verdigris: 'shadow-verdigris border-verdigris/40',
  };

  const variantStyles = {
    default: 'bg-hull-dark border-hull-light',
    dark: 'bg-abyss/90 border-hull-dark',
    raised: 'bg-hull border-hull-light shadow-xl',
  };

  return (
    <div
      className={`panel-wood ${variantStyles[variant] || variantStyles.default} ${
        glowStyles[glow] || ''
      } ${nails ? 'nail-head' : ''} p-4 md:p-6 rounded relative overflow-hidden transition-all duration-300 ${className}`}
      {...rest}
    >
      {/* Decorative grain / stain subtle accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/30 pointer-events-none rounded" />
      
      {/* Content wrapper with relative positioning to stay above overlays */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PanelWood;
