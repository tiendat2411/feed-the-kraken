import React from 'react';

/**
 * Vignette Component (T056)
 * Lớp phủ tối viền 4 góc toàn cục tạo cảm giác nhìn qua ống nhòm đêm hoặc vực thẳm đại dương.
 * Pointer-events none để không chặn tương tác của người chơi.
 */
const Vignette = ({ className = '' }) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 45%,
            rgba(10, 10, 8, 0.45) 75%,
            rgba(10, 10, 8, 0.85) 90%,
            rgba(10, 10, 8, 0.98) 100%
          )
        `,
      }}
    />
  );
};

export default Vignette;
