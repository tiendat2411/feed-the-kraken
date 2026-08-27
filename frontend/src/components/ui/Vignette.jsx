import React from 'react';

/**
 * Vignette Component
 * Creates an immersive peripheral shadow framing the viewport like looking through a dark ship cabin.
 * 
 * @param {Object} props
 * @param {'global' | 'contained'} [props.mode='global']
 * @param {'default' | 'heavy' | 'subtle'} [props.intensity='default']
 */
const Vignette = ({ mode = 'global', intensity = 'default', className = '' }) => {
  const intensityMap = {
    subtle: 'from-transparent via-transparent to-black/60',
    default: 'from-transparent via-black/20 to-black/85',
    heavy: 'from-transparent via-black/40 to-black/95',
  };

  const positionMap = {
    global: 'fixed inset-0 z-40 pointer-events-none',
    contained: 'absolute inset-0 z-10 pointer-events-none',
  };

  return (
    <div
      aria-hidden="true"
      className={`${positionMap[mode]} bg-radial ${intensityMap[intensity]} ${className}`}
      style={{
        background: `radial-gradient(ellipse at center, transparent 40%, rgba(10, 10, 8, 0.45) 75%, rgba(10, 10, 8, 0.88) 100%)`,
      }}
    />
  );
};

export default Vignette;
