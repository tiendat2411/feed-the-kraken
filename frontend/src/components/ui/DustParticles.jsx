import React, { useMemo } from 'react';

/**
 * DustParticles Component (T057)
 * Hiệu ứng hạt bụi tro / bụi giấy da lơ lửng chậm rãi qua luồng ánh nến.
 * Sử dụng CSS animation thuần nhẹ nhàng, tự động ngắt khi bật prefers-reduced-motion.
 */
const DustParticles = ({ count = 6, className = '' }) => {
  // Tạo danh sách particles cố định không bị re-render đổi vị trí
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${15 + (i * 70) / count + (i % 3) * 5}%`,
      size: `${2 + (i % 3)}px`,
      duration: `${10 + (i % 4) * 3}s`,
      delay: `${(i * 2.2) % 7}s`,
      opacity: 0.15 + (i % 3) * 0.1,
      color: i % 2 === 0 ? '#D4C5A0' : '#E8A63E',
    }));
  }, [count]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-20 ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full block animate-dust-drift"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
};

export default DustParticles;
