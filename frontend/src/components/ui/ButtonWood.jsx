import React from 'react';

/**
 * ButtonWood Component
 * Embossed antique nautical wooden button with tactile feedback and firelight aura.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'primary' | 'secondary' | 'danger' | 'cult' | 'gold' | 'wheel'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md']
 * @param {React.ReactNode} [props.icon] - Optional leading or trailing icon
 * @param {'left' | 'right'} [props.iconPosition='left']
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.className]
 */
const ButtonWood = ({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  className = '',
  ...rest
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold tracking-wider',
    md: 'px-5 py-2.5 text-sm font-bold tracking-wider',
    lg: 'px-7 py-3.5 text-base font-bold tracking-widest',
    xl: 'px-8 py-4 text-lg font-extrabold tracking-widest',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-b from-hull-light via-hull to-hull-dark text-parchment-bright border border-gold-dim hover:border-gold hover:text-white hover:shadow-firelight shadow-md',
    secondary:
      'bg-hull-dark text-parchment-dim border border-hull-light hover:border-parchment-dim hover:text-parchment hover:bg-hull shadow',
    gold:
      'bg-gradient-to-b from-gold via-gold-dim to-[#6D5825] text-abyss font-black border border-gold-bright hover:brightness-110 hover:shadow-firelight-lg shadow-lg',
    danger:
      'bg-gradient-to-b from-pirate via-pirate-dim to-hull-dark text-parchment-bright border border-pirate-glow/60 hover:border-pirate-glow hover:shadow-[0_0_20px_rgba(168,59,42,0.4)] shadow-md',
    cult:
      'bg-gradient-to-b from-cult via-cult-dim to-hull-dark text-parchment-bright border border-cult-glow/60 hover:border-cult-glow hover:shadow-eldritch shadow-md',
    wheel:
      'bg-gradient-to-b from-hull-light via-hull to-[#15100B] text-gold-bright border-2 border-gold hover:border-gold-bright hover:shadow-firelight-lg text-lg uppercase font-heading shadow-xl',
  };

  const disabledStyles = disabled
    ? 'opacity-40 cursor-not-allowed filter grayscale pointer-events-none'
    : 'cursor-pointer active:scale-[0.98] transition-all duration-200';

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded relative uppercase select-none overflow-hidden group ${
        fullWidth ? 'w-full' : ''
      } ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${disabledStyles} ${className}`}
      {...rest}
    >
      {/* Subtle top edge highlight */}
      <span className="absolute top-0 inset-x-0 h-[1px] bg-white/10 pointer-events-none" />

      {/* Leading Icon */}
      {icon && iconPosition === 'left' && (
        <span className="inline-flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
      )}

      {/* Button Text */}
      <span className="relative z-10">{children}</span>

      {/* Trailing Icon */}
      {icon && iconPosition === 'right' && (
        <span className="inline-flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
      )}
    </button>
  );
};

export default ButtonWood;
