import React from 'react';

/**
 * InputPlank Component
 * A carved wooden plank input field with antique brass/verdigris focus highlights.
 * 
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.className]
 */
const InputPlank = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...inputProps
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full text-left space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-parchment-dim font-heading"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-parchment-dim pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          className={`w-full bg-abyss/90 border ${
            error ? 'border-blood focus:border-blood focus:ring-blood/30' : 'border-hull-light focus:border-gold focus:ring-gold/30'
          } rounded px-3.5 py-2.5 text-parchment-bright placeholder:text-parchment-dim/40 font-body text-sm md:text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:outline-none focus:ring-2 transition-all duration-200 ${
            icon ? 'pl-10' : ''
          } ${className}`}
          {...inputProps}
        />
      </div>

      {helperText && !error && (
        <p className="text-xs text-parchment-dim/70 italic">{helperText}</p>
      )}

      {error && (
        <p className="text-xs text-blood font-semibold tracking-wide flex items-center gap-1 animate-fade-in-up">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

export default InputPlank;
