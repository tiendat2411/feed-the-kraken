import React, { useMemo } from 'react';

/**
 * DustParticles Component
 * Spawns subtle, ambient dust motes / embers floating through candlelight.
 * Strictly GPU-safe and disabled under prefers-reduced-motion.
 * 
 * @param {Object} props
 * @param {number} [props.count=7]
 * @param {string} [props.className]
 */
const DustParticles = ({ count = 7, className = '' }) => {
  // Precompute random particle properties to avoid recalculating on re-render
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => ({
      id: index,
      left: `${(index * 14 + 7) % 95}%`,
      top: `${(index * 19 + 15) % 90}%`,
      size: `${Math.floor((index % 3) + 2)}px`,
      duration: `${7 + (index % 5) * 2}s`,
      delay: `${(index * 1.3) % 6}s`,
      opacity: 0.25 + (index % 4) * 0.1,
    }));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-30 overflow-hidden ${className}`}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gold/50 shadow-[0_0_4px_rgba(232,166,62,0.6)] animate-dust"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default DustParticles;
