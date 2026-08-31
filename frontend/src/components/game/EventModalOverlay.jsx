import React, { useState } from 'react';
import CardParchment from '../ui/CardParchment';
import ButtonWood from '../ui/ButtonWood';

/**
 * EventModalOverlay Component (Task T061 - In-Game Command Architecture)
 * Center Modal Overlay for In-Game Special Events & Rituals.
 * - Minimizable into a pulsing corner badge so players can inspect the Sea Chart and Seating Table before committing decisions.
 */
const EventModalOverlay = ({
  isOpen = false,
  title = 'SPECIAL EVENT',
  subtitle = '',
  icon = '📜',
  onClose,
  children
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* ── Minimized Pulsing Floating Badge ── */}
      {isMinimized ? (
        <div className="fixed bottom-16 right-6 z-50 animate-bounce">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-purple-950/95 border-2 border-purple-400 text-gold shadow-[0_0_25px_rgba(168,85,247,0.8)] cursor-pointer transform hover:scale-105 transition"
            title="Click to restore event modal"
          >
            <span className="text-2xl">{icon}</span>
            <div className="text-left">
              <div className="font-heading font-black text-xs text-purple-200 uppercase tracking-wide">
                {title}
              </div>
              <div className="font-heading text-[10px] text-amber-300">
                [+] CLICK TO RESTORE
              </div>
            </div>
          </button>
        </div>
      ) : (
        /* ── Full Center Modal Overlay ── */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col items-center justify-center">
            {/* Parchment Container */}
            <CardParchment className="relative overflow-visible !p-5 sm:!p-7">
              {/* Modal Top Control Header */}
              <div className="w-full flex items-center justify-between border-b border-hull/40 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl">{icon}</span>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl md:text-2xl text-[#241708] tracking-wide">
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="font-heading text-xs text-hull-light tracking-wider">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Control Actions: Minimize & Close */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="font-heading font-bold text-xs px-2.5 py-1 rounded bg-[#241708]/10 hover:bg-[#241708]/25 text-[#241708] border border-hull/40 transition cursor-pointer"
                    title="Minimize to inspect Sea Chart"
                  >
                    ─ MINIMIZE
                  </button>

                  {onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="font-heading font-bold text-xs px-2 py-1 rounded bg-blood/20 hover:bg-blood/40 text-blood border border-blood/40 transition cursor-pointer"
                      title="Close modal"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="w-full space-y-3 py-1 font-heading text-sm text-[#2A2118]">
                {children}
              </div>

              {/* Default Close / Understood Button if onClose provided */}
              {onClose && (
                <div className="w-full pt-3 flex justify-center">
                  <ButtonWood
                    variant="gold"
                    onClick={onClose}
                    className="!min-w-[140px]"
                  >
                    UNDERSTOOD
                  </ButtonWood>
                </div>
              )}
            </CardParchment>
          </div>
        </div>
      )}
    </>
  );
};

export default EventModalOverlay;
