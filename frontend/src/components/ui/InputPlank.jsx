import React from 'react';

/**
 * InputPlank Component (T055)
 * Khay rãnh gỗ đục khắc lõm (recessed carved wood slot) cho ô nhập liệu.
 * Bề mặt lòng máng tối với bóng đổ chìm, chữ vàng sáng nổi bật, hỗ trợ nhãn tag da dê phía trên.
 */
const InputPlank = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  maxLength,
  disabled = false,
  className = '',
  id,
  name,
  ...props
}) => {
  return (
    <div className="w-full space-y-1">
      {/* Optional Parchment Tag Label */}
      {label && (
        <label
          htmlFor={id || name}
          className="inline-block px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-widest text-parchment-dim bg-hull-dark/80 border border-hull-light/50 rounded-sm shadow-sm"
        >
          {label}
        </label>
      )}

      {/* Recessed Carved Wood Slot */}
      <div className="relative rounded-sm overflow-hidden bg-[#120E0A] border border-hull-light shadow-[inset_0_3px_8px_rgba(0,0,0,0.85),inset_0_-1px_2px_rgba(255,255,255,0.03)] focus-within:border-verdigris/80 focus-within:shadow-[inset_0_3px_8px_rgba(0,0,0,0.85),0_0_12px_rgba(74,122,106,0.3)] transition-all duration-200">
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-transparent text-parchment-bright font-body text-sm
            placeholder:text-parchment-dim/50 placeholder:font-body
            focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export default InputPlank;
