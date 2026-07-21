import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2 w-full font-poppins">
        {label && (
          <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`w-full text-sm bg-[#090909] border ${
              error ? 'border-red-500' : 'border-[#D4AF37]/15 focus:border-[#D4AF37]/50'
            } text-[#F5F5F5] rounded-xl ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3.5 focus:outline-none transition font-poppins ${className}`}
            {...props}
          />
          {icon && (
            <div className="absolute left-3.5 top-4 text-[#F5F5F5]/40 flex items-center justify-center pointer-events-none">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-[10px] text-red-400 font-medium block mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
