import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  prefix,
  suffix,
  error,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-zinc-400 font-mono text-xs">{prefix}</span>
          </div>
        )}
        <input
          id={id}
          className={`block w-full rounded-xl border bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 ${
            prefix ? "pl-7" : ""
          } ${suffix ? "pr-8" : ""} ${
            error
              ? "border-rose-300 focus:ring-rose-500 focus:border-rose-500"
              : "border-zinc-200/90 hover:border-zinc-300 shadow-sm"
          } ${className}`}
          {...props}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-zinc-400 text-xs font-medium">{suffix}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-[11px] text-zinc-500">{helperText}</p>
      )}
    </div>
  );
};

interface PercentageSliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  id?: string;
  showBadge?: boolean;
}

export const PercentageSliderInput: React.FC<PercentageSliderInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  helperText,
  id,
  showBadge = false,
}) => {
  const pctValue = Number((value * 100).toFixed(2));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider"
        >
          {label}
        </label>
        {showBadge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
            {pctValue}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={pctValue}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="w-full cursor-pointer"
        />
        <div className="w-20 flex-shrink-0">
          <Input
            type="number"
            min={min}
            max={max}
            step={step}
            suffix="%"
            value={pctValue}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) onChange(val / 100);
            }}
          />
        </div>
      </div>
      {helperText && <p className="mt-1 text-[11px] text-zinc-500">{helperText}</p>}
    </div>
  );
};
